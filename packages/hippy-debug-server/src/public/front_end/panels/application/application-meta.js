// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as Root from '../../core/root/root.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as i18n from '../../core/i18n/i18n.js';
const UIStrings = {
    /**
    *@description Text in Application Panel Sidebar of the Application panel
    */
    application: 'Application',
    /**
    *@description Command for showing the 'Application' tool
    */
    showApplication: 'Show Application',
    /**
    *@description A tag of Application Panel that can be searched in the command menu
    */
    pwa: 'pwa',
    /**
    *@description Text of button in Clear Storage View of the Application panel
    */
    clearSiteData: 'Clear site data',
    /**
    *@description Title of an action that clears all site data including 3rd party cookies
    */
    clearSiteDataIncludingThirdparty: 'Clear site data (including third-party cookies)',
    /**
    *@description Title of an action under the Background Services category that can be invoked through the Command Menu
    */
    startRecordingEvents: 'Start recording events',
    /**
    *@description Title of an action under the Background Services category that can be invoked through the Command Menu
    */
    stopRecordingEvents: 'Stop recording events',
};
const str_ = i18n.i18n.registerUIStrings('panels/application/application-meta.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
let loadedResourcesModule;
async function loadResourcesModule() {
    if (!loadedResourcesModule) {
        // Side-effect import resources in module.json
        await Root.Runtime.Runtime.instance().loadModulePromise('panels/application');
        loadedResourcesModule = await import('./application.js');
    }
    return loadedResourcesModule;
}
function maybeRetrieveContextTypes(getClassCallBack) {
    if (loadedResourcesModule === undefined) {
        return [];
    }
    return getClassCallBack(loadedResourcesModule);
}
UI.ViewManager.registerViewExtension({
    location: "panel" /* PANEL */,
    id: 'resources',
    title: i18nLazyString(UIStrings.application),
    commandPrompt: i18nLazyString(UIStrings.showApplication),
    order: 70,
    async loadView() {
        const Resources = await loadResourcesModule();
        return Resources.ResourcesPanel.ResourcesPanel.instance();
    },
    tags: [i18nLazyString(UIStrings.pwa)],
});
UI.ActionRegistration.registerActionExtension({
    category: UI.ActionRegistration.ActionCategory.RESOURCES,
    actionId: 'resources.clear',
    title: i18nLazyString(UIStrings.clearSiteData),
    async loadActionDelegate() {
        const Resources = await loadResourcesModule();
        return Resources.StorageView.ActionDelegate.instance();
    },
});
UI.ActionRegistration.registerActionExtension({
    category: UI.ActionRegistration.ActionCategory.RESOURCES,
    actionId: 'resources.clear-incl-third-party-cookies',
    title: i18nLazyString(UIStrings.clearSiteDataIncludingThirdparty),
    async loadActionDelegate() {
        const Resources = await loadResourcesModule();
        return Resources.StorageView.ActionDelegate.instance();
    },
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'background-service.toggle-recording',
    iconClass: "largeicon-start-recording" /* LARGEICON_START_RECORDING */,
    toggleable: true,
    toggledIconClass: "largeicon-stop-recording" /* LARGEICON_STOP_RECORDING */,
    toggleWithRedColor: true,
    contextTypes() {
        return maybeRetrieveContextTypes(Resources => [Resources.BackgroundServiceView.BackgroundServiceView]);
    },
    async loadActionDelegate() {
        const Resources = await loadResourcesModule();
        return Resources.BackgroundServiceView.ActionDelegate.instance();
    },
    category: UI.ActionRegistration.ActionCategory.BACKGROUND_SERVICES,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.startRecordingEvents),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.stopRecordingEvents),
        },
    ],
    bindings: [
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+E',
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+E',
        },
    ],
});
Common.Revealer.registerRevealer({
    contextTypes() {
        return [
            SDK.Resource.Resource,
        ];
    },
    destination: Common.Revealer.RevealerDestination.APPLICATION_PANEL,
    async loadRevealer() {
        const Resources = await loadResourcesModule();
        return Resources.ResourcesPanel.ResourceRevealer.instance();
    },
});
Common.Revealer.registerRevealer({
    contextTypes() {
        return [
            SDK.Cookie.CookieReference,
        ];
    },
    destination: Common.Revealer.RevealerDestination.APPLICATION_PANEL,
    async loadRevealer() {
        const Resources = await loadResourcesModule();
        return Resources.ResourcesPanel.CookieReferenceRevealer.instance();
    },
});
Common.Revealer.registerRevealer({
    contextTypes() {
        return [
            SDK.ResourceTreeModel.ResourceTreeFrame,
        ];
    },
    destination: Common.Revealer.RevealerDestination.APPLICATION_PANEL,
    async loadRevealer() {
        const Resources = await loadResourcesModule();
        return Resources.ResourcesPanel.FrameDetailsRevealer.instance();
    },
});
//# sourceMappingURL=application-meta.js.map