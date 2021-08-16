/*
 * Copyright (C) 2011 Google Inc. All rights reserved.
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
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as HeapSnapshotModel from '../../models/heap_snapshot_model/heap_snapshot_model.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as UI from '../../ui/legacy/legacy.js';
import { HeapSnapshotRetainmentDataGridEvents } from './HeapSnapshotDataGrids.js';
const UIStrings = {
    /**
    *@description Generic text with two placeholders separated by a comma
    *@example {1 613 680} PH1
    *@example {44 %} PH2
    */
    genericStringsTwoPlaceholders: '{PH1}, {PH2}',
    /**
    *@description Text in Heap Snapshot Grid Nodes of a profiler tool
    */
    internalArray: '(internal array)[]',
    /**
    *@description Text in Heap Snapshot Grid Nodes of a profiler tool
    */
    userObjectReachableFromWindow: 'User object reachable from window',
    /**
    *@description Text in Heap Snapshot Grid Nodes of a profiler tool
    */
    detachedFromDomTree: 'Detached from DOM tree',
    /**
    *@description Text in Heap Snapshot Grid Nodes of a profiler tool
    */
    previewIsNotAvailable: 'Preview is not available',
    /**
    *@description A context menu item in the Heap Profiler Panel of a profiler tool
    */
    revealInSummaryView: 'Reveal in Summary view',
    /**
    *@description Text for the summary view
    */
    summary: 'Summary',
    /**
    *@description A context menu item in the Heap Profiler Panel of a profiler tool
    *@example {SomeClassConstructor} PH1
    *@example {12345} PH2
    */
    revealObjectSWithIdSInSummary: 'Reveal object \'{PH1}\' with id @{PH2} in Summary view',
    /**
    *@description Text to store an HTML element or JavaScript variable or expression result as a global variable
    */
    storeAsGlobalVariable: 'Store as global variable',
    /**
    *@description Text in Heap Snapshot Grid Nodes of a profiler tool that indicates an element contained in another
    * element.
    */
    inElement: 'in',
};
const str_ = i18n.i18n.registerUIStrings('panels/profiler/HeapSnapshotGridNodes.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class HeapSnapshotGridNode extends DataGrid.DataGrid.DataGridNode {
    _dataGrid;
    _instanceCount;
    _savedChildren;
    _retrievedChildrenRanges;
    _providerObject;
    _reachableFromWindow;
    _populated;
    constructor(tree, hasChildren) {
        super(null, hasChildren);
        this._dataGrid = tree;
        this._instanceCount = 0;
        this._savedChildren = new Map();
        /**
         * List of position ranges for all visible nodes: [startPos1, endPos1),...,[startPosN, endPosN)
         * Position is an item position in the provider.
         */
        this._retrievedChildrenRanges = [];
        this._providerObject = null;
        this._reachableFromWindow = false;
    }
    get name() {
        return undefined;
    }
    heapSnapshotDataGrid() {
        return this._dataGrid;
    }
    createProvider() {
        throw new Error('Not implemented.');
    }
    comparator() {
        throw new Error('Not implemented.');
    }
    _getHash() {
        throw new Error('Not implemented.');
    }
    _createChildNode(_item) {
        throw new Error('Not implemented.');
    }
    retainersDataSource() {
        return null;
    }
    _provider() {
        if (!this._providerObject) {
            this._providerObject = this.createProvider();
        }
        return this._providerObject;
    }
    createCell(columnId) {
        return super.createCell(columnId);
    }
    collapse() {
        super.collapse();
        this._dataGrid.updateVisibleNodes(true);
    }
    expand() {
        super.expand();
        this._dataGrid.updateVisibleNodes(true);
    }
    dispose() {
        if (this._providerObject) {
            this._providerObject.dispose();
        }
        for (let node = this.children[0]; node; node = node.traverseNextNode(true, this, true)) {
            node.dispose();
        }
    }
    queryObjectContent(_heapProfilerModel, _objectGroupName) {
        throw new Error('Not implemented.');
    }
    tryQueryObjectContent(_heapProfilerModel, _objectGroupName) {
        throw new Error('Not implemented.');
    }
    populateContextMenu(_contextMenu, _dataDisplayDelegate, _heapProfilerModel) {
    }
    _toPercentString(num) {
        return num.toFixed(0) + '\xa0%'; // \xa0 is a non-breaking space.
    }
    _toUIDistance(distance) {
        const baseSystemDistance = HeapSnapshotModel.HeapSnapshotModel.baseSystemDistance;
        return distance >= 0 && distance < baseSystemDistance ? distance.toString() : '\u2212';
    }
    allChildren() {
        return this._dataGrid.allChildren(this);
    }
    removeChildByIndex(index) {
        this._dataGrid.removeChildByIndex(this, index);
    }
    childForPosition(nodePosition) {
        let indexOfFirstChildInRange = 0;
        for (let i = 0; i < this._retrievedChildrenRanges.length; i++) {
            const range = this._retrievedChildrenRanges[i];
            if (range.from <= nodePosition && nodePosition < range.to) {
                const childIndex = indexOfFirstChildInRange + nodePosition - range.from;
                return this.allChildren()[childIndex];
            }
            indexOfFirstChildInRange += range.to - range.from + 1;
        }
        return null;
    }
    _createValueCell(columnId) {
        const cell = UI.Fragment.html `<td class="numeric-column" />`;
        const dataGrid = this.dataGrid;
        if (dataGrid.snapshot && dataGrid.snapshot.totalSize !== 0) {
            const div = document.createElement('div');
            const valueSpan = UI.Fragment.html `<span>${this.data[columnId]}</span>`;
            div.appendChild(valueSpan);
            const percentColumn = columnId + '-percent';
            if (percentColumn in this.data) {
                const percentSpan = UI.Fragment.html `<span class="percent-column">${this.data[percentColumn]}</span>`;
                div.appendChild(percentSpan);
                div.classList.add('profile-multiple-values');
                UI.ARIAUtils.markAsHidden(valueSpan);
                UI.ARIAUtils.markAsHidden(percentSpan);
                this.setCellAccessibleName(i18nString(UIStrings.genericStringsTwoPlaceholders, { PH1: this.data[columnId], PH2: this.data[percentColumn] }), cell, columnId);
            }
            cell.appendChild(div);
        }
        return cell;
    }
    populate() {
        if (this._populated) {
            return;
        }
        this._populated = true;
        this._provider().sortAndRewind(this.comparator()).then(() => this._populateChildren());
    }
    expandWithoutPopulate() {
        // Make sure default populate won't take action.
        this._populated = true;
        this.expand();
        return this._provider().sortAndRewind(this.comparator());
    }
    _childHashForEntity(entity) {
        if ('edgeIndex' in entity) {
            return entity.edgeIndex;
        }
        return entity.id;
    }
    _populateChildren(fromPosition, toPosition) {
        return new Promise(resolve => {
            fromPosition = fromPosition || 0;
            toPosition = toPosition || fromPosition + this._dataGrid.defaultPopulateCount();
            let firstNotSerializedPosition = fromPosition;
            serializeNextChunk.call(this, toPosition);
            function serializeNextChunk(toPosition) {
                if (firstNotSerializedPosition >= toPosition) {
                    return;
                }
                const end = Math.min(firstNotSerializedPosition + this._dataGrid.defaultPopulateCount(), toPosition);
                this._provider()
                    .serializeItemsRange(firstNotSerializedPosition, end)
                    .then(itemsRange => childrenRetrieved.call(this, itemsRange, toPosition));
                firstNotSerializedPosition = end;
            }
            function insertRetrievedChild(item, insertionIndex) {
                if (this._savedChildren) {
                    const hash = this._childHashForEntity(item);
                    const child = this._savedChildren.get(hash);
                    if (child) {
                        this._dataGrid.insertChild(this, child, insertionIndex);
                        return;
                    }
                }
                this._dataGrid.insertChild(this, this._createChildNode(item), insertionIndex);
            }
            function insertShowMoreButton(from, to, insertionIndex) {
                const button = (new DataGrid.ShowMoreDataGridNode.ShowMoreDataGridNode(this._populateChildren.bind(this), from, to, this._dataGrid.defaultPopulateCount()));
                this._dataGrid.insertChild(this, button, insertionIndex);
            }
            function childrenRetrieved(itemsRange, toPosition) {
                let itemIndex = 0;
                let itemPosition = itemsRange.startPosition;
                const items = itemsRange.items;
                let insertionIndex = 0;
                if (!this._retrievedChildrenRanges.length) {
                    if (itemsRange.startPosition > 0) {
                        this._retrievedChildrenRanges.push({ from: 0, to: 0 });
                        insertShowMoreButton.call(this, 0, itemsRange.startPosition, insertionIndex++);
                    }
                    this._retrievedChildrenRanges.push({ from: itemsRange.startPosition, to: itemsRange.endPosition });
                    for (let i = 0, l = items.length; i < l; ++i) {
                        insertRetrievedChild.call(this, items[i], insertionIndex++);
                    }
                    if (itemsRange.endPosition < itemsRange.totalLength) {
                        insertShowMoreButton.call(this, itemsRange.endPosition, itemsRange.totalLength, insertionIndex++);
                    }
                }
                else {
                    let rangeIndex = 0;
                    let found = false;
                    let range = { from: 0, to: 0 };
                    while (rangeIndex < this._retrievedChildrenRanges.length) {
                        range = this._retrievedChildrenRanges[rangeIndex];
                        if (range.to >= itemPosition) {
                            found = true;
                            break;
                        }
                        insertionIndex += range.to - range.from;
                        // Skip the button if there is one.
                        if (range.to < itemsRange.totalLength) {
                            insertionIndex += 1;
                        }
                        ++rangeIndex;
                    }
                    if (!found || itemsRange.startPosition < range.from) {
                        // Update previous button.
                        const button = this.allChildren()[insertionIndex - 1];
                        button.setEndPosition(itemsRange.startPosition);
                        insertShowMoreButton.call(this, itemsRange.startPosition, found ? range.from : itemsRange.totalLength, insertionIndex);
                        range = { from: itemsRange.startPosition, to: itemsRange.startPosition };
                        if (!found) {
                            rangeIndex = this._retrievedChildrenRanges.length;
                        }
                        this._retrievedChildrenRanges.splice(rangeIndex, 0, range);
                    }
                    else {
                        insertionIndex += itemPosition - range.from;
                    }
                    // At this point insertionIndex is always an index before button or between nodes.
                    // Also it is always true here that range.from <= itemPosition <= range.to
                    // Stretch the range right bound to include all new items.
                    while (range.to < itemsRange.endPosition) {
                        // Skip already added nodes.
                        const skipCount = range.to - itemPosition;
                        insertionIndex += skipCount;
                        itemIndex += skipCount;
                        itemPosition = range.to;
                        // We're at the position before button: ...<?node>x<button>
                        const nextRange = this._retrievedChildrenRanges[rangeIndex + 1];
                        let newEndOfRange = nextRange ? nextRange.from : itemsRange.totalLength;
                        if (newEndOfRange > itemsRange.endPosition) {
                            newEndOfRange = itemsRange.endPosition;
                        }
                        while (itemPosition < newEndOfRange) {
                            insertRetrievedChild.call(this, items[itemIndex++], insertionIndex++);
                            ++itemPosition;
                        }
                        // Merge with the next range.
                        if (nextRange && newEndOfRange === nextRange.from) {
                            range.to = nextRange.to;
                            // Remove "show next" button if there is one.
                            this.removeChildByIndex(insertionIndex);
                            this._retrievedChildrenRanges.splice(rangeIndex + 1, 1);
                        }
                        else {
                            range.to = newEndOfRange;
                            // Remove or update next button.
                            if (newEndOfRange === itemsRange.totalLength) {
                                this.removeChildByIndex(insertionIndex);
                            }
                            else {
                                this.allChildren()[insertionIndex]
                                    .setStartPosition(itemsRange.endPosition);
                            }
                        }
                    }
                }
                // TODO: fix this.
                this._instanceCount += items.length;
                if (firstNotSerializedPosition < toPosition) {
                    serializeNextChunk.call(this, toPosition);
                    return;
                }
                if (this.expanded) {
                    this._dataGrid.updateVisibleNodes(true);
                }
                resolve();
                this.dispatchEventToListeners(HeapSnapshotGridNode.Events.PopulateComplete);
            }
        });
    }
    _saveChildren() {
        this._savedChildren.clear();
        const children = this.allChildren();
        for (let i = 0, l = children.length; i < l; ++i) {
            const child = children[i];
            if (!child.expanded) {
                continue;
            }
            this._savedChildren.set(child._getHash(), child);
        }
    }
    async sort() {
        this._dataGrid.recursiveSortingEnter();
        await this._provider().sortAndRewind(this.comparator());
        this._saveChildren();
        this._dataGrid.removeAllChildren(this);
        this._retrievedChildrenRanges = [];
        const instanceCount = this._instanceCount;
        this._instanceCount = 0;
        await this._populateChildren(0, instanceCount);
        for (const child of this.allChildren()) {
            if (child.expanded) {
                child.sort();
            }
        }
        this._dataGrid.recursiveSortingLeave();
    }
}
(function (HeapSnapshotGridNode) {
    // TODO(crbug.com/1167717): Make this a const enum again
    // eslint-disable-next-line rulesdir/const_enum
    let Events;
    (function (Events) {
        Events["PopulateComplete"] = "PopulateComplete";
    })(Events = HeapSnapshotGridNode.Events || (HeapSnapshotGridNode.Events = {}));
})(HeapSnapshotGridNode || (HeapSnapshotGridNode = {}));
export class HeapSnapshotGenericObjectNode extends HeapSnapshotGridNode {
    _referenceName;
    _name;
    _type;
    _distance;
    _shallowSize;
    _retainedSize;
    snapshotNodeId;
    snapshotNodeIndex;
    detachedDOMTreeNode;
    linkElement;
    constructor(dataGrid, node) {
        super(dataGrid, false);
        // node is null for DataGrid root nodes.
        if (!node) {
            return;
        }
        this._referenceName = null;
        this._name = node.name;
        this._type = node.type;
        this._distance = node.distance;
        this._shallowSize = node.selfSize;
        this._retainedSize = node.retainedSize;
        this.snapshotNodeId = node.id;
        this.snapshotNodeIndex = node.nodeIndex;
        if (this._type === 'string') {
            this._reachableFromWindow = true;
        }
        else if (this._type === 'object' && this._name.startsWith('Window')) {
            this._name = this.shortenWindowURL(this._name, false);
            this._reachableFromWindow = true;
        }
        else if (node.canBeQueried) {
            this._reachableFromWindow = true;
        }
        if (node.detachedDOMTreeNode) {
            this.detachedDOMTreeNode = true;
        }
        const snapshot = dataGrid.snapshot;
        const shallowSizePercent = this._shallowSize / snapshot.totalSize * 100.0;
        const retainedSizePercent = this._retainedSize / snapshot.totalSize * 100.0;
        this.data = {
            'distance': this._toUIDistance(this._distance),
            'shallowSize': Platform.NumberUtilities.withThousandsSeparator(this._shallowSize),
            'retainedSize': Platform.NumberUtilities.withThousandsSeparator(this._retainedSize),
            'shallowSize-percent': this._toPercentString(shallowSizePercent),
            'retainedSize-percent': this._toPercentString(retainedSizePercent),
        };
    }
    get name() {
        return this._name;
    }
    retainersDataSource() {
        return this.snapshotNodeIndex === undefined ? null : {
            snapshot: this._dataGrid.snapshot,
            snapshotNodeIndex: this.snapshotNodeIndex,
        };
    }
    createCell(columnId) {
        const cell = columnId !== 'object' ? this._createValueCell(columnId) : this._createObjectCell();
        return cell;
    }
    _createObjectCell() {
        let value = this._name;
        let valueStyle = 'object';
        switch (this._type) {
            case 'concatenated string':
            case 'string':
                value = `"${value}"`;
                valueStyle = 'string';
                break;
            case 'regexp':
                value = `/${value}/`;
                valueStyle = 'string';
                break;
            case 'closure':
                value = `${value}()`;
                valueStyle = 'function';
                break;
            case 'bigint':
                valueStyle = 'bigint';
                break;
            case 'number':
                valueStyle = 'number';
                break;
            case 'hidden':
                valueStyle = 'null';
                break;
            case 'array':
                value = value ? `${value}[]` : i18nString(UIStrings.internalArray);
                break;
        }
        return this._createObjectCellWithValue(valueStyle, value || '');
    }
    _createObjectCellWithValue(valueStyle, value) {
        const fragment = UI.Fragment.Fragment.build `
  <td class="object-column disclosure">
  <div class="source-code event-properties" style="overflow: visible;" $="container">
  <span class="value object-value-${valueStyle}">${value}</span>
  <span class="object-value-id">@${this.snapshotNodeId}</span>
  </div>
  </td>`;
        const div = fragment.$('container');
        this._prefixObjectCell(div);
        if (this._reachableFromWindow) {
            div.appendChild(UI.Fragment.html `<span class="heap-object-tag" title="${i18nString(UIStrings.userObjectReachableFromWindow)}">🗖</span>`);
        }
        if (this.detachedDOMTreeNode) {
            div.appendChild(UI.Fragment.html `<span class="heap-object-tag" title="${i18nString(UIStrings.detachedFromDomTree)}">✀</span>`);
        }
        this._appendSourceLocation(div);
        const cell = fragment.element();
        if (this.depth) {
            cell.style.setProperty('padding-left', (this.depth * this.dataGrid.indentWidth) + 'px');
        }
        return cell;
    }
    _prefixObjectCell(_div) {
    }
    async _appendSourceLocation(div) {
        const linkContainer = UI.Fragment.html `<span class="heap-object-source-link" />`;
        div.appendChild(linkContainer);
        const link = await this._dataGrid.dataDisplayDelegate().linkifyObject(this.snapshotNodeIndex);
        if (link) {
            linkContainer.appendChild(link);
            this.linkElement = link;
        }
        else {
            linkContainer.remove();
        }
    }
    async queryObjectContent(heapProfilerModel, objectGroupName) {
        const remoteObject = await this.tryQueryObjectContent(heapProfilerModel, objectGroupName);
        return remoteObject ||
            heapProfilerModel.runtimeModel().createRemoteObjectFromPrimitiveValue(i18nString(UIStrings.previewIsNotAvailable));
    }
    async tryQueryObjectContent(heapProfilerModel, objectGroupName) {
        if (this._type === 'string') {
            return heapProfilerModel.runtimeModel().createRemoteObjectFromPrimitiveValue(this._name);
        }
        return await heapProfilerModel.objectForSnapshotObjectId(String(this.snapshotNodeId), objectGroupName);
    }
    async updateHasChildren() {
        const isEmpty = await this._provider().isEmpty();
        this.setHasChildren(!isEmpty);
    }
    shortenWindowURL(fullName, hasObjectId) {
        const startPos = fullName.indexOf('/');
        const endPos = hasObjectId ? fullName.indexOf('@') : fullName.length;
        if (startPos === -1 || endPos === -1) {
            return fullName;
        }
        const fullURL = fullName.substring(startPos + 1, endPos).trimLeft();
        let url = Platform.StringUtilities.trimURL(fullURL);
        if (url.length > 40) {
            url = Platform.StringUtilities.trimMiddle(url, 40);
        }
        return fullName.substr(0, startPos + 2) + url + fullName.substr(endPos);
    }
    populateContextMenu(contextMenu, dataDisplayDelegate, heapProfilerModel) {
        contextMenu.revealSection().appendItem(i18nString(UIStrings.revealInSummaryView), () => {
            dataDisplayDelegate.showObject(String(this.snapshotNodeId), i18nString(UIStrings.summary));
        });
        if (this._referenceName) {
            for (const match of this._referenceName.matchAll(/\((?<objectName>[^@)]*) @(?<snapshotNodeId>\d+)\)/g)) {
                const { objectName, snapshotNodeId } = match.groups;
                contextMenu.revealSection().appendItem(i18nString(UIStrings.revealObjectSWithIdSInSummary, { PH1: objectName, PH2: snapshotNodeId }), () => {
                    dataDisplayDelegate.showObject(snapshotNodeId, i18nString(UIStrings.summary));
                });
            }
        }
        if (heapProfilerModel) {
            contextMenu.revealSection().appendItem(i18nString(UIStrings.storeAsGlobalVariable), async () => {
                const remoteObject = await this.tryQueryObjectContent(heapProfilerModel, '');
                if (!remoteObject) {
                    Common.Console.Console.instance().error(i18nString(UIStrings.previewIsNotAvailable));
                }
                else {
                    await SDK.ConsoleModel.ConsoleModel.instance().saveToTempVariable(UI.Context.Context.instance().flavor(SDK.RuntimeModel.ExecutionContext), remoteObject);
                }
            });
        }
    }
}
export class HeapSnapshotObjectNode extends HeapSnapshotGenericObjectNode {
    _referenceName;
    _referenceType;
    _edgeIndex;
    _snapshot;
    _parentObjectNode;
    _cycledWithAncestorGridNode;
    constructor(dataGrid, snapshot, edge, parentObjectNode) {
        super(dataGrid, edge.node);
        this._referenceName = edge.name;
        this._referenceType = edge.type;
        this._edgeIndex = edge.edgeIndex;
        this._snapshot = snapshot;
        this._parentObjectNode = parentObjectNode;
        this._cycledWithAncestorGridNode = this._findAncestorWithSameSnapshotNodeId();
        if (!this._cycledWithAncestorGridNode) {
            this.updateHasChildren();
        }
        const data = this.data;
        data['count'] = '';
        data['addedCount'] = '';
        data['removedCount'] = '';
        data['countDelta'] = '';
        data['addedSize'] = '';
        data['removedSize'] = '';
        data['sizeDelta'] = '';
    }
    retainersDataSource() {
        return this.snapshotNodeIndex === undefined ? null :
            { snapshot: this._snapshot, snapshotNodeIndex: this.snapshotNodeIndex };
    }
    createProvider() {
        if (this.snapshotNodeIndex === undefined) {
            throw new Error('Cannot create a provider on a root node');
        }
        return this._snapshot.createEdgesProvider(this.snapshotNodeIndex);
    }
    _findAncestorWithSameSnapshotNodeId() {
        let ancestor = this._parentObjectNode;
        while (ancestor) {
            if (ancestor.snapshotNodeId === this.snapshotNodeId) {
                return ancestor;
            }
            ancestor = ancestor._parentObjectNode;
        }
        return null;
    }
    _createChildNode(item) {
        return new HeapSnapshotObjectNode(this._dataGrid, this._snapshot, item, this);
    }
    _getHash() {
        return this._edgeIndex;
    }
    comparator() {
        const sortAscending = this._dataGrid.isSortOrderAscending();
        const sortColumnId = this._dataGrid.sortColumnId();
        switch (sortColumnId) {
            case 'object':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('!edgeName', sortAscending, 'retainedSize', false);
            case 'count':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('!edgeName', true, 'retainedSize', false);
            case 'shallowSize':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('selfSize', sortAscending, '!edgeName', true);
            case 'retainedSize':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('retainedSize', sortAscending, '!edgeName', true);
            case 'distance':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('distance', sortAscending, '_name', true);
            default:
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('!edgeName', true, 'retainedSize', false);
        }
    }
    _prefixObjectCell(div) {
        let name = this._referenceName || '(empty)';
        let nameClass = 'name';
        switch (this._referenceType) {
            case 'context':
                nameClass = 'object-value-number';
                break;
            case 'internal':
            case 'hidden':
            case 'weak':
                nameClass = 'object-value-null';
                break;
            case 'element':
                name = `[${name}]`;
                break;
        }
        if (this._cycledWithAncestorGridNode) {
            div.classList.add('cycled-ancessor-node');
        }
        div.prepend(UI.Fragment.html `<span class="property-name ${nameClass}">${name}</span>
  <span class="grayed">${this._edgeNodeSeparator()}</span>`);
    }
    _edgeNodeSeparator() {
        return '::';
    }
}
export class HeapSnapshotRetainingObjectNode extends HeapSnapshotObjectNode {
    constructor(dataGrid, snapshot, edge, parentRetainingObjectNode) {
        super(dataGrid, snapshot, edge, parentRetainingObjectNode);
    }
    createProvider() {
        if (this.snapshotNodeIndex === undefined) {
            throw new Error('Cannot create providers on root nodes');
        }
        return this._snapshot.createRetainingEdgesProvider(this.snapshotNodeIndex);
    }
    _createChildNode(item) {
        return new HeapSnapshotRetainingObjectNode(this._dataGrid, this._snapshot, item, this);
    }
    _edgeNodeSeparator() {
        // TODO(l10n): improve description or clarify intention.
        return i18nString(UIStrings.inElement);
    }
    expand() {
        this._expandRetainersChain(20);
    }
    _expandRetainersChain(maxExpandLevels) {
        if (!this._populated) {
            this.once(HeapSnapshotGridNode.Events.PopulateComplete).then(() => this._expandRetainersChain(maxExpandLevels));
            this.populate();
            return;
        }
        super.expand();
        if (--maxExpandLevels > 0 && this.children.length > 0) {
            const retainer = this.children[0];
            if ((retainer._distance || 0) > 1) {
                retainer._expandRetainersChain(maxExpandLevels);
                return;
            }
        }
        this._dataGrid.dispatchEventToListeners(HeapSnapshotRetainmentDataGridEvents.ExpandRetainersComplete);
    }
}
export class HeapSnapshotInstanceNode extends HeapSnapshotGenericObjectNode {
    _baseSnapshotOrSnapshot;
    _isDeletedNode;
    constructor(dataGrid, snapshot, node, isDeletedNode) {
        super(dataGrid, node);
        this._baseSnapshotOrSnapshot = snapshot;
        this._isDeletedNode = isDeletedNode;
        this.updateHasChildren();
        const data = this.data;
        data['count'] = '';
        data['countDelta'] = '';
        data['sizeDelta'] = '';
        if (this._isDeletedNode) {
            data['addedCount'] = '';
            data['addedSize'] = '';
            data['removedCount'] = '\u2022';
            data['removedSize'] = Platform.NumberUtilities.withThousandsSeparator(this._shallowSize || 0);
        }
        else {
            data['addedCount'] = '\u2022';
            data['addedSize'] = Platform.NumberUtilities.withThousandsSeparator(this._shallowSize || 0);
            data['removedCount'] = '';
            data['removedSize'] = '';
        }
    }
    retainersDataSource() {
        return this.snapshotNodeIndex === undefined ?
            null :
            { snapshot: this._baseSnapshotOrSnapshot, snapshotNodeIndex: this.snapshotNodeIndex };
    }
    createProvider() {
        if (this.snapshotNodeIndex === undefined) {
            throw new Error('Cannot create providers on root nodes');
        }
        return this._baseSnapshotOrSnapshot.createEdgesProvider(this.snapshotNodeIndex);
    }
    _createChildNode(item) {
        return new HeapSnapshotObjectNode(this._dataGrid, this._baseSnapshotOrSnapshot, item, null);
    }
    _getHash() {
        if (this.snapshotNodeId === undefined) {
            throw new Error('Cannot hash root nodes');
        }
        return this.snapshotNodeId;
    }
    comparator() {
        const sortAscending = this._dataGrid.isSortOrderAscending();
        const sortColumnId = this._dataGrid.sortColumnId();
        switch (sortColumnId) {
            case 'object':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('!edgeName', sortAscending, 'retainedSize', false);
            case 'distance':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('distance', sortAscending, 'retainedSize', false);
            case 'count':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('!edgeName', true, 'retainedSize', false);
            case 'addedSize':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('selfSize', sortAscending, '!edgeName', true);
            case 'removedSize':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('selfSize', sortAscending, '!edgeName', true);
            case 'shallowSize':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('selfSize', sortAscending, '!edgeName', true);
            case 'retainedSize':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('retainedSize', sortAscending, '!edgeName', true);
            default:
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('!edgeName', true, 'retainedSize', false);
        }
    }
}
export class HeapSnapshotConstructorNode extends HeapSnapshotGridNode {
    _name;
    _nodeFilter;
    _distance;
    _count;
    _shallowSize;
    _retainedSize;
    constructor(dataGrid, className, aggregate, nodeFilter) {
        super(dataGrid, aggregate.count > 0);
        this._name = className;
        this._nodeFilter = nodeFilter;
        this._distance = aggregate.distance;
        this._count = aggregate.count;
        this._shallowSize = aggregate.self;
        this._retainedSize = aggregate.maxRet;
        const snapshot = dataGrid.snapshot;
        const retainedSizePercent = this._retainedSize / snapshot.totalSize * 100.0;
        const shallowSizePercent = this._shallowSize / snapshot.totalSize * 100.0;
        this.data = {
            'object': className,
            'count': Platform.NumberUtilities.withThousandsSeparator(this._count),
            'distance': this._toUIDistance(this._distance),
            'shallowSize': Platform.NumberUtilities.withThousandsSeparator(this._shallowSize),
            'retainedSize': Platform.NumberUtilities.withThousandsSeparator(this._retainedSize),
            'shallowSize-percent': this._toPercentString(shallowSizePercent),
            'retainedSize-percent': this._toPercentString(retainedSizePercent),
        };
    }
    get name() {
        return this._name;
    }
    createProvider() {
        return this._dataGrid.snapshot.createNodesProviderForClass(this._name, this._nodeFilter);
    }
    async populateNodeBySnapshotObjectId(snapshotObjectId) {
        this._dataGrid.resetNameFilter();
        await this.expandWithoutPopulate();
        const nodePosition = await this._provider().nodePosition(snapshotObjectId);
        if (nodePosition === -1) {
            this.collapse();
            return [];
        }
        await this._populateChildren(nodePosition, null);
        const node = this.childForPosition(nodePosition);
        return node ? [this, node] : [];
    }
    filteredOut(filterValue) {
        return this._name.toLowerCase().indexOf(filterValue) === -1;
    }
    createCell(columnId) {
        const cell = columnId === 'object' ? super.createCell(columnId) : this._createValueCell(columnId);
        if (columnId === 'object' && this._count > 1) {
            cell.appendChild(UI.Fragment.html `<span class="objects-count">×${this._count}</span>`);
        }
        return cell;
    }
    _createChildNode(item) {
        return new HeapSnapshotInstanceNode(this._dataGrid, this._dataGrid.snapshot, item, false);
    }
    comparator() {
        const sortAscending = this._dataGrid.isSortOrderAscending();
        const sortColumnId = this._dataGrid.sortColumnId();
        switch (sortColumnId) {
            case 'object':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('name', sortAscending, 'id', true);
            case 'distance':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('distance', sortAscending, 'retainedSize', false);
            case 'shallowSize':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('selfSize', sortAscending, 'id', true);
            case 'retainedSize':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('retainedSize', sortAscending, 'id', true);
            default:
                throw new Error(`Invalid sort column id ${sortColumnId}`);
        }
    }
}
export class HeapSnapshotDiffNodesProvider {
    _addedNodesProvider;
    _deletedNodesProvider;
    _addedCount;
    _removedCount;
    constructor(addedNodesProvider, deletedNodesProvider, addedCount, removedCount) {
        this._addedNodesProvider = addedNodesProvider;
        this._deletedNodesProvider = deletedNodesProvider;
        this._addedCount = addedCount;
        this._removedCount = removedCount;
    }
    dispose() {
        this._addedNodesProvider.dispose();
        this._deletedNodesProvider.dispose();
    }
    nodePosition(_snapshotObjectId) {
        throw new Error('Unreachable');
    }
    isEmpty() {
        return Promise.resolve(false);
    }
    async serializeItemsRange(beginPosition, endPosition) {
        let itemsRange;
        let addedItems;
        if (beginPosition < this._addedCount) {
            itemsRange = await this._addedNodesProvider.serializeItemsRange(beginPosition, endPosition);
            for (const item of itemsRange.items) {
                item.isAddedNotRemoved = true;
            }
            if (itemsRange.endPosition >= endPosition) {
                itemsRange.totalLength = this._addedCount + this._removedCount;
                return itemsRange;
            }
            addedItems = itemsRange;
            itemsRange = await this._deletedNodesProvider.serializeItemsRange(0, endPosition - itemsRange.endPosition);
        }
        else {
            addedItems = new HeapSnapshotModel.HeapSnapshotModel.ItemsRange(0, 0, 0, []);
            itemsRange = await this._deletedNodesProvider.serializeItemsRange(beginPosition - this._addedCount, endPosition - this._addedCount);
        }
        if (!addedItems.items.length) {
            addedItems.startPosition = this._addedCount + itemsRange.startPosition;
        }
        for (const item of itemsRange.items) {
            item.isAddedNotRemoved = false;
        }
        addedItems.items.push(...itemsRange.items);
        addedItems.endPosition = this._addedCount + itemsRange.endPosition;
        addedItems.totalLength = this._addedCount + this._removedCount;
        return addedItems;
    }
    async sortAndRewind(comparator) {
        await this._addedNodesProvider.sortAndRewind(comparator);
        await this._deletedNodesProvider.sortAndRewind(comparator);
    }
}
export class HeapSnapshotDiffNode extends HeapSnapshotGridNode {
    _name;
    _addedCount;
    _removedCount;
    _countDelta;
    _addedSize;
    _removedSize;
    _sizeDelta;
    _deletedIndexes;
    constructor(dataGrid, className, diffForClass) {
        super(dataGrid, true);
        this._name = className;
        this._addedCount = diffForClass.addedCount;
        this._removedCount = diffForClass.removedCount;
        this._countDelta = diffForClass.countDelta;
        this._addedSize = diffForClass.addedSize;
        this._removedSize = diffForClass.removedSize;
        this._sizeDelta = diffForClass.sizeDelta;
        this._deletedIndexes = diffForClass.deletedIndexes;
        this.data = {
            'object': className,
            'addedCount': Platform.NumberUtilities.withThousandsSeparator(this._addedCount),
            'removedCount': Platform.NumberUtilities.withThousandsSeparator(this._removedCount),
            'countDelta': this._signForDelta(this._countDelta) +
                Platform.NumberUtilities.withThousandsSeparator(Math.abs(this._countDelta)),
            'addedSize': Platform.NumberUtilities.withThousandsSeparator(this._addedSize),
            'removedSize': Platform.NumberUtilities.withThousandsSeparator(this._removedSize),
            'sizeDelta': this._signForDelta(this._sizeDelta) +
                Platform.NumberUtilities.withThousandsSeparator(Math.abs(this._sizeDelta)),
        };
    }
    get name() {
        return this._name;
    }
    createProvider() {
        const tree = this._dataGrid;
        if (tree.snapshot === null || tree.baseSnapshot === undefined || tree.baseSnapshot.uid === undefined) {
            throw new Error('Data sources have not been set correctly');
        }
        const addedNodesProvider = tree.snapshot.createAddedNodesProvider(tree.baseSnapshot.uid, this._name);
        const deletedNodesProvider = tree.baseSnapshot.createDeletedNodesProvider(this._deletedIndexes);
        if (!addedNodesProvider || !deletedNodesProvider) {
            throw new Error('Failed to create node providers');
        }
        return new HeapSnapshotDiffNodesProvider(addedNodesProvider, deletedNodesProvider, this._addedCount, this._removedCount);
    }
    createCell(columnId) {
        const cell = super.createCell(columnId);
        if (columnId !== 'object') {
            cell.classList.add('numeric-column');
        }
        return cell;
    }
    _createChildNode(item) {
        const dataGrid = this._dataGrid;
        if (item.isAddedNotRemoved) {
            if (dataGrid.snapshot === null) {
                throw new Error('Data sources have not been set correctly');
            }
            return new HeapSnapshotInstanceNode(this._dataGrid, dataGrid.snapshot, item, false);
        }
        if (dataGrid.baseSnapshot === undefined) {
            throw new Error('Data sources have not been set correctly');
        }
        return new HeapSnapshotInstanceNode(this._dataGrid, dataGrid.baseSnapshot, item, true);
    }
    comparator() {
        const sortAscending = this._dataGrid.isSortOrderAscending();
        const sortColumnId = this._dataGrid.sortColumnId();
        switch (sortColumnId) {
            case 'object':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('name', sortAscending, 'id', true);
            case 'addedCount':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('name', true, 'id', true);
            case 'removedCount':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('name', true, 'id', true);
            case 'countDelta':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('name', true, 'id', true);
            case 'addedSize':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('selfSize', sortAscending, 'id', true);
            case 'removedSize':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('selfSize', sortAscending, 'id', true);
            case 'sizeDelta':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('selfSize', sortAscending, 'id', true);
            default:
                throw new Error(`Invalid sort column ${sortColumnId}`);
        }
    }
    filteredOut(filterValue) {
        return this._name.toLowerCase().indexOf(filterValue) === -1;
    }
    _signForDelta(delta) {
        if (delta === 0) {
            return '';
        }
        if (delta > 0) {
            return '+';
        }
        return '\u2212'; // Math minus sign, same width as plus.
    }
}
export class AllocationGridNode extends HeapSnapshotGridNode {
    _populated;
    _allocationNode;
    constructor(dataGrid, data) {
        super(dataGrid, data.hasChildren);
        this._populated = false;
        this._allocationNode = data;
        this.data = {
            'liveCount': Platform.NumberUtilities.withThousandsSeparator(data.liveCount),
            'count': Platform.NumberUtilities.withThousandsSeparator(data.count),
            'liveSize': Platform.NumberUtilities.withThousandsSeparator(data.liveSize),
            'size': Platform.NumberUtilities.withThousandsSeparator(data.size),
            'name': data.name,
        };
    }
    populate() {
        if (this._populated) {
            return;
        }
        this._doPopulate();
    }
    async _doPopulate() {
        this._populated = true;
        const callers = await this._dataGrid.snapshot.allocationNodeCallers(this._allocationNode.id);
        const callersChain = callers.nodesWithSingleCaller;
        let parentNode = this;
        const dataGrid = this._dataGrid;
        for (const caller of callersChain) {
            const child = new AllocationGridNode(dataGrid, caller);
            dataGrid.appendNode(parentNode, child);
            parentNode = child;
            parentNode._populated = true;
            if (this.expanded) {
                parentNode.expand();
            }
        }
        const callersBranch = callers.branchingCallers;
        callersBranch.sort(this._dataGrid.createComparator());
        for (const caller of callersBranch) {
            dataGrid.appendNode(parentNode, new AllocationGridNode(dataGrid, caller));
        }
        dataGrid.updateVisibleNodes(true);
    }
    expand() {
        super.expand();
        if (this.children.length === 1) {
            this.children[0].expand();
        }
    }
    createCell(columnId) {
        if (columnId !== 'name') {
            return this._createValueCell(columnId);
        }
        const cell = super.createCell(columnId);
        const allocationNode = this._allocationNode;
        const heapProfilerModel = this._dataGrid.heapProfilerModel();
        if (allocationNode.scriptId) {
            const linkifier = this._dataGrid.linkifier;
            const urlElement = linkifier.linkifyScriptLocation(heapProfilerModel ? heapProfilerModel.target() : null, String(allocationNode.scriptId), allocationNode.scriptName, allocationNode.line - 1, {
                columnNumber: allocationNode.column - 1,
                inlineFrameIndex: 0,
                className: 'profile-node-file',
                tabStop: undefined,
            });
            urlElement.style.maxWidth = '75%';
            cell.insertBefore(urlElement, cell.firstChild);
        }
        return cell;
    }
    allocationNodeId() {
        return this._allocationNode.id;
    }
}
//# sourceMappingURL=HeapSnapshotGridNodes.js.map