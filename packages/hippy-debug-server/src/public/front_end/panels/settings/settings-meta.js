// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Root from '../../core/root/root.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
     *@description Text for keyboard shortcuts
     */
    shortcuts: 'Shortcuts',
    /**
     *@description Text in Settings Screen of the Settings
     */
    preferences: 'Preferences',
    /**
     *@description Text in Settings Screen of the Settings
     */
    experiments: 'Experiments',
    /**
     *@description Title of Ignore List settings
     */
    ignoreList: 'Ignore List',
    /**
     *@description Command for showing the keyboard shortcuts in Settings
     */
    showShortcuts: 'Show Shortcuts',
    /**
     *@description Command for showing the preference tab in the Settings Screen
     */
    showPreferences: 'Show Preferences',
    /**
     *@description Command for showing the experiments tab in the Settings Screen
     */
    showExperiments: 'Show Experiments',
    /**
     *@description Command for showing the Ignore List settings
     */
    showIgnoreList: 'Show Ignore List',
    /**
    *@description Name of the Settings view
    */
    settings: 'Settings',
    /**
     *@description Text for the documentation of something
    */
    documentation: 'Documentation',
};
const str_ = i18n.i18n.registerUIStrings('panels/settings/settings-meta.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
let loadedSettingsModule;
async function loadSettingsModule() {
    if (!loadedSettingsModule) {
        // Side-effect import resources in module.json
        await Root.Runtime.Runtime.instance().loadModulePromise('panels/settings');
        loadedSettingsModule = await import('./settings.js');
    }
    return loadedSettingsModule;
}
UI.ViewManager.registerViewExtension({
    location: "settings-view" /* SETTINGS_VIEW */,
    id: 'preferences',
    title: i18nLazyString(UIStrings.preferences),
    commandPrompt: i18nLazyString(UIStrings.showPreferences),
    order: 0,
    async loadView() {
        const Settings = await loadSettingsModule();
        return Settings.SettingsScreen.GenericSettingsTab.instance();
    },
});
UI.ViewManager.registerViewExtension({
    location: "settings-view" /* SETTINGS_VIEW */,
    id: 'experiments',
    title: i18nLazyString(UIStrings.experiments),
    commandPrompt: i18nLazyString(UIStrings.showExperiments),
    order: 3,
    experiment: Root.Runtime.ExperimentName.ALL,
    async loadView() {
        const Settings = await loadSettingsModule();
        return Settings.SettingsScreen.ExperimentsSettingsTab.instance();
    },
});
UI.ViewManager.registerViewExtension({
    location: "settings-view" /* SETTINGS_VIEW */,
    id: 'blackbox',
    title: i18nLazyString(UIStrings.ignoreList),
    commandPrompt: i18nLazyString(UIStrings.showIgnoreList),
    order: 4,
    async loadView() {
        const Settings = await loadSettingsModule();
        return Settings.FrameworkIgnoreListSettingsTab.FrameworkIgnoreListSettingsTab.instance();
    },
});
UI.ViewManager.registerViewExtension({
    location: "settings-view" /* SETTINGS_VIEW */,
    id: 'keybinds',
    title: i18nLazyString(UIStrings.shortcuts),
    commandPrompt: i18nLazyString(UIStrings.showShortcuts),
    order: 100,
    async loadView() {
        const Settings = await loadSettingsModule();
        return Settings.KeybindsSettingsTab.KeybindsSettingsTab.instance();
    },
});
UI.ActionRegistration.registerActionExtension({
    category: UI.ActionRegistration.ActionCategory.SETTINGS,
    actionId: 'settings.show',
    title: i18nLazyString(UIStrings.settings),
    async loadActionDelegate() {
        const Settings = await loadSettingsModule();
        return Settings.SettingsScreen.ActionDelegate.instance();
    },
    iconClass: "largeicon-settings-gear" /* LARGEICON_SETTINGS_GEAR */,
    bindings: [
        {
            shortcut: 'F1',
            keybindSets: [
                "devToolsDefault" /* DEVTOOLS_DEFAULT */,
            ],
        },
        {
            shortcut: 'Shift+?',
        },
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+,',
            keybindSets: [
                "vsCode" /* VS_CODE */,
            ],
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+,',
            keybindSets: [
                "vsCode" /* VS_CODE */,
            ],
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    category: UI.ActionRegistration.ActionCategory.SETTINGS,
    actionId: 'settings.documentation',
    title: i18nLazyString(UIStrings.documentation),
    async loadActionDelegate() {
        const Settings = await loadSettingsModule();
        return Settings.SettingsScreen.ActionDelegate.instance();
    },
});
UI.ActionRegistration.registerActionExtension({
    category: UI.ActionRegistration.ActionCategory.SETTINGS,
    actionId: 'settings.shortcuts',
    title: i18nLazyString(UIStrings.shortcuts),
    async loadActionDelegate() {
        const Settings = await loadSettingsModule();
        return Settings.SettingsScreen.ActionDelegate.instance();
    },
    bindings: [
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+K Ctrl+S',
            keybindSets: [
                "vsCode" /* VS_CODE */,
            ],
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+K Meta+S',
            keybindSets: [
                "vsCode" /* VS_CODE */,
            ],
        },
    ],
});
UI.ViewManager.registerLocationResolver({
    name: "settings-view" /* SETTINGS_VIEW */,
    category: UI.ViewManager.ViewLocationCategoryValues.SETTINGS,
    async loadResolver() {
        const Settings = await loadSettingsModule();
        return Settings.SettingsScreen.SettingsScreen.instance();
    },
});
Common.Revealer.registerRevealer({
    contextTypes() {
        return [
            Common.Settings.Setting,
        ];
    },
    async loadRevealer() {
        const Settings = await loadSettingsModule();
        return Settings.SettingsScreen.Revealer.instance();
    },
    destination: undefined,
});
UI.ContextMenu.registerItem({
    location: UI.ContextMenu.ItemLocation.MAIN_MENU_FOOTER,
    actionId: 'settings.shortcuts',
    order: undefined,
});
UI.ContextMenu.registerItem({
    location: UI.ContextMenu.ItemLocation.MAIN_MENU_HELP_DEFAULT,
    actionId: 'settings.documentation',
    order: undefined,
});
//# sourceMappingURL=settings-meta.js.map