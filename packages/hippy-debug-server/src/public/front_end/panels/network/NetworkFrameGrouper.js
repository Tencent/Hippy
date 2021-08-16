// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import { NetworkGroupNode } from './NetworkDataGridNode.js';
export class NetworkFrameGrouper {
    _parentView;
    _activeGroups;
    constructor(parentView) {
        this._parentView = parentView;
        this._activeGroups = new Map();
    }
    groupNodeForRequest(request) {
        const frame = SDK.ResourceTreeModel.ResourceTreeModel.frameForRequest(request);
        if (!frame || frame.isTopFrame()) {
            return null;
        }
        let groupNode = this._activeGroups.get(frame);
        if (groupNode) {
            return groupNode;
        }
        groupNode = new FrameGroupNode(this._parentView, frame);
        this._activeGroups.set(frame, groupNode);
        return groupNode;
    }
    reset() {
        this._activeGroups.clear();
    }
}
export class FrameGroupNode extends NetworkGroupNode {
    _frame;
    constructor(parentView, frame) {
        super(parentView);
        this._frame = frame;
    }
    displayName() {
        return new Common.ParsedURL.ParsedURL(this._frame.url).domain() || this._frame.name || '<iframe>';
    }
    renderCell(cell, columnId) {
        super.renderCell(cell, columnId);
        const columnIndex = this.dataGrid.indexOfVisibleColumn(columnId);
        if (columnIndex === 0) {
            const name = this.displayName();
            cell.appendChild(UI.Icon.Icon.create('largeicon-navigator-frame', 'network-frame-group-icon'));
            UI.UIUtils.createTextChild(cell, name);
            UI.Tooltip.Tooltip.install(cell, name);
            this.setCellAccessibleName(cell.textContent || '', cell, columnId);
        }
    }
}
//# sourceMappingURL=NetworkFrameGrouper.js.map