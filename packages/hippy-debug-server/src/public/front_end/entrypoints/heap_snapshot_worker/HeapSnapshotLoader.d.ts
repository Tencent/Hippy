import { HeapSnapshotProgress, JSHeapSnapshot } from './HeapSnapshot.js';
import type { HeapSnapshotWorkerDispatcher } from './HeapSnapshotWorkerDispatcher.js';
export declare class HeapSnapshotLoader {
    _progress: HeapSnapshotProgress;
    _buffer: string;
    _dataCallback: ((value: string | PromiseLike<string>) => void) | null;
    _done: boolean;
    _snapshot?: {
        [x: string]: any;
    };
    _array: number[] | Uint32Array | null;
    _arrayIndex: number;
    _json?: any;
    _jsonTokenizer?: any;
    constructor(dispatcher: HeapSnapshotWorkerDispatcher);
    dispose(): void;
    _reset(): void;
    close(): void;
    buildSnapshot(): JSHeapSnapshot;
    _parseUintArray(): boolean;
    _parseStringsArray(): void;
    write(chunk: string): void;
    _fetchChunk(): Promise<string>;
    _findToken(token: string, startIndex?: number): Promise<number>;
    _parseArray(name: string, title: string, length?: number): Promise<number[] | Uint32Array>;
    _parseInput(): Promise<void>;
}
