// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as Root from '../../core/root/root.js';
import * as UI from '../../ui/legacy/legacy.js';
let loadedAccessibilityModule;
const UIStrings = {
    /**
     * @description Text for accessibility of the web page
     */
    accessibility: 'Accessibility',
    /**
     * @description Command for showing the 'Accessibility' tool
     */
    shoAccessibility: 'Show Accessibility',
};
const str_ = i18n.i18n.registerUIStrings('panels/accessibility/accessibility-meta.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
async function loadAccessibilityModule() {
    if (!loadedAccessibilityModule) {
        // Side-effect import resources in module.json
        await Root.Runtime.Runtime.instance().loadModulePromise('panels/accessibility');
        loadedAccessibilityModule = await import('./accessibility.js');
    }
    return loadedAccessibilityModule;
}
UI.ViewManager.registerViewExtension({
    location: "elements-sidebar" /* ELEMENTS_SIDEBAR */,
    id: 'accessibility.view',
    title: i18nLazyString(UIStrings.accessibility),
    commandPrompt: i18nLazyString(UIStrings.shoAccessibility),
    order: 10,
    persistence: "permanent" /* PERMANENT */,
    async loadView() {
        const Accessibility = await loadAccessibilityModule();
        return Accessibility.AccessibilitySidebarView.AccessibilitySidebarView.instance();
    },
});
//# sourceMappingURL=accessibility-meta.js.map