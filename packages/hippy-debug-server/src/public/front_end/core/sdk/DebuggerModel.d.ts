import * as Common from '../common/common.js';
import type * as ProtocolClient from '../protocol_client/protocol_client.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import * as Protocol from '../../generated/protocol.js';
import type { RemoteObject } from './RemoteObject.js';
import type { EvaluationOptions, EvaluationResult, ExecutionContext } from './RuntimeModel.js';
import { RuntimeModel } from './RuntimeModel.js';
import { Script } from './Script.js';
import type { Target } from './Target.js';
import { SDKModel } from './SDKModel.js';
import { SourceMapManager } from './SourceMapManager.js';
export declare function sortAndMergeRanges(locationRanges: LocationRange[]): LocationRange[];
export declare enum StepMode {
    StepInto = "StepInto",
    StepOut = "StepOut",
    StepOver = "StepOver"
}
export declare class DebuggerModel extends SDKModel {
    _agent: ProtocolProxyApi.DebuggerApi;
    _runtimeModel: RuntimeModel;
    _sourceMapManager: SourceMapManager<Script>;
    _sourceMapIdToScript: Map<string, Script>;
    _debuggerPausedDetails: DebuggerPausedDetails | null;
    _scripts: Map<string, Script>;
    _scriptsBySourceURL: Map<string, Script[]>;
    _discardableScripts: Script[];
    _continueToLocationCallback: ((arg0: DebuggerPausedDetails) => boolean) | null;
    _selectedCallFrame: CallFrame | null;
    _debuggerEnabled: boolean;
    _debuggerId: string | null;
    _skipAllPausesTimeout: number;
    _beforePausedCallback: ((arg0: DebuggerPausedDetails) => boolean) | null;
    _computeAutoStepRangesCallback: ((arg0: StepMode, arg1: CallFrame) => Promise<Array<{
        start: Location;
        end: Location;
    }>>) | null;
    _expandCallFramesCallback: ((arg0: Array<CallFrame>) => Promise<Array<CallFrame>>) | null;
    _evaluateOnCallFrameCallback: ((arg0: CallFrame, arg1: EvaluationOptions) => Promise<EvaluationResult | null>) | null;
    _ignoreDebuggerPausedEvents: boolean;
    _breakpointResolvedEventTarget: Common.ObjectWrapper.ObjectWrapper;
    _autoStepOver: boolean;
    _isPausing: boolean;
    constructor(target: Target);
    static _sourceMapId(executionContextId: number, sourceURL: string, sourceMapURL: string | undefined): string | null;
    sourceMapManager(): SourceMapManager<Script>;
    runtimeModel(): RuntimeModel;
    debuggerEnabled(): boolean;
    ignoreDebuggerPausedEvents(ignore: boolean): void;
    _enableDebugger(): Promise<void>;
    syncDebuggerId(): Promise<Protocol.Debugger.EnableResponse>;
    _onFrameNavigated(): void;
    _registerDebugger(response: Protocol.Debugger.EnableResponse): void;
    isReadyToPause(): boolean;
    static modelForDebuggerId(debuggerId: string): Promise<DebuggerModel | null>;
    static resyncDebuggerIdForModels(): Promise<void>;
    _disableDebugger(): Promise<void>;
    _skipAllPauses(skip: boolean): void;
    skipAllPausesUntilReloadOrTimeout(timeout: number): void;
    _pauseOnExceptionStateChanged(): void;
    _asyncStackTracesStateChanged(): Promise<Protocol.ProtocolResponseWithError>;
    _breakpointsActiveChanged(): void;
    setComputeAutoStepRangesCallback(callback: ((arg0: StepMode, arg1: CallFrame) => Promise<Array<{
        start: Location;
        end: Location;
    }>>) | null): void;
    _computeAutoStepSkipList(mode: StepMode): Promise<Protocol.Debugger.LocationRange[]>;
    stepInto(): Promise<void>;
    stepOver(): Promise<void>;
    stepOut(): Promise<void>;
    scheduleStepIntoAsync(): void;
    resume(): void;
    pause(): void;
    _pauseOnAsyncCall(parentStackTraceId: Protocol.Runtime.StackTraceId): Promise<Object>;
    setBreakpointByURL(url: string, lineNumber: number, columnNumber?: number, condition?: string): Promise<SetBreakpointResult>;
    setBreakpointInAnonymousScript(scriptId: string, scriptHash: string, lineNumber: number, columnNumber?: number, condition?: string): Promise<SetBreakpointResult>;
    _setBreakpointBySourceId(scriptId: string, lineNumber: number, columnNumber?: number, condition?: string): Promise<SetBreakpointResult>;
    removeBreakpoint(breakpointId: string): Promise<void>;
    getPossibleBreakpoints(startLocation: Location, endLocation: Location | null, restrictToFunction: boolean): Promise<BreakLocation[]>;
    fetchAsyncStackTrace(stackId: Protocol.Runtime.StackTraceId): Promise<Protocol.Runtime.StackTrace | null>;
    _breakpointResolved(breakpointId: string, location: Protocol.Debugger.Location): void;
    globalObjectCleared(): void;
    _reset(): void;
    scripts(): Script[];
    scriptForId(scriptId: string): Script | null;
    scriptsForSourceURL(sourceURL: string | null): Script[];
    scriptsForExecutionContext(executionContext: ExecutionContext): Script[];
    setScriptSource(scriptId: string, newSource: string, callback: (arg0: ProtocolClient.InspectorBackend.ProtocolError | null, arg1?: Protocol.Runtime.ExceptionDetails | undefined) => void): void;
    _didEditScriptSource(scriptId: string, newSource: string, callback: (arg0: ProtocolClient.InspectorBackend.ProtocolError | null, arg1?: Protocol.Runtime.ExceptionDetails | undefined) => void, error: string | null, exceptionDetails?: Protocol.Runtime.ExceptionDetails, callFrames?: Protocol.Debugger.CallFrame[], asyncStackTrace?: Protocol.Runtime.StackTrace, asyncStackTraceId?: Protocol.Runtime.StackTraceId, needsStepIn?: boolean): void;
    get callFrames(): CallFrame[] | null;
    debuggerPausedDetails(): DebuggerPausedDetails | null;
    _setDebuggerPausedDetails(debuggerPausedDetails: DebuggerPausedDetails | null): boolean;
    setBeforePausedCallback(callback: ((arg0: DebuggerPausedDetails) => boolean) | null): void;
    setExpandCallFramesCallback(callback: ((arg0: Array<CallFrame>) => Promise<Array<CallFrame>>) | null): void;
    setEvaluateOnCallFrameCallback(callback: ((arg0: CallFrame, arg1: EvaluationOptions) => Promise<EvaluationResult | null>) | null): void;
    _pausedScript(callFrames: Protocol.Debugger.CallFrame[], reason: Protocol.Debugger.PausedEventReason, auxData: Object | undefined, breakpointIds: string[], asyncStackTrace?: Protocol.Runtime.StackTrace, asyncStackTraceId?: Protocol.Runtime.StackTraceId, asyncCallStackTraceId?: Protocol.Runtime.StackTraceId): Promise<void>;
    _resumedScript(): void;
    _parsedScriptSource(scriptId: string, sourceURL: string, startLine: number, startColumn: number, endLine: number, endColumn: number, executionContextId: number, hash: string, executionContextAuxData: any, isLiveEdit: boolean, sourceMapURL: string | undefined, hasSourceURLComment: boolean, hasSyntaxError: boolean, length: number, isModule: boolean | null, originStackTrace: Protocol.Runtime.StackTrace | null, codeOffset: number | null, scriptLanguage: string | null, debugSymbols: Protocol.Debugger.DebugSymbols | null, embedderName: string | null): Script;
    setSourceMapURL(script: Script, newSourceMapURL: string): void;
    executionContextDestroyed(executionContext: ExecutionContext): void;
    _registerScript(script: Script): void;
    _unregisterScript(script: Script): void;
    _collectDiscardedScripts(): void;
    createRawLocation(script: Script, lineNumber: number, columnNumber: number, inlineFrameIndex?: number): Location;
    createRawLocationByURL(sourceURL: string, lineNumber: number, columnNumber?: number, inlineFrameIndex?: number): Location | null;
    createRawLocationByScriptId(scriptId: string, lineNumber: number, columnNumber?: number, inlineFrameIndex?: number): Location;
    createRawLocationsByStackTrace(stackTrace: Protocol.Runtime.StackTrace): Location[];
    isPaused(): boolean;
    isPausing(): boolean;
    setSelectedCallFrame(callFrame: CallFrame | null): void;
    selectedCallFrame(): CallFrame | null;
    evaluateOnSelectedCallFrame(options: EvaluationOptions): Promise<EvaluationResult>;
    functionDetailsPromise(remoteObject: RemoteObject): Promise<FunctionDetails | null>;
    setVariableValue(scopeNumber: number, variableName: string, newValue: Protocol.Runtime.CallArgument, callFrameId: string): Promise<string | undefined>;
    addBreakpointListener(breakpointId: string, listener: (arg0: Common.EventTarget.EventTargetEvent) => void, thisObject?: Object): void;
    removeBreakpointListener(breakpointId: string, listener: (arg0: Common.EventTarget.EventTargetEvent) => void, thisObject?: Object): void;
    setBlackboxPatterns(patterns: string[]): Promise<boolean>;
    dispose(): void;
    suspendModel(): Promise<void>;
    resumeModel(): Promise<void>;
    static _shouldResyncDebuggerId: boolean;
}
export declare const _debuggerIdToModel: Map<string, DebuggerModel>;
export declare let _scheduledPauseOnAsyncCall: Protocol.Runtime.StackTraceId | null;
/**
 * Keep these in sync with WebCore::V8Debugger
 */
export declare enum PauseOnExceptionsState {
    DontPauseOnExceptions = "none",
    PauseOnAllExceptions = "all",
    PauseOnUncaughtExceptions = "uncaught"
}
export declare enum Events {
    DebuggerWasEnabled = "DebuggerWasEnabled",
    DebuggerWasDisabled = "DebuggerWasDisabled",
    DebuggerPaused = "DebuggerPaused",
    DebuggerResumed = "DebuggerResumed",
    ParsedScriptSource = "ParsedScriptSource",
    FailedToParseScriptSource = "FailedToParseScriptSource",
    DiscardedAnonymousScriptSource = "DiscardedAnonymousScriptSource",
    GlobalObjectCleared = "GlobalObjectCleared",
    CallFrameSelected = "CallFrameSelected",
    ConsoleCommandEvaluatedInSelectedCallFrame = "ConsoleCommandEvaluatedInSelectedCallFrame",
    DebuggerIsReadyToPause = "DebuggerIsReadyToPause"
}
export declare class Location {
    debuggerModel: DebuggerModel;
    scriptId: string;
    lineNumber: number;
    columnNumber: number;
    inlineFrameIndex: number;
    constructor(debuggerModel: DebuggerModel, scriptId: string, lineNumber: number, columnNumber?: number, inlineFrameIndex?: number);
    static fromPayload(debuggerModel: DebuggerModel, payload: Protocol.Debugger.Location, inlineFrameIndex?: number): Location;
    payload(): Protocol.Debugger.Location;
    script(): Script | null;
    continueToLocation(pausedCallback?: (() => void)): void;
    _paused(pausedCallback: () => void | undefined, debuggerPausedDetails: DebuggerPausedDetails): boolean;
    id(): string;
}
export declare class ScriptPosition {
    lineNumber: number;
    columnNumber: number;
    constructor(lineNumber: number, columnNumber: number);
    payload(): Protocol.Debugger.ScriptPosition;
    compareTo(other: ScriptPosition): number;
}
export declare class LocationRange {
    scriptId: string;
    start: ScriptPosition;
    end: ScriptPosition;
    constructor(scriptId: string, start: ScriptPosition, end: ScriptPosition);
    payload(): Protocol.Debugger.LocationRange;
    static comparator(location1: LocationRange, location2: LocationRange): number;
    compareTo(other: LocationRange): number;
    overlap(other: LocationRange): boolean;
}
export declare class BreakLocation extends Location {
    type: Protocol.Debugger.BreakLocationType | undefined;
    constructor(debuggerModel: DebuggerModel, scriptId: string, lineNumber: number, columnNumber?: number, type?: Protocol.Debugger.BreakLocationType);
    static fromPayload(debuggerModel: DebuggerModel, payload: Protocol.Debugger.BreakLocation): BreakLocation;
}
export declare class CallFrame {
    debuggerModel: DebuggerModel;
    _script: Script;
    _payload: Protocol.Debugger.CallFrame;
    _location: Location;
    _scopeChain: Scope[];
    _localScope: Scope | null;
    _inlineFrameIndex: number;
    _functionName: string;
    _functionLocation: Location | undefined;
    _returnValue: RemoteObject | null;
    constructor(debuggerModel: DebuggerModel, script: Script, payload: Protocol.Debugger.CallFrame, inlineFrameIndex?: number, functionName?: string);
    static fromPayloadArray(debuggerModel: DebuggerModel, callFrames: Protocol.Debugger.CallFrame[]): CallFrame[];
    createVirtualCallFrame(inlineFrameIndex?: number, functionName?: string): CallFrame;
    get script(): Script;
    get id(): string;
    get inlineFrameIndex(): number;
    scopeChain(): Scope[];
    localScope(): Scope | null;
    thisObject(): RemoteObject | null;
    returnValue(): RemoteObject | null;
    setReturnValue(expression: string): Promise<RemoteObject | null>;
    get functionName(): string;
    location(): Location;
    functionLocation(): Location | null;
    evaluate(options: EvaluationOptions): Promise<EvaluationResult>;
}
export interface ScopeChainEntry {
    callFrame(): CallFrame;
    type(): string;
    typeName(): string;
    name(): string | undefined;
    startLocation(): Location | null;
    endLocation(): Location | null;
    object(): RemoteObject;
    description(): string;
    icon(): string | undefined;
}
export declare class Scope implements ScopeChainEntry {
    _callFrame: CallFrame;
    _payload: Protocol.Debugger.Scope;
    _type: Protocol.Debugger.ScopeType;
    _name: string | undefined;
    _ordinal: number;
    _startLocation: Location | null;
    _endLocation: Location | null;
    _object: RemoteObject | null;
    constructor(callFrame: CallFrame, ordinal: number);
    callFrame(): CallFrame;
    type(): string;
    typeName(): string;
    name(): string | undefined;
    startLocation(): Location | null;
    endLocation(): Location | null;
    object(): RemoteObject;
    description(): string;
    icon(): undefined;
}
export declare class DebuggerPausedDetails {
    debuggerModel: DebuggerModel;
    callFrames: CallFrame[];
    reason: Protocol.Debugger.PausedEventReason;
    auxData: {
        [x: string]: any;
    } | undefined;
    breakpointIds: string[];
    asyncStackTrace: Protocol.Runtime.StackTrace | undefined;
    asyncStackTraceId: Protocol.Runtime.StackTraceId | undefined;
    constructor(debuggerModel: DebuggerModel, callFrames: Protocol.Debugger.CallFrame[], reason: Protocol.Debugger.PausedEventReason, auxData: {
        [x: string]: any;
    } | undefined, breakpointIds: string[], asyncStackTrace?: Protocol.Runtime.StackTrace, asyncStackTraceId?: Protocol.Runtime.StackTraceId);
    exception(): RemoteObject | null;
    _cleanRedundantFrames(asyncStackTrace: Protocol.Runtime.StackTrace): Protocol.Runtime.StackTrace;
}
export interface FunctionDetails {
    location: Location | null;
    functionName: string;
}
export interface SetBreakpointResult {
    breakpointId: string | null;
    locations: Location[];
}
