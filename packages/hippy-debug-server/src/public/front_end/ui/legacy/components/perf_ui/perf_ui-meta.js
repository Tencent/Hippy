// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../../../core/common/common.js';
import * as i18n from '../../../../core/i18n/i18n.js';
import * as Root from '../../../../core/root/root.js';
import * as UI from '../../legacy.js';
const UIStrings = {
    /**
       *@description Title of a setting under the Performance category in Settings
      */
    flamechartMouseWheelAction: 'Flamechart mouse wheel action:',
    /**
       *@description The action to scroll
      */
    scroll: 'Scroll',
    /**
       *@description Text for zooming in
      */
    zoom: 'Zoom',
    /**
     * @description Title of a setting under the Memory category in Settings. Live memory is memory
     * that is still in-use by the program (not dead). Allocation of live memory is when the program
     * creates new memory. This is a setting that turns on extra annotations in the UI to mark these
     * allocations.
     */
    liveMemoryAllocationAnnotations: 'Live memory allocation annotations',
    /**
       *@description Title of a setting under the Memory category that can be invoked through the Command Menu
      */
    showLiveMemoryAllocation: 'Show live memory allocation annotations',
    /**
       *@description Title of a setting under the Memory category that can be invoked through the Command Menu
      */
    hideLiveMemoryAllocation: 'Hide live memory allocation annotations',
    /**
       *@description Title of an action in the components tool to collect garbage
      */
    collectGarbage: 'Collect garbage',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/components/perf_ui/perf_ui-meta.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
let loadedPerfUIModule;
async function loadPerfUIModule() {
    if (!loadedPerfUIModule) {
        // Side-effect import resources in module.json
        await Root.Runtime.Runtime.instance().loadModulePromise('perf_ui');
        loadedPerfUIModule = await import('./perf_ui.js');
    }
    return loadedPerfUIModule;
}
UI.ActionRegistration.registerActionExtension({
    actionId: 'components.collect-garbage',
    category: UI.ActionRegistration.ActionCategory.PERFORMANCE,
    title: i18nLazyString(UIStrings.collectGarbage),
    iconClass: "largeicon-trash-bin" /* LARGEICON_TRASH_BIN */,
    async loadActionDelegate() {
        const PerfUI = await loadPerfUIModule();
        return PerfUI.GCActionDelegate.GCActionDelegate.instance();
    },
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.PERFORMANCE,
    title: i18nLazyString(UIStrings.flamechartMouseWheelAction),
    settingName: 'flamechartMouseWheelAction',
    settingType: Common.Settings.SettingType.ENUM,
    defaultValue: 'zoom',
    options: [
        {
            title: i18nLazyString(UIStrings.scroll),
            text: i18nLazyString(UIStrings.scroll),
            value: 'scroll',
        },
        {
            title: i18nLazyString(UIStrings.zoom),
            text: i18nLazyString(UIStrings.zoom),
            value: 'zoom',
        },
    ],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.MEMORY,
    experiment: Root.Runtime.ExperimentName.LIVE_HEAP_PROFILE,
    title: i18nLazyString(UIStrings.liveMemoryAllocationAnnotations),
    settingName: 'memoryLiveHeapProfile',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: false,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.showLiveMemoryAllocation),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.hideLiveMemoryAllocation),
        },
    ],
});
//# sourceMappingURL=perf_ui-meta.js.map