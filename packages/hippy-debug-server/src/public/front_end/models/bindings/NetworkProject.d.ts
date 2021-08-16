import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import type * as Workspace from '../workspace/workspace.js';
export declare class NetworkProjectManager extends Common.ObjectWrapper.ObjectWrapper {
    private constructor();
    static instance({ forceNew }?: {
        forceNew: boolean;
    }): NetworkProjectManager;
}
export declare const Events: {
    FrameAttributionAdded: symbol;
    FrameAttributionRemoved: symbol;
};
export declare class NetworkProject {
    static _resolveFrame(uiSourceCode: Workspace.UISourceCode.UISourceCode, frameId: string): SDK.ResourceTreeModel.ResourceTreeFrame | null;
    static setInitialFrameAttribution(uiSourceCode: Workspace.UISourceCode.UISourceCode, frameId: string): void;
    static cloneInitialFrameAttribution(fromUISourceCode: Workspace.UISourceCode.UISourceCode, toUISourceCode: Workspace.UISourceCode.UISourceCode): void;
    static addFrameAttribution(uiSourceCode: Workspace.UISourceCode.UISourceCode, frameId: string): void;
    static removeFrameAttribution(uiSourceCode: Workspace.UISourceCode.UISourceCode, frameId: string): void;
    static targetForUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): SDK.Target.Target | null;
    static setTargetForProject(project: Workspace.Workspace.Project, target: SDK.Target.Target): void;
    static getTargetForProject(project: Workspace.Workspace.Project): SDK.Target.Target | null;
    static framesForUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): SDK.ResourceTreeModel.ResourceTreeFrame[];
}
