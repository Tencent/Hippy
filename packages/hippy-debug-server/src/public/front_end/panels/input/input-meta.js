// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as Root from '../../core/root/root.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
      *@description Title of the inputs tool, which records user input.
      */
    inputs: 'Inputs',
    /**
      *@description Command to pause the replaying of user inputs.
      */
    pause: 'Pause',
    /**
      *@description Command to resume the replaying of user inputs.
      */
    resume: 'Resume',
    /**
      *@description Command for showing the inputs tool.
      */
    showInputs: 'Show Inputs',
    /**
      *@description Command to begin a recording of user input.
      */
    startRecording: 'Start recording',
    /**
      *@description Command to start replaying the recorded user input.
      */
    startReplaying: 'Start replaying',
    /**
      *@description Command to stop a recording of user input.
      */
    stopRecording: 'Stop recording',
};
const str_ = i18n.i18n.registerUIStrings('panels/input//input-meta.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
let loadedInputModule;
async function loadInputModule() {
    if (!loadedInputModule) {
        // Side-effect import resources in module.json
        await Root.Runtime.Runtime.instance().loadModulePromise('input');
        loadedInputModule = await import('./input.js');
    }
    return loadedInputModule;
}
UI.ViewManager.registerViewExtension({
    location: "drawer-view" /* DRAWER_VIEW */,
    id: 'Inputs',
    title: i18nLazyString(UIStrings.inputs),
    commandPrompt: i18nLazyString(UIStrings.showInputs),
    persistence: "closeable" /* CLOSEABLE */,
    order: 7,
    async loadView() {
        const Input = await loadInputModule();
        return Input.InputTimeline.InputTimeline.instance();
    },
    experiment: Root.Runtime.ExperimentName.TIMELINE_REPLAY_EVENT,
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'input.toggle-recording',
    iconClass: "largeicon-start-recording" /* LARGEICON_START_RECORDING */,
    toggleable: true,
    toggledIconClass: "largeicon-stop-recording" /* LARGEICON_STOP_RECORDING */,
    toggleWithRedColor: true,
    async loadActionDelegate() {
        const Input = await loadInputModule();
        return Input.InputTimeline.ActionDelegate.instance();
    },
    category: UI.ActionRegistration.ActionCategory.INPUTS,
    experiment: Root.Runtime.ExperimentName.TIMELINE_REPLAY_EVENT,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.startRecording),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.stopRecording),
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'input.start-replaying',
    iconClass: "largeicon-play" /* LARGEICON_PLAY */,
    toggleable: false,
    async loadActionDelegate() {
        const Input = await loadInputModule();
        return Input.InputTimeline.ActionDelegate.instance();
    },
    category: UI.ActionRegistration.ActionCategory.INPUTS,
    experiment: Root.Runtime.ExperimentName.TIMELINE_REPLAY_EVENT,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.startReplaying),
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'input.toggle-pause',
    iconClass: "largeicon-pause" /* LARGEICON_PAUSE */,
    toggleable: true,
    toggledIconClass: "largeicon-resume" /* LARGEICON_RESUME */,
    async loadActionDelegate() {
        const Input = await loadInputModule();
        return Input.InputTimeline.ActionDelegate.instance();
    },
    category: UI.ActionRegistration.ActionCategory.INPUTS,
    experiment: Root.Runtime.ExperimentName.TIMELINE_REPLAY_EVENT,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.pause),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.resume),
        },
    ],
});
//# sourceMappingURL=input-meta.js.map