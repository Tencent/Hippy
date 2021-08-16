// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2009 Apple Inc.  All rights reserved.
 * Copyright (C) 2009 Joseph Pecoraro
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as IssuesManager from '../../models/issues_manager/issues_manager.js';
import * as CookieTable from '../../ui/legacy/components/cookie_table/cookie_table.js';
import * as UI from '../../ui/legacy/legacy.js';
import { StorageItemsView } from './StorageItemsView.js';
const UIStrings = {
    /**
    *@description Label for checkbox to show url decoded cookie values
    */
    showUrlDecoded: 'Show URL decoded',
    /**
    *@description Text for web cookies
    */
    cookies: 'Cookies',
    /**
    *@description Text in Cookie Items View of the Application panel
    */
    selectACookieToPreviewItsValue: 'Select a cookie to preview its value',
    /**
    *@description Text for filter in Cookies View of the Application panel
    */
    onlyShowCookiesWithAnIssue: 'Only show cookies with an issue',
    /**
    *@description Title for filter in the Cookies View of the Application panel
    */
    onlyShowCookiesWhichHaveAn: 'Only show cookies which have an associated issue',
    /**
    *@description Label to only delete the cookies that are visible after filtering
    */
    clearFilteredCookies: 'Clear filtered cookies',
    /**
    *@description Label to delete all cookies
    */
    clearAllCookies: 'Clear all cookies',
    /**
    *@description Alert message for screen reader to announce # of cookies in the table
    *@example {5} PH1
    */
    numberOfCookiesShownInTableS: 'Number of cookies shown in table: {PH1}',
};
const str_ = i18n.i18n.registerUIStrings('panels/application/CookieItemsView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
class CookiePreviewWidget extends UI.Widget.VBox {
    _cookie;
    _showDecodedSetting;
    _toggle;
    _value;
    constructor() {
        super();
        this.setMinimumSize(230, 45);
        this._cookie = null;
        this._showDecodedSetting = Common.Settings.Settings.instance().createSetting('cookieViewShowDecoded', false);
        const header = document.createElement('div');
        header.classList.add('cookie-preview-widget-header');
        const span = document.createElement('span');
        span.classList.add('cookie-preview-widget-header-label');
        span.textContent = 'Cookie Value';
        header.appendChild(span);
        this.contentElement.appendChild(header);
        const toggle = UI.UIUtils.CheckboxLabel.create(i18nString(UIStrings.showUrlDecoded), this._showDecodedSetting.get());
        toggle.classList.add('cookie-preview-widget-toggle');
        toggle.checkboxElement.addEventListener('click', () => this.showDecoded(!this._showDecodedSetting.get()));
        header.appendChild(toggle);
        this._toggle = toggle;
        const value = document.createElement('div');
        value.classList.add('cookie-preview-widget-cookie-value');
        value.textContent = '';
        value.addEventListener('dblclick', this.handleDblClickOnCookieValue.bind(this));
        this._value = value;
        this.contentElement.classList.add('cookie-preview-widget');
        this.contentElement.appendChild(value);
    }
    showDecoded(decoded) {
        if (!this._cookie) {
            return;
        }
        this._showDecodedSetting.set(decoded);
        this._toggle.checkboxElement.checked = decoded;
        this._updatePreview();
    }
    _updatePreview() {
        if (this._cookie) {
            this._value.textContent =
                this._showDecodedSetting.get() ? decodeURIComponent(this._cookie.value()) : this._cookie.value();
        }
        else {
            this._value.textContent = '';
        }
    }
    setCookie(cookie) {
        this._cookie = cookie;
        this._updatePreview();
    }
    /**
     * Select all text even if there a spaces in it
     */
    handleDblClickOnCookieValue(event) {
        event.preventDefault();
        const range = document.createRange();
        range.selectNode(this._value);
        const selection = window.getSelection();
        if (!selection) {
            return;
        }
        selection.removeAllRanges();
        selection.addRange(range);
    }
}
export class CookieItemsView extends StorageItemsView {
    _model;
    _cookieDomain;
    _totalSize;
    _cookiesTable;
    _splitWidget;
    _previewPanel;
    _previewWidget;
    _emptyWidget;
    _onlyIssuesFilterUI;
    _refreshThrottler;
    _eventDescriptors;
    _allCookies;
    _shownCookies;
    _selectedCookie;
    constructor(model, cookieDomain) {
        super(i18nString(UIStrings.cookies), 'cookiesPanel');
        this.registerRequiredCSS('panels/application/cookieItemsView.css', { enableLegacyPatching: false });
        this.element.classList.add('storage-view');
        this._model = model;
        this._cookieDomain = cookieDomain;
        this._totalSize = 0;
        this._cookiesTable = new CookieTable.CookiesTable.CookiesTable(
        /* renderInline */ false, this._saveCookie.bind(this), this.refreshItems.bind(this), this._handleCookieSelected.bind(this), this._deleteCookie.bind(this));
        this._cookiesTable.setMinimumSize(0, 50);
        this._splitWidget = new UI.SplitWidget.SplitWidget(
        /* isVertical: */ false, /* secondIsSidebar: */ true, 'cookieItemsSplitViewState');
        this._splitWidget.show(this.element);
        this._previewPanel = new UI.Widget.VBox();
        const resizer = this._previewPanel.element.createChild('div', 'preview-panel-resizer');
        this._splitWidget.setMainWidget(this._cookiesTable);
        this._splitWidget.setSidebarWidget(this._previewPanel);
        this._splitWidget.installResizer(resizer);
        this._previewWidget = new CookiePreviewWidget();
        this._emptyWidget = new UI.EmptyWidget.EmptyWidget(i18nString(UIStrings.selectACookieToPreviewItsValue));
        this._emptyWidget.show(this._previewPanel.contentElement);
        this._onlyIssuesFilterUI = new UI.Toolbar.ToolbarCheckbox(i18nString(UIStrings.onlyShowCookiesWithAnIssue), i18nString(UIStrings.onlyShowCookiesWhichHaveAn), () => {
            this._updateWithCookies(this._allCookies);
        });
        this.appendToolbarItem(this._onlyIssuesFilterUI);
        this._refreshThrottler = new Common.Throttler.Throttler(300);
        this._eventDescriptors = [];
        this._allCookies = [];
        this._shownCookies = [];
        this._selectedCookie = null;
        this.setCookiesDomain(model, cookieDomain);
    }
    setCookiesDomain(model, domain) {
        this._model = model;
        this._cookieDomain = domain;
        this.refreshItems();
        Common.EventTarget.EventTarget.removeEventListeners(this._eventDescriptors);
        const networkManager = model.target().model(SDK.NetworkManager.NetworkManager);
        if (networkManager) {
            this._eventDescriptors = [
                networkManager.addEventListener(SDK.NetworkManager.Events.ResponseReceived, this._onResponseReceived, this),
                networkManager.addEventListener(SDK.NetworkManager.Events.LoadingFinished, this._onLoadingFinished, this),
            ];
        }
    }
    _showPreview(cookie) {
        if (cookie === this._selectedCookie) {
            return;
        }
        this._selectedCookie = cookie;
        if (!cookie) {
            this._previewWidget.detach();
            this._emptyWidget.show(this._previewPanel.contentElement);
        }
        else {
            this._emptyWidget.detach();
            this._previewWidget.setCookie(cookie);
            this._previewWidget.show(this._previewPanel.contentElement);
        }
    }
    _handleCookieSelected() {
        const cookie = this._cookiesTable.selectedCookie();
        this.setCanDeleteSelected(Boolean(cookie));
        this._showPreview(cookie);
    }
    async _saveCookie(newCookie, oldCookie) {
        if (oldCookie && newCookie.key() !== oldCookie.key()) {
            await this._model.deleteCookie(oldCookie);
        }
        return this._model.saveCookie(newCookie);
    }
    _deleteCookie(cookie, callback) {
        this._model.deleteCookie(cookie).then(callback);
    }
    _updateWithCookies(allCookies) {
        this._allCookies = allCookies;
        this._totalSize = allCookies.reduce((size, cookie) => size + cookie.size(), 0);
        const parsedURL = Common.ParsedURL.ParsedURL.fromString(this._cookieDomain);
        const host = parsedURL ? parsedURL.host : '';
        this._cookiesTable.setCookieDomain(host);
        this._shownCookies = this.filter(allCookies, cookie => `${cookie.name()} ${cookie.value()} ${cookie.domain()}`);
        if (this.hasFilter()) {
            this.setDeleteAllTitle(i18nString(UIStrings.clearFilteredCookies));
            this.setDeleteAllGlyph('largeicon-delete-filter');
        }
        else {
            this.setDeleteAllTitle(i18nString(UIStrings.clearAllCookies));
            this.setDeleteAllGlyph('largeicon-delete-list');
        }
        this._cookiesTable.setCookies(this._shownCookies, this._model.getCookieToBlockedReasonsMap());
        UI.ARIAUtils.alert(i18nString(UIStrings.numberOfCookiesShownInTableS, { PH1: this._shownCookies.length }));
        this.setCanFilter(true);
        this.setCanDeleteAll(this._shownCookies.length > 0);
        this.setCanDeleteSelected(Boolean(this._cookiesTable.selectedCookie()));
        if (!this._cookiesTable.selectedCookie()) {
            this._showPreview(null);
        }
    }
    filter(items, keyFunction) {
        const predicate = (object) => {
            if (!this._onlyIssuesFilterUI.checked()) {
                return true;
            }
            if (object instanceof SDK.Cookie.Cookie) {
                return IssuesManager.RelatedIssue.hasIssues(object);
            }
            return false;
        };
        return super.filter(items, keyFunction).filter(predicate);
    }
    /**
     * This will only delete the currently visible cookies.
     */
    deleteAllItems() {
        this._showPreview(null);
        this._model.deleteCookies(this._shownCookies).then(() => this.refreshItems());
    }
    deleteSelectedItem() {
        const selectedCookie = this._cookiesTable.selectedCookie();
        if (selectedCookie) {
            this._showPreview(null);
            this._model.deleteCookie(selectedCookie).then(() => this.refreshItems());
        }
    }
    refreshItems() {
        this._model.getCookiesForDomain(this._cookieDomain).then(this._updateWithCookies.bind(this));
    }
    refreshItemsThrottled() {
        this._refreshThrottler.schedule(() => Promise.resolve(this.refreshItems()));
    }
    _onResponseReceived() {
        this.refreshItemsThrottled();
    }
    _onLoadingFinished() {
        this.refreshItemsThrottled();
    }
}
//# sourceMappingURL=CookieItemsView.js.map