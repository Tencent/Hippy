// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import { ApplicationPanelTreeElement, ExpandableApplicationPanelTreeElement } from './ApplicationPanelTreeElement.js';
import { BackForwardCacheView } from './BackForwardCacheView.js';
import { ServiceWorkerCacheView } from './ServiceWorkerCacheViews.js';
const UIStrings = {
    /**
    *@description Text in Application Panel Sidebar of the Application panel
    */
    cacheStorage: 'Cache Storage',
    /**
    *@description Text in Application Panel Sidebar of the Application panel
    */
    backForwardCache: 'Back-forward Cache',
    /**
    *@description A context menu item in the Application Panel Sidebar of the Application panel
    */
    refreshCaches: 'Refresh Caches',
    /**
    *@description Text to delete something
    */
    delete: 'Delete',
};
const str_ = i18n.i18n.registerUIStrings('panels/application/ApplicationPanelCacheSection.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class ApplicationCacheManifestTreeElement extends ApplicationPanelTreeElement {
    manifestURL;
    constructor(resourcesPanel, manifestURL) {
        const title = new Common.ParsedURL.ParsedURL(manifestURL).displayName;
        super(resourcesPanel, title, false);
        this.tooltip = manifestURL;
        this.manifestURL = manifestURL;
    }
    get itemURL() {
        return 'appcache://' + this.manifestURL;
    }
    onselect(selectedByUser) {
        super.onselect(selectedByUser);
        this.resourcesPanel.showCategoryView(this.manifestURL, null);
        return false;
    }
}
export class ServiceWorkerCacheTreeElement extends ExpandableApplicationPanelTreeElement {
    swCacheModel;
    swCacheTreeElements;
    constructor(resourcesPanel) {
        super(resourcesPanel, i18nString(UIStrings.cacheStorage), 'CacheStorage');
        const icon = UI.Icon.Icon.create('mediumicon-database', 'resource-tree-item');
        this.setLink('https://developer.chrome.com/docs/devtools/storage/cache/?utm_source=devtools');
        this.setLeadingIcons([icon]);
        this.swCacheModel = null;
        this.swCacheTreeElements = new Set();
    }
    initialize(model) {
        this.swCacheTreeElements.clear();
        this.swCacheModel = model;
        if (model) {
            for (const cache of model.caches()) {
                this.addCache(model, cache);
            }
        }
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.ServiceWorkerCacheModel.ServiceWorkerCacheModel, SDK.ServiceWorkerCacheModel.Events.CacheAdded, this.cacheAdded, this);
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.ServiceWorkerCacheModel.ServiceWorkerCacheModel, SDK.ServiceWorkerCacheModel.Events.CacheRemoved, this.cacheRemoved, this);
    }
    onattach() {
        super.onattach();
        this.listItemElement.addEventListener('contextmenu', this.handleContextMenuEvent.bind(this), true);
    }
    handleContextMenuEvent(event) {
        const contextMenu = new UI.ContextMenu.ContextMenu(event);
        contextMenu.defaultSection().appendItem(i18nString(UIStrings.refreshCaches), this.refreshCaches.bind(this));
        contextMenu.show();
    }
    refreshCaches() {
        if (this.swCacheModel) {
            this.swCacheModel.refreshCacheNames();
        }
    }
    cacheAdded(event) {
        const cache = /** @type {!SDK.ServiceWorkerCacheModel.Cache} */ (event.data.cache);
        const model = /** @type {!SDK.ServiceWorkerCacheModel.ServiceWorkerCacheModel} */ (event.data.model);
        this.addCache(model, cache);
    }
    addCache(model, cache) {
        const swCacheTreeElement = new SWCacheTreeElement(this.resourcesPanel, model, cache);
        this.swCacheTreeElements.add(swCacheTreeElement);
        this.appendChild(swCacheTreeElement);
    }
    cacheRemoved(event) {
        const cache = /** @type {!SDK.ServiceWorkerCacheModel.Cache} */ (event.data.cache);
        const model = /** @type {!SDK.ServiceWorkerCacheModel.ServiceWorkerCacheModel} */ (event.data.model);
        const swCacheTreeElement = this.cacheTreeElement(model, cache);
        if (!swCacheTreeElement) {
            return;
        }
        this.removeChild(swCacheTreeElement);
        this.swCacheTreeElements.delete(swCacheTreeElement);
        this.setExpandable(this.childCount() > 0);
    }
    cacheTreeElement(model, cache) {
        for (const cacheTreeElement of this.swCacheTreeElements) {
            if (cacheTreeElement.hasModelAndCache(model, cache)) {
                return cacheTreeElement;
            }
        }
        return null;
    }
}
export class SWCacheTreeElement extends ApplicationPanelTreeElement {
    model;
    cache;
    view;
    constructor(resourcesPanel, model, cache) {
        super(resourcesPanel, cache.cacheName + ' - ' + cache.securityOrigin, false);
        this.model = model;
        this.cache = cache;
        /** @type {?} */
        this.view = null;
        const icon = UI.Icon.Icon.create('mediumicon-table', 'resource-tree-item');
        this.setLeadingIcons([icon]);
    }
    get itemURL() {
        // I don't think this will work at all.
        return 'cache://' + this.cache.cacheId;
    }
    onattach() {
        super.onattach();
        this.listItemElement.addEventListener('contextmenu', this.handleContextMenuEvent.bind(this), true);
    }
    handleContextMenuEvent(event) {
        const contextMenu = new UI.ContextMenu.ContextMenu(event);
        contextMenu.defaultSection().appendItem(i18nString(UIStrings.delete), this.clearCache.bind(this));
        contextMenu.show();
    }
    clearCache() {
        this.model.deleteCache(this.cache);
    }
    update(cache) {
        this.cache = cache;
        if (this.view) {
            this.view.update(cache);
        }
    }
    onselect(selectedByUser) {
        super.onselect(selectedByUser);
        if (!this.view) {
            this.view = new ServiceWorkerCacheView(this.model, this.cache);
        }
        this.showView(this.view);
        return false;
    }
    hasModelAndCache(model, cache) {
        return this.cache.equals(cache) && this.model === model;
    }
}
export class ApplicationCacheFrameTreeElement extends ApplicationPanelTreeElement {
    sidebar;
    frameId;
    manifestURL;
    constructor(sidebar, frame, manifestURL) {
        super(sidebar._panel, '', false);
        this.sidebar = sidebar;
        this.frameId = frame.id;
        this.manifestURL = manifestURL;
        this.refreshTitles(frame);
        const icon = UI.Icon.Icon.create('mediumicon-frame-top', 'navigator-folder-tree-item');
        this.setLeadingIcons([icon]);
    }
    get itemURL() {
        return 'appcache://' + this.manifestURL + '/' + encodeURI(this.titleAsText());
    }
    refreshTitles(frame) {
        this.title = frame.displayName();
    }
    frameNavigated(frame) {
        this.refreshTitles(frame);
    }
    onselect(selectedByUser) {
        super.onselect(selectedByUser);
        this.sidebar._showApplicationCache(this.frameId);
        return false;
    }
}
export class BackForwardCacheTreeElement extends ApplicationPanelTreeElement {
    view;
    constructor(resourcesPanel) {
        super(resourcesPanel, i18nString(UIStrings.backForwardCache), false);
        const icon = UI.Icon.Icon.create('mediumicon-database', 'resource-tree-item');
        this.setLeadingIcons([icon]);
    }
    get itemURL() {
        return 'bfcache://';
    }
    onselect(selectedByUser) {
        super.onselect(selectedByUser);
        if (!this.view) {
            this.view = new BackForwardCacheView();
        }
        this.showView(this.view);
        return false;
    }
}
//# sourceMappingURL=ApplicationPanelCacheSection.js.map