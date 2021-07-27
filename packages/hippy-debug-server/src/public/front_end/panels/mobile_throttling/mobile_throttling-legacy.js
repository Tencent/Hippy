// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// @ts-nocheck
import * as MobileThrottlingModule from './mobile_throttling.js';
self.MobileThrottling = self.MobileThrottling || {};
MobileThrottling = MobileThrottling || {};
/** @constructor */
MobileThrottling.MobileThrottlingSelector = MobileThrottlingModule.MobileThrottlingSelector.MobileThrottlingSelector;
/** @constructor */
MobileThrottling.NetworkPanelIndicator = MobileThrottlingModule.NetworkPanelIndicator.NetworkPanelIndicator;
/** @constructor */
MobileThrottling.NetworkThrottlingSelector = MobileThrottlingModule.NetworkThrottlingSelector.NetworkThrottlingSelector;
/** @constructor */
MobileThrottling.ThrottlingManager = MobileThrottlingModule.ThrottlingManager.ThrottlingManager;
MobileThrottling.ThrottlingManager.Events = MobileThrottlingModule.ThrottlingManager.Events;
/** @constructor */
MobileThrottling.ThrottlingManager.ActionDelegate = MobileThrottlingModule.ThrottlingManager.ActionDelegate;
MobileThrottling.throttlingManager = MobileThrottlingModule.ThrottlingManager.throttlingManager;
/** @enum {number} */
MobileThrottling.CPUThrottlingRates = MobileThrottlingModule.ThrottlingPresets.CPUThrottlingRates;
MobileThrottling.NoThrottlingConditions =
    MobileThrottlingModule.ThrottlingPresets.ThrottlingPresets.getNoThrottlingConditions;
MobileThrottling.OfflineConditions = MobileThrottlingModule.ThrottlingPresets.ThrottlingPresets.getOfflineConditions;
MobileThrottling.LowEndMobileConditions =
    MobileThrottlingModule.ThrottlingPresets.ThrottlingPresets.getLowEndMobileConditions;
MobileThrottling.MidTierMobileConditions =
    MobileThrottlingModule.ThrottlingPresets.ThrottlingPresets.getMidTierMobileConditions;
MobileThrottling.CustomConditions = MobileThrottlingModule.ThrottlingPresets.ThrottlingPresets.getCustomConditions;
MobileThrottling.mobilePresets = MobileThrottlingModule.ThrottlingPresets.ThrottlingPresets.getMobilePresets;
MobileThrottling.advancedMobilePresets =
    MobileThrottlingModule.ThrottlingPresets.ThrottlingPresets.getAdvancedMobilePresets;
MobileThrottling.networkPresets = MobileThrottlingModule.ThrottlingPresets.ThrottlingPresets.networkPresets;
MobileThrottling.cpuThrottlingPresets = MobileThrottlingModule.ThrottlingPresets.ThrottlingPresets.cpuThrottlingPresets;
/** @constructor */
MobileThrottling.ThrottlingSettingsTab = MobileThrottlingModule.ThrottlingSettingsTab.ThrottlingSettingsTab;
//# sourceMappingURL=mobile_throttling-legacy.js.map