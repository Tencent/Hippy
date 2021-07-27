// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { ProfileDataGridNode, ProfileDataGridTree } from './ProfileDataGrid.js';
export class TopDownProfileDataGridNode extends ProfileDataGridNode {
    _remainingChildren;
    constructor(profileNode, owningTree) {
        const hasChildren = Boolean(profileNode.children && profileNode.children.length);
        super(profileNode, owningTree, hasChildren);
        this._remainingChildren = profileNode.children;
    }
    static _sharedPopulate(container) {
        const children = container._remainingChildren;
        const childrenLength = children.length;
        for (let i = 0; i < childrenLength; ++i) {
            container.appendChild(new TopDownProfileDataGridNode(children[i], container.tree));
        }
        container._remainingChildren = [];
    }
    static _excludeRecursively(container, aCallUID) {
        if (container._remainingChildren.length > 0) {
            container.populate();
        }
        container.save();
        const children = container.children;
        let index = container.children.length;
        while (index--) {
            TopDownProfileDataGridNode._excludeRecursively(children[index], aCallUID);
        }
        const child = container.childrenByCallUID.get(aCallUID);
        if (child) {
            ProfileDataGridNode.merge(container, child, true);
        }
    }
    populateChildren() {
        TopDownProfileDataGridNode._sharedPopulate(this);
    }
}
export class TopDownProfileDataGridTree extends ProfileDataGridTree {
    _remainingChildren;
    constructor(formatter, searchableView, rootProfileNode, total) {
        super(formatter, searchableView, total);
        this._remainingChildren = rootProfileNode.children;
        ProfileDataGridNode.populate(this);
    }
    focus(profileDataGridNode) {
        if (!profileDataGridNode) {
            return;
        }
        this.save();
        profileDataGridNode.savePosition();
        this.children = [profileDataGridNode];
        this.total = profileDataGridNode.total;
    }
    exclude(profileDataGridNode) {
        if (!profileDataGridNode) {
            return;
        }
        this.save();
        TopDownProfileDataGridNode._excludeRecursively(this, profileDataGridNode.callUID);
        if (this.lastComparator) {
            this.sort(this.lastComparator, true);
        }
    }
    restore() {
        if (!this._savedChildren) {
            return;
        }
        this.children[0].restorePosition();
        super.restore();
    }
    populateChildren() {
        TopDownProfileDataGridNode._sharedPopulate(this);
    }
}
//# sourceMappingURL=TopDownProfileDataGrid.js.map