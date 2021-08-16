import type * as HeapSnapshotModel from '../../models/heap_snapshot_model/heap_snapshot_model.js';
export declare class HeapSnapshotWorkerDispatcher {
    _objects: any[];
    _global: Worker;
    _postMessage: Function;
    constructor(globalObject: Worker, postMessage: Function);
    _findFunction(name: string): Function;
    sendEvent(name: string, data: any): void;
    dispatchMessage({ data }: {
        data: HeapSnapshotModel.HeapSnapshotModel.WorkerCommand;
    }): void;
}
