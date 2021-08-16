import * as Common from '../common/common.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import type * as Protocol from '../../generated/protocol.js';
import { DebuggerModel } from './DebuggerModel.js';
import { HeapProfilerModel } from './HeapProfilerModel.js';
import type { ScopeRef } from './RemoteObject.js';
import { RemoteObject, // eslint-disable-line no-unused-vars
RemoteObjectProperty } from './RemoteObject.js';
import type { Target } from './Target.js';
import { SDKModel } from './SDKModel.js';
export declare class RuntimeModel extends SDKModel {
    _agent: ProtocolProxyApi.RuntimeApi;
    _executionContextById: Map<number, ExecutionContext>;
    _executionContextComparator: (arg0: ExecutionContext, arg1: ExecutionContext) => number;
    _hasSideEffectSupport: boolean | null;
    constructor(target: Target);
    static isSideEffectFailure(response: Protocol.Runtime.EvaluateResponse | EvaluationResult): boolean;
    debuggerModel(): DebuggerModel;
    heapProfilerModel(): HeapProfilerModel;
    executionContexts(): ExecutionContext[];
    setExecutionContextComparator(comparator: (arg0: ExecutionContext, arg1: ExecutionContext) => number): void;
    /** comparator
       */
    executionContextComparator(): (arg0: ExecutionContext, arg1: ExecutionContext) => number;
    defaultExecutionContext(): ExecutionContext | null;
    executionContext(id: number): ExecutionContext | null;
    _executionContextCreated(context: Protocol.Runtime.ExecutionContextDescription): void;
    _executionContextDestroyed(executionContextId: number): void;
    fireExecutionContextOrderChanged(): void;
    _executionContextsCleared(): void;
    createRemoteObject(payload: Protocol.Runtime.RemoteObject): RemoteObject;
    createScopeRemoteObject(payload: Protocol.Runtime.RemoteObject, scopeRef: ScopeRef): RemoteObject;
    createRemoteObjectFromPrimitiveValue(value: string | number | bigint | boolean | undefined): RemoteObject;
    createRemotePropertyFromPrimitiveValue(name: string, value: string | number | boolean): RemoteObjectProperty;
    discardConsoleEntries(): void;
    releaseObjectGroup(objectGroup: string): void;
    releaseEvaluationResult(result: EvaluationResult): void;
    runIfWaitingForDebugger(): void;
    _customFormattersStateChanged(event: Common.EventTarget.EventTargetEvent): void;
    compileScript(expression: string, sourceURL: string, persistScript: boolean, executionContextId: number): Promise<CompileScriptResult | null>;
    runScript(scriptId: string, executionContextId: number, objectGroup?: string, silent?: boolean, includeCommandLineAPI?: boolean, returnByValue?: boolean, generatePreview?: boolean, awaitPromise?: boolean): Promise<EvaluationResult>;
    queryObjects(prototype: RemoteObject): Promise<QueryObjectResult>;
    isolateId(): Promise<string>;
    heapUsage(): Promise<{
        usedSize: number;
        totalSize: number;
    } | null>;
    _inspectRequested(payload: Protocol.Runtime.RemoteObject, hints?: any): void;
    addBinding(event: Protocol.Runtime.AddBindingRequest): Promise<Protocol.ProtocolResponseWithError>;
    _bindingCalled(event: Protocol.Runtime.BindingCalledEvent): void;
    _copyRequested(object: RemoteObject): void;
    _queryObjectsRequested(object: RemoteObject): Promise<void>;
    static simpleTextFromException(exceptionDetails: Protocol.Runtime.ExceptionDetails): string;
    exceptionThrown(timestamp: number, exceptionDetails: Protocol.Runtime.ExceptionDetails): void;
    _exceptionRevoked(exceptionId: number): void;
    _consoleAPICalled(type: string, args: Protocol.Runtime.RemoteObject[], executionContextId: number, timestamp: number, stackTrace?: Protocol.Runtime.StackTrace, context?: string): void;
    executionContextIdForScriptId(scriptId: string): number;
    executionContextForStackTrace(stackTrace: Protocol.Runtime.StackTrace): number;
    hasSideEffectSupport(): boolean | null;
    checkSideEffectSupport(): Promise<boolean>;
    terminateExecution(): Promise<any>;
}
export declare enum Events {
    BindingCalled = "BindingCalled",
    ExecutionContextCreated = "ExecutionContextCreated",
    ExecutionContextDestroyed = "ExecutionContextDestroyed",
    ExecutionContextChanged = "ExecutionContextChanged",
    ExecutionContextOrderChanged = "ExecutionContextOrderChanged",
    ExceptionThrown = "ExceptionThrown",
    ExceptionRevoked = "ExceptionRevoked",
    ConsoleAPICalled = "ConsoleAPICalled",
    QueryObjectRequested = "QueryObjectRequested"
}
export declare class ExecutionContext {
    id: number;
    uniqueId: string;
    name: string;
    _label: string | null;
    origin: string;
    isDefault: boolean;
    runtimeModel: RuntimeModel;
    debuggerModel: DebuggerModel;
    frameId: string | undefined;
    constructor(runtimeModel: RuntimeModel, id: number, uniqueId: string, name: string, origin: string, isDefault: boolean, frameId?: string);
    target(): Target;
    static comparator(a: ExecutionContext, b: ExecutionContext): number;
    evaluate(options: EvaluationOptions, userGesture: boolean, awaitPromise: boolean): Promise<EvaluationResult>;
    globalObject(objectGroup: string, generatePreview: boolean): Promise<EvaluationResult>;
    _evaluateGlobal(options: EvaluationOptions, userGesture: boolean, awaitPromise: boolean): Promise<EvaluationResult>;
    globalLexicalScopeNames(): Promise<string[] | null>;
    label(): string | null;
    setLabel(label: string): void;
    _setLabel(label: string): void;
}
export declare type EvaluationResult = {
    object: RemoteObject;
    exceptionDetails?: Protocol.Runtime.ExceptionDetails;
} | {
    error: string;
};
export interface CompileScriptResult {
    scriptId?: string;
    exceptionDetails?: Protocol.Runtime.ExceptionDetails;
}
export interface EvaluationOptions {
    expression: string;
    objectGroup?: string;
    includeCommandLineAPI?: boolean;
    silent?: boolean;
    returnByValue?: boolean;
    generatePreview?: boolean;
    throwOnSideEffect?: boolean;
    timeout?: number;
    disableBreaks?: boolean;
    replMode?: boolean;
    allowUnsafeEvalBlockedByCSP?: boolean;
    contextId?: number;
}
export declare type QueryObjectResult = {
    objects: RemoteObject;
} | {
    error: string;
};
