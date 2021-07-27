import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as UI from '../../ui/legacy/legacy.js';
import type * as Protocol from '../../generated/protocol.js';
export declare class ServiceWorkerCacheView extends UI.View.SimpleView {
    _model: SDK.ServiceWorkerCacheModel.ServiceWorkerCacheModel;
    _entriesForTest: Protocol.CacheStorage.DataEntry[] | null;
    _splitWidget: UI.SplitWidget.SplitWidget;
    _previewPanel: UI.Widget.VBox;
    _preview: UI.Widget.Widget | null;
    _cache: SDK.ServiceWorkerCacheModel.Cache;
    _dataGrid: DataGrid.DataGrid.DataGridImpl<DataGridNode> | null;
    _refreshThrottler: Common.Throttler.Throttler;
    _refreshButton: UI.Toolbar.ToolbarButton;
    _deleteSelectedButton: UI.Toolbar.ToolbarButton;
    _entryPathFilter: string;
    _returnCount: number | null;
    _summaryBarElement: Element | null;
    _loadingPromise: Promise<{
        entries: Array<Protocol.CacheStorage.DataEntry>;
        returnCount: number;
    }> | null;
    constructor(model: SDK.ServiceWorkerCacheModel.ServiceWorkerCacheModel, cache: SDK.ServiceWorkerCacheModel.Cache);
    _resetDataGrid(): void;
    wasShown(): void;
    willHide(): void;
    _showPreview(preview: UI.Widget.Widget | null): void;
    _createDataGrid(): DataGrid.DataGrid.DataGridImpl<DataGridNode>;
    _sortingChanged(): void;
    _deleteButtonClicked(node: DataGrid.DataGrid.DataGridNode<DataGridNode> | null): Promise<void>;
    update(cache: SDK.ServiceWorkerCacheModel.Cache): void;
    _updateSummaryBar(): void;
    _updateDataCallback(this: ServiceWorkerCacheView, skipCount: number, entries: Protocol.CacheStorage.DataEntry[], returnCount: number): void;
    _updateData(force: boolean): Promise<{
        entries: Protocol.CacheStorage.DataEntry[];
        returnCount: number;
    } | undefined>;
    _refreshButtonClicked(_event: Common.EventTarget.EventTargetEvent): void;
    _cacheContentUpdated(event: Common.EventTarget.EventTargetEvent): void;
    _previewCachedResponse(request: SDK.NetworkRequest.NetworkRequest): Promise<void>;
    _createRequest(entry: Protocol.CacheStorage.DataEntry): SDK.NetworkRequest.NetworkRequest;
    _requestContent(request: SDK.NetworkRequest.NetworkRequest): Promise<SDK.NetworkRequest.ContentData>;
    _updatedForTest(): void;
    static readonly _previewSymbol: unique symbol;
}
export declare class DataGridNode extends DataGrid.DataGrid.DataGridNode<DataGridNode> {
    _number: number;
    _name: string;
    _request: SDK.NetworkRequest.NetworkRequest;
    _responseType: Protocol.CacheStorage.CachedResponseType;
    _varyHeader: string;
    constructor(number: number, request: SDK.NetworkRequest.NetworkRequest, responseType: Protocol.CacheStorage.CachedResponseType);
    createCell(columnId: string): HTMLElement;
}
export declare class RequestView extends UI.Widget.VBox {
    _tabbedPane: UI.TabbedPane.TabbedPane;
    _resourceViewTabSetting: Common.Settings.Setting<string>;
    constructor(request: SDK.NetworkRequest.NetworkRequest);
    wasShown(): void;
    _selectTab(tabId?: string): void;
    _tabSelected(event: Common.EventTarget.EventTargetEvent): void;
}
