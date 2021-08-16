import * as Common from '../../core/common/common.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import type { NetworkNode } from './NetworkDataGridNode.js';
import type { NetworkLogView } from './NetworkLogView.js';
import type { NetworkTimeCalculator, NetworkTransferDurationCalculator, NetworkTransferTimeCalculator } from './NetworkTimeCalculator.js';
import { NetworkWaterfallColumn } from './NetworkWaterfallColumn.js';
export declare class NetworkLogViewColumns {
    _networkLogView: NetworkLogView;
    _persistantSettings: Common.Settings.Setting<{
        [x: string]: {
            visible: boolean;
            title: string;
        };
    }>;
    _networkLogLargeRowsSetting: Common.Settings.Setting<number>;
    _eventDividers: Map<string, number[]>;
    _eventDividersShown: boolean;
    _gridMode: boolean;
    _columns: Descriptor[];
    _waterfallRequestsAreStale: boolean;
    _waterfallScrollerWidthIsStale: boolean;
    _popupLinkifier: Components.Linkifier.Linkifier;
    _calculatorsMap: Map<string, NetworkTimeCalculator>;
    _lastWheelTime: number;
    _dataGrid: DataGrid.SortableDataGrid.SortableDataGrid<NetworkNode>;
    _splitWidget: UI.SplitWidget.SplitWidget;
    _waterfallColumn: NetworkWaterfallColumn;
    _activeScroller: Element;
    _dataGridScroller: HTMLElement;
    _waterfallScroller: HTMLElement;
    _waterfallScrollerContent: HTMLDivElement;
    _waterfallHeaderElement: HTMLElement;
    _waterfallColumnSortIcon: UI.Icon.Icon;
    _activeWaterfallSortId: string;
    _popoverHelper?: UI.PopoverHelper.PopoverHelper;
    _hasScrollerTouchStarted?: boolean;
    _scrollerTouchStartPos?: number;
    constructor(networkLogView: NetworkLogView, timeCalculator: NetworkTransferTimeCalculator, durationCalculator: NetworkTransferDurationCalculator, networkLogLargeRowsSetting: Common.Settings.Setting<number>);
    static _convertToDataGridDescriptor(columnConfig: Descriptor): DataGrid.DataGrid.ColumnDescriptor;
    wasShown(): void;
    willHide(): void;
    reset(): void;
    _setupDataGrid(): void;
    _setupWaterfall(): void;
    _onMouseWheel(shouldConsume: boolean, ev: Event): void;
    _onTouchStart(ev: Event): void;
    _onTouchMove(ev: Event): void;
    _onTouchEnd(): void;
    _syncScrollers(): void;
    _updateScrollerWidthIfNeeded(): void;
    _redrawWaterfallColumn(): void;
    _createWaterfallHeader(): void;
    setCalculator(x: NetworkTimeCalculator): void;
    scheduleRefresh(): void;
    _updateRowsSize(): void;
    show(element: Element): void;
    setHidden(value: boolean): void;
    dataGrid(): DataGrid.SortableDataGrid.SortableDataGrid<NetworkNode>;
    sortByCurrentColumn(): void;
    _sortHandler(): void;
    _dataGridSortedForTest(): void;
    _updateColumns(): void;
    switchViewMode(gridMode: boolean): void;
    _toggleColumnVisibility(columnConfig: Descriptor): void;
    _saveColumnsSettings(): void;
    _loadCustomColumnsAndSettings(): void;
    _makeHeaderFragment(title: string, subtitle: string): DocumentFragment;
    _innerHeaderContextMenu(contextMenu: UI.ContextMenu.SubMenu): void;
    _manageCustomHeaderDialog(): void;
    _removeCustomHeader(headerId: string): boolean;
    _addCustomHeader(headerTitle: string, headerId?: string, index?: number): Descriptor | null;
    _changeCustomHeader(oldHeaderId: string, newHeaderTitle: string, newHeaderId?: string): boolean;
    _getPopoverRequest(event: Event): UI.PopoverHelper.PopoverRequest | null;
    addEventDividers(times: number[], className: string): void;
    hideEventDividers(): void;
    showEventDividers(): void;
    selectFilmStripFrame(time: number): void;
    clearFilmStripFrame(): void;
}
export declare const _initialSortColumn = "waterfall";
export declare enum _calculatorTypes {
    Duration = "Duration",
    Time = "Time"
}
export declare const _defaultColumnConfig: Object;
export declare const _filmStripDividerColor = "#fccc49";
export declare enum WaterfallSortIds {
    StartTime = "startTime",
    ResponseTime = "responseReceivedTime",
    EndTime = "endTime",
    Duration = "duration",
    Latency = "latency"
}
export interface Descriptor {
    id: string;
    title: string | (() => string);
    titleDOMFragment?: DocumentFragment;
    subtitle: string | (() => string) | null;
    visible: boolean;
    weight: number;
    hideable: boolean;
    hideableGroup: string | null;
    nonSelectable: boolean;
    sortable: boolean;
    align?: string | null;
    isResponseHeader: boolean;
    sortingFunction: (arg0: NetworkNode, arg1: NetworkNode) => number | undefined;
    isCustomHeader: boolean;
    allowInSortByEvenWhenHidden: boolean;
}
