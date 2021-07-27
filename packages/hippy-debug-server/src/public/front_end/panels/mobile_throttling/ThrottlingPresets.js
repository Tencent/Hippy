// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
const UIStrings = {
    /**
     *@description Text for no network throttling
     */
    noThrottling: 'No throttling',
    /**
     *@description Text in Throttling Presets of the Network panel
     */
    noInternetConnectivity: 'No internet connectivity',
    /**
     *@description Text in Throttling Presets of the Network panel
     */
    lowendMobile: 'Low-end mobile',
    /**
     *@description Text in Throttling Presets of the Network panel
     */
    slowGXCpuSlowdown: 'Slow 3G & 6x CPU slowdown',
    /**
     *@description Text in Throttling Presets of the Network panel
     */
    midtierMobile: 'Mid-tier mobile',
    /**
     *@description Text in Throttling Presets of the Network panel
     */
    fastGXCpuSlowdown: 'Fast 3G & 4x CPU slowdown',
    /**
     *@description Text in Network Throttling Selector of the Network panel
     */
    custom: 'Custom',
    /**
     *@description Text in Throttling Presets of the Network panel
     */
    checkNetworkAndPerformancePanels: 'Check Network and Performance panels',
};
const str_ = i18n.i18n.registerUIStrings('panels/mobile_throttling/ThrottlingPresets.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var CPUThrottlingRates;
(function (CPUThrottlingRates) {
    CPUThrottlingRates[CPUThrottlingRates["NoThrottling"] = 1] = "NoThrottling";
    CPUThrottlingRates[CPUThrottlingRates["MidTierMobile"] = 4] = "MidTierMobile";
    CPUThrottlingRates[CPUThrottlingRates["LowEndMobile"] = 6] = "LowEndMobile";
})(CPUThrottlingRates || (CPUThrottlingRates = {}));
export class ThrottlingPresets {
    static getNoThrottlingConditions() {
        const title = typeof SDK.NetworkManager.NoThrottlingConditions.title === 'function' ?
            SDK.NetworkManager.NoThrottlingConditions.title() :
            SDK.NetworkManager.NoThrottlingConditions.title;
        return {
            title,
            description: i18nString(UIStrings.noThrottling),
            network: SDK.NetworkManager.NoThrottlingConditions,
            cpuThrottlingRate: CPUThrottlingRates.NoThrottling,
        };
    }
    static getOfflineConditions() {
        const title = typeof SDK.NetworkManager.OfflineConditions.title === 'function' ?
            SDK.NetworkManager.OfflineConditions.title() :
            SDK.NetworkManager.OfflineConditions.title;
        return {
            title,
            description: i18nString(UIStrings.noInternetConnectivity),
            network: SDK.NetworkManager.OfflineConditions,
            cpuThrottlingRate: CPUThrottlingRates.NoThrottling,
        };
    }
    static getLowEndMobileConditions() {
        return {
            title: i18nString(UIStrings.lowendMobile),
            description: i18nString(UIStrings.slowGXCpuSlowdown),
            network: SDK.NetworkManager.Slow3GConditions,
            cpuThrottlingRate: CPUThrottlingRates.LowEndMobile,
        };
    }
    static getMidTierMobileConditions() {
        return {
            title: i18nString(UIStrings.midtierMobile),
            description: i18nString(UIStrings.fastGXCpuSlowdown),
            network: SDK.NetworkManager.Fast3GConditions,
            cpuThrottlingRate: CPUThrottlingRates.MidTierMobile,
        };
    }
    static getCustomConditions() {
        return {
            title: i18nString(UIStrings.custom),
            description: i18nString(UIStrings.checkNetworkAndPerformancePanels),
        };
    }
    static getMobilePresets() {
        return [
            ThrottlingPresets.getMidTierMobileConditions(),
            ThrottlingPresets.getLowEndMobileConditions(),
            ThrottlingPresets.getCustomConditions(),
        ];
    }
    static getAdvancedMobilePresets() {
        return [
            ThrottlingPresets.getOfflineConditions(),
        ];
    }
    static networkPresets = [
        SDK.NetworkManager.Fast3GConditions,
        SDK.NetworkManager.Slow3GConditions,
        SDK.NetworkManager.OfflineConditions,
    ];
    static cpuThrottlingPresets = [
        CPUThrottlingRates.NoThrottling,
        CPUThrottlingRates.MidTierMobile,
        CPUThrottlingRates.LowEndMobile,
    ];
}
// @ts-ignore exported for Tests.js
globalThis.MobileThrottling = globalThis.MobileThrottling || {};
// @ts-ignore exported for Tests.js
globalThis.MobileThrottling.networkPresets = ThrottlingPresets.networkPresets;
//# sourceMappingURL=ThrottlingPresets.js.map