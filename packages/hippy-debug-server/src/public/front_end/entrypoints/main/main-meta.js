// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as Root from '../../core/root/root.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as i18n from '../../core/i18n/i18n.js';
const UIStrings = {
    /**
    *@description Text in Main
    */
    focusDebuggee: 'Focus debuggee',
    /**
    *@description Text in the Shortcuts page in settings to explain a keyboard shortcut
    */
    toggleDrawer: 'Toggle drawer',
    /**
    *@description Title of an action that navigates to the next panel
    */
    nextPanel: 'Next panel',
    /**
    *@description Title of an action that navigates to the previous panel
    */
    previousPanel: 'Previous panel',
    /**
    *@description Title of an action that reloads the DevTools
    */
    reloadDevtools: 'Reload DevTools',
    /**
    *@description Title of an action in the main tool to toggle dock
    */
    restoreLastDockPosition: 'Restore last dock position',
    /**
    *@description Text in the Shortcuts page to explain a keyboard shortcut (zoom in)
    */
    zoomIn: 'Zoom in',
    /**
    *@description Text in the Shortcuts page to explain a keyboard shortcut (zoom out)
    */
    zoomOut: 'Zoom out',
    /**
    *@description Title of an action that reset the zoom level to its default
    */
    resetZoomLevel: 'Reset zoom level',
    /**
    *@description Title of an action to search in panel
    */
    searchInPanel: 'Search in panel',
    /**
    *@description Title of an action that cancels the current search
    */
    cancelSearch: 'Cancel search',
    /**
    *@description Title of an action that finds the next search result
    */
    findNextResult: 'Find next result',
    /**
    *@description Title of an action to find the previous search result
    */
    findPreviousResult: 'Find previous result',
    /**
    *@description Title of a setting under the Appearance category in Settings
    */
    theme: 'Theme:',
    /**
    *@description Title of a setting under the Appearance category that can be invoked through the Command Menu
    */
    switchToSystemPreferredColor: 'Switch to system preferred color theme',
    /**
    *@description A drop-down menu option to switch to system preferred color theme
    */
    systemPreference: 'System preference',
    /**
    *@description Title of a setting under the Appearance category that can be invoked through the Command Menu
    */
    switchToLightTheme: 'Switch to light theme',
    /**
    *@description A drop-down menu option to switch to light theme
    */
    lightCapital: 'Light',
    /**
    *@description Title of a setting under the Appearance category that can be invoked through the Command Menu
    */
    switchToDarkTheme: 'Switch to dark theme',
    /**
    *@description A drop-down menu option to switch to dark theme
    */
    darkCapital: 'Dark',
    /**
    *@description A tag of theme preference settings that can be searched in the command menu
    */
    darkLower: 'dark',
    /**
    *@description A tag of theme preference settings that can be searched in the command menu
    */
    lightLower: 'light',
    /**
    *@description Title of a setting under the Appearance category in Settings
    */
    panelLayout: 'Panel layout:',
    /**
    *@description Title of a setting under the Appearance category that can be invoked through the Command Menu
    */
    useHorizontalPanelLayout: 'Use horizontal panel layout',
    /**
    *@description A drop-down menu option to use horizontal panel layout
    */
    horizontal: 'horizontal',
    /**
    *@description Title of a setting under the Appearance category that can be invoked through the Command Menu
    */
    useVerticalPanelLayout: 'Use vertical panel layout',
    /**
    *@description A drop-down menu option to use vertical panel layout
    */
    vertical: 'vertical',
    /**
    *@description Title of a setting under the Appearance category that can be invoked through the Command Menu
    */
    useAutomaticPanelLayout: 'Use automatic panel layout',
    /**
    *@description Text short for automatic
    */
    auto: 'auto',
    /**
    *@description Title of a setting under the Appearance category in Settings
    */
    colorFormat: 'Color format:',
    /**
    *@description Title of a setting under the Appearance category that can be invoked through the Command Menu
    */
    setColorFormatAsAuthored: 'Set color format as authored',
    /**
    *@description A drop-down menu option to set color format as authored
    */
    asAuthored: 'As authored',
    /**
    *@description Title of a setting under the Appearance category that can be invoked through the Command Menu
    */
    setColorFormatToHex: 'Set color format to HEX',
    /**
    *@description Title of a setting under the Appearance category that can be invoked through the Command Menu
    */
    setColorFormatToRgb: 'Set color format to RGB',
    /**
    *@description Title of a setting under the Appearance category that can be invoked through the Command Menu
    */
    setColorFormatToHsl: 'Set color format to HSL',
    /**
    *@description Title of a setting under the Appearance category in Settings
    */
    enableCtrlShortcutToSwitchPanels: 'Enable Ctrl + 1-9 shortcut to switch panels',
    /**
    *@description (Mac only) Title of a setting under the Appearance category in Settings
    */
    enableShortcutToSwitchPanels: 'Enable ⌘ + 1-9 shortcut to switch panels',
    /**
    *@description A drop-down menu option to dock to right
    */
    right: 'Right',
    /**
    *@description Text to dock the DevTools to the right of the browser tab
    */
    dockToRight: 'Dock to right',
    /**
    *@description A drop-down menu option to dock to bottom
    */
    bottom: 'Bottom',
    /**
    *@description Text to dock the DevTools to the bottom of the browser tab
    */
    dockToBottom: 'Dock to bottom',
    /**
    *@description A drop-down menu option to dock to left
    */
    left: 'Left',
    /**
    *@description Text to dock the DevTools to the left of the browser tab
    */
    dockToLeft: 'Dock to left',
    /**
    *@description A drop-down menu option to undock into separate window
    */
    undocked: 'Undocked',
    /**
    *@description Text to undock the DevTools
    */
    undockIntoSeparateWindow: 'Undock into separate window',
    /**
    *@description Name of the default set of DevTools keyboard shortcuts
    */
    devtoolsDefault: 'DevTools (Default)',
    /**
     * @description Title of the language setting that allows users to switch the locale
     * in which DevTools is presented.
     */
    language: 'Language:',
    /**
     * @description Users can choose this option when picking the language in which
     * DevTools is presented. Choosing this option means that the DevTools language matches
     * Chrome's UI language.
     */
    browserLanguage: 'Browser UI language',
};
const str_ = i18n.i18n.registerUIStrings('entrypoints/main/main-meta.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
let loadedMainModule;
let loadedInspectorMainModule;
async function loadMainModule() {
    if (!loadedMainModule) {
        // Side-effect import resources in module.json
        await Root.Runtime.Runtime.instance().loadModulePromise('entrypoints/main');
        loadedMainModule = await import('./main.js');
    }
    return loadedMainModule;
}
// We load the `inspector_main` module for the action `inspector_main.focus-debuggee`
// which depends on it. It cannot be registered in `inspector_main-meta` as the action
// belongs to the shell app (the module `main` belongs to the`shell` app while
// `inspector_main` belongs to the `devtools_app`).
async function loadInspectorMainModule() {
    if (!loadedInspectorMainModule) {
        // Side-effect import resources in module.json
        await Root.Runtime.Runtime.instance().loadModulePromise('entrypoints/inspector_main');
        loadedInspectorMainModule = await import('../inspector_main/inspector_main.js');
    }
    return loadedInspectorMainModule;
}
UI.ActionRegistration.registerActionExtension({
    category: UI.ActionRegistration.ActionCategory.DRAWER,
    actionId: 'inspector_main.focus-debuggee',
    async loadActionDelegate() {
        const InspectorMain = await loadInspectorMainModule();
        return InspectorMain.InspectorMain.FocusDebuggeeActionDelegate.instance();
    },
    order: 100,
    title: i18nLazyString(UIStrings.focusDebuggee),
});
UI.ActionRegistration.registerActionExtension({
    category: UI.ActionRegistration.ActionCategory.DRAWER,
    actionId: 'main.toggle-drawer',
    async loadActionDelegate() {
        return UI.InspectorView.ActionDelegate.instance();
    },
    order: 101,
    title: i18nLazyString(UIStrings.toggleDrawer),
    bindings: [
        {
            shortcut: 'Esc',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'main.next-tab',
    category: UI.ActionRegistration.ActionCategory.GLOBAL,
    title: i18nLazyString(UIStrings.nextPanel),
    async loadActionDelegate() {
        return UI.InspectorView.ActionDelegate.instance();
    },
    bindings: [
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+]',
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+]',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'main.previous-tab',
    category: UI.ActionRegistration.ActionCategory.GLOBAL,
    title: i18nLazyString(UIStrings.previousPanel),
    async loadActionDelegate() {
        return UI.InspectorView.ActionDelegate.instance();
    },
    bindings: [
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+[',
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+[',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'main.debug-reload',
    category: UI.ActionRegistration.ActionCategory.GLOBAL,
    title: i18nLazyString(UIStrings.reloadDevtools),
    async loadActionDelegate() {
        const Main = await loadMainModule();
        return Main.MainImpl.ReloadActionDelegate.instance();
    },
    bindings: [
        {
            shortcut: 'Alt+R',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    category: UI.ActionRegistration.ActionCategory.GLOBAL,
    title: i18nLazyString(UIStrings.restoreLastDockPosition),
    actionId: 'main.toggle-dock',
    async loadActionDelegate() {
        return UI.DockController.ToggleDockActionDelegate.instance();
    },
    bindings: [
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+Shift+D',
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+Shift+D',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'main.zoom-in',
    category: UI.ActionRegistration.ActionCategory.GLOBAL,
    title: i18nLazyString(UIStrings.zoomIn),
    async loadActionDelegate() {
        const Main = await loadMainModule();
        return Main.MainImpl.ZoomActionDelegate.instance();
    },
    bindings: [
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+Plus',
            keybindSets: [
                "devToolsDefault" /* DEVTOOLS_DEFAULT */,
                "vsCode" /* VS_CODE */,
            ],
        },
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+Shift+Plus',
        },
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+NumpadPlus',
        },
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+Shift+NumpadPlus',
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+Plus',
            keybindSets: [
                "devToolsDefault" /* DEVTOOLS_DEFAULT */,
                "vsCode" /* VS_CODE */,
            ],
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+Shift+Plus',
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+NumpadPlus',
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+Shift+NumpadPlus',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'main.zoom-out',
    category: UI.ActionRegistration.ActionCategory.GLOBAL,
    title: i18nLazyString(UIStrings.zoomOut),
    async loadActionDelegate() {
        const Main = await loadMainModule();
        return Main.MainImpl.ZoomActionDelegate.instance();
    },
    bindings: [
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+Minus',
            keybindSets: [
                "devToolsDefault" /* DEVTOOLS_DEFAULT */,
                "vsCode" /* VS_CODE */,
            ],
        },
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+Shift+Minus',
        },
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+NumpadMinus',
        },
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+Shift+NumpadMinus',
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+Minus',
            keybindSets: [
                "devToolsDefault" /* DEVTOOLS_DEFAULT */,
                "vsCode" /* VS_CODE */,
            ],
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+Shift+Minus',
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+NumpadMinus',
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+Shift+NumpadMinus',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'main.zoom-reset',
    category: UI.ActionRegistration.ActionCategory.GLOBAL,
    title: i18nLazyString(UIStrings.resetZoomLevel),
    async loadActionDelegate() {
        const Main = await loadMainModule();
        return Main.MainImpl.ZoomActionDelegate.instance();
    },
    bindings: [
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+0',
        },
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+Numpad0',
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+Numpad0',
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+0',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'main.search-in-panel.find',
    category: UI.ActionRegistration.ActionCategory.GLOBAL,
    title: i18nLazyString(UIStrings.searchInPanel),
    async loadActionDelegate() {
        const Main = await loadMainModule();
        return Main.MainImpl.SearchActionDelegate.instance();
    },
    bindings: [
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+F',
            keybindSets: [
                "devToolsDefault" /* DEVTOOLS_DEFAULT */,
                "vsCode" /* VS_CODE */,
            ],
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+F',
            keybindSets: [
                "devToolsDefault" /* DEVTOOLS_DEFAULT */,
                "vsCode" /* VS_CODE */,
            ],
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'F3',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'main.search-in-panel.cancel',
    category: UI.ActionRegistration.ActionCategory.GLOBAL,
    title: i18nLazyString(UIStrings.cancelSearch),
    async loadActionDelegate() {
        const Main = await loadMainModule();
        return Main.MainImpl.SearchActionDelegate.instance();
    },
    order: 10,
    bindings: [
        {
            shortcut: 'Esc',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'main.search-in-panel.find-next',
    category: UI.ActionRegistration.ActionCategory.GLOBAL,
    title: i18nLazyString(UIStrings.findNextResult),
    async loadActionDelegate() {
        const Main = await loadMainModule();
        return Main.MainImpl.SearchActionDelegate.instance();
    },
    bindings: [
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+G',
            keybindSets: [
                "devToolsDefault" /* DEVTOOLS_DEFAULT */,
                "vsCode" /* VS_CODE */,
            ],
        },
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+G',
        },
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'F3',
            keybindSets: [
                "devToolsDefault" /* DEVTOOLS_DEFAULT */,
                "vsCode" /* VS_CODE */,
            ],
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'main.search-in-panel.find-previous',
    category: UI.ActionRegistration.ActionCategory.GLOBAL,
    title: i18nLazyString(UIStrings.findPreviousResult),
    async loadActionDelegate() {
        const Main = await loadMainModule();
        return Main.MainImpl.SearchActionDelegate.instance();
    },
    bindings: [
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+Shift+G',
            keybindSets: [
                "devToolsDefault" /* DEVTOOLS_DEFAULT */,
                "vsCode" /* VS_CODE */,
            ],
        },
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+Shift+G',
        },
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Shift+F3',
            keybindSets: [
                "devToolsDefault" /* DEVTOOLS_DEFAULT */,
                "vsCode" /* VS_CODE */,
            ],
        },
    ],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.APPEARANCE,
    title: i18nLazyString(UIStrings.theme),
    settingName: 'uiTheme',
    settingType: Common.Settings.SettingType.ENUM,
    defaultValue: 'systemPreferred',
    reloadRequired: true,
    options: [
        {
            title: i18nLazyString(UIStrings.switchToSystemPreferredColor),
            text: i18nLazyString(UIStrings.systemPreference),
            value: 'systemPreferred',
        },
        {
            title: i18nLazyString(UIStrings.switchToLightTheme),
            text: i18nLazyString(UIStrings.lightCapital),
            value: 'default',
        },
        {
            title: i18nLazyString(UIStrings.switchToDarkTheme),
            text: i18nLazyString(UIStrings.darkCapital),
            value: 'dark',
        },
    ],
    tags: [
        i18nLazyString(UIStrings.darkLower),
        i18nLazyString(UIStrings.lightLower),
    ],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.APPEARANCE,
    title: i18nLazyString(UIStrings.panelLayout),
    settingName: 'sidebarPosition',
    settingType: Common.Settings.SettingType.ENUM,
    defaultValue: 'auto',
    options: [
        {
            title: i18nLazyString(UIStrings.useHorizontalPanelLayout),
            text: i18nLazyString(UIStrings.horizontal),
            value: 'bottom',
        },
        {
            title: i18nLazyString(UIStrings.useVerticalPanelLayout),
            text: i18nLazyString(UIStrings.vertical),
            value: 'right',
        },
        {
            title: i18nLazyString(UIStrings.useAutomaticPanelLayout),
            text: i18nLazyString(UIStrings.auto),
            value: 'auto',
        },
    ],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.APPEARANCE,
    title: i18nLazyString(UIStrings.colorFormat),
    settingName: 'colorFormat',
    settingType: Common.Settings.SettingType.ENUM,
    defaultValue: 'original',
    options: [
        {
            title: i18nLazyString(UIStrings.setColorFormatAsAuthored),
            text: i18nLazyString(UIStrings.asAuthored),
            value: 'original',
        },
        {
            title: i18nLazyString(UIStrings.setColorFormatToHex),
            text: 'HEX: #dac0de',
            value: 'hex',
            raw: true,
        },
        {
            title: i18nLazyString(UIStrings.setColorFormatToRgb),
            text: 'RGB: rgb(128 255 255)',
            value: 'rgb',
            raw: true,
        },
        {
            title: i18nLazyString(UIStrings.setColorFormatToHsl),
            text: 'HSL: hsl(300deg 80% 90%)',
            value: 'hsl',
            raw: true,
        },
    ],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.APPEARANCE,
    title: i18nLazyString(UIStrings.enableCtrlShortcutToSwitchPanels),
    titleMac: i18nLazyString(UIStrings.enableShortcutToSwitchPanels),
    settingName: 'shortcutPanelSwitch',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: false,
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.GLOBAL,
    settingName: 'currentDockState',
    settingType: Common.Settings.SettingType.ENUM,
    defaultValue: 'right',
    options: [
        {
            value: 'right',
            text: i18nLazyString(UIStrings.right),
            title: i18nLazyString(UIStrings.dockToRight),
        },
        {
            value: 'bottom',
            text: i18nLazyString(UIStrings.bottom),
            title: i18nLazyString(UIStrings.dockToBottom),
        },
        {
            value: 'left',
            text: i18nLazyString(UIStrings.left),
            title: i18nLazyString(UIStrings.dockToLeft),
        },
        {
            value: 'undocked',
            text: i18nLazyString(UIStrings.undocked),
            title: i18nLazyString(UIStrings.undockIntoSeparateWindow),
        },
    ],
});
Common.Settings.registerSettingExtension({
    settingName: 'activeKeybindSet',
    settingType: Common.Settings.SettingType.ENUM,
    defaultValue: 'devToolsDefault',
    options: [
        {
            value: 'devToolsDefault',
            title: i18nLazyString(UIStrings.devtoolsDefault),
            text: i18nLazyString(UIStrings.devtoolsDefault),
        },
        {
            value: 'vsCode',
            title: i18n.i18n.lockedLazyString('Visual Studio Code'),
            text: i18n.i18n.lockedLazyString('Visual Studio Code'),
        },
    ],
});
function createLazyLocalizedLocaleSettingText(localeString) {
    return () => i18n.i18n.getLocalizedLanguageRegion(localeString, i18n.DevToolsLocale.DevToolsLocale.instance());
}
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.APPEARANCE,
    settingName: 'language',
    settingType: Common.Settings.SettingType.ENUM,
    title: i18nLazyString(UIStrings.language),
    defaultValue: 'en-US',
    options: [
        {
            value: 'browserLanguage',
            title: i18nLazyString(UIStrings.browserLanguage),
            text: i18nLazyString(UIStrings.browserLanguage),
        },
        {
            value: 'en-US',
            title: createLazyLocalizedLocaleSettingText('en-US'),
            text: createLazyLocalizedLocaleSettingText('en-US'),
        },
        {
            value: 'zh',
            title: createLazyLocalizedLocaleSettingText('zh'),
            text: createLazyLocalizedLocaleSettingText('zh'),
        },
    ],
    reloadRequired: true,
    experiment: Root.Runtime.ExperimentName.LOCALIZED_DEVTOOLS,
});
Common.Settings.registerSettingExtension({
    settingName: 'userShortcuts',
    settingType: Common.Settings.SettingType.ARRAY,
    defaultValue: [],
});
UI.ViewManager.registerLocationResolver({
    name: "drawer-view" /* DRAWER_VIEW */,
    category: UI.ViewManager.ViewLocationCategoryValues.DRAWER,
    async loadResolver() {
        return UI.InspectorView.InspectorView.instance();
    },
});
UI.ViewManager.registerLocationResolver({
    name: "drawer-sidebar" /* DRAWER_SIDEBAR */,
    category: UI.ViewManager.ViewLocationCategoryValues.DRAWER_SIDEBAR,
    async loadResolver() {
        return UI.InspectorView.InspectorView.instance();
    },
});
UI.ViewManager.registerLocationResolver({
    name: "panel" /* PANEL */,
    category: UI.ViewManager.ViewLocationCategoryValues.PANEL,
    async loadResolver() {
        return UI.InspectorView.InspectorView.instance();
    },
});
UI.ContextMenu.registerProvider({
    contextTypes() {
        return [
            Workspace.UISourceCode.UISourceCode,
            SDK.Resource.Resource,
            SDK.NetworkRequest.NetworkRequest,
        ];
    },
    async loadProvider() {
        return Components.Linkifier.ContentProviderContextMenuProvider.instance();
    },
    experiment: undefined,
});
UI.ContextMenu.registerProvider({
    contextTypes() {
        return [
            Node,
        ];
    },
    async loadProvider() {
        return UI.XLink.ContextMenuProvider.instance();
    },
    experiment: undefined,
});
UI.ContextMenu.registerProvider({
    contextTypes() {
        return [
            Node,
        ];
    },
    async loadProvider() {
        return Components.Linkifier.LinkContextMenuProvider.instance();
    },
    experiment: undefined,
});
UI.Toolbar.registerToolbarItem({
    separator: true,
    location: UI.Toolbar.ToolbarItemLocation.MAIN_TOOLBAR_LEFT,
    order: 100,
    showLabel: undefined,
    actionId: undefined,
    condition: undefined,
    loadItem: undefined,
});
UI.Toolbar.registerToolbarItem({
    separator: true,
    order: 97,
    location: UI.Toolbar.ToolbarItemLocation.MAIN_TOOLBAR_RIGHT,
    showLabel: undefined,
    actionId: undefined,
    condition: undefined,
    loadItem: undefined,
});
UI.Toolbar.registerToolbarItem({
    async loadItem() {
        const Main = await loadMainModule();
        return Main.MainImpl.SettingsButtonProvider.instance();
    },
    order: 98,
    location: UI.Toolbar.ToolbarItemLocation.MAIN_TOOLBAR_RIGHT,
    showLabel: undefined,
    condition: undefined,
    separator: undefined,
    actionId: undefined,
});
UI.Toolbar.registerToolbarItem({
    async loadItem() {
        const Main = await loadMainModule();
        return Main.MainImpl.MainMenuItem.instance();
    },
    order: 99,
    location: UI.Toolbar.ToolbarItemLocation.MAIN_TOOLBAR_RIGHT,
    showLabel: undefined,
    condition: undefined,
    separator: undefined,
    actionId: undefined,
});
UI.Toolbar.registerToolbarItem({
    async loadItem() {
        return UI.DockController.CloseButtonProvider.instance();
    },
    order: 100,
    location: UI.Toolbar.ToolbarItemLocation.MAIN_TOOLBAR_RIGHT,
    showLabel: undefined,
    condition: undefined,
    separator: undefined,
    actionId: undefined,
});
Common.AppProvider.registerAppProvider({
    async loadAppProvider() {
        const Main = await loadMainModule();
        return Main.SimpleApp.SimpleAppProvider.instance();
    },
    order: 10,
    condition: undefined,
});
//# sourceMappingURL=main-meta.js.map