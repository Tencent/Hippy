// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as Root from '../../core/root/root.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as i18n from '../../core/i18n/i18n.js';
const UIStrings = {
    /**
    *@description Title of the Console tool
    */
    console: 'Console',
    /**
    *@description Title of an action that shows the console.
    */
    showConsole: 'Show Console',
    /**
    *@description Text to clear the console
    */
    clearConsole: 'Clear console',
    /**
    *@description Title of an action in the console tool to clear
    */
    clearConsoleHistory: 'Clear console history',
    /**
    *@description Title of an action in the console tool to create pin. A live expression is code that the user can enter into the console and it will be pinned in the UI. Live expressions are constantly evaluated as the user interacts with the console (hence 'live').
    */
    createLiveExpression: 'Create live expression',
    /**
    *@description Title of a setting under the Console category that can be invoked through the Command Menu
    */
    hideNetworkMessages: 'Hide network messages',
    /**
    *@description Title of a setting under the Console category that can be invoked through the Command Menu
    */
    showNetworkMessages: 'Show network messages',
    /**
    *@description Alternative title text of a setting in Console View of the Console panel
    */
    selectedContextOnly: 'Selected context only',
    /**
    *@description Tooltip text that appears on the setting when hovering over it in Console View of the Console panel
    */
    onlyShowMessagesFromTheCurrent: 'Only show messages from the current context (`top`, `iframe`, `worker`, extension)',
    /**
    *@description Title of a setting under the Console category that can be invoked through the Command Menu
    */
    showMessagesFromAllContexts: 'Show messages from all contexts',
    /**
    *@description Title of a setting under the Console category in Settings
    */
    logXmlhttprequests: 'Log XMLHttpRequests',
    /**
    *@description Title of a setting under the Console category that can be invoked through the Command Menu
    */
    showTimestamps: 'Show timestamps',
    /**
    *@description Title of a setting under the Console category that can be invoked through the Command Menu
    */
    hideTimestamps: 'Hide timestamps',
    /**
    *@description Title of a setting under the Console category that can be invoked through the Command Menu
    */
    autocompleteFromHistory: 'Autocomplete from history',
    /**
    *@description Title of a setting under the Console category that can be invoked through the Command Menu
    */
    doNotAutocompleteFromHistory: 'Do not autocomplete from history',
    /**
    *@description Title of a setting under the Console category that can be invoked through the Command Menu
    */
    groupSimilarMessagesInConsole: 'Group similar messages in console',
    /**
    *@description Title of a setting under the Console category that can be invoked through the Command Menu
    */
    doNotGroupSimilarMessagesIn: 'Do not group similar messages in console',
    /**
    *@description Title of a setting under the Console category in Settings
    */
    eagerEvaluation: 'Eager evaluation',
    /**
    *@description Title of a setting under the Console category that can be invoked through the Command Menu
    */
    eagerlyEvaluateConsolePromptText: 'Eagerly evaluate console prompt text',
    /**
    *@description Title of a setting under the Console category that can be invoked through the Command Menu
    */
    doNotEagerlyEvaluateConsole: 'Do not eagerly evaluate console prompt text',
    /**
    *@description Title of a setting under the Console category in Settings
    */
    evaluateTriggersUserActivation: 'Evaluate triggers user activation',
    /**
    *@description Title of a setting under the Console category that can be invoked through the Command Menu
    */
    treatEvaluationAsUserActivation: 'Treat evaluation as user activation',
    /**
    *@description Title of a setting under the Console category that can be invoked through the Command Menu
    */
    doNotTreatEvaluationAsUser: 'Do not treat evaluation as user activation',
};
const str_ = i18n.i18n.registerUIStrings('panels/console/console-meta.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
let loadedConsoleModule;
async function loadConsoleModule() {
    if (!loadedConsoleModule) {
        // Side-effect import resources in module.json
        await Root.Runtime.Runtime.instance().loadModulePromise('panels/console');
        loadedConsoleModule = await import('./console.js');
    }
    return loadedConsoleModule;
}
function maybeRetrieveContextTypes(getClassCallBack) {
    if (loadedConsoleModule === undefined) {
        return [];
    }
    return getClassCallBack(loadedConsoleModule);
}
UI.ViewManager.registerViewExtension({
    location: "panel" /* PANEL */,
    id: 'console',
    title: i18nLazyString(UIStrings.console),
    commandPrompt: i18nLazyString(UIStrings.showConsole),
    order: 20,
    async loadView() {
        const Console = await loadConsoleModule();
        return Console.ConsolePanel.ConsolePanel.instance();
    },
});
UI.ViewManager.registerViewExtension({
    location: "drawer-view" /* DRAWER_VIEW */,
    id: 'console-view',
    title: i18nLazyString(UIStrings.console),
    commandPrompt: i18nLazyString(UIStrings.showConsole),
    persistence: "permanent" /* PERMANENT */,
    order: 0,
    async loadView() {
        const Console = await loadConsoleModule();
        return Console.ConsolePanel.WrapperView.instance();
    },
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'console.show',
    category: UI.ActionRegistration.ActionCategory.CONSOLE,
    title: i18nLazyString(UIStrings.showConsole),
    async loadActionDelegate() {
        const Console = await loadConsoleModule();
        return Console.ConsoleView.ActionDelegate.instance();
    },
    bindings: [
        {
            shortcut: 'Ctrl+`',
            keybindSets: [
                "devToolsDefault" /* DEVTOOLS_DEFAULT */,
                "vsCode" /* VS_CODE */,
            ],
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'console.clear',
    category: UI.ActionRegistration.ActionCategory.CONSOLE,
    title: i18nLazyString(UIStrings.clearConsole),
    iconClass: "largeicon-clear" /* LARGEICON_CLEAR */,
    async loadActionDelegate() {
        const Console = await loadConsoleModule();
        return Console.ConsoleView.ActionDelegate.instance();
    },
    contextTypes() {
        return maybeRetrieveContextTypes(Console => [Console.ConsoleView.ConsoleView]);
    },
    bindings: [
        {
            shortcut: 'Ctrl+L',
        },
        {
            shortcut: 'Meta+K',
            platform: "mac" /* Mac */,
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'console.clear.history',
    category: UI.ActionRegistration.ActionCategory.CONSOLE,
    title: i18nLazyString(UIStrings.clearConsoleHistory),
    async loadActionDelegate() {
        const Console = await loadConsoleModule();
        return Console.ConsoleView.ActionDelegate.instance();
    },
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'console.create-pin',
    category: UI.ActionRegistration.ActionCategory.CONSOLE,
    title: i18nLazyString(UIStrings.createLiveExpression),
    iconClass: "largeicon-visibility" /* LARGEICON_VISIBILITY */,
    async loadActionDelegate() {
        const Console = await loadConsoleModule();
        return Console.ConsoleView.ActionDelegate.instance();
    },
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.CONSOLE,
    title: i18nLazyString(UIStrings.hideNetworkMessages),
    settingName: 'hideNetworkMessages',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: false,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.hideNetworkMessages),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.showNetworkMessages),
        },
    ],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.CONSOLE,
    title: i18nLazyString(UIStrings.selectedContextOnly),
    settingName: 'selectedContextFilterEnabled',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: false,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.onlyShowMessagesFromTheCurrent),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.showMessagesFromAllContexts),
        },
    ],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.CONSOLE,
    title: i18nLazyString(UIStrings.logXmlhttprequests),
    settingName: 'monitoringXHREnabled',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: false,
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.CONSOLE,
    title: i18nLazyString(UIStrings.showTimestamps),
    settingName: 'consoleTimestampsEnabled',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: false,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.showTimestamps),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.hideTimestamps),
        },
    ],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.CONSOLE,
    title: i18nLazyString(UIStrings.autocompleteFromHistory),
    settingName: 'consoleHistoryAutocomplete',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: true,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.autocompleteFromHistory),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.doNotAutocompleteFromHistory),
        },
    ],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.CONSOLE,
    title: i18nLazyString(UIStrings.groupSimilarMessagesInConsole),
    settingName: 'consoleGroupSimilar',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: true,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.groupSimilarMessagesInConsole),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.doNotGroupSimilarMessagesIn),
        },
    ],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.CONSOLE,
    title: i18nLazyString(UIStrings.eagerEvaluation),
    settingName: 'consoleEagerEval',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: true,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.eagerlyEvaluateConsolePromptText),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.doNotEagerlyEvaluateConsole),
        },
    ],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.CONSOLE,
    title: i18nLazyString(UIStrings.evaluateTriggersUserActivation),
    settingName: 'consoleUserActivationEval',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: true,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.treatEvaluationAsUserActivation),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.doNotTreatEvaluationAsUser),
        },
    ],
});
Common.Revealer.registerRevealer({
    contextTypes() {
        return [
            Common.Console.Console,
        ];
    },
    async loadRevealer() {
        const Console = await loadConsoleModule();
        return Console.ConsolePanel.ConsoleRevealer.instance();
    },
    destination: undefined,
});
//# sourceMappingURL=console-meta.js.map