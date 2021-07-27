import * as SDK from '../../core/sdk/sdk.js';
export declare class LogManager implements SDK.TargetManager.SDKModelObserver<SDK.LogModel.LogModel> {
    private constructor();
    static instance({ forceNew }?: {
        forceNew: boolean;
    }): LogManager;
    modelAdded(logModel: SDK.LogModel.LogModel): void;
    modelRemoved(logModel: SDK.LogModel.LogModel): void;
    private logEntryAdded;
}
