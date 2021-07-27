// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Root from '../../core/root/root.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as i18n from '../../core/i18n/i18n.js';
const UIStrings = {
    /**
    *@description Command for showing the 'Event Listener Breakpoints' tool
    */
    showEventListenerBreakpoints: 'Show Event Listener Breakpoints',
    /**
    *@description Title of the 'Event Listener Breakpoints' tool in the bottom sidebar of the Sources tool
    */
    eventListenerBreakpoints: 'Event Listener Breakpoints',
    /**
    *@description Title for showing the 'CSP Violation Breakpoints' tool in the Sources panel
    */
    showCspViolationBreakpoints: 'Show CSP Violation Breakpoints',
    /**
    *@description Title of the 'CSP Violation Breakpoints' tool in the bottom sidebar of the Sources tool
    */
    cspViolationBreakpoints: 'CSP Violation Breakpoints',
    /**
    *@description Command for showing the 'XHR/fetch Breakpoints' in the sources panel
    */
    showXhrfetchBreakpoints: 'Show XHR/fetch Breakpoints',
    /**
    *@description Title of the 'XHR/fetch Breakpoints' tool in the bottom sidebar of the Sources tool
    */
    xhrfetchBreakpoints: 'XHR/fetch Breakpoints',
    /**
    *@description Command for showing the 'DOM Breakpoints' tool in the Elements panel
    */
    showDomBreakpoints: 'Show DOM Breakpoints',
    /**
    *@description Title of the 'DOM Breakpoints' tool in the bottom sidebar of the Sources tool
    */
    domBreakpoints: 'DOM Breakpoints',
    /**
    *@description Command for showing the 'Gobal Listeners' tool in the sources panel
    */
    showGlobalListeners: 'Show Global Listeners',
    /**
    *@description Title of the 'Global Listeners' tool in the bottom sidebar of the Sources tool
    */
    globalListeners: 'Global Listeners',
    /**
    *@description Text that refers to one or a group of webpages
    */
    page: 'Page',
    /**
    *@description Command for showing the 'Page' tab in the Sources panel
    */
    showPage: 'Show Page',
    /**
    *@description Title as part of a tool to override existing configurations
    */
    overrides: 'Overrides',
    /**
    *@description Command for showing the 'Overrides' tool in the Sources panel
    */
    showOverrides: 'Show Overrides',
    /**
    *@description Title for a type of source files
    */
    contentScripts: 'Content scripts',
    /**
    *@description Command for showing the 'Content scripts' tool in the sources panel
    */
    showContentScripts: 'Show Content scripts',
};
const str_ = i18n.i18n.registerUIStrings('panels/browser_debugger/browser_debugger-meta.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
let loadedBrowserDebuggerModule;
async function loadBrowserDebuggerModule() {
    if (!loadedBrowserDebuggerModule) {
        // Side-effect import resources in module.json
        await Root.Runtime.Runtime.instance().loadModulePromise('panels/browser_debugger');
        loadedBrowserDebuggerModule = await import('./browser_debugger.js');
    }
    return loadedBrowserDebuggerModule;
}
let loadedSourcesModule;
//  The sources module is imported here because the view with id `navigator-network`
//  is implemented by `NetworkNavigatorView` in sources. It cannot be registered
//  in the sources module as it belongs to the shell app and thus all apps
//  that extend from shell will have such view registered. This would cause a
//  collision with node_app as a separate view with the same id is registered in it.
async function loadSourcesModule() {
    if (!loadedSourcesModule) {
        // Side-effect import resources in module.json
        await Root.Runtime.Runtime.instance().loadModulePromise('sources');
        loadedSourcesModule = await import('../sources/sources.js');
    }
    return loadedSourcesModule;
}
UI.ViewManager.registerViewExtension({
    async loadView() {
        const BrowserDebugger = await loadBrowserDebuggerModule();
        return BrowserDebugger.EventListenerBreakpointsSidebarPane.EventListenerBreakpointsSidebarPane.instance();
    },
    id: 'sources.eventListenerBreakpoints',
    location: "sources.sidebar-bottom" /* SOURCES_SIDEBAR_BOTTOM */,
    commandPrompt: i18nLazyString(UIStrings.showEventListenerBreakpoints),
    title: i18nLazyString(UIStrings.eventListenerBreakpoints),
    order: 9,
    persistence: "permanent" /* PERMANENT */,
});
UI.ViewManager.registerViewExtension({
    async loadView() {
        const BrowserDebugger = await loadBrowserDebuggerModule();
        return BrowserDebugger.CSPViolationBreakpointsSidebarPane.CSPViolationBreakpointsSidebarPane.instance();
    },
    id: 'sources.cspViolationBreakpoints',
    location: "sources.sidebar-bottom" /* SOURCES_SIDEBAR_BOTTOM */,
    commandPrompt: i18nLazyString(UIStrings.showCspViolationBreakpoints),
    title: i18nLazyString(UIStrings.cspViolationBreakpoints),
    order: 10,
    persistence: "permanent" /* PERMANENT */,
});
UI.ViewManager.registerViewExtension({
    async loadView() {
        const BrowserDebugger = await loadBrowserDebuggerModule();
        return BrowserDebugger.XHRBreakpointsSidebarPane.XHRBreakpointsSidebarPane.instance();
    },
    id: 'sources.xhrBreakpoints',
    location: "sources.sidebar-bottom" /* SOURCES_SIDEBAR_BOTTOM */,
    commandPrompt: i18nLazyString(UIStrings.showXhrfetchBreakpoints),
    title: i18nLazyString(UIStrings.xhrfetchBreakpoints),
    order: 5,
    persistence: "permanent" /* PERMANENT */,
    hasToolbar: true,
});
UI.ViewManager.registerViewExtension({
    async loadView() {
        const BrowserDebugger = await loadBrowserDebuggerModule();
        return BrowserDebugger.DOMBreakpointsSidebarPane.DOMBreakpointsSidebarPane.instance();
    },
    id: 'sources.domBreakpoints',
    location: "sources.sidebar-bottom" /* SOURCES_SIDEBAR_BOTTOM */,
    commandPrompt: i18nLazyString(UIStrings.showDomBreakpoints),
    title: i18nLazyString(UIStrings.domBreakpoints),
    order: 7,
    persistence: "permanent" /* PERMANENT */,
});
UI.ViewManager.registerViewExtension({
    async loadView() {
        const BrowserDebugger = await loadBrowserDebuggerModule();
        return BrowserDebugger.ObjectEventListenersSidebarPane.ObjectEventListenersSidebarPane.instance();
    },
    id: 'sources.globalListeners',
    location: "sources.sidebar-bottom" /* SOURCES_SIDEBAR_BOTTOM */,
    commandPrompt: i18nLazyString(UIStrings.showGlobalListeners),
    title: i18nLazyString(UIStrings.globalListeners),
    order: 8,
    persistence: "permanent" /* PERMANENT */,
    hasToolbar: true,
});
UI.ViewManager.registerViewExtension({
    async loadView() {
        const BrowserDebugger = await loadBrowserDebuggerModule();
        return BrowserDebugger.DOMBreakpointsSidebarPane.DOMBreakpointsSidebarPane.instance();
    },
    id: 'elements.domBreakpoints',
    location: "elements-sidebar" /* ELEMENTS_SIDEBAR */,
    commandPrompt: i18nLazyString(UIStrings.showDomBreakpoints),
    title: i18nLazyString(UIStrings.domBreakpoints),
    order: 6,
    persistence: "permanent" /* PERMANENT */,
});
UI.ViewManager.registerViewExtension({
    location: "navigator-view" /* NAVIGATOR_VIEW */,
    id: 'navigator-network',
    title: i18nLazyString(UIStrings.page),
    commandPrompt: i18nLazyString(UIStrings.showPage),
    order: 2,
    persistence: "permanent" /* PERMANENT */,
    async loadView() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesNavigator.NetworkNavigatorView.instance();
    },
});
UI.ViewManager.registerViewExtension({
    location: "navigator-view" /* NAVIGATOR_VIEW */,
    id: 'navigator-overrides',
    title: i18nLazyString(UIStrings.overrides),
    commandPrompt: i18nLazyString(UIStrings.showOverrides),
    order: 4,
    persistence: "permanent" /* PERMANENT */,
    async loadView() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesNavigator.OverridesNavigatorView.instance();
    },
});
UI.ViewManager.registerViewExtension({
    location: "navigator-view" /* NAVIGATOR_VIEW */,
    id: 'navigator-contentScripts',
    title: i18nLazyString(UIStrings.contentScripts),
    commandPrompt: i18nLazyString(UIStrings.showContentScripts),
    order: 5,
    persistence: "permanent" /* PERMANENT */,
    async loadView() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesNavigator.ContentScriptsNavigatorView.instance();
    },
});
UI.ContextMenu.registerProvider({
    contextTypes() {
        return [
            SDK.DOMModel.DOMNode,
        ];
    },
    async loadProvider() {
        const BrowserDebugger = await loadBrowserDebuggerModule();
        return BrowserDebugger.DOMBreakpointsSidebarPane.ContextMenuProvider.instance();
    },
    experiment: undefined,
});
UI.Context.registerListener({
    contextTypes() {
        return [SDK.DebuggerModel.DebuggerPausedDetails];
    },
    async loadListener() {
        const BrowserDebugger = await loadBrowserDebuggerModule();
        return BrowserDebugger.XHRBreakpointsSidebarPane.XHRBreakpointsSidebarPane.instance();
    },
});
UI.Context.registerListener({
    contextTypes() {
        return [SDK.DebuggerModel.DebuggerPausedDetails];
    },
    async loadListener() {
        const BrowserDebugger = await loadBrowserDebuggerModule();
        return BrowserDebugger.DOMBreakpointsSidebarPane.DOMBreakpointsSidebarPane.instance();
    },
});
//# sourceMappingURL=browser_debugger-meta.js.map