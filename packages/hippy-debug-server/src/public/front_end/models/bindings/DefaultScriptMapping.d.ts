import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Workspace from '../workspace/workspace.js';
import { ContentProviderBasedProject } from './ContentProviderBasedProject.js';
import type { DebuggerSourceMapping, DebuggerWorkspaceBinding } from './DebuggerWorkspaceBinding.js';
export declare class DefaultScriptMapping implements DebuggerSourceMapping {
    _debuggerModel: SDK.DebuggerModel.DebuggerModel;
    _debuggerWorkspaceBinding: DebuggerWorkspaceBinding;
    _project: ContentProviderBasedProject;
    _eventListeners: Common.EventTarget.EventDescriptor[];
    _uiSourceCodeToScriptsMap: WeakMap<Workspace.UISourceCode.UISourceCode, SDK.Script.Script>;
    constructor(debuggerModel: SDK.DebuggerModel.DebuggerModel, workspace: Workspace.Workspace.WorkspaceImpl, debuggerWorkspaceBinding: DebuggerWorkspaceBinding);
    static scriptForUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): SDK.Script.Script | null;
    rawLocationToUILocation(rawLocation: SDK.DebuggerModel.Location): Workspace.UISourceCode.UILocation | null;
    uiLocationToRawLocations(uiSourceCode: Workspace.UISourceCode.UISourceCode, lineNumber: number, columnNumber: number): SDK.DebuggerModel.Location[];
    _parsedScriptSource(event: Common.EventTarget.EventTargetEvent): void;
    _discardedScriptSource(event: Common.EventTarget.EventTargetEvent): void;
    _debuggerReset(): void;
    dispose(): void;
}
