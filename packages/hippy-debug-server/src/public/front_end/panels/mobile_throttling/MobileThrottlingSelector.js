// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import { Events, throttlingManager } from './ThrottlingManager.js';
import { ThrottlingPresets } from './ThrottlingPresets.js';
const UIStrings = {
    /**
    *@description Mobile throttling is disabled. The user can select this option to run mobile
    *emulation at a normal speed instead of throttled.
    */
    disabled: 'Disabled',
    /**
    *@description Title for a group of pre-decided configuration options for mobile throttling. These
    *are useful default options that users might want.
    */
    presets: 'Presets',
    /**
    *@description Title for a group of advanced configuration options for mobile throttling, which
    *might not be applicable to every user or situation.
    */
    advanced: 'Advanced',
};
const str_ = i18n.i18n.registerUIStrings('panels/mobile_throttling/MobileThrottlingSelector.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class MobileThrottlingSelector {
    _populateCallback;
    _selectCallback;
    _options;
    constructor(populateCallback, selectCallback) {
        this._populateCallback = populateCallback;
        this._selectCallback = selectCallback;
        throttlingManager().addEventListener(Events.RateChanged, this._conditionsChanged, this);
        SDK.NetworkManager.MultitargetNetworkManager.instance().addEventListener(SDK.NetworkManager.MultitargetNetworkManager.Events.ConditionsChanged, this._conditionsChanged, this);
        this._options = this._populateOptions();
        this._conditionsChanged();
    }
    optionSelected(conditions) {
        SDK.NetworkManager.MultitargetNetworkManager.instance().setNetworkConditions(conditions.network);
        throttlingManager().setCPUThrottlingRate(conditions.cpuThrottlingRate);
    }
    _populateOptions() {
        const disabledGroup = {
            title: i18nString(UIStrings.disabled),
            items: [ThrottlingPresets.getNoThrottlingConditions()],
        };
        const presetsGroup = { title: i18nString(UIStrings.presets), items: ThrottlingPresets.getMobilePresets() };
        const advancedGroup = { title: i18nString(UIStrings.advanced), items: ThrottlingPresets.getAdvancedMobilePresets() };
        return this._populateCallback([disabledGroup, presetsGroup, advancedGroup]);
    }
    _conditionsChanged() {
        const networkConditions = SDK.NetworkManager.MultitargetNetworkManager.instance().networkConditions();
        const cpuThrottlingRate = throttlingManager().cpuThrottlingRate();
        for (let index = 0; index < this._options.length; ++index) {
            const option = this._options[index];
            if (option && 'network' in option && option.network === networkConditions &&
                option.cpuThrottlingRate === cpuThrottlingRate) {
                this._selectCallback(index);
                return;
            }
        }
        const customConditions = ThrottlingPresets.getCustomConditions();
        for (let index = 0; index < this._options.length; ++index) {
            const item = this._options[index];
            if (item && item.title === customConditions.title && item.description === customConditions.description) {
                this._selectCallback(index);
                return;
            }
        }
    }
}
//# sourceMappingURL=MobileThrottlingSelector.js.map