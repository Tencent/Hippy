import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import { NetworkThrottlingSelector } from './NetworkThrottlingSelector.js';
export declare class ThrottlingManager extends Common.ObjectWrapper.ObjectWrapper implements SDK.TargetManager.SDKModelObserver<SDK.EmulationModel.EmulationModel> {
    _cpuThrottlingRate: number;
    _cpuThrottlingControls: Set<UI.Toolbar.ToolbarComboBox>;
    _cpuThrottlingRates: number[];
    _customNetworkConditionsSetting: Common.Settings.Setting<SDK.NetworkManager.Conditions[]>;
    _currentNetworkThrottlingConditions: SDK.NetworkManager.Conditions;
    _lastNetworkThrottlingConditions: SDK.NetworkManager.Conditions;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): ThrottlingManager;
    decorateSelectWithNetworkThrottling(selectElement: HTMLSelectElement): NetworkThrottlingSelector;
    createOfflineToolbarCheckbox(): UI.Toolbar.ToolbarCheckbox;
    createMobileThrottlingButton(): UI.Toolbar.ToolbarMenuButton;
    cpuThrottlingRate(): number;
    setCPUThrottlingRate(rate: number): void;
    modelAdded(emulationModel: SDK.EmulationModel.EmulationModel): void;
    modelRemoved(_emulationModel: SDK.EmulationModel.EmulationModel): void;
    createCPUThrottlingSelector(): UI.Toolbar.ToolbarComboBox;
}
export declare enum Events {
    RateChanged = "RateChanged"
}
export declare class ActionDelegate implements UI.ActionRegistration.ActionDelegate {
    static instance(opts?: {
        forceNew: boolean | null;
    }): ActionDelegate;
    handleAction(context: UI.Context.Context, actionId: string): boolean;
}
export declare function throttlingManager(): ThrottlingManager;
