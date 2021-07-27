import * as HeapSnapshotModel from '../../models/heap_snapshot_model/heap_snapshot_model.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import type * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import type { HeapSnapshotGridNode } from './HeapSnapshotGridNodes.js';
import { HeapSnapshotRetainingObjectNode, HeapSnapshotObjectNode } from './HeapSnapshotGridNodes.js';
import type { HeapSnapshotProxy } from './HeapSnapshotProxy.js';
import type { HeapProfileHeader } from './HeapSnapshotView.js';
import type { DataDisplayDelegate } from './ProfileHeader.js';
export declare class HeapSnapshotSortableDataGrid extends DataGrid.DataGrid.DataGridImpl<HeapSnapshotGridNode> {
    snapshot: HeapSnapshotProxy | null;
    selectedNode: HeapSnapshotGridNode | null;
    _heapProfilerModel: SDK.HeapProfilerModel.HeapProfilerModel | null;
    _dataDisplayDelegate: DataDisplayDelegate;
    _recursiveSortingDepth: number;
    _populatedAndSorted: boolean;
    _nameFilter: UI.Toolbar.ToolbarInput | null;
    _nodeFilter: HeapSnapshotModel.HeapSnapshotModel.NodeFilter | undefined;
    _lastSortColumnId?: string | null;
    _lastSortAscending?: boolean;
    constructor(heapProfilerModel: SDK.HeapProfilerModel.HeapProfilerModel | null, dataDisplayDelegate: DataDisplayDelegate, dataGridParameters: DataGrid.DataGrid.Parameters);
    setDataSource(_snapshot: HeapSnapshotProxy, _nodeIndex: number): Promise<void>;
    _isFilteredOut(node: HeapSnapshotGridNode): boolean;
    heapProfilerModel(): SDK.HeapProfilerModel.HeapProfilerModel | null;
    dataDisplayDelegate(): DataDisplayDelegate;
    nodeFilter(): HeapSnapshotModel.HeapSnapshotModel.NodeFilter | undefined;
    setNameFilter(nameFilter: UI.Toolbar.ToolbarInput): void;
    defaultPopulateCount(): number;
    _disposeAllNodes(): void;
    wasShown(): void;
    _sortingComplete(): void;
    willHide(): void;
    _populateContextMenu(contextMenu: UI.ContextMenu.ContextMenu, gridNode: DataGrid.DataGrid.DataGridNode<HeapSnapshotGridNode>): void;
    resetSortingCache(): void;
    topLevelNodes(): HeapSnapshotGridNode[];
    revealObjectByHeapSnapshotId(_heapSnapshotObjectId: string): Promise<HeapSnapshotGridNode | null>;
    resetNameFilter(): void;
    _onNameFilterChanged(): void;
    _deselectFilteredNodes(): void;
    _sortFields(_sortColumnId: string, _ascending: boolean): HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig;
    sortingChanged(): void;
    _performSorting(sortFunction: (arg0: DataGrid.DataGrid.DataGridNode<HeapSnapshotGridNode>, arg1: DataGrid.DataGrid.DataGridNode<HeapSnapshotGridNode>) => number): void;
    appendChildAfterSorting(child: HeapSnapshotGridNode): void;
    recursiveSortingEnter(): void;
    recursiveSortingLeave(): void;
    updateVisibleNodes(_force: boolean): void;
    allChildren(parent: DataGrid.DataGrid.DataGridNode<HeapSnapshotGridNode>): DataGrid.DataGrid.DataGridNode<HeapSnapshotGridNode>[];
    insertChild(parent: HeapSnapshotGridNode, node: HeapSnapshotGridNode, index: number): void;
    removeChildByIndex(parent: HeapSnapshotGridNode, index: number): void;
    removeAllChildren(parent: HeapSnapshotGridNode): void;
}
export declare enum HeapSnapshotSortableDataGridEvents {
    ContentShown = "ContentShown",
    SortingComplete = "SortingComplete"
}
export declare class HeapSnapshotViewportDataGrid extends HeapSnapshotSortableDataGrid {
    _topPaddingHeight: number;
    _bottomPaddingHeight: number;
    selectedNode: HeapSnapshotGridNode | null;
    _scrollToResolveCallback?: (() => void) | null;
    constructor(heapProfilerModel: SDK.HeapProfilerModel.HeapProfilerModel | null, dataDisplayDelegate: DataDisplayDelegate, dataGridParameters: DataGrid.DataGrid.Parameters);
    topLevelNodes(): HeapSnapshotGridNode[];
    appendChildAfterSorting(_child: HeapSnapshotGridNode): void;
    updateVisibleNodes(force: boolean): void;
    _addVisibleNodes(parentNode: DataGrid.DataGrid.DataGridNode<HeapSnapshotGridNode>, topBound: number, bottomBound: number): number;
    _nodeHeight(node: HeapSnapshotGridNode): number;
    revealTreeNode(pathToReveal: HeapSnapshotGridNode[]): Promise<HeapSnapshotGridNode>;
    _calculateOffset(pathToReveal: HeapSnapshotGridNode[]): number;
    allChildren(parent: DataGrid.DataGrid.DataGridNode<HeapSnapshotGridNode>): HeapSnapshotGridNode[];
    appendNode(parent: DataGrid.DataGrid.DataGridNode<HeapSnapshotGridNode>, node: HeapSnapshotGridNode): void;
    insertChild(parent: HeapSnapshotGridNode, node: HeapSnapshotGridNode, index: number): void;
    removeChildByIndex(parent: HeapSnapshotGridNode, index: number): void;
    removeAllChildren(parent: HeapSnapshotGridNode): void;
    removeTopLevelNodes(): void;
    _isScrolledIntoView(element: HTMLElement): boolean;
    onResize(): void;
    _onScroll(_event: Event): void;
}
export declare class HeapSnapshotContainmentDataGrid extends HeapSnapshotSortableDataGrid {
    constructor(heapProfilerModel: SDK.HeapProfilerModel.HeapProfilerModel | null, dataDisplayDelegate: DataDisplayDelegate, displayName: string, columns?: DataGrid.DataGrid.ColumnDescriptor[]);
    setDataSource(snapshot: HeapSnapshotProxy, nodeIndex: number): Promise<void>;
    _createRootNode(snapshot: HeapSnapshotProxy, node: HeapSnapshotModel.HeapSnapshotModel.Node): HeapSnapshotObjectNode;
    sortingChanged(): void;
}
export declare class HeapSnapshotRetainmentDataGrid extends HeapSnapshotContainmentDataGrid {
    constructor(heapProfilerModel: SDK.HeapProfilerModel.HeapProfilerModel | null, dataDisplayDelegate: DataDisplayDelegate);
    _createRootNode(snapshot: HeapSnapshotProxy, node: HeapSnapshotModel.HeapSnapshotModel.Node): HeapSnapshotRetainingObjectNode;
    _sortFields(sortColumn: string, sortAscending: boolean): HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig;
    reset(): void;
    setDataSource(snapshot: HeapSnapshotProxy, nodeIndex: number): Promise<void>;
}
export declare enum HeapSnapshotRetainmentDataGridEvents {
    ExpandRetainersComplete = "ExpandRetainersComplete"
}
export declare class HeapSnapshotConstructorsDataGrid extends HeapSnapshotViewportDataGrid {
    _profileIndex: number;
    _objectIdToSelect: string | null;
    _nextRequestedFilter: HeapSnapshotModel.HeapSnapshotModel.NodeFilter | null;
    _lastFilter?: HeapSnapshotModel.HeapSnapshotModel.NodeFilter | null;
    _filterInProgress?: HeapSnapshotModel.HeapSnapshotModel.NodeFilter | null;
    constructor(heapProfilerModel: SDK.HeapProfilerModel.HeapProfilerModel | null, dataDisplayDelegate: DataDisplayDelegate);
    _sortFields(sortColumn: string, sortAscending: boolean): HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig;
    revealObjectByHeapSnapshotId(id: string): Promise<HeapSnapshotGridNode | null>;
    clear(): void;
    setDataSource(snapshot: HeapSnapshotProxy, _nodeIndex: number): Promise<void>;
    setSelectionRange(minNodeId: number, maxNodeId: number): void;
    setAllocationNodeId(allocationNodeId: number): void;
    _aggregatesReceived(nodeFilter: HeapSnapshotModel.HeapSnapshotModel.NodeFilter, aggregates: {
        [x: string]: HeapSnapshotModel.HeapSnapshotModel.Aggregate;
    }): void;
    _populateChildren(maybeNodeFilter?: HeapSnapshotModel.HeapSnapshotModel.NodeFilter): Promise<void>;
    filterSelectIndexChanged(profiles: HeapProfileHeader[], profileIndex: number): void;
}
export declare class HeapSnapshotDiffDataGrid extends HeapSnapshotViewportDataGrid {
    baseSnapshot?: HeapSnapshotProxy;
    constructor(heapProfilerModel: SDK.HeapProfilerModel.HeapProfilerModel | null, dataDisplayDelegate: DataDisplayDelegate);
    defaultPopulateCount(): number;
    _sortFields(sortColumn: string, sortAscending: boolean): HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig;
    setDataSource(snapshot: HeapSnapshotProxy, _nodeIndex: number): Promise<void>;
    setBaseDataSource(baseSnapshot: HeapSnapshotProxy): void;
    _populateChildren(): Promise<void>;
}
export declare class AllocationDataGrid extends HeapSnapshotViewportDataGrid {
    _linkifier: Components.Linkifier.Linkifier;
    _topNodes?: HeapSnapshotModel.HeapSnapshotModel.SerializedAllocationNode[];
    constructor(heapProfilerModel: SDK.HeapProfilerModel.HeapProfilerModel | null, dataDisplayDelegate: DataDisplayDelegate);
    get linkifier(): Components.Linkifier.Linkifier;
    dispose(): void;
    setDataSource(snapshot: HeapSnapshotProxy, _nodeIndex: number): Promise<void>;
    _populateChildren(): void;
    sortingChanged(): void;
    createComparator(): (arg0: Object, arg1: Object) => number;
}
