/*
 * Copyright (C) 2012 Google Inc. All rights reserved.
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
import * as i18n from '../../core/i18n/i18n.js';
import * as HeapSnapshotModel from '../../models/heap_snapshot_model/heap_snapshot_model.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import { AllocationGridNode, HeapSnapshotConstructorNode, HeapSnapshotGenericObjectNode, HeapSnapshotRetainingObjectNode, HeapSnapshotObjectNode, HeapSnapshotDiffNode } from './HeapSnapshotGridNodes.js';
const UIStrings = {
    /**
    *@description Text in Heap Snapshot Data Grids of a profiler tool
    */
    distanceFromWindowObject: 'Distance from window object',
    /**
    *@description Text in Heap Snapshot Data Grids of a profiler tool
    */
    sizeOfTheObjectItselfInBytes: 'Size of the object itself in bytes',
    /**
    *@description Text in Heap Snapshot Data Grids of a profiler tool
    */
    sizeOfTheObjectPlusTheGraphIt: 'Size of the object plus the graph it retains in bytes',
    /**
    *@description Text in Heap Snapshot Data Grids of a profiler tool
    */
    object: 'Object',
    /**
    *@description Text in Heap Snapshot Data Grids of a profiler tool
    */
    distance: 'Distance',
    /**
    *@description Text in Heap Snapshot Data Grids of a profiler tool. Shallow size is the size of just this node, not including children/retained size.
    */
    shallowSize: 'Shallow Size',
    /**
    *@description Text in Heap Snapshot Data Grids of a profiler tool
    */
    retainedSize: 'Retained Size',
    /**
    * @description Title for a section in the Heap Snapshot view. This title is for a table which
    * shows retaining relationships between JavaScript objects. One object retains another if it holds
    * a reference to it, keeping it alive.
    */
    heapSnapshotRetainment: 'Heap Snapshot Retainment',
    /**
    *@description Text in Heap Snapshot Data Grids of a profiler tool
    */
    constructorString: 'Constructor',
    /**
    *@description Data grid name for Heap Snapshot Constructors data grids
    */
    heapSnapshotConstructors: 'Heap Snapshot Constructors',
    /**
    *@description Column header in a table displaying the diff between two Heap Snapshots. This
    * column is number of new objects in snapshot #2 compared to snapshot #1.
    */
    New: '# New',
    /**
    *@description Column header in a table displaying the diff between two Heap Snapshots. This
    * column is number of deleted objects in snapshot #2 compared to snapshot #1.
    */
    Deleted: '# Deleted',
    /**
    * @description Column header in a table displaying the diff between two Heap Snapshots. This
    * column is the difference (delta) between the # New and # Deleted objects in the snapshot.
    */
    Delta: '# Delta',
    /**
    *@description Text in Heap Snapshot Data Grids of a profiler tool
    */
    allocSize: 'Alloc. Size',
    /**
    *@description Text in Heap Snapshot Data Grids of a profiler tool
    */
    freedSize: 'Freed Size',
    /**
    * @description Title of a column in a table in the Heap Snapshot tool. 'Delta' here means
    * difference, so the whole string means 'difference in size'.
    */
    sizeDelta: 'Size Delta',
    /**
    *@description Data grid name for Heap Snapshot Diff data grids
    */
    heapSnapshotDiff: 'Heap Snapshot Diff',
    /**
    *@description Text in Heap Snapshot Data Grids of a profiler tool
    */
    liveCount: 'Live Count',
    /**
    *@description Text in Heap Snapshot Data Grids of a profiler tool
    */
    count: 'Count',
    /**
    *@description Text in Heap Snapshot Data Grids of a profiler tool
    */
    liveSize: 'Live Size',
    /**
    *@description Text for the size of something
    */
    size: 'Size',
    /**
    *@description Text for a programming function
    */
    function: 'Function',
    /**
    *@description Text in Heap Snapshot View of a profiler tool
    */
    allocation: 'Allocation',
};
const str_ = i18n.i18n.registerUIStrings('panels/profiler/HeapSnapshotDataGrids.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const adjacencyMap = new WeakMap();
export class HeapSnapshotSortableDataGrid extends DataGrid.DataGrid.DataGridImpl {
    snapshot;
    selectedNode;
    _heapProfilerModel;
    _dataDisplayDelegate;
    _recursiveSortingDepth;
    _populatedAndSorted;
    _nameFilter;
    _nodeFilter;
    _lastSortColumnId;
    _lastSortAscending;
    constructor(heapProfilerModel, dataDisplayDelegate, dataGridParameters) {
        // TODO(allada) This entire class needs to be converted to use the templates in DataGridNode.
        super(dataGridParameters);
        this.snapshot = null;
        this.selectedNode = null;
        this._heapProfilerModel = heapProfilerModel;
        this._dataDisplayDelegate = dataDisplayDelegate;
        const tooltips = [
            ['distance', i18nString(UIStrings.distanceFromWindowObject)],
            ['shallowSize', i18nString(UIStrings.sizeOfTheObjectItselfInBytes)],
            ['retainedSize', i18nString(UIStrings.sizeOfTheObjectPlusTheGraphIt)],
        ];
        for (const info of tooltips) {
            const headerCell = this.headerTableHeader(info[0]);
            if (headerCell) {
                headerCell.setAttribute('title', info[1]);
            }
        }
        this._recursiveSortingDepth = 0;
        this._populatedAndSorted = false;
        this._nameFilter = null;
        this._nodeFilter = new HeapSnapshotModel.HeapSnapshotModel.NodeFilter();
        this.addEventListener(HeapSnapshotSortableDataGridEvents.SortingComplete, this._sortingComplete, this);
        this.addEventListener(DataGrid.DataGrid.Events.SortingChanged, this.sortingChanged, this);
        this.setRowContextMenuCallback(this._populateContextMenu.bind(this));
    }
    async setDataSource(_snapshot, _nodeIndex) {
    }
    _isFilteredOut(node) {
        const nameFilterValue = this._nameFilter ? this._nameFilter.value().toLowerCase() : '';
        if (nameFilterValue && (node instanceof HeapSnapshotDiffNode || node instanceof HeapSnapshotConstructorNode) &&
            node.filteredOut(nameFilterValue)) {
            return true;
        }
        return false;
    }
    heapProfilerModel() {
        return this._heapProfilerModel;
    }
    dataDisplayDelegate() {
        return this._dataDisplayDelegate;
    }
    nodeFilter() {
        return this._nodeFilter;
    }
    setNameFilter(nameFilter) {
        this._nameFilter = nameFilter;
    }
    defaultPopulateCount() {
        return 100;
    }
    _disposeAllNodes() {
        const children = this.topLevelNodes();
        for (let i = 0, l = children.length; i < l; ++i) {
            children[i].dispose();
        }
    }
    wasShown() {
        if (this._nameFilter) {
            this._nameFilter.addEventListener(UI.Toolbar.ToolbarInput.Event.TextChanged, this._onNameFilterChanged, this);
            this.updateVisibleNodes(true);
        }
        if (this._populatedAndSorted) {
            this.dispatchEventToListeners(HeapSnapshotSortableDataGridEvents.ContentShown, this);
        }
    }
    _sortingComplete() {
        this.removeEventListener(HeapSnapshotSortableDataGridEvents.SortingComplete, this._sortingComplete, this);
        this._populatedAndSorted = true;
        this.dispatchEventToListeners(HeapSnapshotSortableDataGridEvents.ContentShown, this);
    }
    willHide() {
        if (this._nameFilter) {
            this._nameFilter.removeEventListener(UI.Toolbar.ToolbarInput.Event.TextChanged, this._onNameFilterChanged, this);
        }
    }
    _populateContextMenu(contextMenu, gridNode) {
        const node = gridNode;
        node.populateContextMenu(contextMenu, this._dataDisplayDelegate, this.heapProfilerModel());
        if (node instanceof HeapSnapshotGenericObjectNode && node.linkElement &&
            !contextMenu.containsTarget(node.linkElement)) {
            contextMenu.appendApplicableItems(node.linkElement);
        }
    }
    resetSortingCache() {
        delete this._lastSortColumnId;
        delete this._lastSortAscending;
    }
    topLevelNodes() {
        return this.rootNode().children;
    }
    revealObjectByHeapSnapshotId(_heapSnapshotObjectId) {
        return Promise.resolve(null);
    }
    resetNameFilter() {
        if (this._nameFilter) {
            this._nameFilter.setValue('');
        }
    }
    _onNameFilterChanged() {
        this.updateVisibleNodes(true);
        this._deselectFilteredNodes();
    }
    _deselectFilteredNodes() {
        let currentNode = this.selectedNode;
        while (currentNode) {
            if (this.selectedNode && this._isFilteredOut(currentNode)) {
                this.selectedNode.deselect();
                this.selectedNode = null;
                return;
            }
            currentNode = currentNode.parent;
        }
    }
    _sortFields(_sortColumnId, _ascending) {
        throw new Error('Not implemented');
    }
    sortingChanged() {
        const sortAscending = this.isSortOrderAscending();
        const sortColumnId = this.sortColumnId();
        if (this._lastSortColumnId === sortColumnId && this._lastSortAscending === sortAscending) {
            return;
        }
        this._lastSortColumnId = sortColumnId;
        this._lastSortAscending = sortAscending;
        const sortFields = this._sortFields(sortColumnId || '', sortAscending);
        // eslint-disable-next-line @typescript-eslint/naming-convention
        function SortByTwoFields(nodeA, nodeB) {
            // @ts-ignore
            let field1 = nodeA[sortFields.fieldName1];
            // @ts-ignore
            let field2 = nodeB[sortFields.fieldName1];
            let result = field1 < field2 ? -1 : (field1 > field2 ? 1 : 0);
            if (!sortFields.ascending1) {
                result = -result;
            }
            if (result !== 0) {
                return result;
            }
            // @ts-ignore
            field1 = nodeA[sortFields.fieldName2];
            // @ts-ignore
            field2 = nodeB[sortFields.fieldName2];
            result = field1 < field2 ? -1 : (field1 > field2 ? 1 : 0);
            if (!sortFields.ascending2) {
                result = -result;
            }
            return result;
        }
        this._performSorting(SortByTwoFields);
    }
    _performSorting(sortFunction) {
        this.recursiveSortingEnter();
        const children = this.allChildren(this.rootNode());
        this.rootNode().removeChildren();
        children.sort(sortFunction);
        for (let i = 0, l = children.length; i < l; ++i) {
            const child = children[i];
            this.appendChildAfterSorting(child);
            if (child.expanded) {
                child.sort();
            }
        }
        this.recursiveSortingLeave();
    }
    appendChildAfterSorting(child) {
        const revealed = child.revealed;
        this.rootNode().appendChild(child);
        child.revealed = revealed;
    }
    recursiveSortingEnter() {
        ++this._recursiveSortingDepth;
    }
    recursiveSortingLeave() {
        if (!this._recursiveSortingDepth) {
            return;
        }
        if (--this._recursiveSortingDepth) {
            return;
        }
        this.updateVisibleNodes(true);
        this.dispatchEventToListeners(HeapSnapshotSortableDataGridEvents.SortingComplete);
    }
    updateVisibleNodes(_force) {
    }
    allChildren(parent) {
        return parent.children;
    }
    insertChild(parent, node, index) {
        parent.insertChild(node, index);
    }
    removeChildByIndex(parent, index) {
        parent.removeChild(parent.children[index]);
    }
    removeAllChildren(parent) {
        parent.removeChildren();
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var HeapSnapshotSortableDataGridEvents;
(function (HeapSnapshotSortableDataGridEvents) {
    HeapSnapshotSortableDataGridEvents["ContentShown"] = "ContentShown";
    HeapSnapshotSortableDataGridEvents["SortingComplete"] = "SortingComplete";
})(HeapSnapshotSortableDataGridEvents || (HeapSnapshotSortableDataGridEvents = {}));
export class HeapSnapshotViewportDataGrid extends HeapSnapshotSortableDataGrid {
    _topPaddingHeight;
    _bottomPaddingHeight;
    selectedNode;
    _scrollToResolveCallback;
    constructor(heapProfilerModel, dataDisplayDelegate, dataGridParameters) {
        super(heapProfilerModel, dataDisplayDelegate, dataGridParameters);
        this.scrollContainer.addEventListener('scroll', this._onScroll.bind(this), true);
        this._topPaddingHeight = 0;
        this._bottomPaddingHeight = 0;
        this.selectedNode = null;
    }
    topLevelNodes() {
        return this.allChildren(this.rootNode());
    }
    appendChildAfterSorting(_child) {
        // Do nothing here, it will be added in updateVisibleNodes.
    }
    updateVisibleNodes(force) {
        // Guard zone is used to ensure there are always some extra items
        // above and below the viewport to support keyboard navigation.
        const guardZoneHeight = 40;
        const scrollHeight = this.scrollContainer.scrollHeight;
        let scrollTop = this.scrollContainer.scrollTop;
        let scrollBottom = scrollHeight - scrollTop - this.scrollContainer.offsetHeight;
        scrollTop = Math.max(0, scrollTop - guardZoneHeight);
        scrollBottom = Math.max(0, scrollBottom - guardZoneHeight);
        let viewPortHeight = scrollHeight - scrollTop - scrollBottom;
        // Do nothing if populated nodes still fit the viewport.
        if (!force && scrollTop >= this._topPaddingHeight && scrollBottom >= this._bottomPaddingHeight) {
            return;
        }
        const hysteresisHeight = 500;
        scrollTop -= hysteresisHeight;
        viewPortHeight += 2 * hysteresisHeight;
        const selectedNode = this.selectedNode;
        this.rootNode().removeChildren();
        this._topPaddingHeight = 0;
        this._bottomPaddingHeight = 0;
        this._addVisibleNodes(this.rootNode(), scrollTop, scrollTop + viewPortHeight);
        this.setVerticalPadding(this._topPaddingHeight, this._bottomPaddingHeight);
        if (selectedNode) {
            // Keep selection even if the node is not in the current viewport.
            if (selectedNode.parent) {
                selectedNode.select(true);
            }
            else {
                /** @type {?HeapSnapshotGridNode} */
                this.selectedNode = selectedNode;
            }
        }
    }
    _addVisibleNodes(parentNode, topBound, bottomBound) {
        if (!parentNode.expanded) {
            return 0;
        }
        const children = this.allChildren(parentNode);
        let topPadding = 0;
        // Iterate over invisible nodes beyond the upper bound of viewport.
        // Do not insert them into the grid, but count their total height.
        let i = 0;
        for (; i < children.length; ++i) {
            const child = children[i];
            if (this._isFilteredOut(child)) {
                continue;
            }
            const newTop = topPadding + this._nodeHeight(child);
            if (newTop > topBound) {
                break;
            }
            topPadding = newTop;
        }
        // Put visible nodes into the data grid.
        let position = topPadding;
        for (; i < children.length && position < bottomBound; ++i) {
            const child = children[i];
            if (this._isFilteredOut(child)) {
                continue;
            }
            const hasChildren = child.hasChildren();
            child.removeChildren();
            child.setHasChildren(hasChildren);
            parentNode.appendChild(child);
            position += child.nodeSelfHeight();
            position += this._addVisibleNodes(child, topBound - position, bottomBound - position);
        }
        // Count the invisible nodes beyond the bottom bound of the viewport.
        let bottomPadding = 0;
        for (; i < children.length; ++i) {
            const child = children[i];
            if (this._isFilteredOut(child)) {
                continue;
            }
            bottomPadding += this._nodeHeight(child);
        }
        this._topPaddingHeight += topPadding;
        this._bottomPaddingHeight += bottomPadding;
        return position + bottomPadding;
    }
    _nodeHeight(node) {
        let result = node.nodeSelfHeight();
        if (!node.expanded) {
            return result;
        }
        const children = this.allChildren(node);
        for (let i = 0; i < children.length; i++) {
            result += this._nodeHeight(children[i]);
        }
        return result;
    }
    revealTreeNode(pathToReveal) {
        const height = this._calculateOffset(pathToReveal);
        const node = pathToReveal[pathToReveal.length - 1];
        const scrollTop = this.scrollContainer.scrollTop;
        const scrollBottom = scrollTop + this.scrollContainer.offsetHeight;
        if (height >= scrollTop && height < scrollBottom) {
            return Promise.resolve(node);
        }
        const scrollGap = 40;
        this.scrollContainer.scrollTop = Math.max(0, height - scrollGap);
        return new Promise(resolve => {
            console.assert(!this._scrollToResolveCallback);
            this._scrollToResolveCallback = resolve.bind(null, node);
            // Still resolve the promise if it does not scroll for some reason.
            this.scrollContainer.window().requestAnimationFrame(() => {
                if (!this._scrollToResolveCallback) {
                    return;
                }
                this._scrollToResolveCallback();
                this._scrollToResolveCallback = null;
            });
        });
    }
    _calculateOffset(pathToReveal) {
        let parentNode = this.rootNode();
        let height = 0;
        if (pathToReveal.length === 0) {
            return 0;
        }
        for (let i = 0; i < pathToReveal.length; ++i) {
            const node = pathToReveal[i];
            const children = this.allChildren(parentNode);
            for (let j = 0; j < children.length; ++j) {
                const child = children[j];
                if (node === child) {
                    height += node.nodeSelfHeight();
                    break;
                }
                height += this._nodeHeight(child);
            }
            parentNode = node;
        }
        return height - pathToReveal[pathToReveal.length - 1].nodeSelfHeight();
    }
    allChildren(parent) {
        const children = adjacencyMap.get(parent) || [];
        if (!adjacencyMap.has(parent)) {
            adjacencyMap.set(parent, children);
        }
        return children;
    }
    appendNode(parent, node) {
        this.allChildren(parent).push(node);
    }
    insertChild(parent, node, index) {
        this.allChildren(parent).splice(index, 0, node);
    }
    removeChildByIndex(parent, index) {
        this.allChildren(parent).splice(index, 1);
    }
    removeAllChildren(parent) {
        adjacencyMap.delete(parent);
    }
    removeTopLevelNodes() {
        this._disposeAllNodes();
        this.rootNode().removeChildren();
        this.removeAllChildren(this.rootNode());
    }
    _isScrolledIntoView(element) {
        const viewportTop = this.scrollContainer.scrollTop;
        const viewportBottom = viewportTop + this.scrollContainer.clientHeight;
        const elemTop = element.offsetTop;
        const elemBottom = elemTop + element.offsetHeight;
        return elemBottom <= viewportBottom && elemTop >= viewportTop;
    }
    onResize() {
        super.onResize();
        this.updateVisibleNodes(false);
    }
    _onScroll(_event) {
        this.updateVisibleNodes(false);
        if (this._scrollToResolveCallback) {
            this._scrollToResolveCallback();
            this._scrollToResolveCallback = null;
        }
    }
}
export class HeapSnapshotContainmentDataGrid extends HeapSnapshotSortableDataGrid {
    constructor(heapProfilerModel, dataDisplayDelegate, displayName, columns) {
        columns =
            columns || [
                { id: 'object', title: i18nString(UIStrings.object), disclosure: true, sortable: true },
                { id: 'distance', title: i18nString(UIStrings.distance), width: '70px', sortable: true, fixedWidth: true },
                {
                    id: 'shallowSize',
                    title: i18nString(UIStrings.shallowSize),
                    width: '110px',
                    sortable: true,
                    fixedWidth: true,
                },
                {
                    id: 'retainedSize',
                    title: i18nString(UIStrings.retainedSize),
                    width: '110px',
                    sortable: true,
                    fixedWidth: true,
                    sort: DataGrid.DataGrid.Order.Descending,
                },
            ];
        const dataGridParameters = { displayName, columns };
        super(heapProfilerModel, dataDisplayDelegate, dataGridParameters);
    }
    async setDataSource(snapshot, nodeIndex) {
        this.snapshot = snapshot;
        const node = new HeapSnapshotModel.HeapSnapshotModel.Node(-1, 'root', 0, nodeIndex || snapshot.rootNodeIndex, 0, 0, '');
        this.setRootNode(this._createRootNode(snapshot, node));
        this.rootNode().sort();
    }
    _createRootNode(snapshot, node) {
        const fakeEdge = new HeapSnapshotModel.HeapSnapshotModel.Edge('', node, '', -1);
        return new HeapSnapshotObjectNode(this, snapshot, fakeEdge, null);
    }
    sortingChanged() {
        const rootNode = this.rootNode();
        if (rootNode.hasChildren()) {
            rootNode.sort();
        }
    }
}
export class HeapSnapshotRetainmentDataGrid extends HeapSnapshotContainmentDataGrid {
    constructor(heapProfilerModel, dataDisplayDelegate) {
        const columns = [
            { id: 'object', title: i18nString(UIStrings.object), disclosure: true, sortable: true },
            {
                id: 'distance',
                title: i18nString(UIStrings.distance),
                width: '70px',
                sortable: true,
                fixedWidth: true,
                sort: DataGrid.DataGrid.Order.Ascending,
            },
            { id: 'shallowSize', title: i18nString(UIStrings.shallowSize), width: '110px', sortable: true, fixedWidth: true },
            { id: 'retainedSize', title: i18nString(UIStrings.retainedSize), width: '110px', sortable: true, fixedWidth: true },
        ];
        super(heapProfilerModel, dataDisplayDelegate, i18nString(UIStrings.heapSnapshotRetainment), columns);
    }
    _createRootNode(snapshot, node) {
        const fakeEdge = new HeapSnapshotModel.HeapSnapshotModel.Edge('', node, '', -1);
        return new HeapSnapshotRetainingObjectNode(this, snapshot, fakeEdge, null);
    }
    _sortFields(sortColumn, sortAscending) {
        switch (sortColumn) {
            case 'object':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('_name', sortAscending, '_count', false);
            case 'count':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('_count', sortAscending, '_name', true);
            case 'shallowSize':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('_shallowSize', sortAscending, '_name', true);
            case 'retainedSize':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('_retainedSize', sortAscending, '_name', true);
            case 'distance':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('_distance', sortAscending, '_name', true);
            default:
                throw new Error(`Unknown column ${sortColumn}`);
        }
    }
    reset() {
        this.rootNode().removeChildren();
        this.resetSortingCache();
    }
    async setDataSource(snapshot, nodeIndex) {
        await super.setDataSource(snapshot, nodeIndex);
        this.rootNode().expand();
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var HeapSnapshotRetainmentDataGridEvents;
(function (HeapSnapshotRetainmentDataGridEvents) {
    HeapSnapshotRetainmentDataGridEvents["ExpandRetainersComplete"] = "ExpandRetainersComplete";
})(HeapSnapshotRetainmentDataGridEvents || (HeapSnapshotRetainmentDataGridEvents = {}));
export class HeapSnapshotConstructorsDataGrid extends HeapSnapshotViewportDataGrid {
    _profileIndex;
    _objectIdToSelect;
    _nextRequestedFilter;
    _lastFilter;
    _filterInProgress;
    constructor(heapProfilerModel, dataDisplayDelegate) {
        const columns = [
            { id: 'object', title: i18nString(UIStrings.constructorString), disclosure: true, sortable: true },
            { id: 'distance', title: i18nString(UIStrings.distance), width: '70px', sortable: true, fixedWidth: true },
            { id: 'shallowSize', title: i18nString(UIStrings.shallowSize), width: '110px', sortable: true, fixedWidth: true },
            {
                id: 'retainedSize',
                title: i18nString(UIStrings.retainedSize),
                width: '110px',
                sort: DataGrid.DataGrid.Order.Descending,
                sortable: true,
                fixedWidth: true,
            },
        ];
        super(heapProfilerModel, dataDisplayDelegate, { displayName: i18nString(UIStrings.heapSnapshotConstructors).toString(), columns });
        // clang-format on
        this._profileIndex = -1;
        this._objectIdToSelect = null;
        this._nextRequestedFilter = null;
    }
    _sortFields(sortColumn, sortAscending) {
        switch (sortColumn) {
            case 'object':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('_name', sortAscending, '_retainedSize', false);
            case 'distance':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('_distance', sortAscending, '_retainedSize', false);
            case 'shallowSize':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('_shallowSize', sortAscending, '_name', true);
            case 'retainedSize':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('_retainedSize', sortAscending, '_name', true);
            default:
                throw new Error(`Unknown column ${sortColumn}`);
        }
    }
    async revealObjectByHeapSnapshotId(id) {
        if (!this.snapshot) {
            this._objectIdToSelect = id;
            return null;
        }
        const className = await this.snapshot.nodeClassName(parseInt(id, 10));
        if (!className) {
            return null;
        }
        const parent = this.topLevelNodes().find(classNode => classNode.name === className);
        if (!parent) {
            return null;
        }
        const nodes = await parent.populateNodeBySnapshotObjectId(parseInt(id, 10));
        return nodes.length ? this.revealTreeNode(nodes) : null;
    }
    clear() {
        this._nextRequestedFilter = null;
        this._lastFilter = null;
        this.removeTopLevelNodes();
    }
    async setDataSource(snapshot, _nodeIndex) {
        this.snapshot = snapshot;
        if (this._profileIndex === -1) {
            this._populateChildren();
        }
        if (this._objectIdToSelect) {
            this.revealObjectByHeapSnapshotId(this._objectIdToSelect);
            this._objectIdToSelect = null;
        }
    }
    setSelectionRange(minNodeId, maxNodeId) {
        this._nodeFilter = new HeapSnapshotModel.HeapSnapshotModel.NodeFilter(minNodeId, maxNodeId);
        this._populateChildren(this._nodeFilter);
    }
    setAllocationNodeId(allocationNodeId) {
        this._nodeFilter = new HeapSnapshotModel.HeapSnapshotModel.NodeFilter();
        this._nodeFilter.allocationNodeId = allocationNodeId;
        this._populateChildren(this._nodeFilter);
    }
    _aggregatesReceived(nodeFilter, aggregates) {
        this._filterInProgress = null;
        if (this._nextRequestedFilter && this.snapshot) {
            this.snapshot.aggregatesWithFilter(this._nextRequestedFilter)
                .then(this._aggregatesReceived.bind(this, this._nextRequestedFilter));
            this._filterInProgress = this._nextRequestedFilter;
            this._nextRequestedFilter = null;
        }
        this.removeTopLevelNodes();
        this.resetSortingCache();
        for (const constructor in aggregates) {
            this.appendNode(this.rootNode(), new HeapSnapshotConstructorNode(this, constructor, aggregates[constructor], nodeFilter));
        }
        this.sortingChanged();
        this._lastFilter = nodeFilter;
    }
    async _populateChildren(maybeNodeFilter) {
        const nodeFilter = maybeNodeFilter || new HeapSnapshotModel.HeapSnapshotModel.NodeFilter();
        if (this._filterInProgress) {
            this._nextRequestedFilter = this._filterInProgress.equals(nodeFilter) ? null : nodeFilter;
            return;
        }
        if (this._lastFilter && this._lastFilter.equals(nodeFilter)) {
            return;
        }
        this._filterInProgress = nodeFilter;
        if (this.snapshot) {
            const aggregates = await this.snapshot.aggregatesWithFilter(nodeFilter);
            this._aggregatesReceived(nodeFilter, aggregates);
        }
    }
    filterSelectIndexChanged(profiles, profileIndex) {
        this._profileIndex = profileIndex;
        this._nodeFilter = undefined;
        if (profileIndex !== -1) {
            const minNodeId = profileIndex > 0 ? profiles[profileIndex - 1].maxJSObjectId : 0;
            const maxNodeId = profiles[profileIndex].maxJSObjectId;
            this._nodeFilter = new HeapSnapshotModel.HeapSnapshotModel.NodeFilter(minNodeId, maxNodeId);
        }
        this._populateChildren(this._nodeFilter);
    }
}
export class HeapSnapshotDiffDataGrid extends HeapSnapshotViewportDataGrid {
    baseSnapshot;
    constructor(heapProfilerModel, dataDisplayDelegate) {
        const columns = [
            { id: 'object', title: i18nString(UIStrings.constructorString), disclosure: true, sortable: true },
            { id: 'addedCount', title: i18nString(UIStrings.New), width: '75px', sortable: true, fixedWidth: true },
            { id: 'removedCount', title: i18nString(UIStrings.Deleted), width: '75px', sortable: true, fixedWidth: true },
            { id: 'countDelta', title: i18nString(UIStrings.Delta), width: '65px', sortable: true, fixedWidth: true },
            {
                id: 'addedSize',
                title: i18nString(UIStrings.allocSize),
                width: '75px',
                sortable: true,
                fixedWidth: true,
                sort: DataGrid.DataGrid.Order.Descending,
            },
            { id: 'removedSize', title: i18nString(UIStrings.freedSize), width: '75px', sortable: true, fixedWidth: true },
            { id: 'sizeDelta', title: i18nString(UIStrings.sizeDelta), width: '75px', sortable: true, fixedWidth: true },
        ];
        super(heapProfilerModel, dataDisplayDelegate, { displayName: i18nString(UIStrings.heapSnapshotDiff).toString(), columns });
    }
    defaultPopulateCount() {
        return 50;
    }
    _sortFields(sortColumn, sortAscending) {
        switch (sortColumn) {
            case 'object':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('_name', sortAscending, '_count', false);
            case 'addedCount':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('_addedCount', sortAscending, '_name', true);
            case 'removedCount':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('_removedCount', sortAscending, '_name', true);
            case 'countDelta':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('_countDelta', sortAscending, '_name', true);
            case 'addedSize':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('_addedSize', sortAscending, '_name', true);
            case 'removedSize':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('_removedSize', sortAscending, '_name', true);
            case 'sizeDelta':
                return new HeapSnapshotModel.HeapSnapshotModel.ComparatorConfig('_sizeDelta', sortAscending, '_name', true);
            default:
                throw new Error(`Unknown column ${sortColumn}`);
        }
    }
    async setDataSource(snapshot, _nodeIndex) {
        this.snapshot = snapshot;
    }
    setBaseDataSource(baseSnapshot) {
        this.baseSnapshot = baseSnapshot;
        this.removeTopLevelNodes();
        this.resetSortingCache();
        if (this.baseSnapshot === this.snapshot) {
            this.dispatchEventToListeners(HeapSnapshotSortableDataGridEvents.SortingComplete);
            return;
        }
        this._populateChildren();
    }
    async _populateChildren() {
        if (this.snapshot === null || this.baseSnapshot === undefined || this.baseSnapshot.uid === undefined) {
            throw new Error('Data sources have not been set correctly');
        }
        // Two snapshots live in different workers isolated from each other. That is why
        // we first need to collect information about the nodes in the first snapshot and
        // then pass it to the second snapshot to calclulate the diff.
        const aggregatesForDiff = await this.baseSnapshot.aggregatesForDiff();
        const diffByClassName = await this.snapshot.calculateSnapshotDiff(this.baseSnapshot.uid, aggregatesForDiff);
        for (const className in diffByClassName) {
            const diff = diffByClassName[className];
            this.appendNode(this.rootNode(), new HeapSnapshotDiffNode(this, className, diff));
        }
        this.sortingChanged();
    }
}
export class AllocationDataGrid extends HeapSnapshotViewportDataGrid {
    _linkifier;
    _topNodes;
    constructor(heapProfilerModel, dataDisplayDelegate) {
        const columns = [
            { id: 'liveCount', title: i18nString(UIStrings.liveCount), width: '75px', sortable: true, fixedWidth: true },
            { id: 'count', title: i18nString(UIStrings.count), width: '65px', sortable: true, fixedWidth: true },
            { id: 'liveSize', title: i18nString(UIStrings.liveSize), width: '75px', sortable: true, fixedWidth: true },
            {
                id: 'size',
                title: i18nString(UIStrings.size),
                width: '75px',
                sortable: true,
                fixedWidth: true,
                sort: DataGrid.DataGrid.Order.Descending,
            },
            { id: 'name', title: i18nString(UIStrings.function), disclosure: true, sortable: true },
        ];
        super(heapProfilerModel, dataDisplayDelegate, { displayName: i18nString(UIStrings.allocation).toString(), columns });
        // clang-format on
        this._linkifier = new Components.Linkifier.Linkifier();
    }
    get linkifier() {
        return this._linkifier;
    }
    dispose() {
        this._linkifier.reset();
    }
    async setDataSource(snapshot, _nodeIndex) {
        this.snapshot = snapshot;
        this._topNodes = await this.snapshot.allocationTracesTops();
        this._populateChildren();
    }
    _populateChildren() {
        this.removeTopLevelNodes();
        const root = this.rootNode();
        const tops = this._topNodes || [];
        for (const top of tops) {
            this.appendNode(root, new AllocationGridNode(this, top));
        }
        this.updateVisibleNodes(true);
    }
    sortingChanged() {
        if (this._topNodes !== undefined) {
            this._topNodes.sort(this.createComparator());
            this.rootNode().removeChildren();
            this._populateChildren();
        }
    }
    createComparator() {
        const fieldName = this.sortColumnId();
        const compareResult = (this.sortOrder() === DataGrid.DataGrid.Order.Ascending) ? +1 : -1;
        function compare(a, b) {
            // @ts-ignore
            if (a[fieldName] > b[fieldName]) {
                return compareResult;
            }
            // @ts-ignore
            if (a[fieldName] < b[fieldName]) {
                return -compareResult;
            }
            return 0;
        }
        return compare;
    }
}
//# sourceMappingURL=HeapSnapshotDataGrids.js.map