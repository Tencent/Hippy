import * as SDK from '../../core/sdk/sdk.js';
import * as HeapSnapshotModel from '../../models/heap_snapshot_model/heap_snapshot_model.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as UI from '../../ui/legacy/legacy.js';
import type { ChildrenProvider } from './ChildrenProvider.js';
import type { AllocationDataGrid, HeapSnapshotConstructorsDataGrid, HeapSnapshotDiffDataGrid, HeapSnapshotSortableDataGrid } from './HeapSnapshotDataGrids.js';
import type { HeapSnapshotProviderProxy, HeapSnapshotProxy } from './HeapSnapshotProxy.js';
import type { DataDisplayDelegate } from './ProfileHeader.js';
export declare class HeapSnapshotGridNode extends DataGrid.DataGrid.DataGridNode<HeapSnapshotGridNode> {
    _dataGrid: HeapSnapshotSortableDataGrid;
    _instanceCount: number;
    _savedChildren: Map<number, HeapSnapshotGridNode>;
    _retrievedChildrenRanges: {
        from: number;
        to: number;
    }[];
    _providerObject: ChildrenProvider | null;
    _reachableFromWindow: boolean;
    _populated?: boolean;
    constructor(tree: HeapSnapshotSortableDataGrid, hasChildren: boolean);
    get name(): string | undefined;
    heapSnapshotDataGrid(): HeapSnapshotSortableDataGrid;
    createProvider(): ChildrenProvider;
    comparator(): HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig;
    _getHash(): number;
    _createChildNode(_item: HeapSnapshotModel.HeapSnapshotModel.Node | HeapSnapshotModel.HeapSnapshotModel.Edge): HeapSnapshotGridNode;
    retainersDataSource(): {
        snapshot: HeapSnapshotProxy;
        snapshotNodeIndex: number;
    } | null;
    _provider(): ChildrenProvider;
    createCell(columnId: string): HTMLElement;
    collapse(): void;
    expand(): void;
    dispose(): void;
    queryObjectContent(_heapProfilerModel: SDK.HeapProfilerModel.HeapProfilerModel, _objectGroupName: string): Promise<SDK.RemoteObject.RemoteObject>;
    tryQueryObjectContent(_heapProfilerModel: SDK.HeapProfilerModel.HeapProfilerModel, _objectGroupName: string): Promise<SDK.RemoteObject.RemoteObject | null>;
    populateContextMenu(_contextMenu: UI.ContextMenu.ContextMenu, _dataDisplayDelegate: DataDisplayDelegate, _heapProfilerModel: SDK.HeapProfilerModel.HeapProfilerModel | null): void;
    _toPercentString(num: number): string;
    _toUIDistance(distance: number): string;
    allChildren(): HeapSnapshotGridNode[];
    removeChildByIndex(index: number): void;
    childForPosition(nodePosition: number): HeapSnapshotGridNode | null;
    _createValueCell(columnId: string): HTMLElement;
    populate(): void;
    expandWithoutPopulate(): Promise<void>;
    _childHashForEntity(entity: HeapSnapshotModel.HeapSnapshotModel.Node | HeapSnapshotModel.HeapSnapshotModel.Edge): number;
    _populateChildren(fromPosition?: number | null, toPosition?: number | null): Promise<void>;
    _saveChildren(): void;
    sort(): Promise<void>;
}
export declare namespace HeapSnapshotGridNode {
    enum Events {
        PopulateComplete = "PopulateComplete"
    }
}
export declare abstract class HeapSnapshotGenericObjectNode extends HeapSnapshotGridNode {
    _referenceName?: string | null;
    _name: string | undefined;
    _type: string | undefined;
    _distance: number | undefined;
    _shallowSize: number | undefined;
    _retainedSize: number | undefined;
    snapshotNodeId: number | undefined;
    snapshotNodeIndex: number | undefined;
    detachedDOMTreeNode: boolean | undefined;
    linkElement?: Element;
    constructor(dataGrid: HeapSnapshotSortableDataGrid, node: HeapSnapshotModel.HeapSnapshotModel.Node);
    get name(): string | undefined;
    retainersDataSource(): {
        snapshot: HeapSnapshotProxy;
        snapshotNodeIndex: number;
    } | null;
    createCell(columnId: string): HTMLElement;
    _createObjectCell(): HTMLElement;
    _createObjectCellWithValue(valueStyle: string, value: string): HTMLElement;
    _prefixObjectCell(_div: Element): void;
    _appendSourceLocation(div: Element): Promise<void>;
    queryObjectContent(heapProfilerModel: SDK.HeapProfilerModel.HeapProfilerModel, objectGroupName: string): Promise<SDK.RemoteObject.RemoteObject>;
    tryQueryObjectContent(heapProfilerModel: SDK.HeapProfilerModel.HeapProfilerModel, objectGroupName: string): Promise<SDK.RemoteObject.RemoteObject | null>;
    updateHasChildren(): Promise<void>;
    shortenWindowURL(fullName: string, hasObjectId: boolean): string;
    populateContextMenu(contextMenu: UI.ContextMenu.ContextMenu, dataDisplayDelegate: DataDisplayDelegate, heapProfilerModel: SDK.HeapProfilerModel.HeapProfilerModel | null): void;
}
export declare class HeapSnapshotObjectNode extends HeapSnapshotGenericObjectNode {
    _referenceName: string;
    _referenceType: string;
    _edgeIndex: number;
    _snapshot: HeapSnapshotProxy;
    _parentObjectNode: HeapSnapshotObjectNode | null;
    _cycledWithAncestorGridNode: HeapSnapshotObjectNode | null;
    constructor(dataGrid: HeapSnapshotSortableDataGrid, snapshot: HeapSnapshotProxy, edge: HeapSnapshotModel.HeapSnapshotModel.Edge, parentObjectNode: HeapSnapshotObjectNode | null);
    retainersDataSource(): {
        snapshot: HeapSnapshotProxy;
        snapshotNodeIndex: number;
    } | null;
    createProvider(): HeapSnapshotProviderProxy;
    _findAncestorWithSameSnapshotNodeId(): HeapSnapshotObjectNode | null;
    _createChildNode(item: HeapSnapshotModel.HeapSnapshotModel.Node | HeapSnapshotModel.HeapSnapshotModel.Edge): HeapSnapshotObjectNode;
    _getHash(): number;
    comparator(): HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig;
    _prefixObjectCell(div: Element): void;
    _edgeNodeSeparator(): string;
}
export declare class HeapSnapshotRetainingObjectNode extends HeapSnapshotObjectNode {
    constructor(dataGrid: HeapSnapshotSortableDataGrid, snapshot: HeapSnapshotProxy, edge: HeapSnapshotModel.HeapSnapshotModel.Edge, parentRetainingObjectNode: HeapSnapshotRetainingObjectNode | null);
    createProvider(): HeapSnapshotProviderProxy;
    _createChildNode(item: HeapSnapshotModel.HeapSnapshotModel.Node | HeapSnapshotModel.HeapSnapshotModel.Edge): HeapSnapshotRetainingObjectNode;
    _edgeNodeSeparator(): string;
    expand(): void;
    _expandRetainersChain(maxExpandLevels: number): void;
}
export declare class HeapSnapshotInstanceNode extends HeapSnapshotGenericObjectNode {
    _baseSnapshotOrSnapshot: HeapSnapshotProxy;
    _isDeletedNode: boolean;
    constructor(dataGrid: HeapSnapshotSortableDataGrid, snapshot: HeapSnapshotProxy, node: HeapSnapshotModel.HeapSnapshotModel.Node, isDeletedNode: boolean);
    retainersDataSource(): {
        snapshot: HeapSnapshotProxy;
        snapshotNodeIndex: number;
    } | null;
    createProvider(): HeapSnapshotProviderProxy;
    _createChildNode(item: HeapSnapshotModel.HeapSnapshotModel.Node | HeapSnapshotModel.HeapSnapshotModel.Edge): HeapSnapshotObjectNode;
    _getHash(): number;
    comparator(): HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig;
}
export declare class HeapSnapshotConstructorNode extends HeapSnapshotGridNode {
    _name: string;
    _nodeFilter: HeapSnapshotModel.HeapSnapshotModel.NodeFilter;
    _distance: number;
    _count: number;
    _shallowSize: number;
    _retainedSize: number;
    constructor(dataGrid: HeapSnapshotConstructorsDataGrid, className: string, aggregate: HeapSnapshotModel.HeapSnapshotModel.Aggregate, nodeFilter: HeapSnapshotModel.HeapSnapshotModel.NodeFilter);
    get name(): string | undefined;
    createProvider(): HeapSnapshotProviderProxy;
    populateNodeBySnapshotObjectId(snapshotObjectId: number): Promise<HeapSnapshotGridNode[]>;
    filteredOut(filterValue: string): boolean;
    createCell(columnId: string): HTMLElement;
    _createChildNode(item: HeapSnapshotModel.HeapSnapshotModel.Node | HeapSnapshotModel.HeapSnapshotModel.Edge): HeapSnapshotInstanceNode;
    comparator(): HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig;
}
export declare class HeapSnapshotDiffNodesProvider implements ChildrenProvider {
    _addedNodesProvider: HeapSnapshotProviderProxy;
    _deletedNodesProvider: HeapSnapshotProviderProxy;
    _addedCount: number;
    _removedCount: number;
    constructor(addedNodesProvider: HeapSnapshotProviderProxy, deletedNodesProvider: HeapSnapshotProviderProxy, addedCount: number, removedCount: number);
    dispose(): void;
    nodePosition(_snapshotObjectId: number): Promise<number>;
    isEmpty(): Promise<boolean>;
    serializeItemsRange(beginPosition: number, endPosition: number): Promise<HeapSnapshotModel.HeapSnapshotModel.ItemsRange>;
    sortAndRewind(comparator: HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig): Promise<void>;
}
export declare class HeapSnapshotDiffNode extends HeapSnapshotGridNode {
    _name: string;
    _addedCount: number;
    _removedCount: number;
    _countDelta: number;
    _addedSize: number;
    _removedSize: number;
    _sizeDelta: number;
    _deletedIndexes: number[];
    constructor(dataGrid: HeapSnapshotDiffDataGrid, className: string, diffForClass: HeapSnapshotModel.HeapSnapshotModel.DiffForClass);
    get name(): string | undefined;
    createProvider(): HeapSnapshotDiffNodesProvider;
    createCell(columnId: string): HTMLElement;
    _createChildNode(item: HeapSnapshotModel.HeapSnapshotModel.Node | HeapSnapshotModel.HeapSnapshotModel.Edge): HeapSnapshotInstanceNode;
    comparator(): HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig;
    filteredOut(filterValue: string): boolean;
    _signForDelta(delta: number): '' | '+' | '−';
}
export declare class AllocationGridNode extends HeapSnapshotGridNode {
    _populated: boolean;
    _allocationNode: HeapSnapshotModel.HeapSnapshotModel.SerializedAllocationNode;
    constructor(dataGrid: AllocationDataGrid, data: HeapSnapshotModel.HeapSnapshotModel.SerializedAllocationNode);
    populate(): void;
    _doPopulate(): Promise<void>;
    expand(): void;
    createCell(columnId: string): HTMLElement;
    allocationNodeId(): number;
}
