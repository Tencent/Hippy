// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as Network from '../network/network.js';
const UIStrings = {
    /**
    *@description Text in Application Panel Sidebar of the Application panel
    */
    cache: 'Cache',
    /**
    *@description Text to refresh the page
    */
    refresh: 'Refresh',
    /**
    *@description Tooltip text that appears when hovering over the largeicon delete button in the Service Worker Cache Views of the Application panel
    */
    deleteSelected: 'Delete Selected',
    /**
    *@description Text in Service Worker Cache Views of the Application panel
    */
    filterByPath: 'Filter by Path',
    /**
    *@description Text in Service Worker Cache Views of the Application panel
    */
    selectACacheEntryAboveToPreview: 'Select a cache entry above to preview',
    /**
    *@description Text for the name of something
    */
    name: 'Name',
    /**
    *@description Text in Service Worker Cache Views of the Application panel
    */
    timeCached: 'Time Cached',
    /**
    * @description Tooltip text that appears when hovering over the vary header column in the Service Worker Cache Views of the Application panel
    */
    varyHeaderWarning: '⚠️ Set ignoreVary to true when matching this entry',
    /**
    *@description Text used to show that data was retrieved from ServiceWorker Cache
    */
    serviceWorkerCache: '`Service Worker` Cache',
    /**
    *@description Span text content in Service Worker Cache Views of the Application panel
    *@example {2} PH1
    */
    matchingEntriesS: 'Matching entries: {PH1}',
    /**
    *@description Span text content in Indexed DBViews of the Application panel
    *@example {2} PH1
    */
    totalEntriesS: 'Total entries: {PH1}',
    /**
    *@description Text for network request headers
    */
    headers: 'Headers',
    /**
    *@description Text for previewing items
    */
    preview: 'Preview',
};
const str_ = i18n.i18n.registerUIStrings('panels/application/ServiceWorkerCacheViews.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class ServiceWorkerCacheView extends UI.View.SimpleView {
    _model;
    _entriesForTest;
    _splitWidget;
    _previewPanel;
    _preview;
    _cache;
    _dataGrid;
    _refreshThrottler;
    _refreshButton;
    _deleteSelectedButton;
    _entryPathFilter;
    _returnCount;
    _summaryBarElement;
    _loadingPromise;
    constructor(model, cache) {
        super(i18nString(UIStrings.cache));
        this.registerRequiredCSS('panels/application/serviceWorkerCacheViews.css', { enableLegacyPatching: false });
        this._model = model;
        this._entriesForTest = null;
        this.element.classList.add('service-worker-cache-data-view');
        this.element.classList.add('storage-view');
        const editorToolbar = new UI.Toolbar.Toolbar('data-view-toolbar', this.element);
        this._splitWidget = new UI.SplitWidget.SplitWidget(false, false);
        this._splitWidget.show(this.element);
        this._previewPanel = new UI.Widget.VBox();
        const resizer = this._previewPanel.element.createChild('div', 'cache-preview-panel-resizer');
        this._splitWidget.setMainWidget(this._previewPanel);
        this._splitWidget.installResizer(resizer);
        this._preview = null;
        this._cache = cache;
        this._dataGrid = null;
        this._refreshThrottler = new Common.Throttler.Throttler(300);
        this._refreshButton = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.refresh), 'largeicon-refresh');
        this._refreshButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, this._refreshButtonClicked, this);
        editorToolbar.appendToolbarItem(this._refreshButton);
        this._deleteSelectedButton = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.deleteSelected), 'largeicon-delete');
        this._deleteSelectedButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, _event => {
            this._deleteButtonClicked(null);
        });
        editorToolbar.appendToolbarItem(this._deleteSelectedButton);
        const entryPathFilterBox = new UI.Toolbar.ToolbarInput(i18nString(UIStrings.filterByPath), '', 1);
        editorToolbar.appendToolbarItem(entryPathFilterBox);
        const entryPathFilterThrottler = new Common.Throttler.Throttler(300);
        this._entryPathFilter = '';
        entryPathFilterBox.addEventListener(UI.Toolbar.ToolbarInput.Event.TextChanged, () => {
            entryPathFilterThrottler.schedule(() => {
                this._entryPathFilter = entryPathFilterBox.value();
                return this._updateData(true);
            });
        });
        this._returnCount = null;
        this._summaryBarElement = null;
        this._loadingPromise = null;
        this.update(cache);
    }
    _resetDataGrid() {
        if (this._dataGrid) {
            this._dataGrid.asWidget().detach();
        }
        this._dataGrid = this._createDataGrid();
        const dataGridWidget = this._dataGrid.asWidget();
        this._splitWidget.setSidebarWidget(dataGridWidget);
        dataGridWidget.setMinimumSize(0, 250);
    }
    wasShown() {
        this._model.addEventListener(SDK.ServiceWorkerCacheModel.Events.CacheStorageContentUpdated, this._cacheContentUpdated, this);
        this._updateData(true);
    }
    willHide() {
        this._model.removeEventListener(SDK.ServiceWorkerCacheModel.Events.CacheStorageContentUpdated, this._cacheContentUpdated, this);
    }
    _showPreview(preview) {
        if (preview && this._preview === preview) {
            return;
        }
        if (this._preview) {
            this._preview.detach();
        }
        if (!preview) {
            preview = new UI.EmptyWidget.EmptyWidget(i18nString(UIStrings.selectACacheEntryAboveToPreview));
        }
        this._preview = preview;
        this._preview.show(this._previewPanel.element);
    }
    _createDataGrid() {
        const columns = [
            { id: 'number', title: '#', sortable: false, width: '3px' },
            { id: 'name', title: i18nString(UIStrings.name), weight: 4, sortable: true },
            {
                id: 'responseType',
                title: i18n.i18n.lockedString('Response-Type'),
                weight: 1,
                align: DataGrid.DataGrid.Align.Right,
                sortable: true,
            },
            { id: 'contentType', title: i18n.i18n.lockedString('Content-Type'), weight: 1, sortable: true },
            {
                id: 'contentLength',
                title: i18n.i18n.lockedString('Content-Length'),
                weight: 1,
                align: DataGrid.DataGrid.Align.Right,
                sortable: true,
            },
            {
                id: 'responseTime',
                title: i18nString(UIStrings.timeCached),
                width: '12em',
                weight: 1,
                align: DataGrid.DataGrid.Align.Right,
                sortable: true,
            },
            { id: 'varyHeader', title: i18n.i18n.lockedString('Vary Header'), weight: 1, sortable: true },
        ];
        const dataGrid = new DataGrid.DataGrid.DataGridImpl({
            displayName: i18nString(UIStrings.serviceWorkerCache),
            columns,
            deleteCallback: this._deleteButtonClicked.bind(this),
            refreshCallback: this._updateData.bind(this, true),
            editCallback: undefined,
        });
        dataGrid.addEventListener(DataGrid.DataGrid.Events.SortingChanged, this._sortingChanged, this);
        dataGrid.addEventListener(DataGrid.DataGrid.Events.SelectedNode, event => {
            this._previewCachedResponse(event.data.data);
        }, this);
        dataGrid.setStriped(true);
        return dataGrid;
    }
    _sortingChanged() {
        if (!this._dataGrid) {
            return;
        }
        const dataGrid = this._dataGrid;
        const accending = dataGrid.isSortOrderAscending();
        const columnId = dataGrid.sortColumnId();
        let comparator;
        if (columnId === 'name') {
            comparator = (a, b) => a._name.localeCompare(b._name);
        }
        else if (columnId === 'contentType') {
            comparator = (a, b) => a.data.mimeType.localeCompare(b.data.mimeType);
        }
        else if (columnId === 'contentLength') {
            comparator = (a, b) => a.data.resourceSize - b.data.resourceSize;
        }
        else if (columnId === 'responseTime') {
            comparator = (a, b) => a.data.endTime - b.data.endTime;
        }
        else if (columnId === 'responseType') {
            comparator = (a, b) => a._responseType.localeCompare(b._responseType);
        }
        else if (columnId === 'varyHeader') {
            comparator = (a, b) => a._varyHeader.localeCompare(b._varyHeader);
        }
        const children = dataGrid.rootNode().children.slice();
        dataGrid.rootNode().removeChildren();
        children.sort((a, b) => {
            const result = comparator(a, b);
            return accending ? result : -result;
        });
        children.forEach(child => dataGrid.rootNode().appendChild(child));
    }
    async _deleteButtonClicked(node) {
        if (!node) {
            node = this._dataGrid && this._dataGrid.selectedNode;
            if (!node) {
                return;
            }
        }
        await this._model.deleteCacheEntry(this._cache, node.data.url());
        node.remove();
    }
    update(cache) {
        this._cache = cache;
        this._resetDataGrid();
        this._updateData(true);
    }
    _updateSummaryBar() {
        if (!this._summaryBarElement) {
            this._summaryBarElement = this.element.createChild('div', 'cache-storage-summary-bar');
        }
        this._summaryBarElement.removeChildren();
        const span = this._summaryBarElement.createChild('span');
        if (this._entryPathFilter) {
            span.textContent = i18nString(UIStrings.matchingEntriesS, { PH1: this._returnCount });
        }
        else {
            span.textContent = i18nString(UIStrings.totalEntriesS, { PH1: this._returnCount });
        }
    }
    _updateDataCallback(skipCount, entries, returnCount) {
        if (!this._dataGrid) {
            return;
        }
        const selected = this._dataGrid.selectedNode && this._dataGrid.selectedNode.data.url();
        this._refreshButton.setEnabled(true);
        this._entriesForTest = entries;
        this._returnCount = returnCount;
        this._updateSummaryBar();
        const oldEntries = new Map();
        const rootNode = this._dataGrid.rootNode();
        for (const node of rootNode.children) {
            oldEntries.set(node.data.url, node);
        }
        rootNode.removeChildren();
        let selectedNode = null;
        for (let i = 0; i < entries.length; ++i) {
            const entry = entries[i];
            let node = oldEntries.get(entry.requestURL);
            if (!node || node.data.responseTime !== entry.responseTime) {
                node = new DataGridNode(i, this._createRequest(entry), entry.responseType);
                node.selectable = true;
            }
            else {
                node.data.number = i;
            }
            rootNode.appendChild(node);
            if (entry.requestURL === selected) {
                selectedNode = node;
            }
        }
        if (!selectedNode) {
            this._showPreview(null);
        }
        else {
            selectedNode.revealAndSelect();
        }
        this._updatedForTest();
    }
    async _updateData(force) {
        if (!force && this._loadingPromise) {
            return this._loadingPromise;
        }
        this._refreshButton.setEnabled(false);
        if (this._loadingPromise) {
            return this._loadingPromise;
        }
        this._loadingPromise = new Promise(resolve => {
            this._model.loadAllCacheData(this._cache, this._entryPathFilter, (entries, returnCount) => {
                resolve({ entries, returnCount });
            });
        });
        const { entries, returnCount } = await this._loadingPromise;
        this._updateDataCallback(0, entries, returnCount);
        this._loadingPromise = null;
        return;
    }
    _refreshButtonClicked(_event) {
        this._updateData(true);
    }
    _cacheContentUpdated(event) {
        const nameAndOrigin = event.data;
        if (this._cache.securityOrigin !== nameAndOrigin.origin || this._cache.cacheName !== nameAndOrigin.cacheName) {
            return;
        }
        this._refreshThrottler.schedule(() => Promise.resolve(this._updateData(true)), true);
    }
    async _previewCachedResponse(request) {
        let preview = networkRequestToPreview.get(request);
        if (!preview) {
            preview = new RequestView(request);
            networkRequestToPreview.set(request, preview);
        }
        // It is possible that table selection changes before the preview opens.
        if (this._dataGrid && this._dataGrid.selectedNode && request === this._dataGrid.selectedNode.data) {
            this._showPreview(preview);
        }
    }
    _createRequest(entry) {
        const request = new SDK.NetworkRequest.NetworkRequest('cache-storage-' + entry.requestURL, entry.requestURL, '', '', '', null);
        request.requestMethod = entry.requestMethod;
        request.setRequestHeaders(entry.requestHeaders);
        request.statusCode = entry.responseStatus;
        request.statusText = entry.responseStatusText;
        request.protocol = new Common.ParsedURL.ParsedURL(entry.requestURL).scheme;
        request.responseHeaders = entry.responseHeaders;
        request.setRequestHeadersText('');
        request.endTime = entry.responseTime;
        let header = entry.responseHeaders.find(header => header.name.toLowerCase() === 'content-type');
        const contentType = header ? header.value : SDK.NetworkRequest.MIME_TYPE.PLAIN;
        request.mimeType = contentType;
        header = entry.responseHeaders.find(header => header.name.toLowerCase() === 'content-length');
        request.resourceSize = (header && Number(header.value)) || 0;
        let resourceType = Common.ResourceType.ResourceType.fromMimeType(contentType);
        if (!resourceType) {
            resourceType =
                Common.ResourceType.ResourceType.fromURL(entry.requestURL) || Common.ResourceType.resourceTypes.Other;
        }
        request.setResourceType(resourceType);
        request.setContentDataProvider(this._requestContent.bind(this, request));
        return request;
    }
    async _requestContent(request) {
        const isText = request.resourceType().isTextType();
        const contentData = { error: null, content: null, encoded: !isText };
        const response = await this._cache.requestCachedResponse(request.url(), request.requestHeaders());
        if (response) {
            contentData.content = isText ? window.atob(response.body) : response.body;
        }
        return contentData;
    }
    _updatedForTest() {
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static _previewSymbol = Symbol('preview');
}
const networkRequestToPreview = new WeakMap();
export class DataGridNode extends DataGrid.DataGrid.DataGridNode {
    _number;
    _name;
    _request;
    _responseType;
    _varyHeader;
    constructor(number, request, responseType) {
        super(request);
        this._number = number;
        const parsed = new Common.ParsedURL.ParsedURL(request.url());
        if (parsed.isValid) {
            this._name = Platform.StringUtilities.trimURL(request.url(), parsed.domain());
        }
        else {
            this._name = request.url();
        }
        this._request = request;
        this._responseType = responseType;
        this._varyHeader = request.responseHeaders.find(header => header.name.toLowerCase() === 'vary')?.value || '';
    }
    createCell(columnId) {
        const cell = this.createTD(columnId);
        let value;
        let tooltip = this._request.url();
        if (columnId === 'number') {
            value = String(this._number);
        }
        else if (columnId === 'name') {
            value = this._name;
        }
        else if (columnId === 'responseType') {
            if (this._responseType === 'opaqueResponse') {
                value = 'opaque';
            }
            else if (this._responseType === 'opaqueRedirect') {
                value = 'opaqueredirect';
            }
            else {
                value = this._responseType;
            }
        }
        else if (columnId === 'contentType') {
            value = this._request.mimeType;
        }
        else if (columnId === 'contentLength') {
            value = (this._request.resourceSize | 0).toLocaleString('en-US');
        }
        else if (columnId === 'responseTime') {
            value = new Date(this._request.endTime * 1000).toLocaleString();
        }
        else if (columnId === 'varyHeader') {
            value = this._varyHeader;
            if (this._varyHeader) {
                tooltip = i18nString(UIStrings.varyHeaderWarning);
            }
        }
        DataGrid.DataGrid.DataGridImpl.setElementText(cell, value || '', true);
        UI.Tooltip.Tooltip.install(cell, tooltip);
        return cell;
    }
}
export class RequestView extends UI.Widget.VBox {
    _tabbedPane;
    _resourceViewTabSetting;
    constructor(request) {
        super();
        this._tabbedPane = new UI.TabbedPane.TabbedPane();
        this._tabbedPane.addEventListener(UI.TabbedPane.Events.TabSelected, this._tabSelected, this);
        this._resourceViewTabSetting = Common.Settings.Settings.instance().createSetting('cacheStorageViewTab', 'preview');
        this._tabbedPane.appendTab('headers', i18nString(UIStrings.headers), new Network.RequestHeadersView.RequestHeadersView(request));
        this._tabbedPane.appendTab('preview', i18nString(UIStrings.preview), new Network.RequestPreviewView.RequestPreviewView(request));
        this._tabbedPane.show(this.element);
    }
    wasShown() {
        super.wasShown();
        this._selectTab();
    }
    _selectTab(tabId) {
        if (!tabId) {
            tabId = this._resourceViewTabSetting.get();
        }
        if (tabId && !this._tabbedPane.selectTab(tabId)) {
            this._tabbedPane.selectTab('headers');
        }
    }
    _tabSelected(event) {
        if (!event.data.isUserGesture) {
            return;
        }
        this._resourceViewTabSetting.set(event.data.tabId);
    }
}
//# sourceMappingURL=ServiceWorkerCacheViews.js.map