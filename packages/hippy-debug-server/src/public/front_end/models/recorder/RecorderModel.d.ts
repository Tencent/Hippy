import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import type * as Workspace from '../workspace/workspace.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import { RecordingSession } from './RecordingSession.js';
import type { UserFlow } from './Steps.js';
declare const enum RecorderState {
    Recording = "Recording",
    Replaying = "Replaying",
    Idle = "Idle"
}
export declare class RecorderModel extends SDK.SDKModel.SDKModel {
    _debuggerAgent: ProtocolProxyApi.DebuggerApi;
    _domDebuggerAgent: ProtocolProxyApi.DOMDebuggerApi;
    _runtimeAgent: ProtocolProxyApi.RuntimeApi;
    _accessibilityAgent: ProtocolProxyApi.AccessibilityApi;
    _toggleRecordAction: UI.ActionRegistration.Action;
    _replayAction: UI.ActionRegistration.Action;
    _state: RecorderState;
    _currentRecordingSession: RecordingSession | null;
    _indentation: string;
    constructor(target: SDK.Target.Target);
    updateState(newState: RecorderState): Promise<void>;
    isRecording(): boolean;
    parseUserFlow(source: string): UserFlow;
    replayRecording(userFlow: UserFlow): Promise<void>;
    toggleRecording(): Promise<RecordingSession | null>;
    startRecording(): Promise<RecordingSession>;
    stopRecording(): Promise<void>;
    exportRecording(uiSourceCode: Workspace.UISourceCode.UISourceCode): Promise<void>;
    getAvailableRecordings(): Promise<UserFlow[]>;
}
export {};
