import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import type * as Protocol from '../../generated/protocol.js';
import type { DebuggerModel } from './DebuggerModel.js';
import type { RemoteObject } from './RemoteObject.js';
import { RuntimeModel } from './RuntimeModel.js';
import type { Target } from './Target.js';
import { SDKModel } from './SDKModel.js';
export declare class HeapProfilerModel extends SDKModel {
    _enabled: boolean;
    _heapProfilerAgent: ProtocolProxyApi.HeapProfilerApi;
    _memoryAgent: ProtocolProxyApi.MemoryApi;
    _runtimeModel: RuntimeModel;
    _samplingProfilerDepth: number;
    constructor(target: Target);
    debuggerModel(): DebuggerModel;
    runtimeModel(): RuntimeModel;
    enable(): Promise<void>;
    startSampling(samplingRateInBytes?: number): Promise<boolean>;
    stopSampling(): Promise<Protocol.HeapProfiler.SamplingHeapProfile | null>;
    getSamplingProfile(): Promise<Protocol.HeapProfiler.SamplingHeapProfile | null>;
    collectGarbage(): Promise<boolean>;
    snapshotObjectIdForObjectId(objectId: string): Promise<string | null>;
    objectForSnapshotObjectId(snapshotObjectId: string, objectGroupName: string): Promise<RemoteObject | null>;
    addInspectedHeapObject(snapshotObjectId: string): Promise<boolean>;
    takeHeapSnapshot(heapSnapshotOptions: Protocol.HeapProfiler.TakeHeapSnapshotRequest): Promise<void>;
    startTrackingHeapObjects(recordAllocationStacks: boolean): Promise<boolean>;
    stopTrackingHeapObjects(reportProgress: boolean): Promise<boolean>;
    heapStatsUpdate(samples: number[]): void;
    lastSeenObjectId(lastSeenObjectId: number, timestamp: number): void;
    addHeapSnapshotChunk(chunk: string): void;
    reportHeapSnapshotProgress(done: number, total: number, finished?: boolean): void;
    resetProfiles(): void;
}
export declare enum Events {
    HeapStatsUpdate = "HeapStatsUpdate",
    LastSeenObjectId = "LastSeenObjectId",
    AddHeapSnapshotChunk = "AddHeapSnapshotChunk",
    ReportHeapSnapshotProgress = "ReportHeapSnapshotProgress",
    ResetProfiles = "ResetProfiles"
}
export interface NativeProfilerCallFrame {
    functionName: string;
    url: string;
    scriptId?: string;
    lineNumber?: number;
    columnNumber?: number;
}
export interface CommonHeapProfileNode {
    callFrame: NativeProfilerCallFrame;
    selfSize: number;
    id?: number;
    children: CommonHeapProfileNode[];
}
export interface CommonHeapProfile {
    head: CommonHeapProfileNode;
    modules: Protocol.Memory.Module[];
}
