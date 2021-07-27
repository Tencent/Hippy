// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as Root from '../../core/root/root.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
    * @description Title of the 'Protocol monitor' tool in the bottom drawer. This is a tool for
    * viewing and inspecting 'protocol' messages which are sent/received by DevTools. 'protocol' here
    * could be left untranslated as this refers to the Chrome DevTools Protocol (CDP) which is a
    * specific API name.
    */
    protocolMonitor: 'Protocol monitor',
    /**
    *@description Command for showing the 'Protocol monitor' tool in the bottom drawer
    */
    showProtocolMonitor: 'Show Protocol monitor',
};
const str_ = i18n.i18n.registerUIStrings('panels/protocol_monitor/protocol_monitor-meta.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
let loadedProtocolMonitorModule;
async function loadProtocolMonitorModule() {
    if (!loadedProtocolMonitorModule) {
        // Side-effect import resources in module.json
        await Root.Runtime.Runtime.instance().loadModulePromise('panels/protocol_monitor');
        loadedProtocolMonitorModule = await import('./protocol_monitor.js');
    }
    return loadedProtocolMonitorModule;
}
UI.ViewManager.registerViewExtension({
    location: "drawer-view" /* DRAWER_VIEW */,
    id: 'protocol-monitor',
    title: i18nLazyString(UIStrings.protocolMonitor),
    commandPrompt: i18nLazyString(UIStrings.showProtocolMonitor),
    order: 100,
    persistence: "closeable" /* CLOSEABLE */,
    async loadView() {
        const ProtocolMonitor = await loadProtocolMonitorModule();
        return ProtocolMonitor.ProtocolMonitor.ProtocolMonitorImpl.instance();
    },
    experiment: Root.Runtime.ExperimentName.PROTOCOL_MONITOR,
});
//# sourceMappingURL=protocol_monitor-meta.js.map