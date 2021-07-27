import { CPUProfileType } from './CPUProfileView.js';
import { SamplingHeapProfileType } from './HeapProfileView.js';
import { HeapSnapshotProfileType, TrackingHeapSnapshotProfileType } from './HeapSnapshotView.js';
export declare class ProfileTypeRegistry {
    cpuProfileType: CPUProfileType;
    heapSnapshotProfileType: HeapSnapshotProfileType;
    samplingHeapProfileType: SamplingHeapProfileType;
    trackingHeapSnapshotProfileType: TrackingHeapSnapshotProfileType;
    constructor();
}
export declare const instance: ProfileTypeRegistry;
