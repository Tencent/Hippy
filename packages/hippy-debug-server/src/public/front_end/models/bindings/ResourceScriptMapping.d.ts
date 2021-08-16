import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Workspace from '../workspace/workspace.js';
import type * as Protocol from '../../generated/protocol.js';
import type { Breakpoint } from './BreakpointManager.js';
import { ContentProviderBasedProject } from './ContentProviderBasedProject.js';
import type { DebuggerSourceMapping, DebuggerWorkspaceBinding } from './DebuggerWorkspaceBinding.js';
export declare class ResourceScriptMapping implements DebuggerSourceMapping {
    _debuggerModel: SDK.DebuggerModel.DebuggerModel;
    _workspace: Workspace.Workspace.WorkspaceImpl;
    _debuggerWorkspaceBinding: DebuggerWorkspaceBinding;
    _uiSourceCodeToScriptFile: Map<Workspace.UISourceCode.UISourceCode, ResourceScriptFile>;
    _projects: Map<string, ContentProviderBasedProject>;
    _acceptedScripts: Set<SDK.Script.Script>;
    _eventListeners: Common.EventTarget.EventDescriptor[];
    constructor(debuggerModel: SDK.DebuggerModel.DebuggerModel, workspace: Workspace.Workspace.WorkspaceImpl, debuggerWorkspaceBinding: DebuggerWorkspaceBinding);
    _project(script: SDK.Script.Script): ContentProviderBasedProject;
    rawLocationToUILocation(rawLocation: SDK.DebuggerModel.Location): Workspace.UISourceCode.UILocation | null;
    uiLocationToRawLocations(uiSourceCode: Workspace.UISourceCode.UISourceCode, lineNumber: number, columnNumber: number): SDK.DebuggerModel.Location[];
    _acceptsScript(script: SDK.Script.Script): boolean;
    _parsedScriptSource(event: Common.EventTarget.EventTargetEvent): Promise<void>;
    scriptFile(uiSourceCode: Workspace.UISourceCode.UISourceCode): ResourceScriptFile | null;
    _removeScript(script: SDK.Script.Script): Promise<void>;
    _executionContextDestroyed(event: Common.EventTarget.EventTargetEvent): void;
    _globalObjectCleared(_event: Common.EventTarget.EventTargetEvent): void;
    resetForTest(): void;
    dispose(): void;
}
export declare class ResourceScriptFile extends Common.ObjectWrapper.ObjectWrapper {
    _resourceScriptMapping: ResourceScriptMapping;
    _uiSourceCode: Workspace.UISourceCode.UISourceCode;
    _script: SDK.Script.Script | undefined;
    _scriptSource?: string | null;
    _isDivergingFromVM?: boolean;
    _hasDivergedFromVM?: boolean;
    _isMergingToVM?: boolean;
    constructor(resourceScriptMapping: ResourceScriptMapping, uiSourceCode: Workspace.UISourceCode.UISourceCode, scripts: SDK.Script.Script[]);
    _hasScripts(scripts: SDK.Script.Script[]): boolean;
    _isDiverged(): boolean;
    _workingCopyChanged(_event: Common.EventTarget.EventTargetEvent): void;
    _workingCopyCommitted(_event: Common.EventTarget.EventTargetEvent): void;
    scriptSourceWasSet(source: string, breakpoints: Breakpoint[], error: string | null, exceptionDetails?: Protocol.Runtime.ExceptionDetails): Promise<void>;
    _update(): Promise<void>;
    _divergeFromVM(): Promise<void>;
    _mergeToVM(): Promise<void>;
    hasDivergedFromVM(): boolean;
    isDivergingFromVM(): boolean;
    isMergingToVM(): boolean;
    checkMapping(): void;
    _mappingCheckedForTest(): void;
    dispose(): void;
    addSourceMapURL(sourceMapURL: string): void;
    hasSourceMapURL(): boolean;
    get script(): SDK.Script.Script | null;
    get uiSourceCode(): Workspace.UISourceCode.UISourceCode;
}
export declare namespace ResourceScriptFile {
    enum Events {
        DidMergeToVM = "DidMergeToVM",
        DidDivergeFromVM = "DidDivergeFromVM"
    }
}
