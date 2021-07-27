import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import type { NetworkLogViewInterface, NetworkNode } from './NetworkDataGridNode.js';
import { NetworkGroupNode, NetworkRequestNode } from './NetworkDataGridNode.js';
import { NetworkLogViewColumns } from './NetworkLogViewColumns.js';
import type { FilterOptions } from './NetworkPanel.js';
import type { NetworkTimeCalculator } from './NetworkTimeCalculator.js';
import { NetworkTransferDurationCalculator, NetworkTransferTimeCalculator } from './NetworkTimeCalculator.js';
export declare class NetworkLogView extends UI.Widget.VBox implements SDK.TargetManager.SDKModelObserver<SDK.NetworkManager.NetworkManager>, NetworkLogViewInterface {
    _networkHideDataURLSetting: Common.Settings.Setting<boolean>;
    _networkShowIssuesOnlySetting: Common.Settings.Setting<boolean>;
    _networkOnlyBlockedRequestsSetting: Common.Settings.Setting<boolean>;
    _networkResourceTypeFiltersSetting: Common.Settings.Setting<any>;
    _rawRowHeight: number;
    _progressBarContainer: Element;
    _networkLogLargeRowsSetting: Common.Settings.Setting<boolean>;
    _rowHeight: number;
    _timeCalculator: NetworkTransferTimeCalculator;
    _durationCalculator: NetworkTransferDurationCalculator;
    _calculator: NetworkTransferTimeCalculator;
    _columns: NetworkLogViewColumns;
    _staleRequests: Set<SDK.NetworkRequest.NetworkRequest>;
    _mainRequestLoadTime: number;
    _mainRequestDOMContentLoadedTime: number;
    _highlightedSubstringChanges: any;
    _filters: Filter[];
    _timeFilter: Filter | null;
    _hoveredNode: NetworkNode | null;
    _recordingHint: Element | null;
    _refreshRequestId: number | null;
    _highlightedNode: NetworkRequestNode | null;
    _linkifier: Components.Linkifier.Linkifier;
    _recording: boolean;
    _needsRefresh: boolean;
    _headerHeight: number;
    _groupLookups: Map<string, GroupLookupInterface>;
    _activeGroupLookup: GroupLookupInterface | null;
    _textFilterUI: UI.FilterBar.TextFilterUI;
    _dataURLFilterUI: UI.FilterBar.CheckboxFilterUI;
    _resourceCategoryFilterUI: UI.FilterBar.NamedBitSetFilterUI;
    _onlyIssuesFilterUI: UI.FilterBar.CheckboxFilterUI;
    _onlyBlockedRequestsUI: UI.FilterBar.CheckboxFilterUI;
    _filterParser: TextUtils.TextUtils.FilterParser;
    _suggestionBuilder: UI.FilterSuggestionBuilder.FilterSuggestionBuilder;
    _dataGrid: DataGrid.SortableDataGrid.SortableDataGrid<NetworkNode>;
    _summaryToolbar: UI.Toolbar.Toolbar;
    _filterBar: UI.FilterBar.FilterBar;
    _textFilterSetting: Common.Settings.Setting<string>;
    constructor(filterBar: UI.FilterBar.FilterBar, progressBarContainer: Element, networkLogLargeRowsSetting: Common.Settings.Setting<boolean>);
    _updateGroupByFrame(): void;
    static _sortSearchValues(key: string, values: string[]): void;
    static _negativeFilter(filter: Filter, request: SDK.NetworkRequest.NetworkRequest): boolean;
    static _requestPathFilter(regex: RegExp | null, request: SDK.NetworkRequest.NetworkRequest): boolean;
    static _subdomains(domain: string): string[];
    static _createRequestDomainFilter(value: string): Filter;
    static _requestDomainFilter(regex: RegExp, request: SDK.NetworkRequest.NetworkRequest): boolean;
    static _runningRequestFilter(request: SDK.NetworkRequest.NetworkRequest): boolean;
    static _fromCacheRequestFilter(request: SDK.NetworkRequest.NetworkRequest): boolean;
    static _interceptedByServiceWorkerFilter(request: SDK.NetworkRequest.NetworkRequest): boolean;
    static _initiatedByServiceWorkerFilter(request: SDK.NetworkRequest.NetworkRequest): boolean;
    static _requestResponseHeaderFilter(value: string, request: SDK.NetworkRequest.NetworkRequest): boolean;
    static _requestMethodFilter(value: string, request: SDK.NetworkRequest.NetworkRequest): boolean;
    static _requestPriorityFilter(value: string, request: SDK.NetworkRequest.NetworkRequest): boolean;
    static _requestMimeTypeFilter(value: string, request: SDK.NetworkRequest.NetworkRequest): boolean;
    static _requestMixedContentFilter(value: MixedContentFilterValues, request: SDK.NetworkRequest.NetworkRequest): boolean;
    static _requestSchemeFilter(value: string, request: SDK.NetworkRequest.NetworkRequest): boolean;
    static _requestCookieDomainFilter(value: string, request: SDK.NetworkRequest.NetworkRequest): boolean;
    static _requestCookieNameFilter(value: string, request: SDK.NetworkRequest.NetworkRequest): boolean;
    static _requestCookiePathFilter(value: string, request: SDK.NetworkRequest.NetworkRequest): boolean;
    static _requestCookieValueFilter(value: string, request: SDK.NetworkRequest.NetworkRequest): boolean;
    static _requestSetCookieDomainFilter(value: string, request: SDK.NetworkRequest.NetworkRequest): boolean;
    static _requestSetCookieNameFilter(value: string, request: SDK.NetworkRequest.NetworkRequest): boolean;
    static _requestSetCookieValueFilter(value: string, request: SDK.NetworkRequest.NetworkRequest): boolean;
    static _requestSizeLargerThanFilter(value: number, request: SDK.NetworkRequest.NetworkRequest): boolean;
    static _statusCodeFilter(value: string, request: SDK.NetworkRequest.NetworkRequest): boolean;
    static HTTPRequestsFilter(request: SDK.NetworkRequest.NetworkRequest): boolean;
    static _resourceTypeFilter(value: string, request: SDK.NetworkRequest.NetworkRequest): boolean;
    static _requestUrlFilter(value: string, request: SDK.NetworkRequest.NetworkRequest): boolean;
    static _requestTimeFilter(windowStart: number, windowEnd: number, request: SDK.NetworkRequest.NetworkRequest): boolean;
    static _copyRequestHeaders(request: SDK.NetworkRequest.NetworkRequest): void;
    static _copyResponseHeaders(request: SDK.NetworkRequest.NetworkRequest): void;
    static _copyResponse(request: SDK.NetworkRequest.NetworkRequest): Promise<void>;
    _handleDrop(dataTransfer: DataTransfer): void;
    onLoadFromFile(file: File): Promise<void>;
    _harLoadFailed(message: string): void;
    _setGrouping(groupKey: string | null): void;
    _computeRowHeight(): number;
    nodeForRequest(request: SDK.NetworkRequest.NetworkRequest): NetworkRequestNode | null;
    headerHeight(): number;
    setRecording(recording: boolean): void;
    modelAdded(networkManager: SDK.NetworkManager.NetworkManager): void;
    modelRemoved(networkManager: SDK.NetworkManager.NetworkManager): void;
    linkifier(): Components.Linkifier.Linkifier;
    setWindow(start: number, end: number): void;
    resetFocus(): void;
    _resetSuggestionBuilder(): void;
    _filterChanged(_event: Common.EventTarget.EventTargetEvent): void;
    resetFilter(): Promise<void>;
    _showRecordingHint(): void;
    _hideRecordingHint(): void;
    _setHidden(value: boolean): void;
    elementsToRestoreScrollPositionsFor(): Element[];
    columnExtensionResolved(): void;
    _setupDataGrid(): DataGrid.SortableDataGrid.SortableDataGrid<NetworkNode>;
    _dataGridMouseMove(event: Event): void;
    hoveredNode(): NetworkNode | null;
    _setHoveredNode(node: NetworkNode | null, highlightInitiatorChain?: boolean): void;
    _dataGridMouseDown(event: Event): void;
    _updateSummaryBar(): void;
    scheduleRefresh(): void;
    addFilmStripFrames(times: number[]): void;
    selectFilmStripFrame(time: number): void;
    clearFilmStripFrame(): void;
    _refreshIfNeeded(): void;
    _invalidateAllItems(deferUpdate?: boolean): void;
    timeCalculator(): NetworkTimeCalculator;
    calculator(): NetworkTimeCalculator;
    setCalculator(x: NetworkTimeCalculator): void;
    _loadEventFired(event: Common.EventTarget.EventTargetEvent): void;
    _domContentLoadedEventFired(event: Common.EventTarget.EventTargetEvent): void;
    wasShown(): void;
    willHide(): void;
    onResize(): void;
    flatNodesList(): NetworkNode[];
    _onDataGridFocus(): void;
    _onDataGridBlur(): void;
    updateNodeBackground(): void;
    updateNodeSelectedClass(isSelected: boolean): void;
    stylesChanged(): void;
    _refresh(): void;
    _didRefreshForTest(): void;
    _parentNodeForInsert(node: NetworkRequestNode): NetworkNode | null;
    _reset(): void;
    setTextFilterValue(filterString: string): void;
    _createNodeForRequest(request: SDK.NetworkRequest.NetworkRequest): NetworkRequestNode;
    _onRequestUpdated(event: Common.EventTarget.EventTargetEvent): void;
    _refreshRequest(request: SDK.NetworkRequest.NetworkRequest): void;
    rowHeight(): number;
    switchViewMode(gridMode: boolean): void;
    handleContextMenuForRequest(contextMenu: UI.ContextMenu.ContextMenu, request: SDK.NetworkRequest.NetworkRequest): void;
    _harRequests(): SDK.NetworkRequest.NetworkRequest[];
    _copyAll(): Promise<void>;
    _copyCurlCommand(request: SDK.NetworkRequest.NetworkRequest, platform: string): Promise<void>;
    _copyAllCurlCommand(platform: string): Promise<void>;
    _copyFetchCall(request: SDK.NetworkRequest.NetworkRequest, includeCookies: boolean): Promise<void>;
    _copyAllFetchCall(includeCookies: boolean): Promise<void>;
    _copyPowerShellCommand(request: SDK.NetworkRequest.NetworkRequest): Promise<void>;
    _copyAllPowerShellCommand(): Promise<void>;
    exportAll(): Promise<void>;
    _clearBrowserCache(): void;
    _clearBrowserCookies(): void;
    _removeAllHighlights(): void;
    _applyFilter(node: NetworkRequestNode): boolean;
    _parseFilterQuery(query: string): void;
    _createSpecialFilter(type: FilterType, value: string): Filter | null;
    _createSizeFilter(value: string): Filter | null;
    _filterRequests(): void;
    _reveal(request: SDK.NetworkRequest.NetworkRequest): NetworkRequestNode | null;
    revealAndHighlightRequest(request: SDK.NetworkRequest.NetworkRequest): void;
    selectRequest(request: SDK.NetworkRequest.NetworkRequest, options?: FilterOptions): void;
    removeAllNodeHighlights(): void;
    _highlightNode(node: NetworkRequestNode): void;
    _filterOutBlobRequests(requests: SDK.NetworkRequest.NetworkRequest[]): SDK.NetworkRequest.NetworkRequest[];
    _generateFetchCall(request: SDK.NetworkRequest.NetworkRequest, includeCookies: boolean): Promise<string>;
    _generateAllFetchCall(requests: SDK.NetworkRequest.NetworkRequest[], includeCookies: boolean): Promise<string>;
    _generateCurlCommand(request: SDK.NetworkRequest.NetworkRequest, platform: string): Promise<string>;
    _generateAllCurlCommand(requests: SDK.NetworkRequest.NetworkRequest[], platform: string): Promise<string>;
    _generatePowerShellCommand(request: SDK.NetworkRequest.NetworkRequest): Promise<string>;
    _generateAllPowerShellCommand(requests: SDK.NetworkRequest.NetworkRequest[]): Promise<string>;
    static getDCLEventColor(): string;
    static getLoadEventColor(): string;
}
export declare function computeStackTraceText(stackTrace: Protocol.Runtime.StackTrace): string;
export declare function isRequestFilteredOut(request: NetworkRequestNode): boolean;
export declare const HTTPSchemas: {
    http: boolean;
    https: boolean;
    ws: boolean;
    wss: boolean;
};
export declare enum FilterType {
    Domain = "domain",
    HasResponseHeader = "has-response-header",
    Is = "is",
    LargerThan = "larger-than",
    Method = "method",
    MimeType = "mime-type",
    MixedContent = "mixed-content",
    Priority = "priority",
    Scheme = "scheme",
    SetCookieDomain = "set-cookie-domain",
    SetCookieName = "set-cookie-name",
    SetCookieValue = "set-cookie-value",
    ResourceType = "resource-type",
    CookieDomain = "cookie-domain",
    CookieName = "cookie-name",
    CookiePath = "cookie-path",
    CookieValue = "cookie-value",
    StatusCode = "status-code",
    Url = "url"
}
export declare enum MixedContentFilterValues {
    All = "all",
    Displayed = "displayed",
    Blocked = "blocked",
    BlockOverridden = "block-overridden"
}
export declare enum IsFilterType {
    Running = "running",
    FromCache = "from-cache",
    ServiceWorkerIntercepted = "service-worker-intercepted",
    ServiceWorkerInitiated = "service-worker-initiated"
}
export declare const _searchKeys: string[];
export interface GroupLookupInterface {
    groupNodeForRequest(request: SDK.NetworkRequest.NetworkRequest): NetworkGroupNode | null;
    reset(): void;
}
export declare type Filter = (request: SDK.NetworkRequest.NetworkRequest) => boolean;
