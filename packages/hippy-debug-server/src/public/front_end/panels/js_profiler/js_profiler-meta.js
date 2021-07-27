// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as Root from '../../core/root/root.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
    *@description Title of the Profiler tool
    */
    profiler: 'Profiler',
    /**
    *@description Command for showing the Profiler tool
    */
    showProfiler: 'Show Profiler',
    /**
    *@description Text in the Shortcuts page to explain a keyboard shortcut (start/stop recording performance)
    */
    startStopRecording: 'Start/stop recording',
};
const str_ = i18n.i18n.registerUIStrings('panels/js_profiler/js_profiler-meta.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
let loadedProfilerModule;
async function loadProfilerModule() {
    if (!loadedProfilerModule) {
        // Side-effect import resources in module.json
        await Root.Runtime.Runtime.instance().loadModulePromise('panels/profiler');
        loadedProfilerModule = await import('../profiler/profiler.js');
    }
    return loadedProfilerModule;
}
function maybeRetrieveContextTypes(getClassCallBack) {
    if (loadedProfilerModule === undefined) {
        return [];
    }
    return getClassCallBack(loadedProfilerModule);
}
UI.ViewManager.registerViewExtension({
    location: "panel" /* PANEL */,
    id: 'js_profiler',
    title: i18nLazyString(UIStrings.profiler),
    commandPrompt: i18nLazyString(UIStrings.showProfiler),
    order: 65,
    async loadView() {
        const Profiler = await loadProfilerModule();
        return Profiler.ProfilesPanel.JSProfilerPanel.instance();
    },
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'profiler.js-toggle-recording',
    category: UI.ActionRegistration.ActionCategory.JAVASCRIPT_PROFILER,
    title: i18nLazyString(UIStrings.startStopRecording),
    iconClass: "largeicon-start-recording" /* LARGEICON_START_RECORDING */,
    toggleable: true,
    toggledIconClass: "largeicon-stop-recording" /* LARGEICON_STOP_RECORDING */,
    toggleWithRedColor: true,
    contextTypes() {
        return maybeRetrieveContextTypes(Profiler => [Profiler.ProfilesPanel.JSProfilerPanel]);
    },
    async loadActionDelegate() {
        const Profiler = await loadProfilerModule();
        return Profiler.ProfilesPanel.JSProfilerPanel.instance();
    },
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
//# sourceMappingURL=js_profiler-meta.js.map