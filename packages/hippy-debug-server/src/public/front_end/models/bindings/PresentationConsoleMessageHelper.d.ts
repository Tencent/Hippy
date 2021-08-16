import type * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Workspace from '../workspace/workspace.js';
import type { LiveLocation } from './LiveLocation.js';
import { LiveLocationPool } from './LiveLocation.js';
export declare class PresentationConsoleMessageManager implements SDK.TargetManager.SDKModelObserver<SDK.DebuggerModel.DebuggerModel> {
    constructor();
    modelAdded(debuggerModel: SDK.DebuggerModel.DebuggerModel): void;
    modelRemoved(debuggerModel: SDK.DebuggerModel.DebuggerModel): void;
    _consoleMessageAdded(message: SDK.ConsoleModel.ConsoleMessage): void;
    _consoleCleared(): void;
}
export declare class PresentationConsoleMessageHelper {
    _debuggerModel: SDK.DebuggerModel.DebuggerModel;
    _pendingConsoleMessages: Map<string, SDK.ConsoleModel.ConsoleMessage[]>;
    _presentationConsoleMessages: PresentationConsoleMessage[];
    _locationPool: LiveLocationPool;
    constructor(debuggerModel: SDK.DebuggerModel.DebuggerModel);
    _consoleMessageAdded(message: SDK.ConsoleModel.ConsoleMessage): void;
    _rawLocation(message: SDK.ConsoleModel.ConsoleMessage): SDK.DebuggerModel.Location | null;
    _addConsoleMessageToScript(message: SDK.ConsoleModel.ConsoleMessage, rawLocation: SDK.DebuggerModel.Location): void;
    _addPendingConsoleMessage(message: SDK.ConsoleModel.ConsoleMessage): void;
    _parsedScriptSource(event: Common.EventTarget.EventTargetEvent): void;
    _consoleCleared(): void;
    _debuggerReset(): void;
}
export declare class PresentationConsoleMessage extends Workspace.UISourceCode.Message {
    private uiSourceCode?;
    constructor(message: SDK.ConsoleModel.ConsoleMessage, rawLocation: SDK.DebuggerModel.Location, locationPool: LiveLocationPool);
    _updateLocation(liveLocation: LiveLocation): Promise<void>;
    dispose(): void;
}
