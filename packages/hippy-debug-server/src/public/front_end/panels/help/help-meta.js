// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Root from '../../core/root/root.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
    *@description Title of the 'What's New' tool in the bottom drawer
    */
    whatsNew: 'What\'s New',
    /**
    *@description Command for showing the 'What's New' tool in the bottom drawer
    */
    showWhatsNew: 'Show What\'s New',
    /**
    *@description Title of an action in the help tool to release notes
    */
    releaseNotes: 'Release notes',
    /**
    *@description Title of an action in the help tool to file an issue
    */
    reportADevtoolsIssue: 'Report a DevTools issue',
    /**
    *@description A search term referring to a software defect (i.e. bug) that can be entered in the command menu
    */
    bug: 'bug',
    /**
    *@description Title of a setting under the Appearance category that can be invoked through the Command Menu
    */
    showWhatsNewAfterEachUpdate: 'Show What\'s New after each update',
    /**
    *@description Title of a setting under the Appearance category that can be invoked through the Command Menu
    */
    doNotShowWhatsNewAfterEachUpdate: 'Do not show What\'s New after each update',
};
const str_ = i18n.i18n.registerUIStrings('panels/help/help-meta.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
let loadedHelpModule;
async function loadHelpModule() {
    if (!loadedHelpModule) {
        // Side-effect import resources in module.json
        await Root.Runtime.Runtime.instance().loadModulePromise('panels/help');
        loadedHelpModule = await import('./help.js');
    }
    return loadedHelpModule;
}
UI.ViewManager.registerViewExtension({
    location: "drawer-view" /* DRAWER_VIEW */,
    id: 'release-note',
    title: i18nLazyString(UIStrings.whatsNew),
    commandPrompt: i18nLazyString(UIStrings.showWhatsNew),
    persistence: "closeable" /* CLOSEABLE */,
    order: 1,
    async loadView() {
        const Help = await loadHelpModule();
        return Help.ReleaseNoteView.ReleaseNoteView.instance();
    },
});
UI.ActionRegistration.registerActionExtension({
    category: UI.ActionRegistration.ActionCategory.HELP,
    actionId: 'help.release-notes',
    title: i18nLazyString(UIStrings.releaseNotes),
    async loadActionDelegate() {
        const Help = await loadHelpModule();
        return Help.Help.ReleaseNotesActionDelegate.instance();
    },
});
UI.ActionRegistration.registerActionExtension({
    category: UI.ActionRegistration.ActionCategory.HELP,
    actionId: 'help.report-issue',
    title: i18nLazyString(UIStrings.reportADevtoolsIssue),
    async loadActionDelegate() {
        const Help = await loadHelpModule();
        return Help.Help.ReportIssueActionDelegate.instance();
    },
    tags: [i18nLazyString(UIStrings.bug)],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.APPEARANCE,
    title: i18nLazyString(UIStrings.showWhatsNewAfterEachUpdate),
    settingName: 'help.show-release-note',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: true,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.showWhatsNewAfterEachUpdate),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.doNotShowWhatsNewAfterEachUpdate),
        },
    ],
});
UI.ContextMenu.registerItem({
    location: UI.ContextMenu.ItemLocation.MAIN_MENU_HELP_DEFAULT,
    actionId: 'help.release-notes',
    order: 10,
});
UI.ContextMenu.registerItem({
    location: UI.ContextMenu.ItemLocation.MAIN_MENU_HELP_DEFAULT,
    actionId: 'help.report-issue',
    order: 11,
});
//# sourceMappingURL=help-meta.js.map