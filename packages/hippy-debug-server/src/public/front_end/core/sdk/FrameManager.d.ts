import * as Common from '../common/common.js';
import type { ResourceTreeFrame } from './ResourceTreeModel.js';
import { ResourceTreeModel } from './ResourceTreeModel.js';
import type { Target } from './Target.js';
import type { SDKModelObserver } from './TargetManager.js';
/**
 * The FrameManager is a central storage for all frames. It collects frames from all
 * ResourceTreeModel-instances (one per target), so that frames can be found by id
 * without needing to know their target.
 */
export declare class FrameManager extends Common.ObjectWrapper.ObjectWrapper implements SDKModelObserver<ResourceTreeModel> {
    _eventListeners: WeakMap<ResourceTreeModel, Common.EventTarget.EventDescriptor[]>;
    _frames: Map<string, {
        frame: ResourceTreeFrame;
        count: number;
    }>;
    _framesForTarget: Map<string, Set<string>>;
    _topFrame: ResourceTreeFrame | null;
    private creationStackTraceDataForTransferringFrame;
    private awaitedFrames;
    constructor();
    static instance({ forceNew }?: {
        forceNew: boolean;
    }): FrameManager;
    modelAdded(resourceTreeModel: ResourceTreeModel): void;
    modelRemoved(resourceTreeModel: ResourceTreeModel): void;
    _frameAdded(event: Common.EventTarget.EventTargetEvent): void;
    _frameDetached(event: Common.EventTarget.EventTargetEvent): void;
    _frameNavigated(event: Common.EventTarget.EventTargetEvent): void;
    _resourceAdded(event: Common.EventTarget.EventTargetEvent): void;
    _decreaseOrRemoveFrame(frameId: string): void;
    /**
     * Looks for the top frame in `_frames` and sets `_topFrame` accordingly.
     *
     * Important: This method needs to be called everytime `_frames` is updated.
     */
    _resetTopFrame(): void;
    /**
     * Returns the ResourceTreeFrame with a given frameId.
     * When a frame is being detached a new ResourceTreeFrame but with the same
     * frameId is created. Consequently getFrame() will return a different
     * ResourceTreeFrame after detachment. Callers of getFrame() should therefore
     * immediately use the function return value and not store it for later use.
     */
    getFrame(frameId: string): ResourceTreeFrame | null;
    getAllFrames(): ResourceTreeFrame[];
    getTopFrame(): ResourceTreeFrame | null;
    getOrWaitForFrame(frameId: string, notInTarget?: Target): Promise<ResourceTreeFrame>;
}
export declare enum Events {
    FrameAddedToTarget = "FrameAddedToTarget",
    FrameNavigated = "FrameNavigated",
    FrameRemoved = "FrameRemoved",
    ResourceAdded = "ResourceAdded",
    TopFrameNavigated = "TopFrameNavigated"
}
