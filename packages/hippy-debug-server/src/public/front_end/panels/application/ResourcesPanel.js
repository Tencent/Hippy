// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js'; // eslint-disable-line no-unused-vars
import * as SDK from '../../core/sdk/sdk.js';
import * as SourceFrame from '../../ui/legacy/components/source_frame/source_frame.js';
import * as UI from '../../ui/legacy/legacy.js';
import { ApplicationPanelSidebar, StorageCategoryView } from './ApplicationPanelSidebar.js'; // eslint-disable-line no-unused-vars
import { CookieItemsView } from './CookieItemsView.js';
import { DatabaseQueryView } from './DatabaseQueryView.js';
import { DatabaseTableView } from './DatabaseTableView.js';
import { DOMStorageItemsView } from './DOMStorageItemsView.js';
import { StorageItemsView } from './StorageItemsView.js';
let resourcesPanelInstance;
export class ResourcesPanel extends UI.Panel.PanelWithSidebar {
    _resourcesLastSelectedItemSetting;
    visibleView;
    _pendingViewPromise;
    _categoryView;
    storageViews;
    _storageViewToolbar;
    _domStorageView;
    _cookieView;
    _emptyWidget;
    _sidebar;
    constructor() {
        super('resources');
        this.registerRequiredCSS('panels/application/resourcesPanel.css', { enableLegacyPatching: false });
        this._resourcesLastSelectedItemSetting =
            Common.Settings.Settings.instance().createSetting('resourcesLastSelectedElementPath', []);
        this.visibleView = null;
        this._pendingViewPromise = null;
        this._categoryView = null;
        const mainContainer = new UI.Widget.VBox();
        this.storageViews = mainContainer.element.createChild('div', 'vbox flex-auto');
        this._storageViewToolbar = new UI.Toolbar.Toolbar('resources-toolbar', mainContainer.element);
        this.splitWidget().setMainWidget(mainContainer);
        this._domStorageView = null;
        this._cookieView = null;
        this._emptyWidget = null;
        this._sidebar = new ApplicationPanelSidebar(this);
        this._sidebar.show(this.panelSidebarElement());
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!resourcesPanelInstance || forceNew) {
            resourcesPanelInstance = new ResourcesPanel();
        }
        return resourcesPanelInstance;
    }
    static _instance() {
        return ResourcesPanel.instance();
    }
    static _shouldCloseOnReset(view) {
        const viewClassesToClose = [
            SourceFrame.ResourceSourceFrame.ResourceSourceFrame,
            SourceFrame.ImageView.ImageView,
            SourceFrame.FontView.FontView,
            StorageItemsView,
            DatabaseQueryView,
            DatabaseTableView,
        ];
        return viewClassesToClose.some(type => view instanceof type);
    }
    static async showAndGetSidebar() {
        await UI.ViewManager.ViewManager.instance().showView('resources');
        return ResourcesPanel._instance()._sidebar;
    }
    focus() {
        this._sidebar.focus();
    }
    lastSelectedItemPath() {
        return this._resourcesLastSelectedItemSetting.get();
    }
    setLastSelectedItemPath(path) {
        this._resourcesLastSelectedItemSetting.set(path);
    }
    resetView() {
        if (this.visibleView && ResourcesPanel._shouldCloseOnReset(this.visibleView)) {
            this.showView(null);
        }
    }
    showView(view) {
        this._pendingViewPromise = null;
        if (this.visibleView === view) {
            return;
        }
        if (this.visibleView) {
            this.visibleView.detach();
        }
        if (view) {
            view.show(this.storageViews);
        }
        this.visibleView = view;
        this._storageViewToolbar.removeToolbarItems();
        this._storageViewToolbar.element.classList.toggle('hidden', true);
        if (view instanceof UI.View.SimpleView) {
            view.toolbarItems().then(items => {
                items.map(item => this._storageViewToolbar.appendToolbarItem(item));
                this._storageViewToolbar.element.classList.toggle('hidden', !items.length);
            });
        }
    }
    async scheduleShowView(viewPromise) {
        this._pendingViewPromise = viewPromise;
        const view = await viewPromise;
        if (this._pendingViewPromise !== viewPromise) {
            return null;
        }
        this.showView(view);
        return view;
    }
    showCategoryView(categoryName, categoryLink) {
        if (!this._categoryView) {
            this._categoryView = new StorageCategoryView();
        }
        this._categoryView.setText(categoryName);
        this._categoryView.setLink(categoryLink);
        this.showView(this._categoryView);
    }
    showDOMStorage(domStorage) {
        if (!domStorage) {
            return;
        }
        if (!this._domStorageView) {
            this._domStorageView = new DOMStorageItemsView(domStorage);
        }
        else {
            this._domStorageView.setStorage(domStorage);
        }
        this.showView(this._domStorageView);
    }
    showCookies(cookieFrameTarget, cookieDomain) {
        const model = cookieFrameTarget.model(SDK.CookieModel.CookieModel);
        if (!model) {
            return;
        }
        if (!this._cookieView) {
            this._cookieView = new CookieItemsView(model, cookieDomain);
        }
        else {
            this._cookieView.setCookiesDomain(model, cookieDomain);
        }
        this.showView(this._cookieView);
    }
    clearCookies(target, cookieDomain) {
        const model = target.model(SDK.CookieModel.CookieModel);
        if (!model) {
            return;
        }
        model.clear(cookieDomain).then(() => {
            if (this._cookieView) {
                this._cookieView.refreshItems();
            }
        });
    }
}
let resourceRevealerInstance;
export class ResourceRevealer {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!resourceRevealerInstance || forceNew) {
            resourceRevealerInstance = new ResourceRevealer();
        }
        return resourceRevealerInstance;
    }
    async reveal(resource) {
        if (!(resource instanceof SDK.Resource.Resource)) {
            throw new Error('Internal error: not a resource');
        }
        const sidebar = await ResourcesPanel.showAndGetSidebar();
        await sidebar.showResource(resource);
    }
}
let cookieReferenceRevealerInstance;
export class CookieReferenceRevealer {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!cookieReferenceRevealerInstance || forceNew) {
            cookieReferenceRevealerInstance = new CookieReferenceRevealer();
        }
        return cookieReferenceRevealerInstance;
    }
    async reveal(cookie) {
        if (!(cookie instanceof SDK.Cookie.CookieReference)) {
            throw new Error('Internal error: not a cookie reference');
        }
        const sidebar = await ResourcesPanel.showAndGetSidebar();
        await sidebar.cookieListTreeElement.select();
        const contextUrl = cookie.contextUrl();
        if (contextUrl && await this._revealByDomain(sidebar, contextUrl)) {
            return;
        }
        // Fallback: try to reveal the cookie using its domain as context, which may not work, because the
        // Application Panel shows cookies grouped by context, see crbug.com/1060563.
        this._revealByDomain(sidebar, cookie.domain());
    }
    async _revealByDomain(sidebar, domain) {
        const item = sidebar.cookieListTreeElement.children().find(c => /** @type {!CookieTreeElement} */ c.cookieDomain().endsWith(domain));
        if (item) {
            await item.revealAndSelect();
            return true;
        }
        return false;
    }
}
let frameDetailsRevealerInstance;
export class FrameDetailsRevealer {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!frameDetailsRevealerInstance || forceNew) {
            frameDetailsRevealerInstance = new FrameDetailsRevealer();
        }
        return frameDetailsRevealerInstance;
    }
    async reveal(frame) {
        if (!(frame instanceof SDK.ResourceTreeModel.ResourceTreeFrame)) {
            throw new Error('Internal error: not a frame');
        }
        const sidebar = await ResourcesPanel.showAndGetSidebar();
        sidebar.showFrame(frame);
    }
}
//# sourceMappingURL=ResourcesPanel.js.map