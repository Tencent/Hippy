import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import type * as Protocol from '../../generated/protocol.js';
import { DebuggerModel, Location } from './DebuggerModel.js';
import type { RuntimeModel } from './RuntimeModel.js';
import type { Target } from './Target.js';
import { SDKModel } from './SDKModel.js';
export declare class CPUProfilerModel extends SDKModel implements ProtocolProxyApi.ProfilerDispatcher {
    _isRecording: boolean;
    _nextAnonymousConsoleProfileNumber: number;
    _anonymousConsoleProfileIdToTitle: Map<any, any>;
    _profilerAgent: ProtocolProxyApi.ProfilerApi;
    _preciseCoverageDeltaUpdateCallback: ((arg0: number, arg1: string, arg2: Array<Protocol.Profiler.ScriptCoverage>) => void) | null;
    _debuggerModel: DebuggerModel;
    constructor(target: Target);
    runtimeModel(): RuntimeModel;
    debuggerModel(): DebuggerModel;
    consoleProfileStarted({ id, location, title }: Protocol.Profiler.ConsoleProfileStartedEvent): void;
    consoleProfileFinished({ id, location, profile, title }: Protocol.Profiler.ConsoleProfileFinishedEvent): void;
    _dispatchProfileEvent(eventName: Events, id: string, scriptLocation: Protocol.Debugger.Location, title?: string, cpuProfile?: Protocol.Profiler.Profile): void;
    isRecordingProfile(): boolean;
    startRecording(): Promise<any>;
    stopRecording(): Promise<Protocol.Profiler.Profile | null>;
    startPreciseCoverage(jsCoveragePerBlock: boolean, preciseCoverageDeltaUpdateCallback: ((arg0: number, arg1: string, arg2: Array<Protocol.Profiler.ScriptCoverage>) => void) | null): Promise<any>;
    takePreciseCoverage(): Promise<{
        timestamp: number;
        coverage: Array<Protocol.Profiler.ScriptCoverage>;
    }>;
    stopPreciseCoverage(): Promise<any>;
    preciseCoverageDeltaUpdate({ timestamp, occasion, result }: Protocol.Profiler.PreciseCoverageDeltaUpdateEvent): void;
}
export declare enum Events {
    ConsoleProfileStarted = "ConsoleProfileStarted",
    ConsoleProfileFinished = "ConsoleProfileFinished"
}
export interface EventData {
    id: string;
    scriptLocation: Location;
    title: string;
    cpuProfile?: Protocol.Profiler.Profile;
    cpuProfilerModel: CPUProfilerModel;
}
