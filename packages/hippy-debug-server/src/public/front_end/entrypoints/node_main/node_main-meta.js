// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as Root from '../../core/root/root.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
    *@description Text that refers to the network connection
    */
    connection: 'Connection',
    /**
   *@description A tag of Node.js Connection Panel that can be searched in the command menu
   */
    node: 'node',
    /**
     *@description Command for showing the Connection tool
     */
    showConnection: 'Show Connection',
};
const str_ = i18n.i18n.registerUIStrings('entrypoints/node_main/node_main-meta.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
let loadedNodeMainModule;
async function loadNodeMainModule() {
    if (!loadedNodeMainModule) {
        // Side-effect import resources in module.json
        await Root.Runtime.Runtime.instance().loadModulePromise('entrypoints/node_main');
        loadedNodeMainModule = await import('./node_main.js');
    }
    return loadedNodeMainModule;
}
UI.ViewManager.registerViewExtension({
    location: "panel" /* PANEL */,
    id: 'node-connection',
    title: i18nLazyString(UIStrings.connection),
    commandPrompt: i18nLazyString(UIStrings.showConnection),
    order: 0,
    async loadView() {
        const NodeMain = await loadNodeMainModule();
        return NodeMain.NodeConnectionsPanel.NodeConnectionsPanel.instance();
    },
    tags: [i18nLazyString(UIStrings.node)],
});
//# sourceMappingURL=node_main-meta.js.map