// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../i18n/i18n.js';
import * as Root from '../root/root.js';
const UIStrings = {
    /**
    *@description Title of the Elements Panel
    */
    elements: 'Elements',
    /**
    *@description Text for DevTools appearance
    */
    appearance: 'Appearance',
    /**
    *@description Name of the Sources panel
    */
    sources: 'Sources',
    /**
    *@description Title of the Network tool
    */
    network: 'Network',
    /**
    *@description Text for the performance of something
    */
    performance: 'Performance',
    /**
    *@description Title of the Console tool
    */
    console: 'Console',
    /**
    *@description A title of the 'Persistence' setting category
    */
    persistence: 'Persistence',
    /**
    *@description Text that refers to the debugger
    */
    debugger: 'Debugger',
    /**
    *@description Text describing global shortcuts and settings that are available throughout the DevTools
    */
    global: 'Global',
    /**
    *@description Title of the Rendering tool
    */
    rendering: 'Rendering',
    /**
    *@description Title of a section on CSS Grid tooling
    */
    grid: 'Grid',
    /**
    *@description Text for the mobile platform, as opposed to desktop
    */
    mobile: 'Mobile',
    /**
    *@description Text for the memory of the page
    */
    memory: 'Memory',
    /**
    *@description Text for the extension of the page
    */
    extension: 'Extension',
    /**
    *@description Text for the adorner of the page
    */
    adorner: 'Adorner',
};
const str_ = i18n.i18n.registerUIStrings('core/common/SettingRegistration.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let registeredSettings = [];
const settingNameSet = new Set();
export function registerSettingExtension(registration) {
    const settingName = registration.settingName;
    if (settingNameSet.has(settingName)) {
        throw new Error(`Duplicate setting name '${settingName}'`);
    }
    settingNameSet.add(settingName);
    registeredSettings.push(registration);
}
export function getRegisteredSettings() {
    return registeredSettings.filter(setting => Root.Runtime.Runtime.isDescriptorEnabled({ experiment: setting.experiment, condition: setting.condition }));
}
export function registerSettingsForTest(settings, forceReset = false) {
    if (registeredSettings.length === 0 || forceReset) {
        registeredSettings = settings;
        settingNameSet.clear();
        for (const setting of settings) {
            const settingName = setting.settingName;
            if (settingNameSet.has(settingName)) {
                throw new Error(`Duplicate setting name '${settingName}'`);
            }
            settingNameSet.add(settingName);
        }
    }
}
export function resetSettings() {
    registeredSettings = [];
}
export function maybeRemoveSettingExtension(settingName) {
    const settingIndex = registeredSettings.findIndex(setting => setting.settingName === settingName);
    if (settingIndex < 0 || !settingNameSet.delete(settingName)) {
        return false;
    }
    registeredSettings.splice(settingIndex, 1);
    return true;
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var SettingCategory;
(function (SettingCategory) {
    SettingCategory["NONE"] = "";
    SettingCategory["ELEMENTS"] = "ELEMENTS";
    SettingCategory["APPEARANCE"] = "APPEARANCE";
    SettingCategory["SOURCES"] = "SOURCES";
    SettingCategory["NETWORK"] = "NETWORK";
    SettingCategory["PERFORMANCE"] = "PERFORMANCE";
    SettingCategory["CONSOLE"] = "CONSOLE";
    SettingCategory["PERSISTENCE"] = "PERSISTENCE";
    SettingCategory["DEBUGGER"] = "DEBUGGER";
    SettingCategory["GLOBAL"] = "GLOBAL";
    SettingCategory["RENDERING"] = "RENDERING";
    SettingCategory["GRID"] = "GRID";
    SettingCategory["MOBILE"] = "MOBILE";
    SettingCategory["EMULATION"] = "EMULATION";
    SettingCategory["MEMORY"] = "MEMORY";
    SettingCategory["EXTENSIONS"] = "EXTENSIONS";
    SettingCategory["ADORNER"] = "ADORNER";
})(SettingCategory || (SettingCategory = {}));
export function getLocalizedSettingsCategory(category) {
    switch (category) {
        case SettingCategory.ELEMENTS:
            return i18nString(UIStrings.elements);
        case SettingCategory.APPEARANCE:
            return i18nString(UIStrings.appearance);
        case SettingCategory.SOURCES:
            return i18nString(UIStrings.sources);
        case SettingCategory.NETWORK:
            return i18nString(UIStrings.network);
        case SettingCategory.PERFORMANCE:
            return i18nString(UIStrings.performance);
        case SettingCategory.CONSOLE:
            return i18nString(UIStrings.console);
        case SettingCategory.PERSISTENCE:
            return i18nString(UIStrings.persistence);
        case SettingCategory.DEBUGGER:
            return i18nString(UIStrings.debugger);
        case SettingCategory.GLOBAL:
            return i18nString(UIStrings.global);
        case SettingCategory.RENDERING:
            return i18nString(UIStrings.rendering);
        case SettingCategory.GRID:
            return i18nString(UIStrings.grid);
        case SettingCategory.MOBILE:
            return i18nString(UIStrings.mobile);
        case SettingCategory.EMULATION:
            return i18nString(UIStrings.console);
        case SettingCategory.MEMORY:
            return i18nString(UIStrings.memory);
        case SettingCategory.EXTENSIONS:
            return i18nString(UIStrings.extension);
        case SettingCategory.ADORNER:
            return i18nString(UIStrings.adorner);
        case SettingCategory.NONE:
            return '';
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var SettingType;
(function (SettingType) {
    SettingType["ARRAY"] = "array";
    SettingType["REGEX"] = "regex";
    SettingType["ENUM"] = "enum";
    SettingType["BOOLEAN"] = "boolean";
})(SettingType || (SettingType = {}));
//# sourceMappingURL=SettingRegistration.js.map