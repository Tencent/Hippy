/*
 * Copyright (C) 2014 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable rulesdir/no_underscored_properties */
export const HeapSnapshotProgressEvent = {
    Update: 'ProgressUpdate',
    BrokenSnapshot: 'BrokenSnapshot',
};
export const baseSystemDistance = 100000000;
export class AllocationNodeCallers {
    nodesWithSingleCaller;
    branchingCallers;
    constructor(nodesWithSingleCaller, branchingCallers) {
        this.nodesWithSingleCaller = nodesWithSingleCaller;
        this.branchingCallers = branchingCallers;
    }
}
export class SerializedAllocationNode {
    id;
    name;
    scriptName;
    scriptId;
    line;
    column;
    count;
    size;
    liveCount;
    liveSize;
    hasChildren;
    constructor(nodeId, functionName, scriptName, scriptId, line, column, count, size, liveCount, liveSize, hasChildren) {
        this.id = nodeId;
        this.name = functionName;
        this.scriptName = scriptName;
        this.scriptId = scriptId;
        this.line = line;
        this.column = column;
        this.count = count;
        this.size = size;
        this.liveCount = liveCount;
        this.liveSize = liveSize;
        this.hasChildren = hasChildren;
    }
}
export class AllocationStackFrame {
    functionName;
    scriptName;
    scriptId;
    line;
    column;
    constructor(functionName, scriptName, scriptId, line, column) {
        this.functionName = functionName;
        this.scriptName = scriptName;
        this.scriptId = scriptId;
        this.line = line;
        this.column = column;
    }
}
export class Node {
    id;
    name;
    distance;
    nodeIndex;
    retainedSize;
    selfSize;
    type;
    canBeQueried;
    detachedDOMTreeNode;
    isAddedNotRemoved;
    constructor(id, name, distance, nodeIndex, retainedSize, selfSize, type) {
        this.id = id;
        this.name = name;
        this.distance = distance;
        this.nodeIndex = nodeIndex;
        this.retainedSize = retainedSize;
        this.selfSize = selfSize;
        this.type = type;
        this.canBeQueried = false;
        this.detachedDOMTreeNode = false;
        this.isAddedNotRemoved = null;
    }
}
export class Edge {
    name;
    node;
    type;
    edgeIndex;
    isAddedNotRemoved;
    constructor(name, node, type, edgeIndex) {
        this.name = name;
        this.node = node;
        this.type = type;
        this.edgeIndex = edgeIndex;
        this.isAddedNotRemoved = null;
    }
}
export class Aggregate {
    count;
    distance;
    self;
    maxRet;
    type;
    name;
    idxs;
    constructor() {
    }
}
export class AggregateForDiff {
    indexes;
    ids;
    selfSizes;
    constructor() {
        this.indexes = [];
        this.ids = [];
        this.selfSizes = [];
    }
}
export class Diff {
    addedCount;
    removedCount;
    addedSize;
    removedSize;
    deletedIndexes;
    addedIndexes;
    countDelta;
    sizeDelta;
    constructor() {
        this.addedCount = 0;
        this.removedCount = 0;
        this.addedSize = 0;
        this.removedSize = 0;
        this.deletedIndexes = [];
        this.addedIndexes = [];
    }
}
export class DiffForClass {
    addedCount;
    removedCount;
    addedSize;
    removedSize;
    deletedIndexes;
    addedIndexes;
    countDelta;
    sizeDelta;
    constructor() {
    }
}
export class ComparatorConfig {
    fieldName1;
    ascending1;
    fieldName2;
    ascending2;
    constructor(fieldName1, ascending1, fieldName2, ascending2) {
        this.fieldName1 = fieldName1;
        this.ascending1 = ascending1;
        this.fieldName2 = fieldName2;
        this.ascending2 = ascending2;
    }
}
export class WorkerCommand {
    callId;
    disposition;
    objectId;
    newObjectId;
    methodName;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    methodArguments;
    source;
    constructor() {
    }
}
export class ItemsRange {
    startPosition;
    endPosition;
    totalLength;
    items;
    constructor(startPosition, endPosition, totalLength, items) {
        this.startPosition = startPosition;
        this.endPosition = endPosition;
        this.totalLength = totalLength;
        this.items = items;
    }
}
export class StaticData {
    nodeCount;
    rootNodeIndex;
    totalSize;
    maxJSObjectId;
    constructor(nodeCount, rootNodeIndex, totalSize, maxJSObjectId) {
        this.nodeCount = nodeCount;
        this.rootNodeIndex = rootNodeIndex;
        this.totalSize = totalSize;
        this.maxJSObjectId = maxJSObjectId;
    }
}
export class Statistics {
    total;
    v8heap;
    native;
    code;
    jsArrays;
    strings;
    system;
    constructor() {
    }
}
export class NodeFilter {
    minNodeId;
    maxNodeId;
    allocationNodeId;
    constructor(minNodeId, maxNodeId) {
        this.minNodeId = minNodeId;
        this.maxNodeId = maxNodeId;
    }
    equals(o) {
        return this.minNodeId === o.minNodeId && this.maxNodeId === o.maxNodeId &&
            this.allocationNodeId === o.allocationNodeId;
    }
}
export class SearchConfig {
    query;
    caseSensitive;
    isRegex;
    shouldJump;
    jumpBackward;
    constructor(query, caseSensitive, isRegex, shouldJump, jumpBackward) {
        this.query = query;
        this.caseSensitive = caseSensitive;
        this.isRegex = isRegex;
        this.shouldJump = shouldJump;
        this.jumpBackward = jumpBackward;
    }
    toSearchRegex(_global) {
        throw new Error('Unsupported operation on search config');
    }
}
export class Samples {
    timestamps;
    lastAssignedIds;
    sizes;
    constructor(timestamps, lastAssignedIds, sizes) {
        this.timestamps = timestamps;
        this.lastAssignedIds = lastAssignedIds;
        this.sizes = sizes;
    }
}
export class Location {
    scriptId;
    lineNumber;
    columnNumber;
    constructor(scriptId, lineNumber, columnNumber) {
        this.scriptId = scriptId;
        this.lineNumber = lineNumber;
        this.columnNumber = columnNumber;
    }
}
//# sourceMappingURL=HeapSnapshotModel.js.map