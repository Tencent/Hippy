// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Root from '../../core/root/root.js';
import * as WorkspaceDiff from '../../models/workspace_diff/workspace_diff.js';
import * as UI from '../../ui/legacy/legacy.js';
let loadedChangesModule;
const UIStrings = {
    /**
     * @description Title of the 'Changes' tool in the bottom drawer
     */
    changes: 'Changes',
    /**
     * @description Command for showing the 'Changes' tool in the bottom drawer
     */
    showChanges: 'Show Changes',
};
const str_ = i18n.i18n.registerUIStrings('panels/changes/changes-meta.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
async function loadChangesModule() {
    if (!loadedChangesModule) {
        // Side-effect import resources in module.json
        await Root.Runtime.Runtime.instance().loadModulePromise('panels/changes');
        loadedChangesModule = await import('./changes.js');
    }
    return loadedChangesModule;
}
UI.ViewManager.registerViewExtension({
    location: "drawer-view" /* DRAWER_VIEW */,
    id: 'changes.changes',
    title: i18nLazyString(UIStrings.changes),
    commandPrompt: i18nLazyString(UIStrings.showChanges),
    persistence: "closeable" /* CLOSEABLE */,
    async loadView() {
        const Changes = await loadChangesModule();
        return Changes.ChangesView.ChangesView.instance();
    },
});
Common.Revealer.registerRevealer({
    contextTypes() {
        return [
            WorkspaceDiff.WorkspaceDiff.DiffUILocation,
        ];
    },
    destination: Common.Revealer.RevealerDestination.CHANGES_DRAWER,
    async loadRevealer() {
        const Changes = await loadChangesModule();
        return Changes.ChangesView.DiffUILocationRevealer.instance();
    },
});
//# sourceMappingURL=changes-meta.js.map