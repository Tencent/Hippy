import * as Common from '../common/common.js';
import type { HeapProfilerModel } from './HeapProfilerModel.js';
import { RuntimeModel } from './RuntimeModel.js';
import type { SDKModelObserver } from './TargetManager.js';
export declare class IsolateManager extends Common.ObjectWrapper.ObjectWrapper implements SDKModelObserver<RuntimeModel> {
    _isolates: Map<string, Isolate>;
    _isolateIdByModel: Map<RuntimeModel, string | null>;
    _observers: Set<Observer>;
    _pollId: number;
    constructor();
    static instance({ forceNew }?: {
        forceNew: boolean;
    }): IsolateManager;
    observeIsolates(observer: Observer): void;
    unobserveIsolates(observer: Observer): void;
    modelAdded(model: RuntimeModel): void;
    _modelAdded(model: RuntimeModel): Promise<void>;
    modelRemoved(model: RuntimeModel): void;
    isolateByModel(model: RuntimeModel): Isolate | null;
    isolates(): Iterable<Isolate>;
    _poll(): Promise<void>;
}
export interface Observer {
    isolateAdded(isolate: Isolate): void;
    isolateRemoved(isolate: Isolate): void;
    isolateChanged(isolate: Isolate): void;
}
export declare enum Events {
    MemoryChanged = "MemoryChanged"
}
export declare const MemoryTrendWindowMs = 120000;
export declare class Isolate {
    _id: string;
    _models: Set<RuntimeModel>;
    _usedHeapSize: number;
    _memoryTrend: MemoryTrend;
    constructor(id: string);
    id(): string;
    models(): Set<RuntimeModel>;
    runtimeModel(): RuntimeModel | null;
    heapProfilerModel(): HeapProfilerModel | null;
    _update(): Promise<void>;
    samplesCount(): number;
    usedHeapSize(): number;
    /** bytes per millisecond
       */
    usedHeapSizeGrowRate(): number;
    isMainThread(): boolean;
}
export declare class MemoryTrend {
    _maxCount: number;
    _base: number;
    _index: number;
    _x: number[];
    _y: number[];
    _sx: number;
    _sy: number;
    _sxx: number;
    _sxy: number;
    constructor(maxCount: number);
    reset(): void;
    count(): number;
    add(heapSize: number, timestamp?: number): void;
    fitSlope(): number;
}
