// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as Root from '../../core/root/root.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
      *@description Text that appears on a button for the media resource type filter.
      */
    media: 'Media',
    /**
      *@description The type of media. Lower case.
      */
    video: 'video',
    /**
      *@description Command for showing the media tool.
      */
    showMedia: 'Show Media',
};
const str_ = i18n.i18n.registerUIStrings('panels/media/media-meta.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
let loadedMediaModule;
async function loadMediaModule() {
    if (!loadedMediaModule) {
        // Side-effect import resources in module.json
        await Root.Runtime.Runtime.instance().loadModulePromise('panels/media');
        loadedMediaModule = await import('./media.js');
    }
    return loadedMediaModule;
}
UI.ViewManager.registerViewExtension({
    location: "panel" /* PANEL */,
    id: 'medias',
    title: i18nLazyString(UIStrings.media),
    commandPrompt: i18nLazyString(UIStrings.showMedia),
    persistence: "closeable" /* CLOSEABLE */,
    order: 100,
    async loadView() {
        const Media = await loadMediaModule();
        return Media.MainView.MainView.instance();
    },
    tags: [
        i18nLazyString(UIStrings.media),
        i18nLazyString(UIStrings.video),
    ],
});
//# sourceMappingURL=media-meta.js.map