// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../core/sdk/sdk.js';
export class ApplicationCacheModel extends SDK.SDKModel.SDKModel {
    _agent;
    _statuses;
    _manifestURLsByFrame;
    _onLine;
    constructor(target) {
        super(target);
        target.registerApplicationCacheDispatcher(new ApplicationCacheDispatcher(this));
        this._agent = target.applicationCacheAgent();
        this._agent.invoke_enable();
        const resourceTreeModel = target.model(SDK.ResourceTreeModel.ResourceTreeModel);
        if (!resourceTreeModel) {
            throw new Error('Target must provide an ResourceTreeModel');
        }
        resourceTreeModel.addEventListener(SDK.ResourceTreeModel.Events.FrameNavigated, this._frameNavigatedCallback, this);
        resourceTreeModel.addEventListener(SDK.ResourceTreeModel.Events.FrameDetached, this._frameDetached, this);
        this._statuses = new Map();
        this._manifestURLsByFrame = new Map();
        this._mainFrameNavigated();
        this._onLine = true;
    }
    _frameNavigatedCallback(event) {
        this._frameNavigated(event);
    }
    async _frameNavigated(event) {
        const frame = event.data;
        if (frame.isMainFrame()) {
            this._mainFrameNavigated();
            return;
        }
        const frameId = frame.id;
        const manifestURL = await this._agent.invoke_getManifestForFrame({ frameId });
        if (manifestURL !== null && !manifestURL) {
            this._frameManifestRemoved(frameId);
        }
    }
    _frameDetached(event) {
        const frame = event.data.frame;
        this._frameManifestRemoved(frame.id);
    }
    reset() {
        this._statuses.clear();
        this._manifestURLsByFrame.clear();
        this.dispatchEventToListeners(Events.FrameManifestsReset);
    }
    async _mainFrameNavigated() {
        const framesWithManifests = await this._agent.invoke_getFramesWithManifests();
        if (framesWithManifests.getError()) {
            return;
        }
        for (const frame of framesWithManifests.frameIds) {
            this._frameManifestUpdated(frame.frameId, frame.manifestURL, frame.status);
        }
    }
    _frameManifestUpdated(frameId, manifestURL, status) {
        if (status === UNCACHED) {
            this._frameManifestRemoved(frameId);
            return;
        }
        if (!manifestURL) {
            return;
        }
        const recordedManifestURL = this._manifestURLsByFrame.get(frameId);
        if (recordedManifestURL && manifestURL !== recordedManifestURL) {
            this._frameManifestRemoved(frameId);
        }
        const statusChanged = this._statuses.get(frameId) !== status;
        this._statuses.set(frameId, status);
        if (!this._manifestURLsByFrame.has(frameId)) {
            this._manifestURLsByFrame.set(frameId, manifestURL);
            this.dispatchEventToListeners(Events.FrameManifestAdded, frameId);
        }
        if (statusChanged) {
            this.dispatchEventToListeners(Events.FrameManifestStatusUpdated, frameId);
        }
    }
    _frameManifestRemoved(frameId) {
        const removed = this._manifestURLsByFrame.delete(frameId);
        this._statuses.delete(frameId);
        if (removed) {
            this.dispatchEventToListeners(Events.FrameManifestRemoved, frameId);
        }
    }
    frameManifestURL(frameId) {
        return this._manifestURLsByFrame.get(frameId) || '';
    }
    frameManifestStatus(frameId) {
        return this._statuses.get(frameId) || UNCACHED;
    }
    get onLine() {
        return this._onLine;
    }
    _statusUpdated(frameId, manifestURL, status) {
        this._frameManifestUpdated(frameId, manifestURL, status);
    }
    async requestApplicationCache(frameId) {
        const response = await this._agent.invoke_getApplicationCacheForFrame({ frameId });
        if (response.getError()) {
            return null;
        }
        return response.applicationCache;
    }
    _networkStateUpdated(isNowOnline) {
        this._onLine = isNowOnline;
        this.dispatchEventToListeners(Events.NetworkStateChanged, isNowOnline);
    }
}
SDK.SDKModel.SDKModel.register(ApplicationCacheModel, { capabilities: SDK.Target.Capability.DOM, autostart: false });
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["FrameManifestStatusUpdated"] = "FrameManifestStatusUpdated";
    Events["FrameManifestAdded"] = "FrameManifestAdded";
    Events["FrameManifestRemoved"] = "FrameManifestRemoved";
    Events["FrameManifestsReset"] = "FrameManifestsReset";
    Events["NetworkStateChanged"] = "NetworkStateChanged";
})(Events || (Events = {}));
export class ApplicationCacheDispatcher {
    _applicationCacheModel;
    constructor(applicationCacheModel) {
        this._applicationCacheModel = applicationCacheModel;
    }
    applicationCacheStatusUpdated({ frameId, manifestURL, status }) {
        this._applicationCacheModel._statusUpdated(frameId, manifestURL, status);
    }
    networkStateUpdated({ isNowOnline }) {
        this._applicationCacheModel._networkStateUpdated(isNowOnline);
    }
}
export const UNCACHED = 0;
export const IDLE = 1;
export const CHECKING = 2;
export const DOWNLOADING = 3;
export const UPDATEREADY = 4;
export const OBSOLETE = 5;
//# sourceMappingURL=ApplicationCacheModel.js.map