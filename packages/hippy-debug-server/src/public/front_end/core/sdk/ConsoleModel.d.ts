import * as Protocol from '../../generated/protocol.js';
import * as Common from '../common/common.js';
import { FrontendMessageSource, FrontendMessageType } from './ConsoleModelTypes.js';
export { FrontendMessageSource, FrontendMessageType } from './ConsoleModelTypes.js';
import { CPUProfilerModel } from './CPUProfilerModel.js';
import type { Location } from './DebuggerModel.js';
import { RemoteObject } from './RemoteObject.js';
import type { ExecutionContext } from './RuntimeModel.js';
import { RuntimeModel } from './RuntimeModel.js';
import type { Target } from './Target.js';
import type { Observer } from './TargetManager.js';
export declare class ConsoleModel extends Common.ObjectWrapper.ObjectWrapper implements Observer {
    _messages: ConsoleMessage[];
    _messageByExceptionId: Map<RuntimeModel, Map<number, ConsoleMessage>>;
    _warnings: number;
    _errors: number;
    _violations: number;
    _pageLoadSequenceNumber: number;
    _targetListeners: WeakMap<Target, Common.EventTarget.EventDescriptor[]>;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): ConsoleModel;
    targetAdded(target: Target): void;
    _initTarget(target: Target): void;
    targetRemoved(target: Target): void;
    evaluateCommandInConsole(executionContext: ExecutionContext, originatingMessage: ConsoleMessage, expression: string, useCommandLineAPI: boolean): Promise<void>;
    addCommandMessage(executionContext: ExecutionContext, text: string): ConsoleMessage;
    addMessage(msg: ConsoleMessage): void;
    _exceptionThrown(runtimeModel: RuntimeModel, event: Common.EventTarget.EventTargetEvent): void;
    _exceptionRevoked(runtimeModel: RuntimeModel, event: Common.EventTarget.EventTargetEvent): void;
    _consoleAPICalled(runtimeModel: RuntimeModel, event: Common.EventTarget.EventTargetEvent): void;
    _queryObjectRequested(runtimeModel: RuntimeModel, event: Common.EventTarget.EventTargetEvent): void;
    _clearIfNecessary(): void;
    _mainFrameNavigated(event: Common.EventTarget.EventTargetEvent): void;
    _consoleProfileStarted(cpuProfilerModel: CPUProfilerModel, event: Common.EventTarget.EventTargetEvent): void;
    _consoleProfileFinished(cpuProfilerModel: CPUProfilerModel, event: Common.EventTarget.EventTargetEvent): void;
    _addConsoleProfileMessage(cpuProfilerModel: CPUProfilerModel, type: MessageType, scriptLocation: Location, messageText: string): void;
    _incrementErrorWarningCount(msg: ConsoleMessage): void;
    messages(): ConsoleMessage[];
    requestClearMessages(): void;
    _clear(): void;
    errors(): number;
    warnings(): number;
    violations(): number;
    saveToTempVariable(currentExecutionContext: ExecutionContext | null, remoteObject: RemoteObject | null): Promise<void>;
}
export declare enum Events {
    ConsoleCleared = "ConsoleCleared",
    MessageAdded = "MessageAdded",
    MessageUpdated = "MessageUpdated",
    CommandEvaluated = "CommandEvaluated"
}
export declare class ConsoleMessage {
    _runtimeModel: RuntimeModel | null;
    source: MessageSource;
    level: Protocol.Log.LogEntryLevel | null;
    messageText: string;
    _type: MessageType;
    url: string | undefined;
    line: number;
    column: number;
    parameters: (string | RemoteObject | Protocol.Runtime.RemoteObject)[] | undefined;
    stackTrace: Protocol.Runtime.StackTrace | undefined;
    timestamp: number;
    executionContextId: number;
    scriptId: string | null;
    workerId: string | null;
    context: string | null | undefined;
    _originatingConsoleMessage: ConsoleMessage | null;
    _pageLoadSequenceNumber: number | undefined;
    _exceptionId: number | undefined;
    constructor(runtimeModel: RuntimeModel | null, source: MessageSource, level: Protocol.Log.LogEntryLevel | null, messageText: string, type?: MessageType, url?: string | null, line?: number, column?: number, parameters?: (string | RemoteObject | Protocol.Runtime.RemoteObject)[], stackTrace?: Protocol.Runtime.StackTrace, timestamp?: number, executionContextId?: number, scriptId?: string | null, workerId?: string | null, context?: string);
    get type(): MessageType;
    static fromException(runtimeModel: RuntimeModel, exceptionDetails: Protocol.Runtime.ExceptionDetails, messageType?: Protocol.Runtime.ConsoleAPICalledEventType | FrontendMessageType, timestamp?: number, forceUrl?: string): ConsoleMessage;
    runtimeModel(): RuntimeModel | null;
    target(): Target | null;
    setOriginatingMessage(originatingMessage: ConsoleMessage): void;
    setExecutionContextId(executionContextId: number): void;
    setExceptionId(exceptionId: number): void;
    originatingMessage(): ConsoleMessage | null;
    isGroupMessage(): boolean;
    isGroupStartMessage(): boolean;
    isErrorOrWarning(): boolean;
    isGroupable(): boolean;
    groupCategoryKey(): string;
    isEqual(msg: ConsoleMessage | null): boolean;
    _isEqualStackTraces(stackTrace1: Protocol.Runtime.StackTrace | undefined, stackTrace2: Protocol.Runtime.StackTrace | undefined): boolean;
}
export declare type MessageSource = Protocol.Log.LogEntrySource | FrontendMessageSource;
export declare type MessageLevel = Protocol.Log.LogEntryLevel;
export declare type MessageType = Protocol.Runtime.ConsoleAPICalledEventType | FrontendMessageType;
export declare const MessageSourceDisplayName: Map<MessageSource, string>;
export interface ConsoleAPICall {
    type: MessageType;
    args: Protocol.Runtime.RemoteObject[];
    executionContextId: number;
    timestamp: number;
    stackTrace?: Protocol.Runtime.StackTrace;
    context?: string;
}
export interface ExceptionWithTimestamp {
    timestamp: number;
    details: Protocol.Runtime.ExceptionDetails;
}
