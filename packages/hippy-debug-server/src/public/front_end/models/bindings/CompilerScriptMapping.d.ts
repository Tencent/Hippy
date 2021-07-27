import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Workspace from '../workspace/workspace.js';
import { ContentProviderBasedProject } from './ContentProviderBasedProject.js';
import type { DebuggerSourceMapping, DebuggerWorkspaceBinding } from './DebuggerWorkspaceBinding.js';
export declare class CompilerScriptMapping implements DebuggerSourceMapping {
    _debuggerModel: SDK.DebuggerModel.DebuggerModel;
    _sourceMapManager: SDK.SourceMapManager.SourceMapManager<SDK.Script.Script>;
    _workspace: Workspace.Workspace.WorkspaceImpl;
    _debuggerWorkspaceBinding: DebuggerWorkspaceBinding;
    _regularProject: ContentProviderBasedProject;
    _contentScriptsProject: ContentProviderBasedProject;
    _regularBindings: Map<string, Binding>;
    _contentScriptsBindings: Map<string, Binding>;
    _stubUISourceCodes: Map<SDK.Script.Script, Workspace.UISourceCode.UISourceCode>;
    _stubProject: ContentProviderBasedProject;
    _eventListeners: Common.EventTarget.EventDescriptor[];
    constructor(debuggerModel: SDK.DebuggerModel.DebuggerModel, workspace: Workspace.Workspace.WorkspaceImpl, debuggerWorkspaceBinding: DebuggerWorkspaceBinding);
    private onUiSourceCodeAdded;
    _addStubUISourceCode(script: SDK.Script.Script): void;
    _removeStubUISourceCode(script: SDK.Script.Script): Promise<void>;
    static uiSourceCodeOrigin(uiSourceCode: Workspace.UISourceCode.UISourceCode): string[];
    mapsToSourceCode(rawLocation: SDK.DebuggerModel.Location): boolean;
    uiSourceCodeForURL(url: string, isContentScript: boolean): Workspace.UISourceCode.UISourceCode | null;
    rawLocationToUILocation(rawLocation: SDK.DebuggerModel.Location): Workspace.UISourceCode.UILocation | null;
    uiLocationToRawLocations(uiSourceCode: Workspace.UISourceCode.UISourceCode, lineNumber: number, columnNumber: number): SDK.DebuggerModel.Location[];
    _sourceMapWillAttach(event: Common.EventTarget.EventTargetEvent): Promise<void>;
    _sourceMapFailedToAttach(event: Common.EventTarget.EventTargetEvent): Promise<void>;
    _sourceMapAttached(event: Common.EventTarget.EventTargetEvent): Promise<void>;
    _sourceMapDetached(event: Common.EventTarget.EventTargetEvent): Promise<void>;
    sourceMapForScript(script: SDK.Script.Script): SDK.SourceMap.SourceMap | null;
    scriptsForUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): SDK.Script.Script[];
    _sourceMapAttachedForTest(_sourceMap: SDK.SourceMap.SourceMap | null): void;
    _populateSourceMapSources(script: SDK.Script.Script, sourceMap: SDK.SourceMap.SourceMap): Promise<void>;
    static uiLineHasMapping(uiSourceCode: Workspace.UISourceCode.UISourceCode, lineNumber: number): boolean;
    dispose(): void;
}
declare class Binding {
    _project: ContentProviderBasedProject;
    _url: string;
    _referringSourceMaps: SDK.SourceMap.SourceMap[];
    _activeSourceMap?: SDK.SourceMap.SourceMap | null;
    _uiSourceCode: Workspace.UISourceCode.UISourceCode | null;
    constructor(project: ContentProviderBasedProject, url: string);
    _recreateUISourceCodeIfNeeded(frameId: string): void;
    addSourceMap(sourceMap: SDK.SourceMap.SourceMap, frameId: string): void;
    removeSourceMap(sourceMap: SDK.SourceMap.SourceMap, frameId: string): void;
}
export {};
