// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../common/common.js';
import { Events as ResourceTreeModelEvents, ResourceTreeModel } from './ResourceTreeModel.js'; // eslint-disable-line no-unused-vars
import { TargetManager } from './TargetManager.js';
let frameManagerInstance = null;
/**
 * The FrameManager is a central storage for all frames. It collects frames from all
 * ResourceTreeModel-instances (one per target), so that frames can be found by id
 * without needing to know their target.
 */
export class FrameManager extends Common.ObjectWrapper.ObjectWrapper {
    _eventListeners;
    _frames;
    _framesForTarget;
    _topFrame;
    creationStackTraceDataForTransferringFrame;
    awaitedFrames = new Map();
    constructor() {
        super();
        this._eventListeners = new WeakMap();
        TargetManager.instance().observeModels(ResourceTreeModel, this);
        // Maps frameIds to frames and a count of how many ResourceTreeModels contain this frame.
        // (OOPIFs are usually first attached to a new target and then detached from their old target,
        // therefore being contained in 2 models for a short period of time.)
        this._frames = new Map();
        // Maps targetIds to a set of frameIds.
        this._framesForTarget = new Map();
        this._topFrame = null;
        this.creationStackTraceDataForTransferringFrame = new Map();
    }
    static instance({ forceNew } = { forceNew: false }) {
        if (!frameManagerInstance || forceNew) {
            frameManagerInstance = new FrameManager();
        }
        return frameManagerInstance;
    }
    modelAdded(resourceTreeModel) {
        const addListener = resourceTreeModel.addEventListener(ResourceTreeModelEvents.FrameAdded, this._frameAdded, this);
        const detachListener = resourceTreeModel.addEventListener(ResourceTreeModelEvents.FrameDetached, this._frameDetached, this);
        const navigatedListener = resourceTreeModel.addEventListener(ResourceTreeModelEvents.FrameNavigated, this._frameNavigated, this);
        const resourceAddedListener = resourceTreeModel.addEventListener(ResourceTreeModelEvents.ResourceAdded, this._resourceAdded, this);
        this._eventListeners.set(resourceTreeModel, [addListener, detachListener, navigatedListener, resourceAddedListener]);
        this._framesForTarget.set(resourceTreeModel.target().id(), new Set());
    }
    modelRemoved(resourceTreeModel) {
        const listeners = this._eventListeners.get(resourceTreeModel);
        if (listeners) {
            Common.EventTarget.EventTarget.removeEventListeners(listeners);
        }
        // Iterate over this model's frames and decrease their count or remove them.
        // (The ResourceTreeModel does not send FrameDetached events when a model
        // is removed.)
        const frameSet = this._framesForTarget.get(resourceTreeModel.target().id());
        if (frameSet) {
            for (const frameId of frameSet) {
                this._decreaseOrRemoveFrame(frameId);
            }
        }
        this._framesForTarget.delete(resourceTreeModel.target().id());
    }
    _frameAdded(event) {
        const frame = event.data;
        const frameData = this._frames.get(frame.id);
        // If the frame is already in the map, increase its count, otherwise add it to the map.
        if (frameData) {
            // In order to not lose frame creation stack trace information during
            // an OOPIF transfer we need to copy it to the new frame
            frame.setCreationStackTrace(frameData.frame.getCreationStackTraceData());
            this._frames.set(frame.id, { frame, count: frameData.count + 1 });
        }
        else {
            // If the transferring frame's detached event is received before its frame added
            // event in the new target, the persisted frame creation stacktrace is reassigned.
            const traceData = this.creationStackTraceDataForTransferringFrame.get(frame.id);
            if (traceData && traceData.creationStackTrace) {
                frame.setCreationStackTrace(traceData);
            }
            this._frames.set(frame.id, { frame, count: 1 });
            this.creationStackTraceDataForTransferringFrame.delete(frame.id);
        }
        this._resetTopFrame();
        // Add the frameId to the the targetId's set of frameIds.
        const frameSet = this._framesForTarget.get(frame.resourceTreeModel().target().id());
        if (frameSet) {
            frameSet.add(frame.id);
        }
        this.dispatchEventToListeners(Events.FrameAddedToTarget, { frame });
        const wasAwaited = this.awaitedFrames.get(frame.id);
        if (wasAwaited && (!wasAwaited.notInTarget || wasAwaited.notInTarget !== frame.resourceTreeModel().target())) {
            this.awaitedFrames.delete(frame.id);
            wasAwaited.resolve(frame);
        }
    }
    _frameDetached(event) {
        const frame = event.data.frame;
        const isSwap = event.data.isSwap;
        // Decrease the frame's count or remove it entirely from the map.
        this._decreaseOrRemoveFrame(frame.id);
        // If the transferring frame's detached event is received before its frame
        // added event in the new target, we persist the frame creation stacktrace here
        // so that later on the frame added event in the new target it can be reassigned.
        if (isSwap && !this._frames.get(frame.id)) {
            const traceData = frame.getCreationStackTraceData();
            if (traceData.creationStackTrace) {
                this.creationStackTraceDataForTransferringFrame.set(frame.id, traceData);
            }
        }
        // Remove the frameId from the target's set of frameIds.
        const frameSet = this._framesForTarget.get(frame.resourceTreeModel().target().id());
        if (frameSet) {
            frameSet.delete(frame.id);
        }
    }
    _frameNavigated(event) {
        const frame = event.data;
        this.dispatchEventToListeners(Events.FrameNavigated, { frame });
        if (frame.isTopFrame()) {
            this.dispatchEventToListeners(Events.TopFrameNavigated, { frame });
        }
    }
    _resourceAdded(event) {
        const resource = event.data;
        this.dispatchEventToListeners(Events.ResourceAdded, { resource });
    }
    _decreaseOrRemoveFrame(frameId) {
        const frameData = this._frames.get(frameId);
        if (frameData) {
            if (frameData.count === 1) {
                this._frames.delete(frameId);
                this._resetTopFrame();
                this.dispatchEventToListeners(Events.FrameRemoved, { frameId });
            }
            else {
                frameData.count--;
            }
        }
    }
    /**
     * Looks for the top frame in `_frames` and sets `_topFrame` accordingly.
     *
     * Important: This method needs to be called everytime `_frames` is updated.
     */
    _resetTopFrame() {
        const topFrames = this.getAllFrames().filter(frame => frame.isTopFrame());
        this._topFrame = topFrames.length > 0 ? topFrames[0] : null;
    }
    /**
     * Returns the ResourceTreeFrame with a given frameId.
     * When a frame is being detached a new ResourceTreeFrame but with the same
     * frameId is created. Consequently getFrame() will return a different
     * ResourceTreeFrame after detachment. Callers of getFrame() should therefore
     * immediately use the function return value and not store it for later use.
     */
    getFrame(frameId) {
        const frameData = this._frames.get(frameId);
        if (frameData) {
            return frameData.frame;
        }
        return null;
    }
    getAllFrames() {
        return Array.from(this._frames.values(), frameData => frameData.frame);
    }
    getTopFrame() {
        return this._topFrame;
    }
    async getOrWaitForFrame(frameId, notInTarget) {
        const frame = this.getFrame(frameId);
        if (frame && (!notInTarget || notInTarget !== frame.resourceTreeModel().target())) {
            return frame;
        }
        return new Promise(resolve => {
            this.awaitedFrames.set(frameId, { notInTarget, resolve });
        });
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    // The FrameAddedToTarget event is sent whenever a frame is added to a target.
    // This means that for OOPIFs it is sent twice: once when it's added to a
    // parent target and a second time when it's added to its own target.
    Events["FrameAddedToTarget"] = "FrameAddedToTarget";
    Events["FrameNavigated"] = "FrameNavigated";
    // The FrameRemoved event is only sent when a frame has been detached from
    // all targets.
    Events["FrameRemoved"] = "FrameRemoved";
    Events["ResourceAdded"] = "ResourceAdded";
    Events["TopFrameNavigated"] = "TopFrameNavigated";
})(Events || (Events = {}));
//# sourceMappingURL=FrameManager.js.map