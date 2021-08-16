import * as Common from '../../../../core/common/common.js';
import * as SDK from '../../../../core/sdk/sdk.js';
export declare class LiveHeapProfile implements Common.Runnable.Runnable, SDK.TargetManager.SDKModelObserver<SDK.HeapProfilerModel.HeapProfilerModel> {
    _running: boolean;
    _sessionId: number;
    _loadEventCallback: (arg0?: Function | null) => void;
    _setting: Common.Settings.Setting<boolean>;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): LiveHeapProfile;
    run(): Promise<void>;
    modelAdded(model: SDK.HeapProfilerModel.HeapProfilerModel): void;
    modelRemoved(_model: SDK.HeapProfilerModel.HeapProfilerModel): void;
    _startProfiling(): Promise<void>;
    _stopProfiling(): void;
    _loadEventFired(): void;
}
