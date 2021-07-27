import * as SDK from '../../core/sdk/sdk.js';
import * as Extensions from '../../models/extensions/extensions.js';
import type * as Protocol from '../../generated/protocol.js';
import { ExtensionTracingSession } from './ExtensionTracingSession.js';
import { PerformanceModel } from './PerformanceModel.js';
export declare class TimelineController implements SDK.TargetManager.SDKModelObserver<SDK.CPUProfilerModel.CPUProfilerModel>, SDK.TracingManager.TracingManagerClient {
    _target: SDK.Target.Target;
    _tracingManager: SDK.TracingManager.TracingManager | null;
    _performanceModel: PerformanceModel;
    _client: Client;
    _tracingModel: SDK.TracingModel.TracingModel;
    _extensionSessions: ExtensionTracingSession[];
    _extensionTraceProviders?: Extensions.ExtensionTraceProvider.ExtensionTraceProvider[];
    _tracingCompleteCallback?: ((value: any) => void) | null;
    _profiling?: boolean;
    _cpuProfiles?: Map<any, any> | null;
    constructor(target: SDK.Target.Target, client: Client);
    dispose(): void;
    mainTarget(): SDK.Target.Target;
    startRecording(options: RecordingOptions, providers: Extensions.ExtensionTraceProvider.ExtensionTraceProvider[]): Promise<Protocol.ProtocolResponseWithError>;
    stopRecording(): Promise<PerformanceModel>;
    _waitForTracingToStop(awaitTracingCompleteCallback: boolean): Promise<void>;
    modelAdded(cpuProfilerModel: SDK.CPUProfilerModel.CPUProfilerModel): void;
    modelRemoved(_cpuProfilerModel: SDK.CPUProfilerModel.CPUProfilerModel): void;
    _startProfilingOnAllModels(): Promise<void>;
    _addCpuProfile(targetId: string, cpuProfile: Protocol.Profiler.Profile | null): void;
    _stopProfilingOnAllModels(): Promise<void>;
    _startRecordingWithCategories(categories: string, enableJSSampling?: boolean): Promise<Protocol.ProtocolResponseWithError>;
    traceEventsCollected(events: SDK.TracingManager.EventPayload[]): void;
    tracingComplete(): void;
    _allSourcesFinished(): void;
    _finalizeTrace(): Promise<void>;
    _injectCpuProfileEvent(pid: number, tid: number, cpuProfile: Protocol.Profiler.Profile | null): void;
    _buildTargetToProcessIdMap(): Map<string, number> | null;
    _injectCpuProfileEvents(): void;
    tracingBufferUsage(usage: number): void;
    eventsRetrievalProgress(progress: number): void;
}
export interface Client {
    recordingProgress(usage: number): void;
    loadingStarted(): void;
    processingStarted(): void;
    loadingProgress(progress?: number): void;
    loadingComplete(tracingModel: SDK.TracingModel.TracingModel | null): void;
}
export interface RecordingOptions {
    enableJSSampling?: boolean;
    capturePictures?: boolean;
    captureFilmStrip?: boolean;
    startCoverage?: boolean;
}
