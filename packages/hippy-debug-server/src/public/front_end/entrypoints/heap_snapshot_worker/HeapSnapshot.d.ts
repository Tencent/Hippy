import * as HeapSnapshotModel from '../../models/heap_snapshot_model/heap_snapshot_model.js';
import { AllocationProfile } from './AllocationProfile.js';
import type { HeapSnapshotWorkerDispatcher } from './HeapSnapshotWorkerDispatcher.js';
/**
 * @interface
 */
export interface HeapSnapshotItem {
    itemIndex(): number;
    serialize(): Object;
}
export declare class HeapSnapshotEdge implements HeapSnapshotItem {
    _snapshot: HeapSnapshot;
    _edges: Uint32Array;
    edgeIndex: number;
    constructor(snapshot: HeapSnapshot, edgeIndex?: number);
    clone(): HeapSnapshotEdge;
    hasStringName(): boolean;
    name(): string;
    node(): HeapSnapshotNode;
    nodeIndex(): number;
    toString(): string;
    type(): string;
    itemIndex(): number;
    serialize(): HeapSnapshotModel.HeapSnapshotModel.Edge;
    rawType(): number;
    isInvisible(): boolean;
    isWeak(): boolean;
}
/**
 * @interface
 */
export interface HeapSnapshotItemIterator {
    hasNext(): boolean;
    item(): HeapSnapshotItem;
    next(): void;
}
/**
 * @interface
 */
export interface HeapSnapshotItemIndexProvider {
    itemForIndex(newIndex: number): HeapSnapshotItem;
}
export declare class HeapSnapshotNodeIndexProvider implements HeapSnapshotItemIndexProvider {
    _node: HeapSnapshotNode;
    constructor(snapshot: HeapSnapshot);
    itemForIndex(index: number): HeapSnapshotNode;
}
export declare class HeapSnapshotEdgeIndexProvider implements HeapSnapshotItemIndexProvider {
    _edge: JSHeapSnapshotEdge;
    constructor(snapshot: HeapSnapshot);
    itemForIndex(index: number): HeapSnapshotEdge;
}
export declare class HeapSnapshotRetainerEdgeIndexProvider implements HeapSnapshotItemIndexProvider {
    _retainerEdge: JSHeapSnapshotRetainerEdge;
    constructor(snapshot: HeapSnapshot);
    itemForIndex(index: number): HeapSnapshotRetainerEdge;
}
export declare class HeapSnapshotEdgeIterator implements HeapSnapshotItemIterator {
    _sourceNode: HeapSnapshotNode;
    edge: JSHeapSnapshotEdge;
    constructor(node: HeapSnapshotNode);
    hasNext(): boolean;
    item(): HeapSnapshotEdge;
    next(): void;
}
export declare class HeapSnapshotRetainerEdge implements HeapSnapshotItem {
    _snapshot: HeapSnapshot;
    _retainerIndex: number;
    _globalEdgeIndex: number;
    _retainingNodeIndex?: number;
    _edgeInstance?: JSHeapSnapshotEdge | null;
    _nodeInstance?: HeapSnapshotNode | null;
    constructor(snapshot: HeapSnapshot, retainerIndex: number);
    clone(): HeapSnapshotRetainerEdge;
    hasStringName(): boolean;
    name(): string;
    node(): HeapSnapshotNode;
    nodeIndex(): number;
    retainerIndex(): number;
    setRetainerIndex(retainerIndex: number): void;
    set edgeIndex(edgeIndex: number);
    _node(): HeapSnapshotNode;
    _edge(): JSHeapSnapshotEdge;
    toString(): string;
    itemIndex(): number;
    serialize(): HeapSnapshotModel.HeapSnapshotModel.Edge;
    type(): string;
}
export declare class HeapSnapshotRetainerEdgeIterator implements HeapSnapshotItemIterator {
    _retainersEnd: number;
    retainer: JSHeapSnapshotRetainerEdge;
    constructor(retainedNode: HeapSnapshotNode);
    hasNext(): boolean;
    item(): HeapSnapshotRetainerEdge;
    next(): void;
}
export declare class HeapSnapshotNode implements HeapSnapshotItem {
    _snapshot: HeapSnapshot;
    nodeIndex: number;
    constructor(snapshot: HeapSnapshot, nodeIndex?: number);
    distance(): number;
    className(): string;
    classIndex(): number;
    dominatorIndex(): number;
    edges(): HeapSnapshotEdgeIterator;
    edgesCount(): number;
    id(): number;
    rawName(): string;
    isRoot(): boolean;
    isUserRoot(): boolean;
    isHidden(): boolean;
    isArray(): boolean;
    isDocumentDOMTreesRoot(): boolean;
    name(): string;
    retainedSize(): number;
    retainers(): HeapSnapshotRetainerEdgeIterator;
    retainersCount(): number;
    selfSize(): number;
    type(): string;
    traceNodeId(): number;
    itemIndex(): number;
    serialize(): HeapSnapshotModel.HeapSnapshotModel.Node;
    _name(): number;
    edgeIndexesStart(): number;
    edgeIndexesEnd(): number;
    ordinal(): number;
    _nextNodeIndex(): number;
    rawType(): number;
}
export declare class HeapSnapshotNodeIterator implements HeapSnapshotItemIterator {
    node: HeapSnapshotNode;
    _nodesLength: number;
    constructor(node: HeapSnapshotNode);
    hasNext(): boolean;
    item(): HeapSnapshotNode;
    next(): void;
}
export declare class HeapSnapshotIndexRangeIterator implements HeapSnapshotItemIterator {
    _itemProvider: HeapSnapshotItemIndexProvider;
    _indexes: number[] | Uint32Array;
    _position: number;
    constructor(itemProvider: HeapSnapshotItemIndexProvider, indexes: number[] | Uint32Array);
    hasNext(): boolean;
    item(): HeapSnapshotItem;
    next(): void;
}
export declare class HeapSnapshotFilteredIterator implements HeapSnapshotItemIterator {
    _iterator: HeapSnapshotItemIterator;
    _filter: ((arg0: HeapSnapshotItem) => boolean) | undefined;
    constructor(iterator: HeapSnapshotItemIterator, filter?: ((arg0: HeapSnapshotItem) => boolean));
    hasNext(): boolean;
    item(): HeapSnapshotItem;
    next(): void;
    _skipFilteredItems(): void;
}
export declare class HeapSnapshotProgress {
    _dispatcher: HeapSnapshotWorkerDispatcher | undefined;
    constructor(dispatcher?: HeapSnapshotWorkerDispatcher);
    updateStatus(status: string): void;
    updateProgress(title: string, value: number, total: number): void;
    reportProblem(error: string): void;
    _sendUpdateEvent(serializedText: string): void;
}
export declare class HeapSnapshotProblemReport {
    _errors: string[];
    constructor(title: string);
    addError(error: string): void;
    toString(): string;
}
export interface Profile {
    root_index: number;
    nodes: Uint32Array;
    edges: Uint32Array;
    snapshot: HeapSnapshotHeader;
    samples: number[];
    strings: string[];
    locations: number[];
    trace_function_infos: Uint32Array;
    trace_tree: Object;
}
export declare abstract class HeapSnapshot {
    nodes: Uint32Array;
    containmentEdges: Uint32Array;
    _metaNode: HeapSnapshotMetainfo;
    _rawSamples: number[];
    _samples: HeapSnapshotModel.HeapSnapshotModel.Samples | null;
    strings: string[];
    _locations: number[];
    _progress: HeapSnapshotProgress;
    _noDistance: number;
    _rootNodeIndex: number;
    _snapshotDiffs: {
        [x: string]: {
            [x: string]: HeapSnapshotModel.HeapSnapshotModel.Diff;
        };
    };
    _aggregatesForDiff: {
        [x: string]: HeapSnapshotModel.HeapSnapshotModel.AggregateForDiff;
    };
    _aggregates: {
        [x: string]: {
            [x: string]: AggregatedInfo;
        };
    };
    _aggregatesSortedFlags: {
        [x: string]: boolean;
    };
    _profile: Profile;
    _nodeTypeOffset: number;
    _nodeNameOffset: number;
    _nodeIdOffset: number;
    _nodeSelfSizeOffset: number;
    _nodeEdgeCountOffset: number;
    _nodeTraceNodeIdOffset: number;
    _nodeFieldCount: number;
    _nodeTypes: string[];
    _nodeArrayType: number;
    _nodeHiddenType: number;
    _nodeObjectType: number;
    _nodeNativeType: number;
    _nodeConsStringType: number;
    _nodeSlicedStringType: number;
    _nodeCodeType: number;
    _nodeSyntheticType: number;
    _edgeFieldsCount: number;
    _edgeTypeOffset: number;
    _edgeNameOffset: number;
    _edgeToNodeOffset: number;
    _edgeTypes: string[];
    _edgeElementType: number;
    _edgeHiddenType: number;
    _edgeInternalType: number;
    _edgeShortcutType: number;
    _edgeWeakType: number;
    _edgeInvisibleType: number;
    _locationIndexOffset: number;
    _locationScriptIdOffset: number;
    _locationLineOffset: number;
    _locationColumnOffset: number;
    _locationFieldCount: number;
    nodeCount: number;
    _edgeCount: number;
    _retainedSizes: Float64Array;
    _firstEdgeIndexes: Uint32Array;
    _retainingNodes: Uint32Array;
    _retainingEdges: Uint32Array;
    _firstRetainerIndex: Uint32Array;
    _nodeDistances: Int32Array;
    _firstDominatedNodeIndex: Uint32Array;
    _dominatedNodes: Uint32Array;
    _dominatorsTree: Uint32Array;
    _allocationProfile: AllocationProfile;
    _nodeDetachednessOffset: number;
    _locationMap: Map<number, HeapSnapshotModel.HeapSnapshotModel.Location>;
    _lazyStringCache: {
        [x: string]: string;
    };
    constructor(profile: Profile, progress: HeapSnapshotProgress);
    initialize(): void;
    _buildEdgeIndexes(): void;
    _buildRetainers(): void;
    abstract createNode(_nodeIndex?: number): HeapSnapshotNode;
    abstract createEdge(_edgeIndex: number): JSHeapSnapshotEdge;
    abstract createRetainingEdge(_retainerIndex: number): JSHeapSnapshotRetainerEdge;
    _allNodes(): HeapSnapshotNodeIterator;
    rootNode(): HeapSnapshotNode;
    get rootNodeIndex(): number;
    get totalSize(): number;
    _getDominatedIndex(nodeIndex: number): number;
    _createFilter(nodeFilter: HeapSnapshotModel.HeapSnapshotModel.NodeFilter): ((arg0: HeapSnapshotNode) => boolean) | undefined;
    search(searchConfig: HeapSnapshotModel.HeapSnapshotModel.SearchConfig, nodeFilter: HeapSnapshotModel.HeapSnapshotModel.NodeFilter): number[];
    aggregatesWithFilter(nodeFilter: HeapSnapshotModel.HeapSnapshotModel.NodeFilter): {
        [x: string]: HeapSnapshotModel.HeapSnapshotModel.Aggregate;
    };
    _createNodeIdFilter(minNodeId: number, maxNodeId: number): (arg0: HeapSnapshotNode) => boolean;
    _createAllocationStackFilter(bottomUpAllocationNodeId: number): ((arg0: HeapSnapshotNode) => boolean) | undefined;
    aggregates(sortedIndexes: boolean, key?: string, filter?: ((arg0: HeapSnapshotNode) => boolean)): {
        [x: string]: HeapSnapshotModel.HeapSnapshotModel.Aggregate;
    };
    allocationTracesTops(): HeapSnapshotModel.HeapSnapshotModel.SerializedAllocationNode[];
    allocationNodeCallers(nodeId: number): HeapSnapshotModel.HeapSnapshotModel.AllocationNodeCallers;
    allocationStack(nodeIndex: number): HeapSnapshotModel.HeapSnapshotModel.AllocationStackFrame[] | null;
    aggregatesForDiff(): {
        [x: string]: HeapSnapshotModel.HeapSnapshotModel.AggregateForDiff;
    };
    isUserRoot(_node: HeapSnapshotNode): boolean;
    calculateDistances(filter?: ((arg0: HeapSnapshotNode, arg1: HeapSnapshotEdge) => boolean)): void;
    _bfs(nodesToVisit: Uint32Array, nodesToVisitLength: number, distances: Int32Array, filter?: ((arg0: HeapSnapshotNode, arg1: HeapSnapshotEdge) => boolean)): void;
    _buildAggregates(filter?: ((arg0: HeapSnapshotNode) => boolean)): {
        aggregatesByClassName: {
            [x: string]: AggregatedInfo;
        };
        aggregatesByClassIndex: {
            [x: number]: AggregatedInfo;
        };
    };
    _calculateClassesRetainedSize(aggregates: {
        [x: number]: AggregatedInfo;
    }, filter?: ((arg0: HeapSnapshotNode) => boolean)): void;
    _sortAggregateIndexes(aggregates: {
        [x: string]: AggregatedInfo;
    }): void;
    /**
     * The function checks is the edge should be considered during building
     * postorder iterator and dominator tree.
     */
    _isEssentialEdge(nodeIndex: number, edgeType: number): boolean;
    _buildPostOrderIndex(): {
        postOrderIndex2NodeOrdinal: Uint32Array;
        nodeOrdinal2PostOrderIndex: Uint32Array;
    };
    _hasOnlyWeakRetainers(nodeOrdinal: number): boolean;
    _buildDominatorTree(postOrderIndex2NodeOrdinal: Uint32Array, nodeOrdinal2PostOrderIndex: Uint32Array): Uint32Array;
    _calculateRetainedSizes(postOrderIndex2NodeOrdinal: Uint32Array): void;
    _buildDominatedNodes(): void;
    /**
     * Iterates children of a node.
     */
    _iterateFilteredChildren(nodeOrdinal: number, edgeFilterCallback: (arg0: number) => boolean, childCallback: (arg0: number) => void): void;
    /**
     * Adds a string to the snapshot.
     */
    _addString(string: string): number;
    /**
      * The phase propagates whether a node is attached or detached through the
      * graph and adjusts the low-level representation of nodes.
      *
      * State propagation:
      * 1. Any object reachable from an attached object is itself attached.
      * 2. Any object reachable from a detached object that is not already
      *    attached is considered detached.
      *
      * Representation:
      * - Name of any detached node is changed from "<Name>"" to
      *   "Detached <Name>".
      */
    _propagateDOMState(): void;
    _buildSamples(): void;
    _buildLocationMap(): void;
    getLocation(nodeIndex: number): HeapSnapshotModel.HeapSnapshotModel.Location | null;
    getSamples(): HeapSnapshotModel.HeapSnapshotModel.Samples | null;
    calculateFlags(): void;
    calculateStatistics(): void;
    userObjectsMapAndFlag(): {
        map: Uint32Array;
        flag: number;
    } | null;
    calculateSnapshotDiff(baseSnapshotId: string, baseSnapshotAggregates: {
        [x: string]: HeapSnapshotModel.HeapSnapshotModel.AggregateForDiff;
    }): {
        [x: string]: HeapSnapshotModel.HeapSnapshotModel.Diff;
    };
    _calculateDiffForClass(baseAggregate: HeapSnapshotModel.HeapSnapshotModel.AggregateForDiff, aggregate: HeapSnapshotModel.HeapSnapshotModel.Aggregate): HeapSnapshotModel.HeapSnapshotModel.Diff | null;
    _nodeForSnapshotObjectId(snapshotObjectId: number): HeapSnapshotNode | null;
    nodeClassName(snapshotObjectId: number): string | null;
    idsOfObjectsWithName(name: string): number[];
    createEdgesProvider(nodeIndex: number): HeapSnapshotEdgesProvider;
    createEdgesProviderForTest(nodeIndex: number, filter: ((arg0: HeapSnapshotEdge) => boolean) | null): HeapSnapshotEdgesProvider;
    retainingEdgesFilter(): ((arg0: HeapSnapshotEdge) => boolean) | null;
    containmentEdgesFilter(): ((arg0: HeapSnapshotEdge) => boolean) | null;
    createRetainingEdgesProvider(nodeIndex: number): HeapSnapshotEdgesProvider;
    createAddedNodesProvider(baseSnapshotId: string, className: string): HeapSnapshotNodesProvider;
    createDeletedNodesProvider(nodeIndexes: number[]): HeapSnapshotNodesProvider;
    createNodesProviderForClass(className: string, nodeFilter: HeapSnapshotModel.HeapSnapshotModel.NodeFilter): HeapSnapshotNodesProvider;
    _maxJsNodeId(): number;
    updateStaticData(): HeapSnapshotModel.HeapSnapshotModel.StaticData;
}
declare class HeapSnapshotMetainfo {
    location_fields: string[];
    node_fields: string[];
    node_types: string[][];
    edge_fields: string[];
    edge_types: string[][];
    trace_function_info_fields: string[];
    trace_node_fields: string[];
    sample_fields: string[];
    type_strings: {
        [key: string]: string;
    };
}
export declare class HeapSnapshotHeader {
    title: string;
    meta: HeapSnapshotMetainfo;
    node_count: number;
    edge_count: number;
    trace_function_count: number;
    root_index: number;
    constructor();
}
export declare abstract class HeapSnapshotItemProvider {
    _iterator: HeapSnapshotItemIterator;
    _indexProvider: HeapSnapshotItemIndexProvider;
    _isEmpty: boolean;
    _iterationOrder: number[] | null;
    _currentComparator: HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig | null;
    _sortedPrefixLength: number;
    _sortedSuffixLength: number;
    constructor(iterator: HeapSnapshotItemIterator, indexProvider: HeapSnapshotItemIndexProvider);
    _createIterationOrder(): void;
    isEmpty(): boolean;
    serializeItemsRange(begin: number, end: number): HeapSnapshotModel.HeapSnapshotModel.ItemsRange;
    sortAndRewind(comparator: HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig): void;
    abstract sort(comparator: HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig, leftBound: number, rightBound: number, windowLeft: number, windowRight: number): void;
}
export declare class HeapSnapshotEdgesProvider extends HeapSnapshotItemProvider {
    snapshot: HeapSnapshot;
    constructor(snapshot: HeapSnapshot, filter: ((arg0: HeapSnapshotEdge) => boolean) | null, edgesIter: HeapSnapshotEdgeIterator | HeapSnapshotRetainerEdgeIterator, indexProvider: HeapSnapshotItemIndexProvider);
    sort(comparator: HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig, leftBound: number, rightBound: number, windowLeft: number, windowRight: number): void;
}
export declare class HeapSnapshotNodesProvider extends HeapSnapshotItemProvider {
    snapshot: HeapSnapshot;
    constructor(snapshot: HeapSnapshot, nodeIndexes: number[] | Uint32Array);
    nodePosition(snapshotObjectId: number): number;
    _buildCompareFunction(comparator: HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig): (arg0: number, arg1: number) => number;
    sort(comparator: HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig, leftBound: number, rightBound: number, windowLeft: number, windowRight: number): void;
}
export declare class JSHeapSnapshot extends HeapSnapshot {
    _nodeFlags: {
        canBeQueried: number;
        detachedDOMTreeNode: number;
        pageObject: number;
    };
    _lazyStringCache: {};
    _flags: Uint32Array;
    _statistics?: HeapSnapshotModel.HeapSnapshotModel.Statistics;
    constructor(profile: Profile, progress: HeapSnapshotProgress);
    createNode(nodeIndex?: number): JSHeapSnapshotNode;
    createEdge(edgeIndex: number): JSHeapSnapshotEdge;
    createRetainingEdge(retainerIndex: number): JSHeapSnapshotRetainerEdge;
    containmentEdgesFilter(): (arg0: HeapSnapshotEdge) => boolean;
    retainingEdgesFilter(): (arg0: HeapSnapshotEdge) => boolean;
    calculateFlags(): void;
    calculateDistances(): void;
    isUserRoot(node: HeapSnapshotNode): boolean;
    userObjectsMapAndFlag(): {
        map: Uint32Array;
        flag: number;
    } | null;
    _flagsOfNode(node: HeapSnapshotNode): number;
    _markDetachedDOMTreeNodes(): void;
    _markQueriableHeapObjects(): void;
    _markPageOwnedNodes(): void;
    calculateStatistics(): void;
    _calculateArraySize(node: HeapSnapshotNode): number;
    getStatistics(): HeapSnapshotModel.HeapSnapshotModel.Statistics;
}
export declare class JSHeapSnapshotNode extends HeapSnapshotNode {
    constructor(snapshot: JSHeapSnapshot, nodeIndex?: number);
    canBeQueried(): boolean;
    rawName(): string;
    name(): string;
    _consStringName(): string;
    className(): string;
    classIndex(): number;
    id(): number;
    isHidden(): boolean;
    isArray(): boolean;
    isSynthetic(): boolean;
    isUserRoot(): boolean;
    isDocumentDOMTreesRoot(): boolean;
    serialize(): HeapSnapshotModel.HeapSnapshotModel.Node;
}
export declare class JSHeapSnapshotEdge extends HeapSnapshotEdge {
    constructor(snapshot: JSHeapSnapshot, edgeIndex?: number);
    clone(): JSHeapSnapshotEdge;
    hasStringName(): boolean;
    isElement(): boolean;
    isHidden(): boolean;
    isWeak(): boolean;
    isInternal(): boolean;
    isInvisible(): boolean;
    isShortcut(): boolean;
    name(): string;
    toString(): string;
    _hasStringName(): boolean;
    _name(): string | number;
    _nameOrIndex(): number;
    rawType(): number;
}
export declare class JSHeapSnapshotRetainerEdge extends HeapSnapshotRetainerEdge {
    constructor(snapshot: JSHeapSnapshot, retainerIndex: number);
    clone(): JSHeapSnapshotRetainerEdge;
    isHidden(): boolean;
    isInternal(): boolean;
    isInvisible(): boolean;
    isShortcut(): boolean;
    isWeak(): boolean;
}
export interface AggregatedInfo {
    count: number;
    distance: number;
    self: number;
    maxRet: number;
    name: string | null;
    idxs: number[];
}
export {};
