// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2009 280 North Inc. All Rights Reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
// Bottom Up Profiling shows the entire callstack backwards:
// The root node is a representation of each individual function called, and each child of that node represents
// a reverse-callstack showing how many of those calls came from it. So, unlike top-down, the statistics in
// each child still represent the root node. We have to be particularly careful of recursion with this mode
// because a root node can represent itself AND an ancestor.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Platform from '../../core/platform/platform.js';
import { ProfileDataGridNode, ProfileDataGridTree } from './ProfileDataGrid.js';
export class BottomUpProfileDataGridNode extends ProfileDataGridNode {
    _remainingNodeInfos;
    constructor(profileNode, owningTree) {
        super(profileNode, owningTree, profileNode.parent !== null && Boolean(profileNode.parent.parent));
        this._remainingNodeInfos = [];
    }
    static _sharedPopulate(container) {
        if (container._remainingNodeInfos === undefined) {
            return;
        }
        const remainingNodeInfos = container._remainingNodeInfos;
        const count = remainingNodeInfos.length;
        for (let index = 0; index < count; ++index) {
            const nodeInfo = remainingNodeInfos[index];
            const ancestor = nodeInfo.ancestor;
            const focusNode = nodeInfo.focusNode;
            let child = container.findChild(ancestor);
            // If we already have this child, then merge the data together.
            if (child) {
                const totalAccountedFor = nodeInfo.totalAccountedFor;
                child.self += focusNode.self;
                if (!totalAccountedFor) {
                    child.total += focusNode.total;
                }
            }
            else {
                child = new BottomUpProfileDataGridNode(ancestor, container.tree);
                if (ancestor !== focusNode) {
                    // But the actual statistics from the "root" node (bottom of the callstack).
                    child.self = focusNode.self;
                    child.total = focusNode.total;
                }
                container.appendChild(child);
            }
            const parent = ancestor.parent;
            if (parent && parent.parent) {
                nodeInfo.ancestor = parent;
                if (!child._remainingNodeInfos) {
                    child._remainingNodeInfos = [];
                }
                child._remainingNodeInfos.push(nodeInfo);
            }
        }
        delete container._remainingNodeInfos;
    }
    _takePropertiesFromProfileDataGridNode(profileDataGridNode) {
        this.save();
        this.self = profileDataGridNode.self;
        this.total = profileDataGridNode.total;
    }
    /**
     * When focusing, we keep just the members of the callstack.
     */
    _keepOnlyChild(child) {
        this.save();
        this.removeChildren();
        this.appendChild(child);
    }
    _exclude(aCallUID) {
        if (this._remainingNodeInfos) {
            this.populate();
        }
        this.save();
        const children = this.children;
        let index = this.children.length;
        while (index--) {
            children[index]._exclude(aCallUID);
        }
        const child = this.childrenByCallUID.get(aCallUID);
        if (child) {
            this.merge(child, true);
        }
    }
    restore() {
        super.restore();
        if (!this.children.length) {
            this.setHasChildren(this._willHaveChildren(this.profileNode));
        }
    }
    merge(child, shouldAbsorb) {
        this.self -= child.self;
        super.merge(child, shouldAbsorb);
    }
    populateChildren() {
        BottomUpProfileDataGridNode._sharedPopulate(this);
    }
    _willHaveChildren(profileNode) {
        // In bottom up mode, our parents are our children since we display an inverted tree.
        // However, we don't want to show the very top parent since it is redundant.
        return Boolean(profileNode.parent && profileNode.parent.parent);
    }
}
export class BottomUpProfileDataGridTree extends ProfileDataGridTree {
    deepSearch;
    _remainingNodeInfos;
    constructor(formatter, searchableView, rootProfileNode, total) {
        super(formatter, searchableView, total);
        this.deepSearch = false;
        // Iterate each node in pre-order.
        let profileNodeUIDs = 0;
        const profileNodeGroups = [[], [rootProfileNode]];
        const visitedProfileNodesForCallUID = new Map();
        this._remainingNodeInfos = [];
        for (let profileNodeGroupIndex = 0; profileNodeGroupIndex < profileNodeGroups.length; ++profileNodeGroupIndex) {
            const parentProfileNodes = profileNodeGroups[profileNodeGroupIndex];
            const profileNodes = profileNodeGroups[++profileNodeGroupIndex];
            const count = profileNodes.length;
            const profileNodeUIDValues = new WeakMap();
            for (let index = 0; index < count; ++index) {
                const profileNode = profileNodes[index];
                if (!profileNodeUIDValues.get(profileNode)) {
                    profileNodeUIDValues.set(profileNode, ++profileNodeUIDs);
                }
                if (profileNode.parent) {
                    // The total time of this ancestor is accounted for if we're in any form of recursive cycle.
                    let visitedNodes = visitedProfileNodesForCallUID.get(profileNode.callUID);
                    let totalAccountedFor = false;
                    if (!visitedNodes) {
                        visitedNodes = new Set();
                        visitedProfileNodesForCallUID.set(profileNode.callUID, visitedNodes);
                    }
                    else {
                        // The total time for this node has already been accounted for iff one of it's parents has already been visited.
                        // We can do this check in this style because we are traversing the tree in pre-order.
                        const parentCount = parentProfileNodes.length;
                        for (let parentIndex = 0; parentIndex < parentCount; ++parentIndex) {
                            const parentUID = profileNodeUIDValues.get(parentProfileNodes[parentIndex]);
                            if (parentUID && visitedNodes.has(parentUID)) {
                                totalAccountedFor = true;
                                break;
                            }
                        }
                    }
                    const uid = profileNodeUIDValues.get(profileNode);
                    if (uid) {
                        visitedNodes.add(uid);
                    }
                    this._remainingNodeInfos.push({ ancestor: profileNode, focusNode: profileNode, totalAccountedFor: totalAccountedFor });
                }
                const children = profileNode.children;
                if (children.length) {
                    profileNodeGroups.push(parentProfileNodes.concat([profileNode]));
                    profileNodeGroups.push(children);
                }
            }
        }
        // Populate the top level nodes.
        ProfileDataGridNode.populate(this);
        return this;
    }
    /**
     * When focusing, we keep the entire callstack up to this ancestor.
     */
    focus(profileDataGridNode) {
        if (!profileDataGridNode) {
            return;
        }
        this.save();
        let currentNode = profileDataGridNode;
        let focusNode = profileDataGridNode;
        while (currentNode.parent && (currentNode instanceof BottomUpProfileDataGridNode)) {
            currentNode._takePropertiesFromProfileDataGridNode(profileDataGridNode);
            focusNode = currentNode;
            currentNode = currentNode.parent;
            if (currentNode instanceof BottomUpProfileDataGridNode) {
                currentNode._keepOnlyChild(focusNode);
            }
        }
        this.children = [focusNode];
        this.total = profileDataGridNode.total;
    }
    exclude(profileDataGridNode) {
        if (!profileDataGridNode) {
            return;
        }
        this.save();
        const excludedCallUID = profileDataGridNode.callUID;
        const excludedTopLevelChild = this.childrenByCallUID.get(excludedCallUID);
        // If we have a top level node that is excluded, get rid of it completely (not keeping children),
        // since bottom up data relies entirely on the root node.
        if (excludedTopLevelChild) {
            Platform.ArrayUtilities.removeElement(this.children, excludedTopLevelChild);
        }
        const children = this.children;
        const count = children.length;
        for (let index = 0; index < count; ++index) {
            children[index]._exclude(excludedCallUID);
        }
        if (this.lastComparator) {
            this.sort(this.lastComparator, true);
        }
    }
    populateChildren() {
        BottomUpProfileDataGridNode._sharedPopulate(this);
    }
}
//# sourceMappingURL=BottomUpProfileDataGrid.js.map