// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
export class ProfileNode {
    callFrame;
    callUID;
    self;
    total;
    id;
    parent;
    children;
    depth;
    deoptReason;
    constructor(callFrame) {
        this.callFrame = callFrame;
        this.callUID = `${callFrame.functionName}@${callFrame.scriptId}:${callFrame.lineNumber}:${callFrame.columnNumber}`;
        this.self = 0;
        this.total = 0;
        this.id = 0;
        this.parent = null;
        this.children = [];
    }
    get functionName() {
        return this.callFrame.functionName;
    }
    get scriptId() {
        return this.callFrame.scriptId;
    }
    get url() {
        return this.callFrame.url;
    }
    get lineNumber() {
        return this.callFrame.lineNumber;
    }
    get columnNumber() {
        return this.callFrame.columnNumber;
    }
}
export class ProfileTreeModel {
    _target;
    root;
    total;
    maxDepth;
    constructor(target) {
        this._target = target || null;
    }
    initialize(root) {
        this.root = root;
        this._assignDepthsAndParents();
        this.total = this._calculateTotals(this.root);
    }
    _assignDepthsAndParents() {
        const root = this.root;
        root.depth = -1;
        root.parent = null;
        this.maxDepth = 0;
        const nodesToTraverse = [root];
        while (nodesToTraverse.length) {
            const parent = nodesToTraverse.pop();
            const depth = parent.depth + 1;
            if (depth > this.maxDepth) {
                this.maxDepth = depth;
            }
            const children = parent.children;
            for (const child of children) {
                child.depth = depth;
                child.parent = parent;
                if (child.children.length) {
                    nodesToTraverse.push(child);
                }
            }
        }
    }
    _calculateTotals(root) {
        const nodesToTraverse = [root];
        const dfsList = [];
        while (nodesToTraverse.length) {
            const node = nodesToTraverse.pop();
            node.total = node.self;
            dfsList.push(node);
            nodesToTraverse.push(...node.children);
        }
        while (dfsList.length > 1) {
            const node = dfsList.pop();
            if (node.parent) {
                node.parent.total += node.total;
            }
        }
        return root.total;
    }
    target() {
        return this._target;
    }
}
//# sourceMappingURL=ProfileTreeModel.js.map