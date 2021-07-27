import type * as SDK from '../../core/sdk/sdk.js';
import type * as Extensions from '../../models/extensions/extensions.js';
import type { PerformanceModel } from './PerformanceModel.js';
import type { Client } from './TimelineLoader.js';
export declare class ExtensionTracingSession implements Extensions.ExtensionTraceProvider.TracingSession, Client {
    _provider: Extensions.ExtensionTraceProvider.ExtensionTraceProvider;
    _performanceModel: PerformanceModel;
    _completionCallback: () => void;
    _completionPromise: Promise<void>;
    _timeOffset: number;
    constructor(provider: Extensions.ExtensionTraceProvider.ExtensionTraceProvider, performanceModel: PerformanceModel);
    loadingStarted(): void;
    processingStarted(): void;
    loadingProgress(_progress?: number): void;
    loadingComplete(tracingModel: SDK.TracingModel.TracingModel | null): void;
    complete(url: string, timeOffsetMicroseconds: number): void;
    start(): void;
    stop(): Promise<void>;
}
