import * as SDK from '../../../core/sdk/sdk.js';
import type { Settings } from './LinearMemoryInspector.js';
export declare const ACCEPTED_MEMORY_TYPES: string[];
export interface LazyUint8Array {
    getRange(start: number, end: number): Promise<Uint8Array>;
    length(): number;
}
export declare class RemoteArrayBufferWrapper implements LazyUint8Array {
    private remoteArrayBuffer;
    constructor(arrayBuffer: SDK.RemoteObject.RemoteArrayBuffer);
    length(): number;
    getRange(start: number, end: number): Promise<Uint8Array>;
}
export declare class LinearMemoryInspectorController extends SDK.TargetManager.SDKModelObserver<SDK.RuntimeModel.RuntimeModel> {
    private paneInstance;
    private bufferIdToRemoteObject;
    private settings;
    private constructor();
    static instance(): LinearMemoryInspectorController;
    static getMemoryForAddress(memoryWrapper: LazyUint8Array, address: number): Promise<{
        memory: Uint8Array;
        offset: number;
    }>;
    static getMemoryRange(memoryWrapper: LazyUint8Array, start: number, end: number): Promise<Uint8Array>;
    saveSettings(data: Settings): void;
    loadSettings(): Settings;
    openInspectorView(obj: SDK.RemoteObject.RemoteObject, address?: number): Promise<void>;
    modelRemoved(model: SDK.RuntimeModel.RuntimeModel): void;
    private onDebuggerPause;
    private onGlobalObjectClear;
    private viewClosed;
}
