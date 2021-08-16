// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
const UIStrings = {
    /**
   *@description Text to preserve the log after refreshing
   */
    preserveLog: 'Preserve log',
    /**
    * @description A term that can be used to search in the command menu, and will find the search
    * result 'Preserve log on page reload / navigation'. This is an additional search term to help
    * user find the setting even when they don't know the exact name of it.
    */
    preserve: 'preserve',
    /**
    * @description A term that can be used to search in the command menu, and will find the search
    * result 'Preserve log on page reload / navigation'. This is an additional search term to help
    * user find the setting even when they don't know the exact name of it.
    */
    clear: 'clear',
    /**
    * @description A term that can be used to search in the command menu, and will find the search
    * result 'Preserve log on page reload / navigation'. This is an additional search term to help
    * user find the setting even when they don't know the exact name of it.
    */
    reset: 'reset',
    /**
   *@description Title of a setting under the Network category that can be invoked through the Command Menu
   */
    preserveLogOnPageReload: 'Preserve log on page reload / navigation',
    /**
   *@description Title of a setting under the Network category that can be invoked through the Command Menu
   */
    doNotPreserveLogOnPageReload: 'Do not preserve log on page reload / navigation',
    /**
   *@description Title of an action in the network tool to toggle recording
   */
    recordNetworkLog: 'Record network log',
};
const str_ = i18n.i18n.registerUIStrings('models/logs/logs-meta.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.NETWORK,
    title: i18nLazyString(UIStrings.preserveLog),
    settingName: 'network_log.preserve-log',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: false,
    tags: [
        i18nLazyString(UIStrings.preserve),
        i18nLazyString(UIStrings.clear),
        i18nLazyString(UIStrings.reset),
    ],
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.preserveLogOnPageReload),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.doNotPreserveLogOnPageReload),
        },
    ],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.NETWORK,
    title: i18nLazyString(UIStrings.recordNetworkLog),
    settingName: 'network_log.record-log',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: true,
    storageType: Common.Settings.SettingStorageType.Session,
});
//# sourceMappingURL=logs-meta.js.map