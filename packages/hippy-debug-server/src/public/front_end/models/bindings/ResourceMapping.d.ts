import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as TextUtils from '../text_utils/text_utils.js';
import * as Workspace from '../workspace/workspace.js';
import { ContentProviderBasedProject } from './ContentProviderBasedProject.js';
export declare class ResourceMapping implements SDK.TargetManager.SDKModelObserver<SDK.ResourceTreeModel.ResourceTreeModel> {
    _workspace: Workspace.Workspace.WorkspaceImpl;
    _modelToInfo: Map<SDK.ResourceTreeModel.ResourceTreeModel, ModelInfo>;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
        targetManager: SDK.TargetManager.TargetManager | null;
        workspace: Workspace.Workspace.WorkspaceImpl | null;
    }): ResourceMapping;
    modelAdded(resourceTreeModel: SDK.ResourceTreeModel.ResourceTreeModel): void;
    modelRemoved(resourceTreeModel: SDK.ResourceTreeModel.ResourceTreeModel): void;
    _infoForTarget(target: SDK.Target.Target): ModelInfo | null;
    cssLocationToUILocation(cssLocation: SDK.CSSModel.CSSLocation): Workspace.UISourceCode.UILocation | null;
    jsLocationToUILocation(jsLocation: SDK.DebuggerModel.Location): Workspace.UISourceCode.UILocation | null;
    uiLocationToJSLocations(uiSourceCode: Workspace.UISourceCode.UISourceCode, lineNumber: number, columnNumber: number): SDK.DebuggerModel.Location[];
    uiLocationToCSSLocations(uiLocation: Workspace.UISourceCode.UILocation): SDK.CSSModel.CSSLocation[];
    _resetForTest(target: SDK.Target.Target): void;
}
declare class ModelInfo {
    _project: ContentProviderBasedProject;
    _bindings: Map<string, Binding>;
    _cssModel: SDK.CSSModel.CSSModel;
    _eventListeners: Common.EventTarget.EventDescriptor[];
    constructor(workspace: Workspace.Workspace.WorkspaceImpl, resourceTreeModel: SDK.ResourceTreeModel.ResourceTreeModel);
    _styleSheetChanged(event: Common.EventTarget.EventTargetEvent): Promise<void>;
    _acceptsResource(resource: SDK.Resource.Resource): boolean;
    _resourceAdded(event: Common.EventTarget.EventTargetEvent): void;
    _removeFrameResources(frame: SDK.ResourceTreeModel.ResourceTreeFrame): void;
    _frameWillNavigate(event: Common.EventTarget.EventTargetEvent): void;
    _frameDetached(event: Common.EventTarget.EventTargetEvent): void;
    _resetForTest(): void;
    dispose(): void;
}
declare class Binding implements TextUtils.ContentProvider.ContentProvider {
    _resources: Set<SDK.Resource.Resource>;
    _project: ContentProviderBasedProject;
    _uiSourceCode: Workspace.UISourceCode.UISourceCode;
    _edits: {
        stylesheet: SDK.CSSStyleSheetHeader.CSSStyleSheetHeader;
        edit: SDK.CSSModel.Edit | null;
    }[];
    constructor(project: ContentProviderBasedProject, resource: SDK.Resource.Resource);
    _inlineStyles(): SDK.CSSStyleSheetHeader.CSSStyleSheetHeader[];
    _inlineScripts(): SDK.Script.Script[];
    _styleSheetChanged(stylesheet: SDK.CSSStyleSheetHeader.CSSStyleSheetHeader, edit: SDK.CSSModel.Edit | null): Promise<void>;
    _innerStyleSheetChanged(content: string): Promise<void>;
    addResource(resource: SDK.Resource.Resource): void;
    removeResource(resource: SDK.Resource.Resource): void;
    dispose(): void;
    _firstResource(): SDK.Resource.Resource;
    contentURL(): string;
    contentType(): Common.ResourceType.ResourceType;
    contentEncoded(): Promise<boolean>;
    requestContent(): Promise<TextUtils.ContentProvider.DeferredContent>;
    searchInContent(query: string, caseSensitive: boolean, isRegex: boolean): Promise<TextUtils.ContentProvider.SearchMatch[]>;
}
export {};
