export declare const HeapSnapshotProgressEvent: {
    Update: string;
    BrokenSnapshot: string;
};
export declare const baseSystemDistance = 100000000;
export declare class AllocationNodeCallers {
    nodesWithSingleCaller: SerializedAllocationNode[];
    branchingCallers: SerializedAllocationNode[];
    constructor(nodesWithSingleCaller: SerializedAllocationNode[], branchingCallers: SerializedAllocationNode[]);
}
export declare class SerializedAllocationNode {
    id: number;
    name: string;
    scriptName: string;
    scriptId: number;
    line: number;
    column: number;
    count: number;
    size: number;
    liveCount: number;
    liveSize: number;
    hasChildren: boolean;
    constructor(nodeId: number, functionName: string, scriptName: string, scriptId: number, line: number, column: number, count: number, size: number, liveCount: number, liveSize: number, hasChildren: boolean);
}
export declare class AllocationStackFrame {
    functionName: string;
    scriptName: string;
    scriptId: number;
    line: number;
    column: number;
    constructor(functionName: string, scriptName: string, scriptId: number, line: number, column: number);
}
export declare class Node {
    id: number;
    name: string;
    distance: number;
    nodeIndex: number;
    retainedSize: number;
    selfSize: number;
    type: string;
    canBeQueried: boolean;
    detachedDOMTreeNode: boolean;
    isAddedNotRemoved: boolean | null;
    constructor(id: number, name: string, distance: number, nodeIndex: number, retainedSize: number, selfSize: number, type: string);
}
export declare class Edge {
    name: string;
    node: Node;
    type: string;
    edgeIndex: number;
    isAddedNotRemoved: boolean | null;
    constructor(name: string, node: Node, type: string, edgeIndex: number);
}
export declare class Aggregate {
    count: number;
    distance: number;
    self: number;
    maxRet: number;
    type: number;
    name: string;
    idxs: number[];
    constructor();
}
export declare class AggregateForDiff {
    indexes: number[];
    ids: number[];
    selfSizes: number[];
    constructor();
}
export declare class Diff {
    addedCount: number;
    removedCount: number;
    addedSize: number;
    removedSize: number;
    deletedIndexes: number[];
    addedIndexes: number[];
    countDelta: number;
    sizeDelta: number;
    constructor();
}
export declare class DiffForClass {
    addedCount: number;
    removedCount: number;
    addedSize: number;
    removedSize: number;
    deletedIndexes: number[];
    addedIndexes: number[];
    countDelta: number;
    sizeDelta: number;
    constructor();
}
export declare class ComparatorConfig {
    fieldName1: string;
    ascending1: boolean;
    fieldName2: string;
    ascending2: boolean;
    constructor(fieldName1: string, ascending1: boolean, fieldName2: string, ascending2: boolean);
}
export declare class WorkerCommand {
    callId: number;
    disposition: string;
    objectId: number;
    newObjectId: number;
    methodName: string;
    methodArguments: any[];
    source: string;
    constructor();
}
export declare class ItemsRange {
    startPosition: number;
    endPosition: number;
    totalLength: number;
    items: (Node | Edge)[];
    constructor(startPosition: number, endPosition: number, totalLength: number, items: (Node | Edge)[]);
}
export declare class StaticData {
    nodeCount: number;
    rootNodeIndex: number;
    totalSize: number;
    maxJSObjectId: number;
    constructor(nodeCount: number, rootNodeIndex: number, totalSize: number, maxJSObjectId: number);
}
export declare class Statistics {
    total: number;
    v8heap: number;
    native: number;
    code: number;
    jsArrays: number;
    strings: number;
    system: number;
    constructor();
}
export declare class NodeFilter {
    minNodeId: number | undefined;
    maxNodeId: number | undefined;
    allocationNodeId: number | undefined;
    constructor(minNodeId?: number, maxNodeId?: number);
    equals(o: NodeFilter): boolean;
}
export declare class SearchConfig {
    query: string;
    caseSensitive: boolean;
    isRegex: boolean;
    shouldJump: boolean;
    jumpBackward: boolean;
    constructor(query: string, caseSensitive: boolean, isRegex: boolean, shouldJump: boolean, jumpBackward: boolean);
    toSearchRegex(_global?: boolean): RegExp;
}
export declare class Samples {
    timestamps: number[];
    lastAssignedIds: number[];
    sizes: number[];
    constructor(timestamps: number[], lastAssignedIds: number[], sizes: number[]);
}
export declare class Location {
    scriptId: number;
    lineNumber: number;
    columnNumber: number;
    constructor(scriptId: number, lineNumber: number, columnNumber: number);
}
