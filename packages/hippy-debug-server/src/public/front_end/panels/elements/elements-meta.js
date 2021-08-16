// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as Root from '../../core/root/root.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as i18n from '../../core/i18n/i18n.js';
const UIStrings = {
    /**
    * @description Command for showing the 'Elements' panel. Elements refers to HTML elements.
    */
    showElements: 'Show Elements',
    /**
    * @description Title of the Elements Panel. Elements refers to HTML elements.
    */
    elements: 'Elements',
    /**
    * @description Command for showing the 'Event Listeners' tool. Refers to DOM Event listeners.
    */
    showEventListeners: 'Show Event Listeners',
    /**
    * @description Title of the 'Event Listeners' tool in the sidebar of the elements panel. Refers to
    * DOM Event listeners.
    */
    eventListeners: 'Event Listeners',
    /**
    * @description Command for showing the 'Properties' tool. Refers to HTML properties.
    */
    showProperties: 'Show Properties',
    /**
    * @description Title of the 'Properties' tool in the sidebar of the elements tool. Refers to HTML
    * properties.
    */
    properties: 'Properties',
    /**
    * @description Command for showing the 'Stack Trace' tool. Stack trace refers to the location in
    * the code where the program was at a point in time.
    */
    showStackTrace: 'Show Stack Trace',
    /**
    * @description Text for the execution stack trace tool, which shows the stack trace from when this
    * HTML element was created. Stack trace refers to the location in the code where the program was
    * at a point in time.
    */
    stackTrace: 'Stack Trace',
    /**
    * @description Command for showing the 'Layout' tool
    */
    showLayout: 'Show Layout',
    /**
    * @description The title of the 'Layout' tool in the sidebar of the elements panel.
    */
    layout: 'Layout',
    /**
    * @description Command to hide a HTML element in the Elements tree.
    */
    hideElement: 'Hide element',
    /**
    * @description A context menu item (command) in the Elements panel that allows the user to edit the
    * currently selected node as raw HTML text.
    */
    editAsHtml: 'Edit as HTML',
    /**
    * @description A context menu item (command) in the Elements panel that creates an exact copy of
    * this HTML element.
    */
    duplicateElement: 'Duplicate element',
    /**
    * @description A command in the Elements panel to undo the last action the user took.
    */
    undo: 'Undo',
    /**
    * @description A command in the Elements panel to redo the last action the user took (undo an
    * undo).
    */
    redo: 'Redo',
    /**
    * @description A command in the Elements panel to capture a screenshot of the selected area.
    */
    captureAreaScreenshot: 'Capture area screenshot',
    /**
    * @description Title/tooltip of an action in the elements panel to toggle element search on/off.
    */
    selectAnElementInThePageTo: 'Select an element in the page to inspect it',
    /**
    * @description Title of a setting under the Elements category in Settings. Whether words should be
    * wrapped around at the end of lines or not.
    */
    wordWrap: 'Word wrap',
    /**
    * @description Title of a setting under the Elements category. Whether words should be wrapped
    * around at the end of lines or not when showing DOM elements.
    */
    enableDomWordWrap: 'Enable `DOM` word wrap',
    /**
    * @description Title of a setting under the Elements category. Whether words should be wrapped
    * around at the end of lines or not when showing DOM elements.
    */
    disableDomWordWrap: 'Disable `DOM` word wrap',
    /**
    * @description Title of a setting under the Elements category. Whether to show/hide code comments in HTML.
    */
    showHtmlComments: 'Show `HTML` comments',
    /**
    * @description Title of a setting under the Elements category. Whether to show/hide code comments in HTML.
    */
    hideHtmlComments: 'Hide `HTML` comments',
    /**
    * @description Title of a setting under the Elements category in Settings. Whether the position of
    * the DOM node on the actual website should be highlighted/revealed to the user when they hover
    * over the corresponding node in the DOM tree in DevTools.
    */
    revealDomNodeOnHover: 'Reveal `DOM` node on hover',
    /**
    * @description Title of a setting under the Elements category in Settings. Turns on a mode where
    * the inspect tooltip (an information pane that hovers next to selected DOM elements) has extra
    * detail.
    */
    showDetailedInspectTooltip: 'Show detailed inspect tooltip',
    /**
    *@description A context menu item (command) in the Elements panel that copy the styles of
    * the HTML element.
    */
    copyStyles: 'Copy styles',
};
const str_ = i18n.i18n.registerUIStrings('panels/elements/elements-meta.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
let loadedElementsModule;
async function loadElementsModule() {
    if (!loadedElementsModule) {
        // Side-effect import resources in module.json
        await Root.Runtime.Runtime.instance().loadModulePromise('panels/elements');
        loadedElementsModule = await import('./elements.js');
    }
    return loadedElementsModule;
}
function maybeRetrieveContextTypes(getClassCallBack) {
    if (loadedElementsModule === undefined) {
        return [];
    }
    return getClassCallBack(loadedElementsModule);
}
UI.ViewManager.registerViewExtension({
    location: "panel" /* PANEL */,
    id: 'elements',
    commandPrompt: i18nLazyString(UIStrings.showElements),
    title: i18nLazyString(UIStrings.elements),
    order: 10,
    persistence: "permanent" /* PERMANENT */,
    hasToolbar: false,
    async loadView() {
        const Elements = await loadElementsModule();
        return Elements.ElementsPanel.ElementsPanel.instance();
    },
});
UI.ViewManager.registerViewExtension({
    location: "elements-sidebar" /* ELEMENTS_SIDEBAR */,
    id: 'elements.eventListeners',
    commandPrompt: i18nLazyString(UIStrings.showEventListeners),
    title: i18nLazyString(UIStrings.eventListeners),
    order: 5,
    hasToolbar: true,
    persistence: "permanent" /* PERMANENT */,
    async loadView() {
        const Elements = await loadElementsModule();
        return Elements.EventListenersWidget.EventListenersWidget.instance();
    },
});
UI.ViewManager.registerViewExtension({
    location: "elements-sidebar" /* ELEMENTS_SIDEBAR */,
    id: 'elements.domProperties',
    commandPrompt: i18nLazyString(UIStrings.showProperties),
    title: i18nLazyString(UIStrings.properties),
    order: 7,
    persistence: "permanent" /* PERMANENT */,
    async loadView() {
        const Elements = await loadElementsModule();
        return Elements.PropertiesWidget.PropertiesWidget.instance();
    },
});
UI.ViewManager.registerViewExtension({
    experiment: Root.Runtime.ExperimentName.CAPTURE_NODE_CREATION_STACKS,
    location: "elements-sidebar" /* ELEMENTS_SIDEBAR */,
    id: 'elements.domCreation',
    commandPrompt: i18nLazyString(UIStrings.showStackTrace),
    title: i18nLazyString(UIStrings.stackTrace),
    order: 10,
    persistence: "permanent" /* PERMANENT */,
    async loadView() {
        const Elements = await loadElementsModule();
        return Elements.NodeStackTraceWidget.NodeStackTraceWidget.instance();
    },
});
UI.ViewManager.registerViewExtension({
    location: "elements-sidebar" /* ELEMENTS_SIDEBAR */,
    id: 'elements.layout',
    commandPrompt: i18nLazyString(UIStrings.showLayout),
    title: i18nLazyString(UIStrings.layout),
    order: 4,
    persistence: "permanent" /* PERMANENT */,
    async loadView() {
        const Elements = await loadElementsModule();
        return Elements.LayoutSidebarPane.LayoutSidebarPane.instance();
    },
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'elements.hide-element',
    category: UI.ActionRegistration.ActionCategory.ELEMENTS,
    title: i18nLazyString(UIStrings.hideElement),
    async loadActionDelegate() {
        const Elements = await loadElementsModule();
        return Elements.ElementsPanel.ElementsActionDelegate.instance();
    },
    contextTypes() {
        return maybeRetrieveContextTypes(Elements => [Elements.ElementsPanel.ElementsPanel]);
    },
    bindings: [
        {
            shortcut: 'H',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'elements.edit-as-html',
    category: UI.ActionRegistration.ActionCategory.ELEMENTS,
    title: i18nLazyString(UIStrings.editAsHtml),
    async loadActionDelegate() {
        const Elements = await loadElementsModule();
        return Elements.ElementsPanel.ElementsActionDelegate.instance();
    },
    contextTypes() {
        return maybeRetrieveContextTypes(Elements => [Elements.ElementsPanel.ElementsPanel]);
    },
    bindings: [
        {
            shortcut: 'F2',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'elements.duplicate-element',
    category: UI.ActionRegistration.ActionCategory.ELEMENTS,
    title: i18nLazyString(UIStrings.duplicateElement),
    async loadActionDelegate() {
        const Elements = await loadElementsModule();
        return Elements.ElementsPanel.ElementsActionDelegate.instance();
    },
    contextTypes() {
        return maybeRetrieveContextTypes(Elements => [Elements.ElementsPanel.ElementsPanel]);
    },
    bindings: [
        {
            shortcut: 'Shift+Alt+Down',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'elements.copy-styles',
    category: UI.ActionRegistration.ActionCategory.ELEMENTS,
    title: i18nLazyString(UIStrings.copyStyles),
    async loadActionDelegate() {
        const Elements = await loadElementsModule();
        return Elements.ElementsPanel.ElementsActionDelegate.instance();
    },
    contextTypes() {
        return maybeRetrieveContextTypes(Elements => [Elements.ElementsPanel.ElementsPanel]);
    },
    bindings: [
        {
            shortcut: 'Ctrl+Alt+C',
            platform: "windows,linux" /* WindowsLinux */,
        },
        {
            shortcut: 'Meta+Alt+C',
            platform: "mac" /* Mac */,
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'elements.undo',
    category: UI.ActionRegistration.ActionCategory.ELEMENTS,
    title: i18nLazyString(UIStrings.undo),
    async loadActionDelegate() {
        const Elements = await loadElementsModule();
        return Elements.ElementsPanel.ElementsActionDelegate.instance();
    },
    contextTypes() {
        return maybeRetrieveContextTypes(Elements => [Elements.ElementsPanel.ElementsPanel]);
    },
    bindings: [
        {
            shortcut: 'Ctrl+Z',
            platform: "windows,linux" /* WindowsLinux */,
        },
        {
            shortcut: 'Meta+Z',
            platform: "mac" /* Mac */,
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'elements.redo',
    category: UI.ActionRegistration.ActionCategory.ELEMENTS,
    title: i18nLazyString(UIStrings.redo),
    async loadActionDelegate() {
        const Elements = await loadElementsModule();
        return Elements.ElementsPanel.ElementsActionDelegate.instance();
    },
    contextTypes() {
        return maybeRetrieveContextTypes(Elements => [Elements.ElementsPanel.ElementsPanel]);
    },
    bindings: [
        {
            shortcut: 'Ctrl+Y',
            platform: "windows,linux" /* WindowsLinux */,
        },
        {
            shortcut: 'Meta+Shift+Z',
            platform: "mac" /* Mac */,
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'elements.capture-area-screenshot',
    async loadActionDelegate() {
        const Elements = await loadElementsModule();
        return Elements.InspectElementModeController.ToggleSearchActionDelegate.instance();
    },
    condition: Root.Runtime.ConditionName.CAN_DOCK,
    title: i18nLazyString(UIStrings.captureAreaScreenshot),
    category: UI.ActionRegistration.ActionCategory.SCREENSHOT,
});
UI.ActionRegistration.registerActionExtension({
    category: UI.ActionRegistration.ActionCategory.ELEMENTS,
    actionId: 'elements.toggle-element-search',
    toggleable: true,
    async loadActionDelegate() {
        const Elements = await loadElementsModule();
        return Elements.InspectElementModeController.ToggleSearchActionDelegate.instance();
    },
    title: i18nLazyString(UIStrings.selectAnElementInThePageTo),
    iconClass: "largeicon-node-search" /* LARGEICON_NODE_SEARCH */,
    bindings: [
        {
            shortcut: 'Ctrl+Shift+C',
            platform: "windows,linux" /* WindowsLinux */,
        },
        {
            shortcut: 'Meta+Shift+C',
            platform: "mac" /* Mac */,
        },
    ],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.ELEMENTS,
    order: 1,
    title: i18nLazyString('Show user agent shadow DOM'),
    settingName: 'showUAShadowDOM',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: false,
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.ELEMENTS,
    order: 2,
    title: i18nLazyString(UIStrings.wordWrap),
    settingName: 'domWordWrap',
    settingType: Common.Settings.SettingType.BOOLEAN,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.enableDomWordWrap),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.disableDomWordWrap),
        },
    ],
    defaultValue: true,
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.ELEMENTS,
    order: 3,
    title: i18nLazyString(UIStrings.showHtmlComments),
    settingName: 'showHTMLComments',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: true,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.showHtmlComments),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.hideHtmlComments),
        },
    ],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.ELEMENTS,
    order: 4,
    title: i18nLazyString(UIStrings.revealDomNodeOnHover),
    settingName: 'highlightNodeOnHoverInOverlay',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: true,
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.ELEMENTS,
    order: 5,
    title: i18nLazyString(UIStrings.showDetailedInspectTooltip),
    settingName: 'showDetailedInspectTooltip',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: true,
});
Common.Settings.registerSettingExtension({
    settingName: 'showEventListenersForAncestors',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: true,
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.ADORNER,
    settingName: 'adornerSettings',
    settingType: Common.Settings.SettingType.ARRAY,
    defaultValue: [],
});
UI.ContextMenu.registerProvider({
    contextTypes() {
        return [
            SDK.RemoteObject.RemoteObject,
            SDK.DOMModel.DOMNode,
            SDK.DOMModel.DeferredDOMNode,
        ];
    },
    async loadProvider() {
        const Elements = await loadElementsModule();
        return Elements.ElementsPanel.ContextMenuProvider.instance();
    },
    experiment: undefined,
});
UI.ViewManager.registerLocationResolver({
    name: "elements-sidebar" /* ELEMENTS_SIDEBAR */,
    category: UI.ViewManager.ViewLocationCategoryValues.ELEMENTS,
    async loadResolver() {
        const Elements = await loadElementsModule();
        return Elements.ElementsPanel.ElementsPanel.instance();
    },
});
Common.Revealer.registerRevealer({
    contextTypes() {
        return [
            SDK.DOMModel.DOMNode,
            SDK.DOMModel.DeferredDOMNode,
            SDK.RemoteObject.RemoteObject,
        ];
    },
    destination: Common.Revealer.RevealerDestination.ELEMENTS_PANEL,
    async loadRevealer() {
        const Elements = await loadElementsModule();
        return Elements.ElementsPanel.DOMNodeRevealer.instance();
    },
});
Common.Revealer.registerRevealer({
    contextTypes() {
        return [
            SDK.CSSProperty.CSSProperty,
        ];
    },
    destination: Common.Revealer.RevealerDestination.STYLES_SIDEBAR,
    async loadRevealer() {
        const Elements = await loadElementsModule();
        return Elements.ElementsPanel.CSSPropertyRevealer.instance();
    },
});
UI.Toolbar.registerToolbarItem({
    async loadItem() {
        const Elements = await loadElementsModule();
        return Elements.ElementStatePaneWidget.ButtonProvider.instance();
    },
    order: 1,
    location: UI.Toolbar.ToolbarItemLocation.STYLES_SIDEBARPANE_TOOLBAR,
    showLabel: undefined,
    condition: undefined,
    separator: undefined,
    actionId: undefined,
});
UI.Toolbar.registerToolbarItem({
    async loadItem() {
        const Elements = await loadElementsModule();
        return Elements.ClassesPaneWidget.ButtonProvider.instance();
    },
    order: 2,
    location: UI.Toolbar.ToolbarItemLocation.STYLES_SIDEBARPANE_TOOLBAR,
    showLabel: undefined,
    condition: undefined,
    separator: undefined,
    actionId: undefined,
});
UI.Toolbar.registerToolbarItem({
    async loadItem() {
        const Elements = await loadElementsModule();
        return Elements.StylesSidebarPane.ButtonProvider.instance();
    },
    order: 100,
    location: UI.Toolbar.ToolbarItemLocation.STYLES_SIDEBARPANE_TOOLBAR,
    showLabel: undefined,
    condition: undefined,
    separator: undefined,
    actionId: undefined,
});
UI.Toolbar.registerToolbarItem({
    actionId: 'elements.toggle-element-search',
    location: UI.Toolbar.ToolbarItemLocation.MAIN_TOOLBAR_LEFT,
    order: 0,
    showLabel: undefined,
    condition: undefined,
    separator: undefined,
    loadItem: undefined,
});
UI.UIUtils.registerRenderer({
    contextTypes() {
        return [SDK.DOMModel.DOMNode, SDK.DOMModel.DeferredDOMNode];
    },
    async loadRenderer() {
        const Elements = await loadElementsModule();
        return Elements.ElementsTreeOutline.Renderer.instance();
    },
});
Common.Linkifier.registerLinkifier({
    contextTypes() {
        return [
            SDK.DOMModel.DOMNode,
            SDK.DOMModel.DeferredDOMNode,
        ];
    },
    async loadLinkifier() {
        const Elements = await loadElementsModule();
        return Elements.DOMLinkifier.Linkifier.instance();
    },
});
//# sourceMappingURL=elements-meta.js.map