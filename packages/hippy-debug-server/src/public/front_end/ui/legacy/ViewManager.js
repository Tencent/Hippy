// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as ARIAUtils from './ARIAUtils.js';
import { Icon } from './Icon.js';
import { Events as TabbedPaneEvents, TabbedPane } from './TabbedPane.js';
import { Toolbar, ToolbarMenuButton } from './Toolbar.js'; // eslint-disable-line no-unused-vars
import { createTextChild } from './UIUtils.js';
import { getRegisteredLocationResolvers, getRegisteredViewExtensions, maybeRemoveViewExtension, registerLocationResolver, registerViewExtension, ViewLocationCategoryValues } from './ViewRegistration.js';
import { VBox } from './Widget.js'; // eslint-disable-line no-unused-vars
const UIStrings = {
    /**
    *@description Aria label for the tab panel view container
    *@example {Sensors} PH1
    */
    sPanel: '{PH1} panel',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/ViewManager.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class PreRegisteredView {
    _viewRegistration;
    _widgetRequested;
    constructor(viewRegistration) {
        this._viewRegistration = viewRegistration;
        this._widgetRequested = false;
    }
    title() {
        return this._viewRegistration.title();
    }
    commandPrompt() {
        return this._viewRegistration.commandPrompt();
    }
    isCloseable() {
        return this._viewRegistration.persistence === "closeable" /* CLOSEABLE */;
    }
    isTransient() {
        return this._viewRegistration.persistence === "transient" /* TRANSIENT */;
    }
    viewId() {
        return this._viewRegistration.id;
    }
    location() {
        return this._viewRegistration.location;
    }
    order() {
        return this._viewRegistration.order;
    }
    settings() {
        return this._viewRegistration.settings;
    }
    tags() {
        if (this._viewRegistration.tags) {
            // Get localized keys and separate by null character to prevent fuzzy matching from matching across them.
            return this._viewRegistration.tags.map(tag => tag()).join('\0');
        }
        return undefined;
    }
    persistence() {
        return this._viewRegistration.persistence;
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async toolbarItems() {
        if (this._viewRegistration.hasToolbar) {
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return this.widget().then(widget => widget.toolbarItems());
        }
        return [];
    }
    async widget() {
        this._widgetRequested = true;
        return this._viewRegistration.loadView();
    }
    async disposeView() {
        if (!this._widgetRequested) {
            return;
        }
        const widget = await this.widget();
        await widget.ownerViewDisposed();
    }
    experiment() {
        return this._viewRegistration.experiment;
    }
    condition() {
        return this._viewRegistration.condition;
    }
}
let viewManagerInstance;
export class ViewManager {
    _views;
    _locationNameByViewId;
    _locationOverrideSetting;
    constructor() {
        this._views = new Map();
        this._locationNameByViewId = new Map();
        // Read override setting for location
        this._locationOverrideSetting = Common.Settings.Settings.instance().createSetting('viewsLocationOverride', {});
        const preferredExtensionLocations = this._locationOverrideSetting.get();
        // Views may define their initial ordering within a location. When the user has not reordered, we use the
        // default ordering as defined by the views themselves.
        const viewsByLocation = new Map();
        for (const view of getRegisteredViewExtensions()) {
            const location = view.location() || 'none';
            const views = viewsByLocation.get(location) || [];
            views.push(view);
            viewsByLocation.set(location, views);
        }
        let sortedViewExtensions = [];
        for (const views of viewsByLocation.values()) {
            views.sort((firstView, secondView) => {
                const firstViewOrder = firstView.order();
                const secondViewOrder = secondView.order();
                if (firstViewOrder && secondViewOrder) {
                    return firstViewOrder - secondViewOrder;
                }
                return 0;
            });
            sortedViewExtensions = sortedViewExtensions.concat(views);
        }
        for (const view of sortedViewExtensions) {
            const viewId = view.viewId();
            const location = view.location();
            if (this._views.has(viewId)) {
                throw new Error(`Duplicate view id '${viewId}'`);
            }
            this._views.set(viewId, view);
            // Use the preferred user location if available
            const locationName = preferredExtensionLocations[viewId] || location;
            this._locationNameByViewId.set(viewId, locationName);
        }
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!viewManagerInstance || forceNew) {
            viewManagerInstance = new ViewManager();
        }
        return viewManagerInstance;
    }
    static removeInstance() {
        viewManagerInstance = undefined;
    }
    static _createToolbar(toolbarItems) {
        if (!toolbarItems.length) {
            return null;
        }
        const toolbar = new Toolbar('');
        for (const item of toolbarItems) {
            toolbar.appendToolbarItem(item);
        }
        return toolbar.element;
    }
    locationNameForViewId(viewId) {
        const locationName = this._locationNameByViewId.get(viewId);
        if (!locationName) {
            throw new Error(`No location name for view with id ${viewId}`);
        }
        return locationName;
    }
    /**
     * Moves a view to a new location
     */
    moveView(viewId, locationName, options) {
        const defaultOptions = { shouldSelectTab: true, overrideSaving: false };
        const { shouldSelectTab, overrideSaving } = options || defaultOptions;
        if (!viewId || !locationName) {
            return;
        }
        const view = this.view(viewId);
        if (!view) {
            return;
        }
        if (!overrideSaving) {
            // Update the inner map of locations
            this._locationNameByViewId.set(viewId, locationName);
            // Update the settings of location overwrites
            const locations = this._locationOverrideSetting.get();
            locations[viewId] = locationName;
            this._locationOverrideSetting.set(locations);
        }
        // Find new location and show view there
        this.resolveLocation(locationName).then(location => {
            if (!location) {
                throw new Error('Move view: Could not resolve location for view: ' + viewId);
            }
            location._reveal();
            return location.showView(view, undefined, /* userGesture*/ true, /* omitFocus*/ false, shouldSelectTab);
        });
    }
    revealView(view) {
        const location = locationForView.get(view);
        if (!location) {
            return Promise.resolve();
        }
        location._reveal();
        return location.showView(view);
    }
    /**
     * Show view in location
     */
    showViewInLocation(viewId, locationName, shouldSelectTab = true) {
        this.moveView(viewId, locationName, {
            shouldSelectTab,
            overrideSaving: true,
        });
    }
    view(viewId) {
        const view = this._views.get(viewId);
        if (!view) {
            throw new Error(`No view with id ${viewId} found!`);
        }
        return view;
    }
    materializedWidget(viewId) {
        const view = this.view(viewId);
        if (!view) {
            return null;
        }
        return widgetForView.get(view) || null;
    }
    showView(viewId, userGesture, omitFocus) {
        const view = this._views.get(viewId);
        if (!view) {
            console.error('Could not find view for id: \'' + viewId + '\' ' + new Error().stack);
            return Promise.resolve();
        }
        const locationName = this._locationNameByViewId.get(viewId);
        const location = locationForView.get(view);
        if (location) {
            location._reveal();
            return location.showView(view, undefined, userGesture, omitFocus);
        }
        return this.resolveLocation(locationName).then(location => {
            if (!location) {
                throw new Error('Could not resolve location for view: ' + viewId);
            }
            location._reveal();
            return location.showView(view, undefined, userGesture, omitFocus);
        });
    }
    async resolveLocation(location) {
        if (!location) {
            return Promise.resolve(null);
        }
        const registeredResolvers = getRegisteredLocationResolvers().filter(resolver => resolver.name === location);
        if (registeredResolvers.length > 1) {
            throw new Error('Duplicate resolver for location: ' + location);
        }
        if (registeredResolvers.length) {
            const resolver = await registeredResolvers[0].loadResolver();
            return resolver.resolveLocation(location);
        }
        throw new Error('Unresolved location: ' + location);
    }
    createTabbedLocation(revealCallback, location, restoreSelection, allowReorder, defaultTab) {
        return new _TabbedLocation(this, revealCallback, location, restoreSelection, allowReorder, defaultTab);
    }
    createStackLocation(revealCallback, location) {
        return new _StackLocation(this, revealCallback, location);
    }
    hasViewsForLocation(location) {
        return Boolean(this._viewsForLocation(location).length);
    }
    _viewsForLocation(location) {
        const result = [];
        for (const [id, view] of this._views.entries()) {
            if (this._locationNameByViewId.get(id) === location) {
                result.push(view);
            }
        }
        return result;
    }
}
const widgetForView = new WeakMap();
export class ContainerWidget extends VBox {
    _view;
    _materializePromise;
    constructor(view) {
        super();
        this.element.classList.add('flex-auto', 'view-container', 'overflow-auto');
        this._view = view;
        this.element.tabIndex = -1;
        ARIAUtils.markAsTabpanel(this.element);
        ARIAUtils.setAccessibleName(this.element, i18nString(UIStrings.sPanel, { PH1: view.title() }));
        this.setDefaultFocusedElement(this.element);
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _materialize() {
        if (this._materializePromise) {
            return this._materializePromise;
        }
        const promises = [];
        // TODO(crbug.com/1006759): Transform to async-await
        promises.push(this._view.toolbarItems().then(toolbarItems => {
            const toolbarElement = ViewManager._createToolbar(toolbarItems);
            if (toolbarElement) {
                this.element.insertBefore(toolbarElement, this.element.firstChild);
            }
        }));
        promises.push(this._view.widget().then(widget => {
            // Move focus from |this| to loaded |widget| if any.
            const shouldFocus = this.element.hasFocus();
            this.setDefaultFocusedElement(null);
            widgetForView.set(this._view, widget);
            widget.show(this.element);
            if (shouldFocus) {
                widget.focus();
            }
        }));
        this._materializePromise = Promise.all(promises);
        return this._materializePromise;
    }
    wasShown() {
        this._materialize().then(() => {
            const widget = widgetForView.get(this._view);
            if (widget) {
                widget.show(this.element);
                this._wasShownForTest();
            }
        });
    }
    _wasShownForTest() {
        // This method is sniffed in tests.
    }
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
export class _ExpandableContainerWidget extends VBox {
    _titleElement;
    _titleExpandIcon;
    _view;
    _widget;
    _materializePromise;
    constructor(view) {
        super(true);
        this.element.classList.add('flex-none');
        this.registerRequiredCSS('ui/legacy/viewContainers.css', { enableLegacyPatching: false });
        this._titleElement = document.createElement('div');
        this._titleElement.classList.add('expandable-view-title');
        ARIAUtils.markAsButton(this._titleElement);
        this._titleExpandIcon = Icon.create('smallicon-triangle-right', 'title-expand-icon');
        this._titleElement.appendChild(this._titleExpandIcon);
        const titleText = view.title();
        createTextChild(this._titleElement, titleText);
        ARIAUtils.setAccessibleName(this._titleElement, titleText);
        ARIAUtils.setExpanded(this._titleElement, false);
        this._titleElement.tabIndex = 0;
        self.onInvokeElement(this._titleElement, this._toggleExpanded.bind(this));
        this._titleElement.addEventListener('keydown', this._onTitleKeyDown.bind(this), false);
        this.contentElement.insertBefore(this._titleElement, this.contentElement.firstChild);
        ARIAUtils.setControls(this._titleElement, this.contentElement.createChild('slot'));
        this._view = view;
        expandableContainerForView.set(view, this);
    }
    wasShown() {
        if (this._widget && this._materializePromise) {
            this._materializePromise.then(() => {
                if (this._titleElement.classList.contains('expanded') && this._widget) {
                    this._widget.show(this.element);
                }
            });
        }
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _materialize() {
        if (this._materializePromise) {
            return this._materializePromise;
        }
        // TODO(crbug.com/1006759): Transform to async-await
        const promises = [];
        promises.push(this._view.toolbarItems().then(toolbarItems => {
            const toolbarElement = ViewManager._createToolbar(toolbarItems);
            if (toolbarElement) {
                this._titleElement.appendChild(toolbarElement);
            }
        }));
        promises.push(this._view.widget().then(widget => {
            this._widget = widget;
            widgetForView.set(this._view, widget);
            widget.show(this.element);
        }));
        this._materializePromise = Promise.all(promises);
        return this._materializePromise;
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _expand() {
        if (this._titleElement.classList.contains('expanded')) {
            return this._materialize();
        }
        this._titleElement.classList.add('expanded');
        ARIAUtils.setExpanded(this._titleElement, true);
        this._titleExpandIcon.setIconType('smallicon-triangle-down');
        return this._materialize().then(() => {
            if (this._widget) {
                this._widget.show(this.element);
            }
        });
    }
    _collapse() {
        if (!this._titleElement.classList.contains('expanded')) {
            return;
        }
        this._titleElement.classList.remove('expanded');
        ARIAUtils.setExpanded(this._titleElement, false);
        this._titleExpandIcon.setIconType('smallicon-triangle-right');
        this._materialize().then(() => {
            if (this._widget) {
                this._widget.detach();
            }
        });
    }
    _toggleExpanded(event) {
        if (event.type === 'keydown' && event.target !== this._titleElement) {
            return;
        }
        if (this._titleElement.classList.contains('expanded')) {
            this._collapse();
        }
        else {
            this._expand();
        }
    }
    _onTitleKeyDown(event) {
        if (event.target !== this._titleElement) {
            return;
        }
        const keyEvent = event;
        if (keyEvent.key === 'ArrowLeft') {
            this._collapse();
        }
        else if (keyEvent.key === 'ArrowRight') {
            if (!this._titleElement.classList.contains('expanded')) {
                this._expand();
            }
            else if (this._widget) {
                this._widget.focus();
            }
        }
    }
}
const expandableContainerForView = new WeakMap();
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
class _Location {
    _manager;
    _revealCallback;
    _widget;
    constructor(manager, widget, revealCallback) {
        this._manager = manager;
        this._revealCallback = revealCallback;
        this._widget = widget;
    }
    widget() {
        return this._widget;
    }
    _reveal() {
        if (this._revealCallback) {
            this._revealCallback();
        }
    }
    showView(_view, _insertBefore, _userGesture, _omitFocus, _shouldSelectTab) {
        throw new Error('not implemented');
    }
    removeView(_view) {
        throw new Error('not implemented');
    }
}
const locationForView = new WeakMap();
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
export class _TabbedLocation extends _Location {
    _tabbedPane;
    _allowReorder;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _closeableTabSetting;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _tabOrderSetting;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _lastSelectedTabSetting;
    _defaultTab;
    _views;
    constructor(manager, revealCallback, location, restoreSelection, allowReorder, defaultTab) {
        const tabbedPane = new TabbedPane();
        if (allowReorder) {
            tabbedPane.setAllowTabReorder(true);
        }
        super(manager, tabbedPane, revealCallback);
        this._tabbedPane = tabbedPane;
        this._allowReorder = allowReorder;
        this._tabbedPane.addEventListener(TabbedPaneEvents.TabSelected, this._tabSelected, this);
        this._tabbedPane.addEventListener(TabbedPaneEvents.TabClosed, this._tabClosed, this);
        this._closeableTabSetting = Common.Settings.Settings.instance().createSetting('closeableTabs', {});
        // As we give tabs the capability to be closed we also need to add them to the setting so they are still open
        // until the user decide to close them
        this._setOrUpdateCloseableTabsSetting();
        this._tabOrderSetting = Common.Settings.Settings.instance().createSetting(location + '-tabOrder', {});
        this._tabbedPane.addEventListener(TabbedPaneEvents.TabOrderChanged, this._persistTabOrder, this);
        if (restoreSelection) {
            this._lastSelectedTabSetting = Common.Settings.Settings.instance().createSetting(location + '-selectedTab', '');
        }
        this._defaultTab = defaultTab;
        this._views = new Map();
        if (location) {
            this.appendApplicableItems(location);
        }
    }
    _setOrUpdateCloseableTabsSetting() {
        // Update the setting value, we respect the closed state decided by the user
        // and append the new tabs with value of true so they are shown open
        const defaultOptionsForTabs = { 'security': true };
        const tabs = this._closeableTabSetting.get();
        const newClosable = Object.assign(defaultOptionsForTabs, tabs);
        this._closeableTabSetting.set(newClosable);
    }
    widget() {
        return this._tabbedPane;
    }
    tabbedPane() {
        return this._tabbedPane;
    }
    enableMoreTabsButton() {
        const moreTabsButton = new ToolbarMenuButton(this._appendTabsToMenu.bind(this));
        this._tabbedPane.leftToolbar().appendToolbarItem(moreTabsButton);
        this._tabbedPane.disableOverflowMenu();
        return moreTabsButton;
    }
    appendApplicableItems(locationName) {
        const views = this._manager._viewsForLocation(locationName);
        if (this._allowReorder) {
            let i = 0;
            const persistedOrders = this._tabOrderSetting.get();
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const orders = new Map();
            for (const view of views) {
                orders.set(view.viewId(), persistedOrders[view.viewId()] || (++i) * _TabbedLocation.orderStep);
            }
            views.sort((a, b) => orders.get(a.viewId()) - orders.get(b.viewId()));
        }
        for (const view of views) {
            const id = view.viewId();
            this._views.set(id, view);
            locationForView.set(view, this);
            if (view.isTransient()) {
                continue;
            }
            if (!view.isCloseable()) {
                this._appendTab(view);
            }
            else if (this._closeableTabSetting.get()[id]) {
                this._appendTab(view);
            }
        }
        // If a default tab was provided we open or select it
        if (this._defaultTab) {
            if (this._tabbedPane.hasTab(this._defaultTab)) {
                // If the tabbed pane already has the tab we just have to select it
                this._tabbedPane.selectTab(this._defaultTab);
            }
            else {
                // If the tab is not present already it can be because:
                // it doesn't correspond to this tabbed location
                // or because it is closed
                const view = Array.from(this._views.values()).find(view => view.viewId() === this._defaultTab);
                if (view) {
                    // _defaultTab is indeed part of the views for this tabbed location
                    this.showView(view);
                }
            }
        }
        else if (this._lastSelectedTabSetting && this._tabbedPane.hasTab(this._lastSelectedTabSetting.get())) {
            this._tabbedPane.selectTab(this._lastSelectedTabSetting.get());
        }
    }
    _appendTabsToMenu(contextMenu) {
        const views = Array.from(this._views.values());
        views.sort((viewa, viewb) => viewa.title().localeCompare(viewb.title()));
        for (const view of views) {
            const title = view.title();
            if (view.viewId() === 'issues-pane') {
                contextMenu.defaultSection().appendItem(title, () => {
                    Host.userMetrics.issuesPanelOpenedFrom(Host.UserMetrics.IssueOpener.HamburgerMenu);
                    this.showView(view, undefined, true);
                });
                continue;
            }
            contextMenu.defaultSection().appendItem(title, this.showView.bind(this, view, undefined, true));
        }
    }
    _appendTab(view, index) {
        this._tabbedPane.appendTab(view.viewId(), view.title(), new ContainerWidget(view), undefined, false, view.isCloseable() || view.isTransient(), index);
    }
    appendView(view, insertBefore) {
        if (this._tabbedPane.hasTab(view.viewId())) {
            return;
        }
        const oldLocation = locationForView.get(view);
        if (oldLocation && oldLocation !== this) {
            oldLocation.removeView(view);
        }
        locationForView.set(view, this);
        this._manager._views.set(view.viewId(), view);
        this._views.set(view.viewId(), view);
        let index = undefined;
        const tabIds = this._tabbedPane.tabIds();
        if (this._allowReorder) {
            const orderSetting = this._tabOrderSetting.get();
            const order = orderSetting[view.viewId()];
            for (let i = 0; order && i < tabIds.length; ++i) {
                if (orderSetting[tabIds[i]] && orderSetting[tabIds[i]] > order) {
                    index = i;
                    break;
                }
            }
        }
        else if (insertBefore) {
            for (let i = 0; i < tabIds.length; ++i) {
                if (tabIds[i] === insertBefore.viewId()) {
                    index = i;
                    break;
                }
            }
        }
        this._appendTab(view, index);
        if (view.isCloseable()) {
            const tabs = this._closeableTabSetting.get();
            const tabId = view.viewId();
            if (!tabs[tabId]) {
                tabs[tabId] = true;
                this._closeableTabSetting.set(tabs);
            }
        }
        this._persistTabOrder();
    }
    async showView(view, insertBefore, userGesture, omitFocus, shouldSelectTab = true) {
        this.appendView(view, insertBefore);
        if (shouldSelectTab) {
            this._tabbedPane.selectTab(view.viewId(), userGesture);
        }
        if (!omitFocus) {
            this._tabbedPane.focus();
        }
        const widget = this._tabbedPane.tabView(view.viewId());
        await widget._materialize();
    }
    removeView(view) {
        if (!this._tabbedPane.hasTab(view.viewId())) {
            return;
        }
        locationForView.delete(view);
        this._manager._views.delete(view.viewId());
        this._tabbedPane.closeTab(view.viewId());
        this._views.delete(view.viewId());
    }
    _tabSelected(event) {
        const tabId = event.data.tabId;
        if (this._lastSelectedTabSetting && event.data['isUserGesture']) {
            this._lastSelectedTabSetting.set(tabId);
        }
    }
    _tabClosed(event) {
        const id = event.data['tabId'];
        const tabs = this._closeableTabSetting.get();
        if (tabs[id]) {
            tabs[id] = false;
            this._closeableTabSetting.set(tabs);
        }
        const view = this._views.get(id);
        if (view) {
            view.disposeView();
        }
    }
    _persistTabOrder() {
        const tabIds = this._tabbedPane.tabIds();
        const tabOrders = {};
        for (let i = 0; i < tabIds.length; i++) {
            tabOrders[tabIds[i]] = (i + 1) * _TabbedLocation.orderStep;
        }
        const oldTabOrder = this._tabOrderSetting.get();
        const oldTabArray = Object.keys(oldTabOrder);
        oldTabArray.sort((a, b) => oldTabOrder[a] - oldTabOrder[b]);
        let lastOrder = 0;
        for (const key of oldTabArray) {
            if (key in tabOrders) {
                lastOrder = tabOrders[key];
                continue;
            }
            tabOrders[key] = ++lastOrder;
        }
        this._tabOrderSetting.set(tabOrders);
    }
    static orderStep = 10; // Keep in sync with descriptors.
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
class _StackLocation extends _Location {
    _vbox;
    _expandableContainers;
    constructor(manager, revealCallback, location) {
        const vbox = new VBox();
        super(manager, vbox, revealCallback);
        this._vbox = vbox;
        this._expandableContainers = new Map();
        if (location) {
            this.appendApplicableItems(location);
        }
    }
    appendView(view, insertBefore) {
        const oldLocation = locationForView.get(view);
        if (oldLocation && oldLocation !== this) {
            oldLocation.removeView(view);
        }
        let container = this._expandableContainers.get(view.viewId());
        if (!container) {
            locationForView.set(view, this);
            this._manager._views.set(view.viewId(), view);
            container = new _ExpandableContainerWidget(view);
            let beforeElement = null;
            if (insertBefore) {
                const beforeContainer = expandableContainerForView.get(insertBefore);
                beforeElement = beforeContainer ? beforeContainer.element : null;
            }
            container.show(this._vbox.contentElement, beforeElement);
            this._expandableContainers.set(view.viewId(), container);
        }
    }
    async showView(view, insertBefore) {
        this.appendView(view, insertBefore);
        const container = this._expandableContainers.get(view.viewId());
        if (container) {
            await container._expand();
        }
    }
    removeView(view) {
        const container = this._expandableContainers.get(view.viewId());
        if (!container) {
            return;
        }
        container.detach();
        this._expandableContainers.delete(view.viewId());
        locationForView.delete(view);
        this._manager._views.delete(view.viewId());
    }
    appendApplicableItems(locationName) {
        for (const view of this._manager._viewsForLocation(locationName)) {
            this.appendView(view);
        }
    }
}
export { getRegisteredViewExtensions, maybeRemoveViewExtension, registerViewExtension, getRegisteredLocationResolvers, registerLocationResolver, ViewLocationCategoryValues, };
//# sourceMappingURL=ViewManager.js.map