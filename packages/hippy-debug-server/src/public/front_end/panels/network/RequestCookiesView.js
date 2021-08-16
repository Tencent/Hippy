/*
 * Copyright (C) 2011 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as CookieTable from '../../ui/legacy/components/cookie_table/cookie_table.js'; // eslint-disable-line no-unused-vars
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
    *@description Text in Request Cookies View of the Network panel
    */
    thisRequestHasNoCookies: 'This request has no cookies.',
    /**
    * @description Title for a table which shows all of the cookies associated with a selected network
    * request, in the Network panel. Noun phrase.
    */
    requestCookies: 'Request Cookies',
    /**
    *@description Tooltip to explain what request cookies are
    */
    cookiesThatWereSentToTheServerIn: 'Cookies that were sent to the server in the \'cookie\' header of the request',
    /**
    *@description Label for showing request cookies that were not actually sent
    */
    showFilteredOutRequestCookies: 'show filtered out request cookies',
    /**
    *@description Text in Request Headers View of the Network Panel
    */
    noRequestCookiesWereSent: 'No request cookies were sent.',
    /**
    *@description Text in Request Cookies View of the Network panel
    */
    responseCookies: 'Response Cookies',
    /**
    *@description Tooltip to explain what response cookies are
    */
    cookiesThatWereReceivedFromThe: 'Cookies that were received from the server in the \'`set-cookie`\' header of the response',
    /**
    *@description Label for response cookies with invalid syntax
    */
    malformedResponseCookies: 'Malformed Response Cookies',
    /**
    * @description Tooltip to explain what malformed response cookies are. Malformed cookies are
    * cookies that did not match the expected format and could not be interpreted, and are invalid.
    */
    cookiesThatWereReceivedFromTheServer: 'Cookies that were received from the server in the \'`set-cookie`\' header of the response but were malformed',
};
const str_ = i18n.i18n.registerUIStrings('panels/network/RequestCookiesView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class RequestCookiesView extends UI.Widget.Widget {
    _request;
    _showFilteredOutCookiesSetting;
    _emptyWidget;
    _requestCookiesTitle;
    _requestCookiesEmpty;
    _requestCookiesTable;
    _responseCookiesTitle;
    _responseCookiesTable;
    _malformedResponseCookiesTitle;
    _malformedResponseCookiesList;
    constructor(request) {
        super();
        this.registerRequiredCSS('panels/network/requestCookiesView.css', { enableLegacyPatching: false });
        this.element.classList.add('request-cookies-view');
        this._request = request;
        this._showFilteredOutCookiesSetting = Common.Settings.Settings.instance().createSetting('show-filtered-out-request-cookies', /* defaultValue */ false);
        this._emptyWidget = new UI.EmptyWidget.EmptyWidget(i18nString(UIStrings.thisRequestHasNoCookies));
        this._emptyWidget.show(this.element);
        this._requestCookiesTitle = this.element.createChild('div');
        const titleText = this._requestCookiesTitle.createChild('span', 'request-cookies-title');
        titleText.textContent = i18nString(UIStrings.requestCookies);
        UI.Tooltip.Tooltip.install(titleText, i18nString(UIStrings.cookiesThatWereSentToTheServerIn));
        const requestCookiesCheckbox = UI.SettingsUI.createSettingCheckbox(i18nString(UIStrings.showFilteredOutRequestCookies), this._showFilteredOutCookiesSetting, true);
        requestCookiesCheckbox.checkboxElement.addEventListener('change', () => {
            this._refreshRequestCookiesView();
        });
        this._requestCookiesTitle.appendChild(requestCookiesCheckbox);
        this._requestCookiesEmpty = this.element.createChild('div', 'cookies-panel-item');
        this._requestCookiesEmpty.textContent = i18nString(UIStrings.noRequestCookiesWereSent);
        this._requestCookiesTable = new CookieTable.CookiesTable.CookiesTable(/* renderInline */ true);
        this._requestCookiesTable.contentElement.classList.add('cookie-table', 'cookies-panel-item');
        this._requestCookiesTable.show(this.element);
        this._responseCookiesTitle = this.element.createChild('div', 'request-cookies-title');
        this._responseCookiesTitle.textContent = i18nString(UIStrings.responseCookies);
        this._responseCookiesTitle.title = i18nString(UIStrings.cookiesThatWereReceivedFromThe);
        this._responseCookiesTable = new CookieTable.CookiesTable.CookiesTable(/* renderInline */ true);
        this._responseCookiesTable.contentElement.classList.add('cookie-table', 'cookies-panel-item');
        this._responseCookiesTable.show(this.element);
        this._malformedResponseCookiesTitle = this.element.createChild('div', 'request-cookies-title');
        this._malformedResponseCookiesTitle.textContent = i18nString(UIStrings.malformedResponseCookies);
        UI.Tooltip.Tooltip.install(this._malformedResponseCookiesTitle, i18nString(UIStrings.cookiesThatWereReceivedFromTheServer));
        this._malformedResponseCookiesList = this.element.createChild('div');
    }
    _getRequestCookies() {
        const requestCookieToBlockedReasons = new Map();
        const requestCookies = this._request.includedRequestCookies().slice();
        if (this._showFilteredOutCookiesSetting.get()) {
            for (const blockedCookie of this._request.blockedRequestCookies()) {
                requestCookieToBlockedReasons.set(blockedCookie.cookie, blockedCookie.blockedReasons.map(blockedReason => {
                    return {
                        attribute: SDK.NetworkRequest.cookieBlockedReasonToAttribute(blockedReason),
                        uiString: SDK.NetworkRequest.cookieBlockedReasonToUiString(blockedReason),
                    };
                }));
                requestCookies.push(blockedCookie.cookie);
            }
        }
        return { requestCookies, requestCookieToBlockedReasons };
    }
    _getResponseCookies() {
        let responseCookies = [];
        const responseCookieToBlockedReasons = new Map();
        const malformedResponseCookies = [];
        if (this._request.responseCookies.length) {
            const blockedCookieLines = this._request.blockedResponseCookies().map(blockedCookie => blockedCookie.cookieLine);
            responseCookies = this._request.responseCookies.filter(cookie => {
                // remove the regular cookies that would overlap with blocked cookies
                const index = blockedCookieLines.indexOf(cookie.getCookieLine());
                if (index !== -1) {
                    blockedCookieLines[index] = null;
                    return false;
                }
                return true;
            });
            for (const blockedCookie of this._request.blockedResponseCookies()) {
                const parsedCookies = SDK.CookieParser.CookieParser.parseSetCookie(blockedCookie.cookieLine);
                if (parsedCookies && !parsedCookies.length ||
                    blockedCookie.blockedReasons.includes("SyntaxError" /* SyntaxError */)) {
                    malformedResponseCookies.push(blockedCookie);
                    continue;
                }
                let cookie = blockedCookie.cookie;
                if (!cookie && parsedCookies) {
                    cookie = parsedCookies[0];
                }
                if (cookie) {
                    responseCookieToBlockedReasons.set(cookie, blockedCookie.blockedReasons.map(blockedReason => {
                        return {
                            attribute: SDK.NetworkRequest.setCookieBlockedReasonToAttribute(blockedReason),
                            uiString: SDK.NetworkRequest.setCookieBlockedReasonToUiString(blockedReason),
                        };
                    }));
                    responseCookies.push(cookie);
                }
            }
        }
        return { responseCookies, responseCookieToBlockedReasons, malformedResponseCookies };
    }
    _refreshRequestCookiesView() {
        if (!this.isShowing()) {
            return;
        }
        const gotCookies = this._request.hasRequestCookies() || this._request.responseCookies.length;
        if (gotCookies) {
            this._emptyWidget.hideWidget();
        }
        else {
            this._emptyWidget.showWidget();
        }
        const { requestCookies, requestCookieToBlockedReasons } = this._getRequestCookies();
        const { responseCookies, responseCookieToBlockedReasons, malformedResponseCookies } = this._getResponseCookies();
        if (requestCookies.length) {
            this._requestCookiesTitle.classList.remove('hidden');
            this._requestCookiesEmpty.classList.add('hidden');
            this._requestCookiesTable.showWidget();
            this._requestCookiesTable.setCookies(requestCookies, requestCookieToBlockedReasons);
        }
        else if (this._request.blockedRequestCookies().length) {
            this._requestCookiesTitle.classList.remove('hidden');
            this._requestCookiesEmpty.classList.remove('hidden');
            this._requestCookiesTable.hideWidget();
        }
        else {
            this._requestCookiesTitle.classList.add('hidden');
            this._requestCookiesEmpty.classList.add('hidden');
            this._requestCookiesTable.hideWidget();
        }
        if (responseCookies.length) {
            this._responseCookiesTitle.classList.remove('hidden');
            this._responseCookiesTable.showWidget();
            this._responseCookiesTable.setCookies(responseCookies, responseCookieToBlockedReasons);
        }
        else {
            this._responseCookiesTitle.classList.add('hidden');
            this._responseCookiesTable.hideWidget();
        }
        if (malformedResponseCookies.length) {
            this._malformedResponseCookiesTitle.classList.remove('hidden');
            this._malformedResponseCookiesList.classList.remove('hidden');
            this._malformedResponseCookiesList.removeChildren();
            for (const malformedCookie of malformedResponseCookies) {
                const listItem = this._malformedResponseCookiesList.createChild('span', 'cookie-line source-code');
                const icon = UI.Icon.Icon.create('smallicon-error', 'cookie-warning-icon');
                listItem.appendChild(icon);
                UI.UIUtils.createTextChild(listItem, malformedCookie.cookieLine);
                listItem.title =
                    SDK.NetworkRequest.setCookieBlockedReasonToUiString("SyntaxError" /* SyntaxError */);
            }
        }
        else {
            this._malformedResponseCookiesTitle.classList.add('hidden');
            this._malformedResponseCookiesList.classList.add('hidden');
        }
    }
    wasShown() {
        this._request.addEventListener(SDK.NetworkRequest.Events.RequestHeadersChanged, this._refreshRequestCookiesView, this);
        this._request.addEventListener(SDK.NetworkRequest.Events.ResponseHeadersChanged, this._refreshRequestCookiesView, this);
        this._refreshRequestCookiesView();
    }
    willHide() {
        this._request.removeEventListener(SDK.NetworkRequest.Events.RequestHeadersChanged, this._refreshRequestCookiesView, this);
        this._request.removeEventListener(SDK.NetworkRequest.Events.ResponseHeadersChanged, this._refreshRequestCookiesView, this);
    }
}
//# sourceMappingURL=RequestCookiesView.js.map