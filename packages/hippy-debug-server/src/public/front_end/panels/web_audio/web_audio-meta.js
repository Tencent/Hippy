// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as Root from '../../core/root/root.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
    *@description Title of the WebAudio tool
    */
    webaudio: 'WebAudio',
    /**
     *@description A tags of WebAudio tool that can be searched in the command menu
     */
    audio: 'audio',
    /**
     *@description Command for showing the WebAudio tool
     */
    showWebaudio: 'Show WebAudio',
};
const str_ = i18n.i18n.registerUIStrings('panels/web_audio/web_audio-meta.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
let loadedWebAudioModule;
async function loadWebAudioModule() {
    if (!loadedWebAudioModule) {
        // Side-effect import resources in module.json
        await Root.Runtime.Runtime.instance().loadModulePromise('panels/web_audio');
        loadedWebAudioModule = await import('./web_audio.js');
    }
    return loadedWebAudioModule;
}
UI.ViewManager.registerViewExtension({
    location: "drawer-view" /* DRAWER_VIEW */,
    id: 'web-audio',
    title: i18nLazyString(UIStrings.webaudio),
    commandPrompt: i18nLazyString(UIStrings.showWebaudio),
    persistence: "closeable" /* CLOSEABLE */,
    order: 100,
    async loadView() {
        const WebAudio = await loadWebAudioModule();
        return WebAudio.WebAudioView.WebAudioView.instance();
    },
    tags: [i18nLazyString(UIStrings.audio)],
});
//# sourceMappingURL=web_audio-meta.js.map