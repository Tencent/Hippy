// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as Root from '../../core/root/root.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
    *@description Title of the CSS Overview Panel
    */
    recorder: 'Recorder',
    /**
    *@description Title of the CSS Overview Panel
    */
    showRecorder: 'Recorder',
};
const str_ = i18n.i18n.registerUIStrings('panels/recorder/recorder-meta.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
let loadedRecorderModule;
async function loadRecorderModule() {
    if (!loadedRecorderModule) {
        // Side-effect import resources in module.json
        await Root.Runtime.Runtime.instance().loadModulePromise('panels/recorder');
        loadedRecorderModule = await import('./recorder.js');
    }
    return loadedRecorderModule;
}
UI.ViewManager.registerViewExtension({
    location: "panel" /* PANEL */,
    id: 'recorder',
    commandPrompt: i18nLazyString(UIStrings.showRecorder),
    title: i18nLazyString(UIStrings.recorder),
    experiment: Root.Runtime.ExperimentName.RECORDER,
    order: 95,
    async loadView() {
        const Recorder = await loadRecorderModule();
        return Recorder.RecorderPanel.RecorderPanel.instance();
    },
});
//# sourceMappingURL=recorder-meta.js.map