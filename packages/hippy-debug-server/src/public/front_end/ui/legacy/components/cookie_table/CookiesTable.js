// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2009 Apple Inc.  All rights reserved.
 * Copyright (C) 2009 Joseph Pecoraro
 * Copyright (C) 2010 Google Inc. All rights reserved.
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
import * as Common from '../../../../core/common/common.js';
import * as i18n from '../../../../core/i18n/i18n.js';
import * as Platform from '../../../../core/platform/platform.js';
import * as Root from '../../../../core/root/root.js';
import * as SDK from '../../../../core/sdk/sdk.js';
import * as IssuesManager from '../../../../models/issues_manager/issues_manager.js';
import * as UI from '../../legacy.js';
import * as DataGrid from '../data_grid/data_grid.js';
const UIStrings = {
    /**
    *@description Cookie table cookies table expires session value in Cookies Table of the Cookies table in the Application panel
    */
    session: 'Session',
    /**
    *@description Text for the name of something
    */
    name: 'Name',
    /**
    *@description Text for the value of something
    */
    value: 'Value',
    /**
    *@description Text for the size of something
    */
    size: 'Size',
    /**
    *@description Data grid name for Editable Cookies data grid
    */
    editableCookies: 'Editable Cookies',
    /**
    *@description Text for web cookies
    */
    cookies: 'Cookies',
    /**
    *@description Text for something not available
    */
    na: 'N/A',
    /**
    *@description Text for Context Menu entry
    */
    showRequestsWithThisCookie: 'Show Requests With This Cookie',
    /**
    *@description Text for Context Menu entry
    */
    showIssueAssociatedWithThis: 'Show issue associated with this cookie',
    /**
    *@description Tooltip for the cell that shows the sourcePort property of a cookie in the cookie table. The source port is numberic attribute of a cookie.
    */
    sourcePortTooltip: 'Shows the source port (range 1-65535) the cookie was set on. If the port is unknown, this shows -1.',
    /**
    *@description Tooltip for the cell that shows the sourceScheme property of a cookie in the cookie table. The source scheme is a trinary attribute of a cookie.
    */
    sourceSchemeTooltip: 'Shows the source scheme (`Secure`, `NonSecure`) the cookie was set on. If the scheme is unknown, this shows `Unset`.',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/components/cookie_table/CookiesTable.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
const expiresSessionValue = i18nLazyString(UIStrings.session);
export class CookiesTable extends UI.Widget.VBox {
    _saveCallback;
    _refreshCallback;
    _deleteCallback;
    _dataGrid;
    _lastEditedColumnId;
    _data;
    _cookieDomain;
    _cookieToBlockedReasons;
    constructor(renderInline, saveCallback, refreshCallback, selectedCallback, deleteCallback) {
        super();
        this.registerRequiredCSS('ui/legacy/components/cookie_table/cookiesTable.css', { enableLegacyPatching: false });
        this.element.classList.add('cookies-table');
        this._saveCallback = saveCallback;
        this._refreshCallback = refreshCallback;
        this._deleteCallback = deleteCallback;
        const editable = Boolean(saveCallback);
        const columns = [
            {
                id: SDK.Cookie.Attributes.Name,
                title: i18nString(UIStrings.name),
                sortable: true,
                disclosure: editable,
                sort: DataGrid.DataGrid.Order.Ascending,
                longText: true,
                weight: 24,
                editable: editable,
            },
            {
                id: SDK.Cookie.Attributes.Value,
                title: i18nString(UIStrings.value),
                sortable: true,
                longText: true,
                weight: 34,
                editable: editable,
            },
            {
                id: SDK.Cookie.Attributes.Domain,
                title: 'Domain',
                sortable: true,
                weight: 7,
                editable: editable,
            },
            {
                id: SDK.Cookie.Attributes.Path,
                title: 'Path',
                sortable: true,
                weight: 7,
                editable: editable,
            },
            {
                id: SDK.Cookie.Attributes.Expires,
                title: 'Expires / Max-Age',
                sortable: true,
                weight: 7,
                editable: editable,
            },
            {
                id: SDK.Cookie.Attributes.Size,
                title: i18nString(UIStrings.size),
                sortable: true,
                align: DataGrid.DataGrid.Align.Right,
                weight: 7,
            },
            {
                id: SDK.Cookie.Attributes.HttpOnly,
                title: 'HttpOnly',
                sortable: true,
                align: DataGrid.DataGrid.Align.Center,
                weight: 7,
                dataType: DataGrid.DataGrid.DataType.Boolean,
                editable,
            },
            {
                id: SDK.Cookie.Attributes.Secure,
                title: 'Secure',
                sortable: true,
                align: DataGrid.DataGrid.Align.Center,
                weight: 7,
                dataType: DataGrid.DataGrid.DataType.Boolean,
                editable,
            },
            {
                id: SDK.Cookie.Attributes.SameSite,
                title: 'SameSite',
                sortable: true,
                weight: 7,
                editable: editable,
            },
            {
                id: SDK.Cookie.Attributes.SameParty,
                title: 'SameParty',
                sortable: true,
                align: DataGrid.DataGrid.Align.Center,
                weight: 7,
                dataType: DataGrid.DataGrid.DataType.Boolean,
                editable: editable,
            },
            {
                id: SDK.Cookie.Attributes.Priority,
                title: 'Priority',
                sortable: true,
                sort: DataGrid.DataGrid.Order.Descending,
                weight: 7,
                editable: editable,
            },
        ];
        if (Root.Runtime.experiments.isEnabled('experimentalCookieFeatures')) {
            const additionalColumns = [
                {
                    id: SDK.Cookie.Attributes.SourceScheme,
                    title: 'SourceScheme',
                    sortable: true,
                    align: DataGrid.DataGrid.Align.Center,
                    weight: 7,
                    editable: editable,
                },
                {
                    id: SDK.Cookie.Attributes.SourcePort,
                    title: 'SourcePort',
                    sortable: true,
                    align: DataGrid.DataGrid.Align.Center,
                    weight: 7,
                    editable: editable,
                },
            ];
            columns.push(...additionalColumns);
        }
        if (editable) {
            this._dataGrid = new DataGrid.DataGrid.DataGridImpl({
                displayName: i18nString(UIStrings.editableCookies),
                columns,
                editCallback: this._onUpdateCookie.bind(this),
                deleteCallback: this._onDeleteCookie.bind(this),
                refreshCallback,
            });
        }
        else {
            this._dataGrid = new DataGrid.DataGrid.DataGridImpl({
                displayName: i18nString(UIStrings.cookies),
                columns,
                editCallback: undefined,
                deleteCallback: undefined,
                refreshCallback: undefined,
            });
        }
        this._dataGrid.setStriped(true);
        this._dataGrid.setName('cookiesTable');
        this._dataGrid.addEventListener(DataGrid.DataGrid.Events.SortingChanged, this._rebuildTable, this);
        this._dataGrid.setRowContextMenuCallback(this._populateContextMenu.bind(this));
        if (renderInline) {
            this._dataGrid.renderInline();
        }
        if (selectedCallback) {
            this._dataGrid.addEventListener(DataGrid.DataGrid.Events.SelectedNode, selectedCallback, this);
        }
        this._lastEditedColumnId = null;
        this._dataGrid.asWidget().show(this.element);
        this._data = [];
        this._cookieDomain = '';
        this._cookieToBlockedReasons = null;
    }
    setCookies(cookies, cookieToBlockedReasons) {
        this.setCookieFolders([{ cookies: cookies, folderName: null }], cookieToBlockedReasons);
    }
    setCookieFolders(cookieFolders, cookieToBlockedReasons) {
        this._data = cookieFolders;
        this._cookieToBlockedReasons = cookieToBlockedReasons || null;
        this._rebuildTable();
    }
    setCookieDomain(cookieDomain) {
        this._cookieDomain = cookieDomain;
    }
    selectedCookie() {
        const node = this._dataGrid.selectedNode;
        return node ? node.cookie : null;
    }
    _getSelectionCookies() {
        const node = this._dataGrid.selectedNode;
        const nextNeighbor = node && node.traverseNextNode(true);
        const previousNeighbor = node && node.traversePreviousNode(true);
        return {
            current: node && node.cookie,
            neighbor: (nextNeighbor && nextNeighbor.cookie) || (previousNeighbor && previousNeighbor.cookie),
        };
    }
    willHide() {
        this._lastEditedColumnId = null;
    }
    _findSelectedCookie(selectionCookies, cookies) {
        if (!cookies) {
            return null;
        }
        const current = selectionCookies.current;
        const foundCurrent = cookies.find(cookie => this._isSameCookie(cookie, current));
        if (foundCurrent) {
            return foundCurrent;
        }
        const neighbor = selectionCookies.neighbor;
        const foundNeighbor = cookies.find(cookie => this._isSameCookie(cookie, neighbor));
        if (foundNeighbor) {
            return foundNeighbor;
        }
        return null;
    }
    _isSameCookie(cookieA, cookieB) {
        return cookieB !== null && cookieB !== undefined && cookieB.name() === cookieA.name() &&
            cookieB.domain() === cookieA.domain() && cookieB.path() === cookieA.path();
    }
    _rebuildTable() {
        const selectionCookies = this._getSelectionCookies();
        const lastEditedColumnId = this._lastEditedColumnId;
        this._lastEditedColumnId = null;
        this._dataGrid.rootNode().removeChildren();
        for (let i = 0; i < this._data.length; ++i) {
            const item = this._data[i];
            const selectedCookie = this._findSelectedCookie(selectionCookies, item.cookies);
            if (item.folderName) {
                const groupData = {};
                groupData[SDK.Cookie.Attributes.Name] = item.folderName;
                groupData[SDK.Cookie.Attributes.Value] = '';
                groupData[SDK.Cookie.Attributes.Size] = this._totalSize(item.cookies);
                groupData[SDK.Cookie.Attributes.Domain] = '';
                groupData[SDK.Cookie.Attributes.Path] = '';
                groupData[SDK.Cookie.Attributes.Expires] = '';
                groupData[SDK.Cookie.Attributes.HttpOnly] = '';
                groupData[SDK.Cookie.Attributes.Secure] = '';
                groupData[SDK.Cookie.Attributes.SameSite] = '';
                groupData[SDK.Cookie.Attributes.SameParty] = '';
                groupData[SDK.Cookie.Attributes.SourcePort] = '';
                groupData[SDK.Cookie.Attributes.SourceScheme] = '';
                groupData[SDK.Cookie.Attributes.Priority] = '';
                const groupNode = new DataGrid.DataGrid.DataGridNode(groupData);
                groupNode.selectable = true;
                this._dataGrid.rootNode().appendChild(groupNode);
                groupNode.element().classList.add('row-group');
                this._populateNode(groupNode, item.cookies, selectedCookie, lastEditedColumnId);
                groupNode.expand();
            }
            else {
                this._populateNode(this._dataGrid.rootNode(), item.cookies, selectedCookie, lastEditedColumnId);
            }
        }
        if (selectionCookies.current && lastEditedColumnId && !this._dataGrid.selectedNode) {
            this._addInactiveNode(this._dataGrid.rootNode(), selectionCookies.current, lastEditedColumnId);
        }
        if (this._saveCallback) {
            this._dataGrid.addCreationNode(false);
        }
    }
    _populateNode(parentNode, cookies, selectedCookie, lastEditedColumnId) {
        parentNode.removeChildren();
        if (!cookies) {
            return;
        }
        this._sortCookies(cookies);
        for (let i = 0; i < cookies.length; ++i) {
            const cookie = cookies[i];
            const cookieNode = this._createGridNode(cookie);
            parentNode.appendChild(cookieNode);
            if (this._isSameCookie(cookie, selectedCookie)) {
                cookieNode.select();
                if (lastEditedColumnId !== null) {
                    this._dataGrid.startEditingNextEditableColumnOfDataGridNode(cookieNode, lastEditedColumnId);
                }
            }
        }
    }
    _addInactiveNode(parentNode, cookie, editedColumnId) {
        const cookieNode = this._createGridNode(cookie);
        parentNode.appendChild(cookieNode);
        cookieNode.select();
        cookieNode.setInactive(true);
        if (editedColumnId !== null) {
            this._dataGrid.startEditingNextEditableColumnOfDataGridNode(cookieNode, editedColumnId);
        }
    }
    _totalSize(cookies) {
        let totalSize = 0;
        for (let i = 0; cookies && i < cookies.length; ++i) {
            totalSize += cookies[i].size();
        }
        return totalSize;
    }
    _sortCookies(cookies) {
        const sortDirection = this._dataGrid.isSortOrderAscending() ? 1 : -1;
        function getValue(cookie, property) {
            switch (property) {
                case SDK.Cookie.Attributes.Name:
                    return String(cookie.name());
                case SDK.Cookie.Attributes.Value:
                    return String(cookie.value());
                case SDK.Cookie.Attributes.Domain:
                    return String(cookie.domain());
                case SDK.Cookie.Attributes.Path:
                    return String(cookie.path());
                case SDK.Cookie.Attributes.HttpOnly:
                    return String(cookie.httpOnly());
                case SDK.Cookie.Attributes.Secure:
                    return String(cookie.secure());
                case SDK.Cookie.Attributes.SameSite:
                    return String(cookie.sameSite());
                case SDK.Cookie.Attributes.SameParty:
                    return String(cookie.sameParty());
                case SDK.Cookie.Attributes.SourceScheme:
                    return String(cookie.sourceScheme());
                default:
                    return String(cookie.name());
            }
        }
        function compareTo(property, cookie1, cookie2) {
            return sortDirection * Platform.StringUtilities.compare(getValue(cookie1, property), getValue(cookie2, property));
        }
        function numberCompare(p, cookie1, cookie2) {
            return sortDirection * (p(cookie1) - p(cookie2));
        }
        function priorityCompare(cookie1, cookie2) {
            const priorities = [
                "Low" /* Low */,
                "Medium" /* Medium */,
                "High" /* High */,
            ];
            const priority1 = priorities.indexOf(cookie1.priority());
            const priority2 = priorities.indexOf(cookie2.priority());
            return sortDirection * (priority1 - priority2);
        }
        function expiresCompare(cookie1, cookie2) {
            if (cookie1.session() !== cookie2.session()) {
                return sortDirection * (cookie1.session() ? 1 : -1);
            }
            if (cookie1.session()) {
                return 0;
            }
            if (cookie1.maxAge() && cookie2.maxAge()) {
                return sortDirection * (cookie1.maxAge() - cookie2.maxAge());
            }
            if (cookie1.expires() && cookie2.expires()) {
                return sortDirection * (cookie1.expires() - cookie2.expires());
            }
            return sortDirection * (cookie1.expires() ? 1 : -1);
        }
        let comparator;
        const columnId = this._dataGrid.sortColumnId() || SDK.Cookie.Attributes.Name;
        if (columnId === SDK.Cookie.Attributes.Expires) {
            comparator = expiresCompare;
        }
        else if (columnId === SDK.Cookie.Attributes.Size) {
            comparator = numberCompare.bind(null, c => c.size());
        }
        else if (columnId === SDK.Cookie.Attributes.SourcePort) {
            comparator = numberCompare.bind(null, c => c.sourcePort());
        }
        else if (columnId === SDK.Cookie.Attributes.Priority) {
            comparator = priorityCompare;
        }
        else {
            comparator = compareTo.bind(null, columnId);
        }
        cookies.sort(comparator);
    }
    _createGridNode(cookie) {
        const data = {};
        data[SDK.Cookie.Attributes.Name] = cookie.name();
        data[SDK.Cookie.Attributes.Value] = cookie.value();
        if (cookie.type() === SDK.Cookie.Type.Request) {
            data[SDK.Cookie.Attributes.Domain] = cookie.domain() ? cookie.domain() : i18nString(UIStrings.na);
            data[SDK.Cookie.Attributes.Path] = cookie.path() ? cookie.path() : i18nString(UIStrings.na);
        }
        else {
            data[SDK.Cookie.Attributes.Domain] = cookie.domain() || '';
            data[SDK.Cookie.Attributes.Path] = cookie.path() || '';
        }
        if (cookie.maxAge()) {
            data[SDK.Cookie.Attributes.Expires] = i18n.i18n.secondsToString(Math.floor(cookie.maxAge()));
        }
        else if (cookie.expires()) {
            if (cookie.expires() < 0) {
                data[SDK.Cookie.Attributes.Expires] = expiresSessionValue();
            }
            else {
                data[SDK.Cookie.Attributes.Expires] = new Date(cookie.expires()).toISOString();
            }
        }
        else {
            data[SDK.Cookie.Attributes.Expires] =
                cookie.type() === SDK.Cookie.Type.Request ? i18nString(UIStrings.na) : expiresSessionValue();
        }
        data[SDK.Cookie.Attributes.Size] = cookie.size();
        data[SDK.Cookie.Attributes.HttpOnly] = cookie.httpOnly();
        data[SDK.Cookie.Attributes.Secure] = cookie.secure();
        data[SDK.Cookie.Attributes.SameSite] = cookie.sameSite() || '';
        data[SDK.Cookie.Attributes.SameParty] = cookie.sameParty();
        data[SDK.Cookie.Attributes.SourcePort] = cookie.sourcePort();
        data[SDK.Cookie.Attributes.SourceScheme] = cookie.sourceScheme();
        data[SDK.Cookie.Attributes.Priority] = cookie.priority() || '';
        const blockedReasons = this._cookieToBlockedReasons ? this._cookieToBlockedReasons.get(cookie) : null;
        const node = new DataGridNode(data, cookie, blockedReasons || null);
        node.selectable = true;
        return node;
    }
    _onDeleteCookie(node) {
        if (node.cookie && this._deleteCallback) {
            this._deleteCallback(node.cookie, () => this._refresh());
        }
    }
    _onUpdateCookie(editingNode, columnIdentifier, _oldText, _newText) {
        this._lastEditedColumnId = columnIdentifier;
        this._setDefaults(editingNode);
        if (this._isValidCookieData(editingNode.data)) {
            this._saveNode(editingNode);
        }
        else {
            editingNode.setDirty(true);
        }
    }
    _setDefaults(node) {
        if (node.data[SDK.Cookie.Attributes.Name] === null) {
            node.data[SDK.Cookie.Attributes.Name] = '';
        }
        if (node.data[SDK.Cookie.Attributes.Value] === null) {
            node.data[SDK.Cookie.Attributes.Value] = '';
        }
        if (node.data[SDK.Cookie.Attributes.Domain] === null) {
            node.data[SDK.Cookie.Attributes.Domain] = this._cookieDomain;
        }
        if (node.data[SDK.Cookie.Attributes.Path] === null) {
            node.data[SDK.Cookie.Attributes.Path] = '/';
        }
        if (node.data[SDK.Cookie.Attributes.Expires] === null) {
            node.data[SDK.Cookie.Attributes.Expires] = expiresSessionValue();
        }
    }
    _saveNode(node) {
        const oldCookie = node.cookie;
        const newCookie = this._createCookieFromData(node.data);
        node.cookie = newCookie;
        if (!this._saveCallback) {
            return;
        }
        this._saveCallback(newCookie, oldCookie).then(success => {
            if (success) {
                this._refresh();
            }
            else {
                node.setDirty(true);
            }
        });
    }
    _createCookieFromData(data) {
        const cookie = new SDK.Cookie.Cookie(data[SDK.Cookie.Attributes.Name], data[SDK.Cookie.Attributes.Value], null, data[SDK.Cookie.Attributes.Priority]);
        cookie.addAttribute(SDK.Cookie.Attributes.Domain, data[SDK.Cookie.Attributes.Domain]);
        cookie.addAttribute(SDK.Cookie.Attributes.Path, data[SDK.Cookie.Attributes.Path]);
        if (data.expires && data.expires !== expiresSessionValue()) {
            cookie.addAttribute(SDK.Cookie.Attributes.Expires, (new Date(data[SDK.Cookie.Attributes.Expires])).toUTCString());
        }
        if (data[SDK.Cookie.Attributes.HttpOnly]) {
            cookie.addAttribute(SDK.Cookie.Attributes.HttpOnly);
        }
        if (data[SDK.Cookie.Attributes.Secure]) {
            cookie.addAttribute(SDK.Cookie.Attributes.Secure);
        }
        if (data[SDK.Cookie.Attributes.SameSite]) {
            cookie.addAttribute(SDK.Cookie.Attributes.SameSite, data[SDK.Cookie.Attributes.SameSite]);
        }
        if (data[SDK.Cookie.Attributes.SameParty]) {
            cookie.addAttribute(SDK.Cookie.Attributes.SameParty);
        }
        if (SDK.Cookie.Attributes.SourceScheme in data) {
            cookie.addAttribute(SDK.Cookie.Attributes.SourceScheme, data[SDK.Cookie.Attributes.SourceScheme]);
        }
        if (SDK.Cookie.Attributes.SourcePort in data) {
            cookie.addAttribute(SDK.Cookie.Attributes.SourcePort, Number.parseInt(data[SDK.Cookie.Attributes.SourcePort], 10) || undefined);
        }
        cookie.setSize(data[SDK.Cookie.Attributes.Name].length + data[SDK.Cookie.Attributes.Value].length);
        return cookie;
    }
    _isValidCookieData(data) {
        return (Boolean(data.name) || Boolean(data.value)) && this._isValidDomain(data.domain) &&
            this._isValidPath(data.path) && this._isValidDate(data.expires);
    }
    _isValidDomain(domain) {
        if (!domain) {
            return true;
        }
        const parsedURL = Common.ParsedURL.ParsedURL.fromString('http://' + domain);
        return parsedURL !== null && parsedURL.domain() === domain;
    }
    _isValidPath(path) {
        const parsedURL = Common.ParsedURL.ParsedURL.fromString('http://example.com' + path);
        return parsedURL !== null && parsedURL.path === path;
    }
    _isValidDate(date) {
        return date === '' || date === expiresSessionValue() || !isNaN(Date.parse(date));
    }
    _refresh() {
        if (this._refreshCallback) {
            this._refreshCallback();
        }
    }
    _populateContextMenu(contextMenu, gridNode) {
        const maybeCookie = gridNode.cookie;
        if (!maybeCookie) {
            return;
        }
        const cookie = maybeCookie;
        contextMenu.revealSection().appendItem(i18nString(UIStrings.showRequestsWithThisCookie), () => {
            const evt = new CustomEvent('networkrevealandfilter', {
                bubbles: true,
                composed: true,
                detail: [
                    {
                        filterType: 'cookie-domain',
                        filterValue: cookie.domain(),
                    },
                    {
                        filterType: 'cookie-name',
                        filterValue: cookie.name(),
                    },
                ],
            });
            this.element.dispatchEvent(evt);
        });
        if (IssuesManager.RelatedIssue.hasIssues(cookie)) {
            contextMenu.revealSection().appendItem(i18nString(UIStrings.showIssueAssociatedWithThis), () => {
                // TODO(chromium:1077719): Just filter for the cookie instead of revealing one of the associated issues.
                IssuesManager.RelatedIssue.reveal(cookie);
            });
        }
    }
}
export class DataGridNode extends DataGrid.DataGrid.DataGridNode {
    cookie;
    _blockedReasons;
    constructor(data, cookie, blockedReasons) {
        super(data);
        this.cookie = cookie;
        this._blockedReasons = blockedReasons;
    }
    createCells(element) {
        super.createCells(element);
        if (this._blockedReasons && this._blockedReasons.length) {
            element.classList.add('flagged-cookie-attribute-row');
        }
    }
    createCell(columnId) {
        const cell = super.createCell(columnId);
        if (columnId === SDK.Cookie.Attributes.SourcePort) {
            UI.Tooltip.Tooltip.install(cell, i18nString(UIStrings.sourcePortTooltip));
        }
        else if (columnId === SDK.Cookie.Attributes.SourceScheme) {
            UI.Tooltip.Tooltip.install(cell, i18nString(UIStrings.sourceSchemeTooltip));
        }
        else {
            UI.Tooltip.Tooltip.install(cell, cell.textContent || '');
        }
        let blockedReasonString = '';
        if (this._blockedReasons) {
            for (const blockedReason of this._blockedReasons) {
                const attributeMatches = blockedReason.attribute === columnId;
                const useNameColumn = !blockedReason.attribute && columnId === SDK.Cookie.Attributes.Name;
                if (attributeMatches || useNameColumn) {
                    if (blockedReasonString) {
                        blockedReasonString += '\n';
                    }
                    blockedReasonString += blockedReason.uiString;
                }
            }
        }
        if (blockedReasonString) {
            const infoElement = UI.Icon.Icon.create('smallicon-info', 'cookie-warning-icon');
            UI.Tooltip.Tooltip.install(infoElement, blockedReasonString);
            cell.insertBefore(infoElement, cell.firstChild);
            cell.classList.add('flagged-cookie-attribute-cell');
        }
        return cell;
    }
}
//# sourceMappingURL=CookiesTable.js.map