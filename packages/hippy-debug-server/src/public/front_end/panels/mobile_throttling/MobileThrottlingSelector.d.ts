import type { Conditions, ConditionsList, MobileThrottlingConditionsGroup } from './ThrottlingPresets.js';
export declare class MobileThrottlingSelector {
    _populateCallback: (arg0: Array<MobileThrottlingConditionsGroup>) => ConditionsList;
    _selectCallback: (arg0: number) => void;
    _options: ConditionsList;
    constructor(populateCallback: (arg0: Array<MobileThrottlingConditionsGroup>) => ConditionsList, selectCallback: (arg0: number) => void);
    optionSelected(conditions: Conditions): void;
    _populateOptions(): ConditionsList;
    _conditionsChanged(): void;
}
