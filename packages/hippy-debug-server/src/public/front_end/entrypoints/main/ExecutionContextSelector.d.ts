import * as SDK from '../../core/sdk/sdk.js';
import type * as UI from '../../ui/legacy/legacy.js';
export declare class ExecutionContextSelector implements SDK.TargetManager.SDKModelObserver<SDK.RuntimeModel.RuntimeModel> {
    private targetManager;
    private context;
    private lastSelectedContextId?;
    private ignoreContextChanged?;
    constructor(targetManager: SDK.TargetManager.TargetManager, context: UI.Context.Context);
    modelAdded(runtimeModel: SDK.RuntimeModel.RuntimeModel): void;
    modelRemoved(runtimeModel: SDK.RuntimeModel.RuntimeModel): void;
    private executionContextChanged;
    private contextPersistentId;
    private targetChanged;
    private shouldSwitchToContext;
    private isDefaultContext;
    private onExecutionContextCreated;
    private onExecutionContextDestroyed;
    private onExecutionContextOrderChanged;
    private switchContextIfNecessary;
    private currentExecutionContextGone;
}
