import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import type { NetworkThrottlingConditionsGroup } from './ThrottlingPresets.js';
export declare class NetworkThrottlingSelector {
    _populateCallback: (arg0: Array<NetworkThrottlingConditionsGroup>) => Array<SDK.NetworkManager.Conditions | null>;
    _selectCallback: (arg0: number) => void;
    _customNetworkConditionsSetting: Common.Settings.Setting<SDK.NetworkManager.Conditions[]>;
    _options: (SDK.NetworkManager.Conditions | null)[];
    constructor(populateCallback: (arg0: Array<NetworkThrottlingConditionsGroup>) => Array<SDK.NetworkManager.Conditions | null>, selectCallback: (arg0: number) => void, customNetworkConditionsSetting: Common.Settings.Setting<SDK.NetworkManager.Conditions[]>);
    revealAndUpdate(): void;
    optionSelected(conditions: SDK.NetworkManager.Conditions): void;
    _populateOptions(): void;
    /**
     * returns false if selected condition no longer exists
     */
    _networkConditionsChanged(): boolean;
}
