// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as Root from '../../core/root/root.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
     * @description Title for developer resources panel
     */
    developerResources: 'Developer Resources',
    /**
     * @description Command for showing the developer resources panel
     */
    showDeveloperResources: 'Show Developer Resources',
};
const str_ = i18n.i18n.registerUIStrings('panels/developer_resources/developer_resources-meta.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
let loadedDeveloperResourcesModule;
async function loadDeveloperResourcesModule() {
    if (!loadedDeveloperResourcesModule) {
        // Side-effect import resources in module.json
        await Root.Runtime.Runtime.instance().loadModulePromise('panels/developer_resources');
        loadedDeveloperResourcesModule = await import('./developer_resources.js');
    }
    return loadedDeveloperResourcesModule;
}
UI.ViewManager.registerViewExtension({
    location: "drawer-view" /* DRAWER_VIEW */,
    id: 'resource-loading-pane',
    title: i18nLazyString(UIStrings.developerResources),
    commandPrompt: i18nLazyString(UIStrings.showDeveloperResources),
    order: 100,
    persistence: "closeable" /* CLOSEABLE */,
    experiment: Root.Runtime.ExperimentName.DEVELOPER_RESOURCES_VIEW,
    async loadView() {
        const DeveloperResources = await loadDeveloperResourcesModule();
        return DeveloperResources.DeveloperResourcesView.DeveloperResourcesView.instance();
    },
});
//# sourceMappingURL=developer_resources-meta.js.map