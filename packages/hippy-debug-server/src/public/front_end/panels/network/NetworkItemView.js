/*
 * Copyright (C) 2010 Google Inc. All rights reserved.
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
import * as UI from '../../ui/legacy/legacy.js';
import * as NetworkComponents from './components/components.js';
import { EventSourceMessagesView } from './EventSourceMessagesView.js';
import { RequestCookiesView } from './RequestCookiesView.js';
import { RequestHeadersView } from './RequestHeadersView.js';
import { RequestInitiatorView } from './RequestInitiatorView.js';
import { RequestPreviewView } from './RequestPreviewView.js';
import { RequestResponseView } from './RequestResponseView.js';
import { RequestTimingView } from './RequestTimingView.js';
import { ResourceWebSocketFrameView } from './ResourceWebSocketFrameView.js';
const UIStrings = {
    /**
    *@description Text for network request headers
    */
    headers: 'Headers',
    /**
    *@description Text in Network Item View of the Network panel
    */
    headersAndRequestBody: 'Headers and request body',
    /**
    *@description Text in Network Item View of the Network panel
    */
    messages: 'Messages',
    /**
    *@description Text in Network Item View of the Network panel
    */
    websocketMessages: 'WebSocket messages',
    /**
    *@description Text in Network Item View of the Network panel
    */
    eventstream: 'EventStream',
    /**
    *@description Text for previewing items
    */
    preview: 'Preview',
    /**
    *@description Text in Network Item View of the Network panel
    */
    responsePreview: 'Response preview',
    /**
    *@description Icon title in Network Item View of the Network panel
    */
    signedexchangeError: 'SignedExchange error',
    /**
    *@description Title of a tab in the Network panel. A Network response refers to the act of acknowledging a
    network request. Should not be confused with answer.
    */
    response: 'Response',
    /**
    *@description Text in Network Item View of the Network panel
    */
    rawResponseData: 'Raw response data',
    /**
    *@description Text for the initiator of something
    */
    initiator: 'Initiator',
    /**
    * @description Tooltip for initiator view in Network panel. An initiator is a piece of code/entity
    * in the code that initiated/started the network request, i.e. caused the network request. The 'call
    * stack' is the location in the code where the initiation happened.
    */
    requestInitiatorCallStack: 'Request initiator call stack',
    /**
    *@description Title of a tab in Network Item View of the Network panel.
    *The tab displays the duration breakdown of a network request.
    */
    timing: 'Timing',
    /**
    *@description Text in Network Item View of the Network panel
    */
    requestAndResponseTimeline: 'Request and response timeline',
    /**
    *@description Label of a tab in the network panel
    */
    trustTokens: 'Trust Tokens',
    /**
    *@description Title of the Trust token tab in the Network panel
    */
    trustTokenOperationDetails: 'Trust Token operation details',
    /**
    *@description Text for web cookies
    */
    cookies: 'Cookies',
    /**
    *@description Text in Network Item View of the Network panel
    */
    requestAndResponseCookies: 'Request and response cookies',
};
const str_ = i18n.i18n.registerUIStrings('panels/network/NetworkItemView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class NetworkItemView extends UI.TabbedPane.TabbedPane {
    _request;
    _resourceViewTabSetting;
    _headersView;
    _responseView;
    _cookiesView;
    _initialTab;
    constructor(request, calculator, initialTab) {
        super();
        this._request = request;
        this.element.classList.add('network-item-view');
        this._resourceViewTabSetting = Common.Settings.Settings.instance().createSetting('resourceViewTab', Tabs.Preview);
        this._headersView = new RequestHeadersView(request);
        this.appendTab(Tabs.Headers, i18nString(UIStrings.headers), this._headersView, i18nString(UIStrings.headersAndRequestBody));
        this.addEventListener(UI.TabbedPane.Events.TabSelected, this._tabSelected, this);
        if (request.resourceType() === Common.ResourceType.resourceTypes.WebSocket) {
            const frameView = new ResourceWebSocketFrameView(request);
            this.appendTab(Tabs.WsFrames, i18nString(UIStrings.messages), frameView, i18nString(UIStrings.websocketMessages));
        }
        else if (request.mimeType === SDK.NetworkRequest.MIME_TYPE.EVENTSTREAM) {
            this.appendTab(Tabs.EventSource, i18nString(UIStrings.eventstream), new EventSourceMessagesView(request));
        }
        else {
            this._responseView = new RequestResponseView(request);
            const previewView = new RequestPreviewView(request);
            this.appendTab(Tabs.Preview, i18nString(UIStrings.preview), previewView, i18nString(UIStrings.responsePreview));
            const signedExchangeInfo = request.signedExchangeInfo();
            if (signedExchangeInfo && signedExchangeInfo.errors && signedExchangeInfo.errors.length) {
                const icon = UI.Icon.Icon.create('smallicon-error');
                UI.Tooltip.Tooltip.install(icon, i18nString(UIStrings.signedexchangeError));
                this.setTabIcon(Tabs.Preview, icon);
            }
            this.appendTab(Tabs.Response, i18nString(UIStrings.response), this._responseView, i18nString(UIStrings.rawResponseData));
        }
        this.appendTab(Tabs.Initiator, i18nString(UIStrings.initiator), new RequestInitiatorView(request), i18nString(UIStrings.requestInitiatorCallStack));
        this.appendTab(Tabs.Timing, i18nString(UIStrings.timing), new RequestTimingView(request, calculator), i18nString(UIStrings.requestAndResponseTimeline));
        if (request.trustTokenParams()) {
            this.appendTab(Tabs.TrustTokens, i18nString(UIStrings.trustTokens), new NetworkComponents.RequestTrustTokensView.RequestTrustTokensView(request), i18nString(UIStrings.trustTokenOperationDetails));
        }
        this._cookiesView = null;
        this._initialTab = initialTab || this._resourceViewTabSetting.get();
        // Selecting tabs should not be handled by the super class.
        this.setAutoSelectFirstItemOnShow(false);
    }
    wasShown() {
        super.wasShown();
        this._request.addEventListener(SDK.NetworkRequest.Events.RequestHeadersChanged, this._maybeAppendCookiesPanel, this);
        this._request.addEventListener(SDK.NetworkRequest.Events.ResponseHeadersChanged, this._maybeAppendCookiesPanel, this);
        this._request.addEventListener(SDK.NetworkRequest.Events.TrustTokenResultAdded, this._maybeShowErrorIconInTrustTokenTabHeader, this);
        this._maybeAppendCookiesPanel();
        this._maybeShowErrorIconInTrustTokenTabHeader();
        // Only select the initial tab the first time the view is shown after construction.
        // When the view is re-shown (without re-constructing) users or revealers might have changed
        // the selected tab in the mean time. Show the previously selected tab in that
        // case instead, by simply doing nohting.
        if (this._initialTab) {
            this._selectTab(this._initialTab);
            this._initialTab = undefined;
        }
    }
    willHide() {
        this._request.removeEventListener(SDK.NetworkRequest.Events.RequestHeadersChanged, this._maybeAppendCookiesPanel, this);
        this._request.removeEventListener(SDK.NetworkRequest.Events.ResponseHeadersChanged, this._maybeAppendCookiesPanel, this);
        this._request.removeEventListener(SDK.NetworkRequest.Events.TrustTokenResultAdded, this._maybeShowErrorIconInTrustTokenTabHeader, this);
    }
    _maybeAppendCookiesPanel() {
        const cookiesPresent = this._request.hasRequestCookies() || this._request.responseCookies.length > 0;
        console.assert(cookiesPresent || !this._cookiesView, 'Cookies were introduced in headers and then removed!');
        if (cookiesPresent && !this._cookiesView) {
            this._cookiesView = new RequestCookiesView(this._request);
            this.appendTab(Tabs.Cookies, i18nString(UIStrings.cookies), this._cookiesView, i18nString(UIStrings.requestAndResponseCookies));
        }
    }
    _maybeShowErrorIconInTrustTokenTabHeader() {
        const trustTokenResult = this._request.trustTokenOperationDoneEvent();
        if (trustTokenResult &&
            !NetworkComponents.RequestTrustTokensView.statusConsideredSuccess(trustTokenResult.status)) {
            this.setTabIcon(Tabs.TrustTokens, UI.Icon.Icon.create('smallicon-error'));
        }
    }
    _selectTab(tabId) {
        if (!this.selectTab(tabId)) {
            this.selectTab('headers');
        }
    }
    _tabSelected(event) {
        if (!event.data.isUserGesture) {
            return;
        }
        this._resourceViewTabSetting.set(event.data.tabId);
    }
    request() {
        return this._request;
    }
    async revealResponseBody(line) {
        this._selectTab(Tabs.Response);
        if (this._responseView && typeof line === 'number') {
            await this._responseView.revealLine(line);
        }
    }
    revealHeader(section, header) {
        this._selectTab(Tabs.Headers);
        this._headersView.revealHeader(section, header);
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Tabs;
(function (Tabs) {
    Tabs["Cookies"] = "cookies";
    Tabs["EventSource"] = "eventSource";
    Tabs["Headers"] = "headers";
    Tabs["Initiator"] = "initiator";
    Tabs["Preview"] = "preview";
    Tabs["Response"] = "response";
    Tabs["Timing"] = "timing";
    Tabs["TrustTokens"] = "trustTokens";
    Tabs["WsFrames"] = "webSocketFrames";
})(Tabs || (Tabs = {}));
//# sourceMappingURL=NetworkItemView.js.map