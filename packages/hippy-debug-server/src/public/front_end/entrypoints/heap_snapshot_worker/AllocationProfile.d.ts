import * as HeapSnapshotModel from '../../models/heap_snapshot_model/heap_snapshot_model.js';
export declare class AllocationProfile {
    _strings: any;
    _liveObjectStats: any;
    _nextNodeId: number;
    _functionInfos: FunctionAllocationInfo[];
    _idToNode: {
        [x: number]: BottomUpAllocationNode | null;
    };
    _idToTopDownNode: {
        [x: number]: TopDownAllocationNode;
    };
    _collapsedTopNodeIdToFunctionInfo: {
        [x: number]: FunctionAllocationInfo;
    };
    _traceTops: HeapSnapshotModel.HeapSnapshotModel.SerializedAllocationNode[] | null;
    _traceTree: TopDownAllocationNode;
    constructor(profile: any, liveObjectStats: any);
    _buildFunctionAllocationInfos(profile: any): void;
    _buildAllocationTree(profile: any, liveObjectStats: any): TopDownAllocationNode;
    serializeTraceTops(): HeapSnapshotModel.HeapSnapshotModel.SerializedAllocationNode[];
    serializeCallers(nodeId: number): HeapSnapshotModel.HeapSnapshotModel.AllocationNodeCallers;
    serializeAllocationStack(traceNodeId: number): HeapSnapshotModel.HeapSnapshotModel.AllocationStackFrame[];
    traceIds(allocationNodeId: number): number[];
    _ensureBottomUpNode(nodeId: number): BottomUpAllocationNode;
    _serializeCaller(node: BottomUpAllocationNode): HeapSnapshotModel.HeapSnapshotModel.SerializedAllocationNode;
    _serializeNode(nodeId: number, functionInfo: FunctionAllocationInfo, count: number, size: number, liveCount: number, liveSize: number, hasChildren: boolean): HeapSnapshotModel.HeapSnapshotModel.SerializedAllocationNode;
}
export declare class TopDownAllocationNode {
    id: number;
    functionInfo: FunctionAllocationInfo;
    allocationCount: number;
    allocationSize: number;
    liveCount: number;
    liveSize: number;
    parent: TopDownAllocationNode | null;
    children: TopDownAllocationNode[];
    constructor(id: number, functionInfo: FunctionAllocationInfo, count: number, size: number, liveCount: number, liveSize: number, parent: TopDownAllocationNode | null);
}
export declare class BottomUpAllocationNode {
    functionInfo: FunctionAllocationInfo;
    allocationCount: number;
    allocationSize: number;
    liveCount: number;
    liveSize: number;
    traceTopIds: number[];
    _callers: BottomUpAllocationNode[];
    constructor(functionInfo: FunctionAllocationInfo);
    addCaller(traceNode: TopDownAllocationNode): BottomUpAllocationNode;
    callers(): BottomUpAllocationNode[];
    hasCallers(): boolean;
}
export declare class FunctionAllocationInfo {
    functionName: string;
    scriptName: string;
    scriptId: number;
    line: number;
    column: number;
    totalCount: number;
    totalSize: number;
    totalLiveCount: number;
    totalLiveSize: number;
    _traceTops: TopDownAllocationNode[];
    _bottomUpTree?: BottomUpAllocationNode;
    constructor(functionName: string, scriptName: string, scriptId: number, line: number, column: number);
    addTraceTopNode(node: TopDownAllocationNode): void;
    bottomUpRoot(): BottomUpAllocationNode | null;
    _buildAllocationTraceTree(): void;
}
