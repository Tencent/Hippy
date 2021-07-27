// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2007, 2008 Apple Inc.  All rights reserved.
 * Copyright (C) 2008, 2009 Anthony Ricaud <rik@webkit.org>
 * Copyright (C) 2011 Google Inc. All rights reserved.
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
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/naming-convention */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as Logs from '../../models/logs/logs.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import { Tabs as NetworkItemViewTabs } from './NetworkItemView.js';
const UIStrings = {
    /**
    *@description Text in Network Data Grid Node of the Network panel
    */
    redirect: 'Redirect',
    /**
    *@description Content of the request method column in the network log view. Some requests require an additional request to check permissions, and this additional request is called 'Preflight Request', see https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request. In the request method column we use, for example, 'POST + Preflight' to indicate that the request method was 'POST' and the request was accompanied by a preflight request. Since the column is short, the translation for Preflight in this context should ideally also be short.
    *@example {GET} PH1
    */
    sPreflight: '{PH1} + Preflight',
    /**
    *@description Name of a network initiator type
    */
    preflight: 'Preflight',
    /**
    *@description Title for a link element in the network log view
    */
    selectPreflightRequest: 'Select preflight request',
    /**
    *@description Text in Network Data Grid Node of the Network panel
    */
    failed: '(failed)',
    /**
    *@description Text in Network Data Grid Node of the Network panel
    */
    data: '(data)',
    /**
    * @description Text in Network Data Grid Node of the Network panel. Indicates a network request has
    * been canceled.
    */
    canceled: '(canceled)',
    /**
    *@description Reason in Network Data Grid Node of the Network panel
    */
    other: 'other',
    /**
    *@description Reason in Network Data Grid Node of the Network panel
    */
    csp: 'csp',
    /**
    *@description Reason in Network Data Grid Node of the Network panel
    */
    origin: 'origin',
    /**
    *@description Reason in Network Data Grid Node of the Network panel
    */
    devtools: 'devtools',
    /**
    *@description Text in Network Data Grid Node of the Network panel
    *@example {mixed-content} PH1
    */
    blockeds: '(blocked:{PH1})',
    /**
    *@description Text in Network Data Grid Node of the Network panel
    */
    blockedTooltip: 'This request was blocked due to misconfigured response headers, click to view the headers',
    /**
    *@description Text in Network Data Grid Node of the Network panel
    */
    corsError: 'CORS error',
    /**
    *@description Tooltip providing the cors error code
    *@example {PreflightDisallowedRedirect} PH1
    */
    crossoriginResourceSharingErrorS: 'Cross-Origin Resource Sharing error: {PH1}',
    /**
    *@description Text in Network Data Grid Node of the Network panel
    */
    finished: 'Finished',
    /**
    * @description Status text in the Network panel that indicates a network request is still loading
    * and has not finished yet (is pending).
    */
    pendingq: '(pending)',
    /**
    * @description Text in Network Data Grid Node of the Network panel. Noun, short for a 'HTTP server
    * push'.
    */
    push: 'Push / ',
    /**
    *@description Text in Network Data Grid Node of the Network panel
    */
    parser: 'Parser',
    /**
    *@description Label for a group of JavaScript files
    */
    script: 'Script',
    /**
    *@description Cell title in Network Data Grid Node of the Network panel
    */
    preload: 'Preload',
    /**
    *@description Text in Network Data Grid Node of the Network panel
    */
    signedexchange: 'signed-exchange',
    /**
    *@description Title for a link element in the network log view
    */
    selectTheRequestThatTriggered: 'Select the request that triggered this preflight',
    /**
    *@description Text for other types of items
    */
    otherC: 'Other',
    /**
    *@description Text of a DOM element in Network Data Grid Node of the Network panel
    */
    memoryCache: '(memory cache)',
    /**
    *@description Cell title in Network Data Grid Node of the Network panel. Indicates that the response came from memory cache.
    *@example {50 B} PH1
    */
    servedFromMemoryCacheResource: 'Served from memory cache, resource size: {PH1}',
    /**
    *@description Text of a DOM element in Network Data Grid Node of the Network panel
    */
    serviceworker: '(`ServiceWorker`)',
    /**
    *@description Cell title in Network Data Grid Node of the Network panel
    *@example {4 B} PH1
    */
    servedFromServiceworkerResource: 'Served from `ServiceWorker`, resource size: {PH1}',
    /**
    *@description Cell title in Network Data Grid Node of the Network panel
    *@example {4 B} PH1
    */
    servedFromSignedHttpExchange: 'Served from Signed HTTP Exchange, resource size: {PH1}',
    /**
    *@description Text of a DOM element in Network Data Grid Node of the Network panel
    */
    prefetchCache: '(prefetch cache)',
    /**
    *@description Cell title in Network Data Grid Node of the Network panel
    *@example {4 B} PH1
    */
    servedFromPrefetchCacheResource: 'Served from prefetch cache, resource size: {PH1}',
    /**
    *@description Text of a DOM element in Network Data Grid Node of the Network panel
    */
    diskCache: '(disk cache)',
    /**
    *@description Cell title in Network Data Grid Node of the Network panel
    *@example {10 B} PH1
    */
    servedFromDiskCacheResourceSizeS: 'Served from disk cache, resource size: {PH1}',
    /**
    *@description Text in Network Data Grid Node of the Network panel
    */
    pending: 'Pending',
    /**
    *@description Text describing the depth of a top level node in the network datagrid
    */
    level: 'level 1',
};
const str_ = i18n.i18n.registerUIStrings('panels/network/NetworkDataGridNode.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["RequestSelected"] = "RequestSelected";
    Events["RequestActivated"] = "RequestActivated";
})(Events || (Events = {}));
export class NetworkLogViewInterface {
    static HTTPRequestsFilter(request) {
        throw new Error('not implemented');
    }
    async onLoadFromFile(file) {
    }
    setRecording(recording) {
    }
    setWindow(start, end) {
    }
    resetFocus() {
    }
    columnExtensionResolved() {
    }
    hoveredNode() {
        throw new Error('not implemented');
    }
    scheduleRefresh() {
    }
    addFilmStripFrames(times) {
    }
    selectFilmStripFrame(time) {
    }
    clearFilmStripFrame() {
    }
    timeCalculator() {
        throw new Error('not implemented');
    }
    calculator() {
        throw new Error('not implemented');
    }
    setCalculator(x) {
    }
    flatNodesList() {
        throw new Error('not implemented');
    }
    updateNodeBackground() {
    }
    updateNodeSelectedClass(isSelected) {
    }
    stylesChanged() {
    }
    setTextFilterValue(filterString) {
    }
    rowHeight() {
        throw new Error('not implemented');
    }
    switchViewMode(gridMode) {
    }
    handleContextMenuForRequest(contextMenu, request) {
    }
    async exportAll() {
    }
    revealAndHighlightRequest(request) {
    }
    selectRequest(request) {
    }
    removeAllNodeHighlights() {
    }
    static getDCLEventColor() {
        throw new Error('not implemented');
    }
    static getLoadEventColor() {
        throw new Error('not implemented');
    }
    modelAdded(model) {
    }
    modelRemoved(model) {
    }
    linkifier() {
        throw new Error('not implemented');
    }
}
export class NetworkNode extends DataGrid.SortableDataGrid.SortableDataGridNode {
    _parentView;
    _isHovered;
    _showingInitiatorChain;
    _requestOrFirstKnownChildRequest;
    constructor(parentView) {
        super({});
        this._parentView = parentView;
        this._isHovered = false;
        this._showingInitiatorChain = false;
        this._requestOrFirstKnownChildRequest = null;
    }
    displayName() {
        return '';
    }
    displayType() {
        return '';
    }
    createCell(columnId) {
        const cell = this.createTD(columnId);
        this.renderCell(cell, columnId);
        return cell;
    }
    renderCell(cell, columnId) {
    }
    _isFailed() {
        return false;
    }
    backgroundColor() {
        const bgColors = _backgroundColors;
        const hasFocus = document.hasFocus();
        const isSelected = this.dataGrid && this.dataGrid.element === document.activeElement;
        const isFailed = this._isFailed();
        if (this.selected && hasFocus && isSelected && isFailed) {
            return bgColors.FocusSelectedHasError;
        }
        if (this.selected && hasFocus && isSelected) {
            return bgColors.FocusSelected;
        }
        if (this.selected) {
            return bgColors.Selected;
        }
        if (this.hovered()) {
            return bgColors.Hovered;
        }
        if (this.isOnInitiatorPath()) {
            return bgColors.InitiatorPath;
        }
        if (this.isOnInitiatedPath()) {
            return bgColors.InitiatedPath;
        }
        if (this.isStriped()) {
            return bgColors.Stripe;
        }
        return bgColors.Default;
    }
    updateBackgroundColor() {
        const element = this.existingElement();
        if (!element) {
            return;
        }
        element.style.backgroundColor = `var(${this.backgroundColor()})`;
        this._parentView.stylesChanged();
    }
    setStriped(isStriped) {
        super.setStriped(isStriped);
        this.updateBackgroundColor();
    }
    select(supressSelectedEvent) {
        super.select(supressSelectedEvent);
        this.updateBackgroundColor();
        this._parentView.updateNodeSelectedClass(/* isSelected */ true);
    }
    deselect(supressSelectedEvent) {
        super.deselect(supressSelectedEvent);
        this.updateBackgroundColor();
        this._parentView.updateNodeSelectedClass(/* isSelected */ false);
    }
    parentView() {
        return this._parentView;
    }
    hovered() {
        return this._isHovered;
    }
    showingInitiatorChain() {
        return this._showingInitiatorChain;
    }
    nodeSelfHeight() {
        return this._parentView.rowHeight();
    }
    setHovered(hovered, showInitiatorChain) {
        if (this._isHovered === hovered && this._showingInitiatorChain === showInitiatorChain) {
            return;
        }
        if (this._isHovered !== hovered) {
            this._isHovered = hovered;
            if (this.attached()) {
                this.element().classList.toggle('hover', hovered);
            }
        }
        if (this._showingInitiatorChain !== showInitiatorChain) {
            this._showingInitiatorChain = showInitiatorChain;
            this.showingInitiatorChainChanged();
        }
        this._parentView.stylesChanged();
        this.updateBackgroundColor();
    }
    showingInitiatorChainChanged() {
    }
    isOnInitiatorPath() {
        return false;
    }
    isOnInitiatedPath() {
        return false;
    }
    request() {
        return null;
    }
    isNavigationRequest() {
        return false;
    }
    clearFlatNodes() {
        super.clearFlatNodes();
        this._requestOrFirstKnownChildRequest = null;
    }
    requestOrFirstKnownChildRequest() {
        if (this._requestOrFirstKnownChildRequest) {
            return this._requestOrFirstKnownChildRequest;
        }
        let request = this.request();
        if (request || !this.hasChildren()) {
            this._requestOrFirstKnownChildRequest = request;
            return this._requestOrFirstKnownChildRequest;
        }
        let firstChildRequest = null;
        const flatChildren = this.flatChildren();
        for (let i = 0; i < flatChildren.length; i++) {
            request = flatChildren[i].request();
            if (!firstChildRequest || (request && request.issueTime() < firstChildRequest.issueTime())) {
                firstChildRequest = request;
            }
        }
        this._requestOrFirstKnownChildRequest = firstChildRequest;
        return this._requestOrFirstKnownChildRequest;
    }
}
export const _backgroundColors = {
    Default: '--network-grid-default-color',
    Stripe: '--network-grid-stripe-color',
    Navigation: '--network-grid-navigation-color',
    Hovered: '--network-grid-hovered-color',
    InitiatorPath: '--network-grid-initiator-path-color',
    InitiatedPath: '--network-grid-initiated-path-color',
    Selected: '--network-grid-selected-color',
    FocusSelected: '--network-grid-focus-selected-color',
    FocusSelectedHasError: '--network-grid-focus-selected-color-has-error',
    FromFrame: '--network-grid-from-frame-color',
};
export class NetworkRequestNode extends NetworkNode {
    _nameCell;
    _initiatorCell;
    _request;
    _isNavigationRequest;
    selectable;
    _isOnInitiatorPath;
    _isOnInitiatedPath;
    _linkifiedInitiatorAnchor;
    constructor(parentView, request) {
        super(parentView);
        this._nameCell = null;
        this._initiatorCell = null;
        this._request = request;
        this._isNavigationRequest = false;
        this.selectable = true;
        this._isOnInitiatorPath = false;
        this._isOnInitiatedPath = false;
    }
    static NameComparator(a, b) {
        const aName = a.displayName().toLowerCase();
        const bName = b.displayName().toLowerCase();
        if (aName === bName) {
            const aRequest = a.requestOrFirstKnownChildRequest();
            const bRequest = b.requestOrFirstKnownChildRequest();
            if (aRequest && bRequest) {
                return aRequest.identityCompare(bRequest);
            }
            return aRequest ? -1 : 1;
        }
        return aName < bName ? -1 : 1;
    }
    static RemoteAddressComparator(a, b) {
        // TODO(allada) Handle this properly for group nodes.
        const aRequest = a.requestOrFirstKnownChildRequest();
        const bRequest = b.requestOrFirstKnownChildRequest();
        if (!aRequest || !bRequest) {
            return !aRequest ? -1 : 1;
        }
        const aRemoteAddress = aRequest.remoteAddress();
        const bRemoteAddress = bRequest.remoteAddress();
        if (aRemoteAddress > bRemoteAddress) {
            return 1;
        }
        if (bRemoteAddress > aRemoteAddress) {
            return -1;
        }
        return aRequest.identityCompare(bRequest);
    }
    static SizeComparator(a, b) {
        // TODO(allada) Handle this properly for group nodes.
        const aRequest = a.requestOrFirstKnownChildRequest();
        const bRequest = b.requestOrFirstKnownChildRequest();
        if (!aRequest || !bRequest) {
            return !aRequest ? -1 : 1;
        }
        if (bRequest.cached() && !aRequest.cached()) {
            return 1;
        }
        if (aRequest.cached() && !bRequest.cached()) {
            return -1;
        }
        return (aRequest.transferSize - bRequest.transferSize) || (aRequest.resourceSize - bRequest.resourceSize) ||
            aRequest.identityCompare(bRequest);
    }
    static TypeComparator(a, b) {
        // TODO(allada) Handle this properly for group nodes.
        const aRequest = a.requestOrFirstKnownChildRequest();
        const bRequest = b.requestOrFirstKnownChildRequest();
        if (!aRequest || !bRequest) {
            return !aRequest ? -1 : 1;
        }
        const aSimpleType = a.displayType();
        const bSimpleType = b.displayType();
        if (aSimpleType > bSimpleType) {
            return 1;
        }
        if (bSimpleType > aSimpleType) {
            return -1;
        }
        return aRequest.identityCompare(bRequest);
    }
    static InitiatorComparator(a, b) {
        // TODO(allada) Handle this properly for group nodes.
        const aRequest = a.requestOrFirstKnownChildRequest();
        const bRequest = b.requestOrFirstKnownChildRequest();
        if (!aRequest || !bRequest) {
            return !aRequest ? -1 : 1;
        }
        const aHasInitiatorCell = a instanceof NetworkRequestNode && a._initiatorCell;
        const bHasInitiatorCell = b instanceof NetworkRequestNode && b._initiatorCell;
        if (!aHasInitiatorCell || !bHasInitiatorCell) {
            return !aHasInitiatorCell ? -1 : 1;
        }
        // `a` and `b` are guaranteed NetworkRequestNodes with present initiatorCell elements.
        const networkRequestNodeA = a;
        const networkRequestNodeB = b;
        const aText = networkRequestNodeA._linkifiedInitiatorAnchor ?
            networkRequestNodeA._linkifiedInitiatorAnchor.textContent || '' :
            networkRequestNodeA._initiatorCell.title;
        const bText = networkRequestNodeB._linkifiedInitiatorAnchor ?
            networkRequestNodeB._linkifiedInitiatorAnchor.textContent || '' :
            networkRequestNodeB._initiatorCell.title;
        return aText.localeCompare(bText);
    }
    static InitiatorAddressSpaceComparator(a, b) {
        const aRequest = a.requestOrFirstKnownChildRequest();
        const bRequest = b.requestOrFirstKnownChildRequest();
        if (!aRequest || !bRequest) {
            return !aRequest ? -1 : 1;
        }
        const aClientSecurityState = aRequest.clientSecurityState();
        const bClientSecurityState = bRequest.clientSecurityState();
        if (!aClientSecurityState || !bClientSecurityState) {
            return !aClientSecurityState ? -1 : 1;
        }
        return aClientSecurityState.initiatorIPAddressSpace.localeCompare(bClientSecurityState.initiatorIPAddressSpace);
    }
    static RemoteAddressSpaceComparator(a, b) {
        const aRequest = a.requestOrFirstKnownChildRequest();
        const bRequest = b.requestOrFirstKnownChildRequest();
        if (!aRequest || !bRequest) {
            return !aRequest ? -1 : 1;
        }
        return aRequest.remoteAddressSpace().localeCompare(bRequest.remoteAddressSpace());
    }
    static RequestCookiesCountComparator(a, b) {
        // TODO(allada) Handle this properly for group nodes.
        const aRequest = a.requestOrFirstKnownChildRequest();
        const bRequest = b.requestOrFirstKnownChildRequest();
        if (!aRequest || !bRequest) {
            return !aRequest ? -1 : 1;
        }
        const aScore = aRequest.includedRequestCookies().length;
        const bScore = bRequest.includedRequestCookies().length;
        return (aScore - bScore) || aRequest.identityCompare(bRequest);
    }
    // TODO(allada) This function deserves to be in a network-common of some sort.
    static ResponseCookiesCountComparator(a, b) {
        // TODO(allada) Handle this properly for group nodes.
        const aRequest = a.requestOrFirstKnownChildRequest();
        const bRequest = b.requestOrFirstKnownChildRequest();
        if (!aRequest || !bRequest) {
            return !aRequest ? -1 : 1;
        }
        const aScore = aRequest.responseCookies ? aRequest.responseCookies.length : 0;
        const bScore = bRequest.responseCookies ? bRequest.responseCookies.length : 0;
        return (aScore - bScore) || aRequest.identityCompare(bRequest);
    }
    static PriorityComparator(a, b) {
        // TODO(allada) Handle this properly for group nodes.
        const aRequest = a.requestOrFirstKnownChildRequest();
        const bRequest = b.requestOrFirstKnownChildRequest();
        if (!aRequest || !bRequest) {
            return !aRequest ? -1 : 1;
        }
        const aPriority = aRequest.priority();
        let aScore = aPriority ? PerfUI.NetworkPriorities.networkPriorityWeight(aPriority) : 0;
        aScore = aScore || 0;
        const bPriority = bRequest.priority();
        let bScore = bPriority ? PerfUI.NetworkPriorities.networkPriorityWeight(bPriority) : 0;
        bScore = bScore || 0;
        return aScore - bScore || aRequest.identityCompare(bRequest);
    }
    static RequestPropertyComparator(propertyName, a, b) {
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const aRequest = a.requestOrFirstKnownChildRequest();
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bRequest = b.requestOrFirstKnownChildRequest();
        if (!aRequest || !bRequest) {
            return !aRequest ? -1 : 1;
        }
        const aValue = aRequest[propertyName];
        const bValue = bRequest[propertyName];
        if (aValue === bValue) {
            return aRequest.identityCompare(bRequest);
        }
        return aValue > bValue ? 1 : -1;
    }
    static RequestURLComparator(a, b) {
        const aRequest = a.requestOrFirstKnownChildRequest();
        const bRequest = b.requestOrFirstKnownChildRequest();
        if (!aRequest || !bRequest) {
            return !aRequest ? -1 : 1;
        }
        const aURL = aRequest.url();
        const bURL = bRequest.url();
        if (aURL === bURL) {
            return aRequest.identityCompare(bRequest);
        }
        return aURL > bURL ? 1 : -1;
    }
    static ResponseHeaderStringComparator(propertyName, a, b) {
        // TODO(allada) Handle this properly for group nodes.
        const aRequest = a.requestOrFirstKnownChildRequest();
        const bRequest = b.requestOrFirstKnownChildRequest();
        if (!aRequest || !bRequest) {
            return !aRequest ? -1 : 1;
        }
        const aValue = String(aRequest.responseHeaderValue(propertyName) || '');
        const bValue = String(bRequest.responseHeaderValue(propertyName) || '');
        return aValue.localeCompare(bValue) || aRequest.identityCompare(bRequest);
    }
    static ResponseHeaderNumberComparator(propertyName, a, b) {
        // TODO(allada) Handle this properly for group nodes.
        const aRequest = a.requestOrFirstKnownChildRequest();
        const bRequest = b.requestOrFirstKnownChildRequest();
        if (!aRequest || !bRequest) {
            return !aRequest ? -1 : 1;
        }
        const aRawValue = aRequest.responseHeaderValue(propertyName);
        const aValue = (aRawValue !== undefined) ? parseFloat(aRawValue) : -Infinity;
        const bRawValue = bRequest.responseHeaderValue(propertyName);
        const bValue = (bRawValue !== undefined) ? parseFloat(bRawValue) : -Infinity;
        if (aValue === bValue) {
            return aRequest.identityCompare(bRequest);
        }
        return aValue > bValue ? 1 : -1;
    }
    static ResponseHeaderDateComparator(propertyName, a, b) {
        // TODO(allada) Handle this properly for group nodes.
        const aRequest = a.requestOrFirstKnownChildRequest();
        const bRequest = b.requestOrFirstKnownChildRequest();
        if (!aRequest || !bRequest) {
            return !aRequest ? -1 : 1;
        }
        const aHeader = aRequest.responseHeaderValue(propertyName);
        const bHeader = bRequest.responseHeaderValue(propertyName);
        const aValue = aHeader ? new Date(aHeader).getTime() : -Infinity;
        const bValue = bHeader ? new Date(bHeader).getTime() : -Infinity;
        if (aValue === bValue) {
            return aRequest.identityCompare(bRequest);
        }
        return aValue > bValue ? 1 : -1;
    }
    showingInitiatorChainChanged() {
        const showInitiatorChain = this.showingInitiatorChain();
        const initiatorGraph = Logs.NetworkLog.NetworkLog.instance().initiatorGraphForRequest(this._request);
        for (const request of initiatorGraph.initiators) {
            if (request === this._request) {
                continue;
            }
            const node = this.parentView().nodeForRequest(request);
            if (!node) {
                continue;
            }
            node._setIsOnInitiatorPath(showInitiatorChain);
        }
        for (const request of initiatorGraph.initiated.keys()) {
            if (request === this._request) {
                continue;
            }
            const node = this.parentView().nodeForRequest(request);
            if (!node) {
                continue;
            }
            node._setIsOnInitiatedPath(showInitiatorChain);
        }
    }
    _setIsOnInitiatorPath(isOnInitiatorPath) {
        if (this._isOnInitiatorPath === isOnInitiatorPath || !this.attached()) {
            return;
        }
        this._isOnInitiatorPath = isOnInitiatorPath;
        this.updateBackgroundColor();
    }
    isOnInitiatorPath() {
        return this._isOnInitiatorPath;
    }
    _setIsOnInitiatedPath(isOnInitiatedPath) {
        if (this._isOnInitiatedPath === isOnInitiatedPath || !this.attached()) {
            return;
        }
        this._isOnInitiatedPath = isOnInitiatedPath;
        this.updateBackgroundColor();
    }
    isOnInitiatedPath() {
        return this._isOnInitiatedPath;
    }
    displayType() {
        const mimeType = this._request.mimeType || this._request.requestContentType() || '';
        const resourceType = this._request.resourceType();
        let simpleType = resourceType.name();
        if (resourceType === Common.ResourceType.resourceTypes.Other ||
            resourceType === Common.ResourceType.resourceTypes.Image) {
            simpleType = mimeType.replace(/^(application|image)\//, '');
        }
        if (this._request.isRedirect()) {
            simpleType += ' / ' + i18nString(UIStrings.redirect);
        }
        return simpleType;
    }
    displayName() {
        return this._request.name();
    }
    request() {
        return this._request;
    }
    isNavigationRequest() {
        const pageLoad = SDK.PageLoad.PageLoad.forRequest(this._request);
        return pageLoad ? pageLoad.mainRequest === this._request : false;
    }
    nodeSelfHeight() {
        return this.parentView().rowHeight();
    }
    createCells(element) {
        this._nameCell = null;
        this._initiatorCell = null;
        element.classList.toggle('network-error-row', this._isFailed());
        element.classList.toggle('network-navigation-row', this._isNavigationRequest);
        super.createCells(element);
        this.updateBackgroundColor();
    }
    _setTextAndTitle(element, text, title) {
        UI.UIUtils.createTextChild(element, text);
        UI.Tooltip.Tooltip.install(element, title || text);
    }
    _setTextAndTitleAsLink(element, cellText, titleText, handler) {
        const link = document.createElement('span');
        link.classList.add('devtools-link');
        link.textContent = cellText;
        link.addEventListener('click', handler);
        element.appendChild(link);
        UI.Tooltip.Tooltip.install(element, titleText);
    }
    renderCell(c, columnId) {
        const cell = c;
        switch (columnId) {
            case 'name': {
                this._renderPrimaryCell(cell, columnId);
                break;
            }
            case 'path': {
                this._renderPrimaryCell(cell, columnId, this._request.pathname);
                break;
            }
            case 'url': {
                this._renderPrimaryCell(cell, columnId, this._request.url());
                break;
            }
            case 'method': {
                const preflightRequest = this._request.preflightRequest();
                if (preflightRequest) {
                    this._setTextAndTitle(cell, `${this._request.requestMethod} + `, i18nString(UIStrings.sPreflight, { PH1: this._request.requestMethod }));
                    cell.appendChild(Components.Linkifier.Linkifier.linkifyRevealable(preflightRequest, i18nString(UIStrings.preflight), undefined, i18nString(UIStrings.selectPreflightRequest)));
                }
                else {
                    this._setTextAndTitle(cell, this._request.requestMethod);
                }
                break;
            }
            case 'status': {
                this._renderStatusCell(cell);
                break;
            }
            case 'protocol': {
                this._setTextAndTitle(cell, this._request.protocol);
                break;
            }
            case 'scheme': {
                this._setTextAndTitle(cell, this._request.scheme);
                break;
            }
            case 'domain': {
                this._setTextAndTitle(cell, this._request.domain);
                break;
            }
            case 'remoteaddress': {
                this._setTextAndTitle(cell, this._request.remoteAddress());
                break;
            }
            case 'remoteaddress-space': {
                this._renderAddressSpaceCell(cell, this._request.remoteAddressSpace());
                break;
            }
            case 'cookies': {
                this._setTextAndTitle(cell, this._arrayLength(this._request.includedRequestCookies()));
                break;
            }
            case 'setcookies': {
                this._setTextAndTitle(cell, this._arrayLength(this._request.responseCookies));
                break;
            }
            case 'priority': {
                const priority = this._request.priority();
                this._setTextAndTitle(cell, priority ? PerfUI.NetworkPriorities.uiLabelForNetworkPriority(priority) : '');
                break;
            }
            case 'connectionid': {
                this._setTextAndTitle(cell, this._request.connectionId === '0' ? '' : this._request.connectionId);
                break;
            }
            case 'type': {
                this._setTextAndTitle(cell, this.displayType());
                break;
            }
            case 'initiator': {
                this._renderInitiatorCell(cell);
                break;
            }
            case 'initiator-address-space': {
                const clientSecurityState = this._request.clientSecurityState();
                this._renderAddressSpaceCell(cell, clientSecurityState ? clientSecurityState.initiatorIPAddressSpace :
                    "Unknown" /* Unknown */);
                break;
            }
            case 'size': {
                this._renderSizeCell(cell);
                break;
            }
            case 'time': {
                this._renderTimeCell(cell);
                break;
            }
            case 'timeline': {
                this._setTextAndTitle(cell, '');
                break;
            }
            default: {
                this._setTextAndTitle(cell, this._request.responseHeaderValue(columnId) || '');
                break;
            }
        }
    }
    _arrayLength(array) {
        return array ? String(array.length) : '';
    }
    select(supressSelectedEvent) {
        super.select(supressSelectedEvent);
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.parentView().dispatchEventToListeners(Events.RequestSelected, this._request);
    }
    highlightMatchedSubstring(regexp) {
        if (!regexp || !this._nameCell || this._nameCell.textContent === null) {
            return [];
        }
        // Ensure element is created.
        this.element();
        const domChanges = [];
        const matchInfo = this._nameCell.textContent.match(regexp);
        if (matchInfo) {
            UI.UIUtils.highlightSearchResult(this._nameCell, matchInfo.index || 0, matchInfo[0].length, domChanges);
        }
        return domChanges;
    }
    _openInNewTab() {
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.openInNewTab(this._request.url());
    }
    _isFailed() {
        const signedExchangeInfo = this._request.signedExchangeInfo();
        return (this._request.failed && !this._request.statusCode) || (this._request.statusCode >= 400) ||
            (signedExchangeInfo !== null && Boolean(signedExchangeInfo.errors));
    }
    _renderPrimaryCell(cell, columnId, text) {
        const columnIndex = this.dataGrid.indexOfVisibleColumn(columnId);
        const isFirstCell = (columnIndex === 0);
        if (isFirstCell) {
            const leftPadding = this.leftPadding ? this.leftPadding + 'px' : '';
            cell.style.setProperty('padding-left', leftPadding);
            this._nameCell = cell;
            cell.addEventListener('dblclick', this._openInNewTab.bind(this), false);
            cell.addEventListener('click', () => {
                // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                this.parentView().dispatchEventToListeners(Events.RequestActivated, { showPanel: true });
            });
            let iconElement;
            if (this._request.resourceType() === Common.ResourceType.resourceTypes.Image) {
                const previewImage = document.createElement('img');
                previewImage.classList.add('image-network-icon-preview');
                previewImage.alt = this._request.resourceType().title();
                this._request.populateImageSource(previewImage);
                iconElement = document.createElement('div');
                iconElement.classList.add('icon');
                iconElement.appendChild(previewImage);
            }
            else {
                iconElement = document.createElement('img');
                iconElement.classList.add('icon');
                iconElement.alt = this._request.resourceType().title();
            }
            iconElement.classList.add(this._request.resourceType().name());
            cell.appendChild(iconElement);
        }
        if (columnId === 'name') {
            const name = Platform.StringUtilities.trimMiddle(this._request.name(), 100);
            const networkManager = SDK.NetworkManager.NetworkManager.forRequest(this._request);
            UI.UIUtils.createTextChild(cell, networkManager ? networkManager.target().decorateLabel(name) : name);
            this._appendSubtitle(cell, this._request.path());
            UI.Tooltip.Tooltip.install(cell, this._request.url());
        }
        else if (text) {
            UI.UIUtils.createTextChild(cell, text);
            UI.Tooltip.Tooltip.install(cell, text);
        }
    }
    _renderStatusCell(cell) {
        cell.classList.toggle('network-dim-cell', !this._isFailed() && (this._request.cached() || !this._request.statusCode));
        const corsErrorStatus = this._request.corsErrorStatus();
        if (this._request.failed && !this._request.canceled && !this._request.wasBlocked() && !corsErrorStatus) {
            const failText = i18nString(UIStrings.failed);
            if (this._request.localizedFailDescription) {
                UI.UIUtils.createTextChild(cell, failText);
                this._appendSubtitle(cell, this._request.localizedFailDescription, true);
                UI.Tooltip.Tooltip.install(cell, failText + ' ' + this._request.localizedFailDescription);
            }
            else {
                this._setTextAndTitle(cell, failText);
            }
        }
        else if (this._request.statusCode) {
            UI.UIUtils.createTextChild(cell, String(this._request.statusCode));
            this._appendSubtitle(cell, this._request.statusText);
            UI.Tooltip.Tooltip.install(cell, this._request.statusCode + ' ' + this._request.statusText);
        }
        else if (this._request.parsedURL.isDataURL()) {
            this._setTextAndTitle(cell, i18nString(UIStrings.data));
        }
        else if (this._request.canceled) {
            this._setTextAndTitle(cell, i18nString(UIStrings.canceled));
        }
        else if (this._request.wasBlocked()) {
            let reason = i18nString(UIStrings.other);
            let displayShowHeadersLink = false;
            switch (this._request.blockedReason()) {
                case "other" /* Other */:
                    reason = i18nString(UIStrings.other);
                    break;
                case "csp" /* Csp */:
                    reason = i18nString(UIStrings.csp);
                    break;
                case "mixed-content" /* MixedContent */:
                    reason = i18n.i18n.lockedString('mixed-content');
                    break;
                case "origin" /* Origin */:
                    reason = i18nString(UIStrings.origin);
                    break;
                case "inspector" /* Inspector */:
                    reason = i18nString(UIStrings.devtools);
                    break;
                case "subresource-filter" /* SubresourceFilter */:
                    reason = i18n.i18n.lockedString('subresource-filter');
                    break;
                case "content-type" /* ContentType */:
                    reason = i18n.i18n.lockedString('content-type');
                    break;
                case "coep-frame-resource-needs-coep-header" /* CoepFrameResourceNeedsCoepHeader */:
                    displayShowHeadersLink = true;
                    reason = i18n.i18n.lockedString('CoepFrameResourceNeedsCoepHeader');
                    break;
                case "coop-sandboxed-iframe-cannot-navigate-to-coop-page" /* CoopSandboxedIframeCannotNavigateToCoopPage */:
                    displayShowHeadersLink = true;
                    reason = i18n.i18n.lockedString('CoopSandboxedIframeCannotNavigateToCoopPage');
                    break;
                case "corp-not-same-origin" /* CorpNotSameOrigin */:
                    displayShowHeadersLink = true;
                    reason = i18n.i18n.lockedString('NotSameOrigin');
                    break;
                case "corp-not-same-site" /* CorpNotSameSite */:
                    displayShowHeadersLink = true;
                    reason = i18n.i18n.lockedString('NotSameSite');
                    break;
                case "corp-not-same-origin-after-defaulted-to-same-origin-by-coep" /* CorpNotSameOriginAfterDefaultedToSameOriginByCoep */:
                    displayShowHeadersLink = true;
                    reason = i18n.i18n.lockedString('NotSameOriginAfterDefaultedToSameOriginByCoep');
                    break;
            }
            if (displayShowHeadersLink) {
                this._setTextAndTitleAsLink(cell, i18nString(UIStrings.blockeds, { PH1: reason }), i18nString(UIStrings.blockedTooltip), () => {
                    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    this.parentView().dispatchEventToListeners(Events.RequestActivated, {
                        showPanel: true,
                        tab: NetworkItemViewTabs.Headers,
                    });
                });
            }
            else {
                this._setTextAndTitle(cell, i18nString(UIStrings.blockeds, { PH1: reason }));
            }
        }
        else if (corsErrorStatus) {
            this._setTextAndTitle(cell, i18nString(UIStrings.corsError), i18nString(UIStrings.crossoriginResourceSharingErrorS, { PH1: corsErrorStatus.corsError }));
        }
        else if (this._request.finished) {
            this._setTextAndTitle(cell, i18nString(UIStrings.finished));
        }
        else {
            this._setTextAndTitle(cell, i18nString(UIStrings.pendingq));
        }
    }
    _renderInitiatorCell(cell) {
        this._initiatorCell = cell;
        const request = this._request;
        const initiator = Logs.NetworkLog.NetworkLog.instance().initiatorInfoForRequest(request);
        const timing = request.timing;
        if (timing && timing.pushStart) {
            cell.appendChild(document.createTextNode(i18nString(UIStrings.push)));
        }
        switch (initiator.type) {
            case SDK.NetworkRequest.InitiatorType.Parser: {
                UI.Tooltip.Tooltip.install(cell, initiator.url + ':' + (initiator.lineNumber + 1));
                const uiSourceCode = Workspace.Workspace.WorkspaceImpl.instance().uiSourceCodeForURL(initiator.url);
                cell.appendChild(Components.Linkifier.Linkifier.linkifyURL(initiator.url, {
                    text: uiSourceCode ? uiSourceCode.displayName() : undefined,
                    lineNumber: initiator.lineNumber,
                    columnNumber: initiator.columnNumber,
                }));
                this._appendSubtitle(cell, i18nString(UIStrings.parser));
                break;
            }
            case SDK.NetworkRequest.InitiatorType.Redirect: {
                UI.Tooltip.Tooltip.install(cell, initiator.url);
                const redirectSource = request.redirectSource();
                console.assert(redirectSource !== null);
                if (this.parentView().nodeForRequest(redirectSource)) {
                    cell.appendChild(Components.Linkifier.Linkifier.linkifyRevealable(redirectSource, Bindings.ResourceUtils.displayNameForURL(redirectSource.url())));
                }
                else {
                    cell.appendChild(Components.Linkifier.Linkifier.linkifyURL(redirectSource.url()));
                }
                this._appendSubtitle(cell, i18nString(UIStrings.redirect));
                break;
            }
            case SDK.NetworkRequest.InitiatorType.Script: {
                const networkManager = SDK.NetworkManager.NetworkManager.forRequest(request);
                if (!networkManager) {
                    return;
                }
                const linkifier = this.parentView().linkifier();
                if (initiator.stack) {
                    this._linkifiedInitiatorAnchor =
                        linkifier.linkifyStackTraceTopFrame(networkManager.target(), initiator.stack);
                }
                else {
                    this._linkifiedInitiatorAnchor = linkifier.linkifyScriptLocation(networkManager.target(), initiator.scriptId, initiator.url, initiator.lineNumber, { columnNumber: initiator.columnNumber, inlineFrameIndex: 0, className: undefined, tabStop: undefined });
                }
                UI.Tooltip.Tooltip.install((this._linkifiedInitiatorAnchor), '');
                cell.appendChild(this._linkifiedInitiatorAnchor);
                this._appendSubtitle(cell, i18nString(UIStrings.script));
                cell.classList.add('network-script-initiated');
                break;
            }
            case SDK.NetworkRequest.InitiatorType.Preload: {
                UI.Tooltip.Tooltip.install(cell, i18nString(UIStrings.preload));
                cell.classList.add('network-dim-cell');
                cell.appendChild(document.createTextNode(i18nString(UIStrings.preload)));
                break;
            }
            case SDK.NetworkRequest.InitiatorType.SignedExchange: {
                cell.appendChild(Components.Linkifier.Linkifier.linkifyURL(initiator.url));
                this._appendSubtitle(cell, i18nString(UIStrings.signedexchange));
                break;
            }
            case SDK.NetworkRequest.InitiatorType.Preflight: {
                cell.appendChild(document.createTextNode(i18nString(UIStrings.preflight)));
                if (initiator.initiatorRequest) {
                    const icon = UI.Icon.Icon.create('mediumicon-network-panel');
                    const link = Components.Linkifier.Linkifier.linkifyRevealable(initiator.initiatorRequest, icon, undefined, i18nString(UIStrings.selectTheRequestThatTriggered), 'trailing-link-icon');
                    UI.ARIAUtils.setAccessibleName(link, i18nString(UIStrings.selectTheRequestThatTriggered));
                    cell.appendChild(link);
                }
                break;
            }
            default: {
                UI.Tooltip.Tooltip.install(cell, i18nString(UIStrings.otherC));
                cell.classList.add('network-dim-cell');
                cell.appendChild(document.createTextNode(i18nString(UIStrings.otherC)));
            }
        }
    }
    _renderAddressSpaceCell(cell, ipAddressSpace) {
        if (ipAddressSpace !== "Unknown" /* Unknown */) {
            UI.UIUtils.createTextChild(cell, ipAddressSpace);
        }
    }
    _renderSizeCell(cell) {
        const resourceSize = Platform.NumberUtilities.bytesToString(this._request.resourceSize);
        if (this._request.cachedInMemory()) {
            UI.UIUtils.createTextChild(cell, i18nString(UIStrings.memoryCache));
            UI.Tooltip.Tooltip.install(cell, i18nString(UIStrings.servedFromMemoryCacheResource, { PH1: resourceSize }));
            cell.classList.add('network-dim-cell');
        }
        else if (this._request.fetchedViaServiceWorker) {
            UI.UIUtils.createTextChild(cell, i18nString(UIStrings.serviceworker));
            UI.Tooltip.Tooltip.install(cell, i18nString(UIStrings.servedFromServiceworkerResource, { PH1: resourceSize }));
            cell.classList.add('network-dim-cell');
        }
        else if (this._request.redirectSourceSignedExchangeInfoHasNoErrors()) {
            UI.UIUtils.createTextChild(cell, i18n.i18n.lockedString('(signed-exchange)'));
            UI.Tooltip.Tooltip.install(cell, i18nString(UIStrings.servedFromSignedHttpExchange, { PH1: resourceSize }));
            cell.classList.add('network-dim-cell');
        }
        else if (this._request.fromPrefetchCache()) {
            UI.UIUtils.createTextChild(cell, i18nString(UIStrings.prefetchCache));
            UI.Tooltip.Tooltip.install(cell, i18nString(UIStrings.servedFromPrefetchCacheResource, { PH1: resourceSize }));
            cell.classList.add('network-dim-cell');
        }
        else if (this._request.cached()) {
            UI.UIUtils.createTextChild(cell, i18nString(UIStrings.diskCache));
            UI.Tooltip.Tooltip.install(cell, i18nString(UIStrings.servedFromDiskCacheResourceSizeS, { PH1: resourceSize }));
            cell.classList.add('network-dim-cell');
        }
        else {
            const transferSize = Platform.NumberUtilities.bytesToString(this._request.transferSize);
            UI.UIUtils.createTextChild(cell, transferSize);
            UI.Tooltip.Tooltip.install(cell, `${transferSize} transferred over network, resource size: ${resourceSize}`);
        }
        this._appendSubtitle(cell, resourceSize);
    }
    _renderTimeCell(cell) {
        if (this._request.duration > 0) {
            this._setTextAndTitle(cell, i18n.i18n.secondsToString(this._request.duration));
            this._appendSubtitle(cell, i18n.i18n.secondsToString(this._request.latency));
        }
        else {
            cell.classList.add('network-dim-cell');
            this._setTextAndTitle(cell, i18nString(UIStrings.pending));
        }
    }
    _appendSubtitle(cellElement, subtitleText, showInlineWhenSelected = false) {
        const subtitleElement = document.createElement('div');
        subtitleElement.classList.add('network-cell-subtitle');
        if (showInlineWhenSelected) {
            subtitleElement.classList.add('network-cell-subtitle-show-inline-when-selected');
        }
        subtitleElement.textContent = subtitleText;
        cellElement.appendChild(subtitleElement);
    }
}
export class NetworkGroupNode extends NetworkNode {
    createCells(element) {
        super.createCells(element);
        const primaryColumn = this.dataGrid.visibleColumnsArray[0];
        const localizedTitle = `${primaryColumn.title}`;
        const localizedLevel = i18nString(UIStrings.level);
        this.nodeAccessibleText =
            `${localizedLevel} ${localizedTitle}: ${this.cellAccessibleTextMap.get(primaryColumn.id)}`;
    }
    renderCell(c, columnId) {
        const columnIndex = this.dataGrid.indexOfVisibleColumn(columnId);
        if (columnIndex === 0) {
            const cell = c;
            const leftPadding = this.leftPadding ? this.leftPadding + 'px' : '';
            cell.style.setProperty('padding-left', leftPadding);
            cell.classList.add('disclosure');
            this.setCellAccessibleName(cell.textContent || '', cell, columnId);
        }
    }
    select(supressSelectedEvent) {
        super.select(supressSelectedEvent);
        const firstChildNode = this.traverseNextNode(false, undefined, true);
        if (firstChildNode && firstChildNode.request()) {
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.parentView().dispatchEventToListeners(Events.RequestSelected, firstChildNode.request());
        }
    }
}
//# sourceMappingURL=NetworkDataGridNode.js.map