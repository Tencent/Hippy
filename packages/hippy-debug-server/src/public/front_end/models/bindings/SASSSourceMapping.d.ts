import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Workspace from '../workspace/workspace.js';
import { ContentProviderBasedProject } from './ContentProviderBasedProject.js';
import type { SourceMapping } from './CSSWorkspaceBinding.js';
export declare class SASSSourceMapping implements SourceMapping {
    _sourceMapManager: SDK.SourceMapManager.SourceMapManager<SDK.CSSStyleSheetHeader.CSSStyleSheetHeader>;
    _project: ContentProviderBasedProject;
    _eventListeners: Common.EventTarget.EventDescriptor[];
    _bindings: Map<string, Binding>;
    constructor(target: SDK.Target.Target, sourceMapManager: SDK.SourceMapManager.SourceMapManager<SDK.CSSStyleSheetHeader.CSSStyleSheetHeader>, workspace: Workspace.Workspace.WorkspaceImpl);
    _sourceMapAttachedForTest(_sourceMap: SDK.SourceMap.SourceMap | null): void;
    _sourceMapAttached(event: Common.EventTarget.EventTargetEvent): Promise<void>;
    _sourceMapDetached(event: Common.EventTarget.EventTargetEvent): Promise<void>;
    rawLocationToUILocation(rawLocation: SDK.CSSModel.CSSLocation): Workspace.UISourceCode.UILocation | null;
    uiLocationToRawLocations(uiLocation: Workspace.UISourceCode.UILocation): SDK.CSSModel.CSSLocation[];
    dispose(): void;
}
declare class Binding {
    _project: ContentProviderBasedProject;
    _url: string;
    _referringSourceMaps: SDK.SourceMap.TextSourceMap[];
    _activeSourceMap?: SDK.SourceMap.TextSourceMap | null;
    _uiSourceCode: Workspace.UISourceCode.UISourceCode | null;
    constructor(project: ContentProviderBasedProject, url: string);
    _recreateUISourceCodeIfNeeded(frameId: string): void;
    addSourceMap(sourceMap: SDK.SourceMap.TextSourceMap, frameId: string): void;
    removeSourceMap(sourceMap: SDK.SourceMap.TextSourceMap, frameId: string): void;
}
export {};
