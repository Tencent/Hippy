import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as TimelineModel from '../../models/timeline_model/timeline_model.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import type { PerformanceModel } from './PerformanceModel.js';
import { TimelineRegExp } from './TimelineFilters.js';
import type { TimelineSelection } from './TimelinePanel.js';
export declare class TimelineTreeView extends UI.Widget.VBox implements UI.SearchableView.Searchable {
    _model: PerformanceModel | null;
    _track: TimelineModel.TimelineModel.Track | null;
    _tree: TimelineModel.TimelineProfileTree.Node | null;
    _searchResults: TimelineModel.TimelineProfileTree.Node[];
    linkifier: Components.Linkifier.Linkifier;
    dataGrid: DataGrid.SortableDataGrid.SortableDataGrid<GridNode>;
    _lastHoveredProfileNode: TimelineModel.TimelineProfileTree.Node | null;
    _textFilter: TimelineRegExp;
    _taskFilter: TimelineModel.TimelineModelFilter.ExclusiveNameFilter;
    _startTime: number;
    _endTime: number;
    splitWidget: UI.SplitWidget.SplitWidget;
    detailsView: UI.Widget.Widget;
    _searchableView: UI.SearchableView.SearchableView;
    _currentThreadSetting?: Common.Settings.Setting<any>;
    _lastSelectedNode?: TimelineModel.TimelineProfileTree.Node | null;
    _textFilterUI?: UI.Toolbar.ToolbarInput;
    _root?: TimelineModel.TimelineProfileTree.Node;
    _currentResult?: any;
    constructor();
    static eventNameForSorting(event: SDK.TracingModel.Event): string;
    setSearchableView(searchableView: UI.SearchableView.SearchableView): void;
    setModel(model: PerformanceModel | null, track: TimelineModel.TimelineModel.Track | null): void;
    getToolbarInputAccessiblePlaceHolder(): string;
    model(): PerformanceModel | null;
    init(): void;
    lastSelectedNode(): TimelineModel.TimelineProfileTree.Node | null | undefined;
    updateContents(selection: TimelineSelection): void;
    setRange(startTime: number, endTime: number): void;
    filters(): TimelineModel.TimelineModelFilter.TimelineModelFilter[];
    filtersWithoutTextFilter(): TimelineModel.TimelineModelFilter.TimelineModelFilter[];
    textFilter(): TimelineRegExp;
    _exposePercentages(): boolean;
    populateToolbar(toolbar: UI.Toolbar.Toolbar): void;
    _modelEvents(): SDK.TracingModel.Event[];
    _onHover(_node: TimelineModel.TimelineProfileTree.Node | null): void;
    _appendContextMenuItems(_contextMenu: UI.ContextMenu.ContextMenu, _node: TimelineModel.TimelineProfileTree.Node): void;
    _linkifyLocation(event: SDK.TracingModel.Event): Element | null;
    selectProfileNode(treeNode: TimelineModel.TimelineProfileTree.Node, suppressSelectedEvent: boolean): void;
    refreshTree(): void;
    _buildTree(): TimelineModel.TimelineProfileTree.Node;
    buildTopDownTree(doNotAggregate: boolean, groupIdCallback: ((arg0: SDK.TracingModel.Event) => string) | null): TimelineModel.TimelineProfileTree.Node;
    populateColumns(columns: DataGrid.DataGrid.ColumnDescriptor[]): void;
    _sortingChanged(): void;
    _onShowModeChanged(): void;
    _updateDetailsForSelection(): void;
    _showDetailsForNode(_node: TimelineModel.TimelineProfileTree.Node): boolean;
    _onMouseMove(event: Event): void;
    _onContextMenu(contextMenu: UI.ContextMenu.ContextMenu, eventGridNode: DataGrid.DataGrid.DataGridNode<GridNode>): void;
    dataGridNodeForTreeNode(treeNode: TimelineModel.TimelineProfileTree.Node): GridNode | null;
    searchCanceled(): void;
    performSearch(searchConfig: UI.SearchableView.SearchConfig, _shouldJump: boolean, _jumpBackwards?: boolean): void;
    jumpToNextSearchResult(): void;
    jumpToPreviousSearchResult(): void;
    supportsCaseSensitiveSearch(): boolean;
    supportsRegexSearch(): boolean;
}
export declare class GridNode extends DataGrid.SortableDataGrid.SortableDataGridNode<GridNode> {
    _populated: boolean;
    _profileNode: TimelineModel.TimelineProfileTree.Node;
    _treeView: TimelineTreeView;
    _grandTotalTime: number;
    _maxSelfTime: number;
    _maxTotalTime: number;
    _linkElement: Element | null;
    constructor(profileNode: TimelineModel.TimelineProfileTree.Node, grandTotalTime: number, maxSelfTime: number, maxTotalTime: number, treeView: TimelineTreeView);
    createCell(columnId: string): HTMLElement;
    _createNameCell(columnId: string): HTMLElement;
    _createValueCell(columnId: string): HTMLElement | null;
}
export declare class TreeGridNode extends GridNode {
    constructor(profileNode: TimelineModel.TimelineProfileTree.Node, grandTotalTime: number, maxSelfTime: number, maxTotalTime: number, treeView: TimelineTreeView);
    populate(): void;
    static readonly _gridNodeSymbol: unique symbol;
}
export declare class AggregatedTimelineTreeView extends TimelineTreeView {
    _groupBySetting: Common.Settings.Setting<any>;
    _stackView: TimelineStackView;
    _productByURLCache: Map<string, string>;
    _colorByURLCache: Map<string, string>;
    _executionContextNamesByOrigin: Map<any, any>;
    constructor();
    setModel(model: PerformanceModel | null, track: TimelineModel.TimelineModel.Track | null): void;
    updateContents(selection: TimelineSelection): void;
    _updateExtensionResolver(): void;
    _beautifyDomainName(this: AggregatedTimelineTreeView, name: string): string;
    _displayInfoForGroupNode(node: TimelineModel.TimelineProfileTree.Node): {
        name: string;
        color: string;
        icon: (Element | undefined);
    };
    populateToolbar(toolbar: UI.Toolbar.Toolbar): void;
    _buildHeaviestStack(treeNode: TimelineModel.TimelineProfileTree.Node): TimelineModel.TimelineProfileTree.Node[];
    _exposePercentages(): boolean;
    _onStackViewSelectionChanged(): void;
    _showDetailsForNode(node: TimelineModel.TimelineProfileTree.Node): boolean;
    _groupingFunction(groupBy: string): ((arg0: SDK.TracingModel.Event) => string) | null;
    _domainByEvent(groupSubdomains: boolean, event: SDK.TracingModel.Event): string;
    _appendContextMenuItems(contextMenu: UI.ContextMenu.ContextMenu, node: TimelineModel.TimelineProfileTree.Node): void;
    static _isExtensionInternalURL(url: string): boolean;
    static _isV8NativeURL(url: string): boolean;
    static readonly _extensionInternalPrefix = "extensions::";
    static readonly _v8NativePrefix = "native ";
}
export declare namespace AggregatedTimelineTreeView {
    enum GroupBy {
        None = "None",
        EventName = "EventName",
        Category = "Category",
        Domain = "Domain",
        Subdomain = "Subdomain",
        URL = "URL",
        Frame = "Frame"
    }
}
export declare class CallTreeTimelineTreeView extends AggregatedTimelineTreeView {
    constructor();
    getToolbarInputAccessiblePlaceHolder(): string;
    _buildTree(): TimelineModel.TimelineProfileTree.Node;
}
export declare class BottomUpTimelineTreeView extends AggregatedTimelineTreeView {
    constructor();
    getToolbarInputAccessiblePlaceHolder(): string;
    _buildTree(): TimelineModel.TimelineProfileTree.Node;
}
export declare class TimelineStackView extends UI.Widget.VBox {
    _treeView: TimelineTreeView;
    _dataGrid: DataGrid.ViewportDataGrid.ViewportDataGrid<unknown>;
    constructor(treeView: TimelineTreeView);
    setStack(stack: TimelineModel.TimelineProfileTree.Node[], selectedNode: TimelineModel.TimelineProfileTree.Node): void;
    selectedTreeNode(): TimelineModel.TimelineProfileTree.Node | null;
    _onSelectionChanged(): void;
}
export declare namespace TimelineStackView {
    enum Events {
        SelectionChanged = "SelectionChanged"
    }
}
