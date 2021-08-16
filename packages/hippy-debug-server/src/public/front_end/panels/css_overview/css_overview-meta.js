// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as Root from '../../core/root/root.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
    *@description Title of the CSS Overview Panel
    */
    cssOverview: 'CSS Overview',
    /**
    *@description Title of the CSS Overview Panel
    */
    showCssOverview: 'Show CSS Overview',
};
const str_ = i18n.i18n.registerUIStrings('panels/css_overview/css_overview-meta.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
let loadedCSSOverviewModule;
async function loadCSSOverviewModule() {
    if (!loadedCSSOverviewModule) {
        // Side-effect import resources in module.json
        await Root.Runtime.Runtime.instance().loadModulePromise('panels/css_overview');
        loadedCSSOverviewModule = await import('./css_overview.js');
    }
    return loadedCSSOverviewModule;
}
UI.ViewManager.registerViewExtension({
    location: "panel" /* PANEL */,
    id: 'cssoverview',
    commandPrompt: i18nLazyString(UIStrings.showCssOverview),
    title: i18nLazyString(UIStrings.cssOverview),
    order: 95,
    async loadView() {
        const CSSOverview = await loadCSSOverviewModule();
        return CSSOverview.CSSOverviewPanel.CSSOverviewPanel.instance();
    },
    experiment: Root.Runtime.ExperimentName.CSS_OVERVIEW,
});
//# sourceMappingURL=css_overview-meta.js.map