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
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as Root from '../../core/root/root.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as HeapSnapshotModel from '../../models/heap_snapshot_model/heap_snapshot_model.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as ObjectUI from '../../ui/legacy/components/object_ui/object_ui.js';
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import { AllocationDataGrid, HeapSnapshotSortableDataGridEvents, HeapSnapshotConstructorsDataGrid, HeapSnapshotDiffDataGrid, HeapSnapshotRetainmentDataGrid, HeapSnapshotContainmentDataGrid } from './HeapSnapshotDataGrids.js';
import { HeapSnapshotGenericObjectNode } from './HeapSnapshotGridNodes.js';
import { HeapSnapshotWorkerProxy } from './HeapSnapshotProxy.js';
import { HeapTimelineOverview, IdsRangeChanged, Samples } from './HeapTimelineOverview.js';
import * as ModuleUIStrings from './ModuleUIStrings.js';
import { Events as ProfileHeaderEvents, ProfileEvents as ProfileTypeEvents, ProfileHeader, ProfileType } from './ProfileHeader.js';
import { ProfileSidebarTreeElement } from './ProfileSidebarTreeElement.js';
import { instance } from './ProfileTypeRegistry.js';
const UIStrings = {
    /**
    *@description Text to find an item
    */
    find: 'Find',
    /**
    *@description Text in Heap Snapshot View of a profiler tool
    */
    containment: 'Containment',
    /**
    *@description Retaining paths title text content in Heap Snapshot View of a profiler tool
    */
    retainers: 'Retainers',
    /**
    *@description Text in Heap Snapshot View of a profiler tool
    */
    allocationStack: 'Allocation stack',
    /**
    *@description Screen reader label for a select box that chooses the perspective in the Memory panel when vieweing a Heap Snapshot
    */
    perspective: 'Perspective',
    /**
    *@description Screen reader label for a select box that chooses the snapshot to use as a base in the Memory panel when vieweing a Heap Snapshot
    */
    baseSnapshot: 'Base snapshot',
    /**
    *@description Text to filter result items
    */
    filter: 'Filter',
    /**
    * @description Filter label text in the Memory tool to filter by JavaScript class names for a heap
    * snapshot.
    */
    classFilter: 'Class filter',
    /**
    *@description Text in Heap Snapshot View of a profiler tool
    */
    code: 'Code',
    /**
    *@description Text in Heap Snapshot View of a profiler tool
    */
    strings: 'Strings',
    /**
    *@description Label on a pie chart in the statistics view for the Heap Snapshot tool
    */
    jsArrays: 'JS arrays',
    /**
    *@description Label on a pie chart in the statistics view for the Heap Snapshot tool
    */
    typedArrays: 'Typed arrays',
    /**
    *@description Label on a pie chart in the statistics view for the Heap Snapshot tool
    */
    systemObjects: 'System objects',
    /**
    *@description The reported total size used in the selected time frame of the allocation sampling profile
    *@example {3 MB} PH1
    */
    selectedSizeS: 'Selected size: {PH1}',
    /**
    *@description Text in Heap Snapshot View of a profiler tool
    */
    allObjects: 'All objects',
    /**
    *@description Title in Heap Snapshot View of a profiler tool
    *@example {Profile 2} PH1
    */
    objectsAllocatedBeforeS: 'Objects allocated before {PH1}',
    /**
    *@description Title in Heap Snapshot View of a profiler tool
    *@example {Profile 1} PH1
    *@example {Profile 2} PH2
    */
    objectsAllocatedBetweenSAndS: 'Objects allocated between {PH1} and {PH2}',
    /**
    *@description Text for the summary view
    */
    summary: 'Summary',
    /**
    *@description Text in Heap Snapshot View of a profiler tool
    */
    comparison: 'Comparison',
    /**
    *@description Text in Heap Snapshot View of a profiler tool
    */
    allocation: 'Allocation',
    /**
    *@description Title text content in Heap Snapshot View of a profiler tool
    */
    liveObjects: 'Live objects',
    /**
    *@description Text in Heap Snapshot View of a profiler tool
    */
    statistics: 'Statistics',
    /**
    *@description Text in Heap Snapshot View of a profiler tool
    */
    heapSnapshot: 'Heap snapshot',
    /**
    *@description Text in Heap Snapshot View of a profiler tool
    */
    takeHeapSnapshot: 'Take heap snapshot',
    /**
    *@description Text in Heap Snapshot View of a profiler tool
    */
    heapSnapshots: 'HEAP SNAPSHOTS',
    /**
    *@description Text in Heap Snapshot View of a profiler tool
    */
    heapSnapshotProfilesShowMemory: 'Heap snapshot profiles show memory distribution among your page\'s JavaScript objects and related DOM nodes.',
    /**
    *@description Text in Heap Snapshot View of a profiler tool
    */
    treatGlobalObjectsAsRoots: 'Treat global objects as roots (recommended, unchecking this exposes internal nodes and introduces excessive detail, but might help debugging cycles in retaining paths)',
    /**
    *@description Text in Heap Snapshot View of a profiler tool
    * This option turns on inclusion of numerical values in the heap snapshot.
    */
    captureNumericValue: 'Include numerical values in capture',
    /**
    *@description Progress update that the profiler is capturing a snapshot of the heap
    */
    snapshotting: 'Snapshotting…',
    /**
    *@description Profile title in Heap Snapshot View of a profiler tool
    *@example {1} PH1
    */
    snapshotD: 'Snapshot {PH1}',
    /**
    *@description Text for a percentage value
    *@example {13.0} PH1
    */
    percentagePlaceholder: '{PH1}%',
    /**
    *@description Text in Heap Snapshot View of a profiler tool
    */
    allocationInstrumentationOn: 'Allocation instrumentation on timeline',
    /**
    *@description Text in Heap Snapshot View of a profiler tool
    */
    stopRecordingHeapProfile: 'Stop recording heap profile',
    /**
    *@description Text in Heap Snapshot View of a profiler tool
    */
    startRecordingHeapProfile: 'Start recording heap profile',
    /**
    *@description Text in Heap Snapshot View of a profiler tool.
    * A stack trace is a list of functions that were called.
    * This option turns on recording of a stack trace at each allocation.
    * The recording itself is a somewhat expensive operation, so turning this option on, the website's performance may be affected negatively (e.g. everything becomes slower).
    */
    recordAllocationStacksExtra: 'Record stack traces of allocations (extra performance overhead)',
    /**
    *@description Text in CPUProfile View of a profiler tool
    */
    recording: 'Recording…',
    /**
    *@description Text in Heap Snapshot View of a profiler tool
    */
    allocationTimelines: 'ALLOCATION TIMELINES',
    /**
    *@description Description for the 'Allocation timeline' tool in the Memory panel.
    */
    AllocationTimelinesShowInstrumented: 'Allocation timelines show instrumented JavaScript memory allocations over time. Once profile is recorded you can select a time interval to see objects that were allocated within it and still alive by the end of recording. Use this profile type to isolate memory leaks.',
    /**
    *@description Text when something is loading
    */
    loading: 'Loading…',
    /**
    *@description Text in Heap Snapshot View of a profiler tool
    *@example {30} PH1
    */
    savingD: 'Saving… {PH1}%',
    /**
    *@description Text in Heap Snapshot View of a profiler tool
    *@example {1,021} PH1
    */
    sKb: '{PH1} kB',
    /**
    *@description Text in Heap Snapshot View of a profiler tool
    */
    heapMemoryUsage: 'Heap memory usage',
    /**
    *@description Text of a DOM element in Heap Snapshot View of a profiler tool
    */
    stackWasNotRecordedForThisObject: 'Stack was not recorded for this object because it had been allocated before this profile recording started.',
};
const str_ = i18n.i18n.registerUIStrings('panels/profiler/HeapSnapshotView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
// The way this is handled is to workaround the strings inside the heap_snapshot_worker
// If strings are removed from inside the worker strings can be declared in this module
// as any other.
// eslint-disable-next-line @typescript-eslint/naming-convention
const moduleUIstr_ = i18n.i18n.registerUIStrings('panels/profiler/ModuleUIStrings.ts', ModuleUIStrings.UIStrings);
const moduleI18nString = i18n.i18n.getLocalizedString.bind(undefined, moduleUIstr_);
export class HeapSnapshotView extends UI.View.SimpleView {
    _searchResults;
    _profile;
    _linkifier;
    _parentDataDisplayDelegate;
    _searchableView;
    _splitWidget;
    _containmentDataGrid;
    _containmentWidget;
    _statisticsView;
    _constructorsDataGrid;
    _constructorsWidget;
    _diffDataGrid;
    _diffWidget;
    _allocationDataGrid;
    _allocationWidget;
    _allocationStackView;
    _tabbedPane;
    _retainmentDataGrid;
    _retainmentWidget;
    _objectDetailsView;
    _perspectives;
    _comparisonPerspective;
    _perspectiveSelect;
    _baseSelect;
    _filterSelect;
    _classNameFilter;
    _selectedSizeText;
    _popoverHelper;
    _currentPerspectiveIndex;
    _currentPerspective;
    _dataGrid;
    _searchThrottler;
    _baseProfile;
    _trackingOverviewGrid;
    _currentSearchResultIndex = -1;
    currentQuery;
    constructor(dataDisplayDelegate, profile) {
        super(i18nString(UIStrings.heapSnapshot));
        this._searchResults = [];
        this.element.classList.add('heap-snapshot-view');
        this._profile = profile;
        this._linkifier = new Components.Linkifier.Linkifier();
        const profileType = profile.profileType();
        profileType.addEventListener(HeapSnapshotProfileType.SnapshotReceived, this._onReceiveSnapshot, this);
        profileType.addEventListener(ProfileTypeEvents.RemoveProfileHeader, this._onProfileHeaderRemoved, this);
        const isHeapTimeline = profileType.id === TrackingHeapSnapshotProfileType.TypeId;
        if (isHeapTimeline) {
            this._createOverview();
        }
        this._parentDataDisplayDelegate = dataDisplayDelegate;
        this._searchableView = new UI.SearchableView.SearchableView(this, null);
        this._searchableView.setPlaceholder(i18nString(UIStrings.find), i18nString(UIStrings.find));
        this._searchableView.show(this.element);
        this._splitWidget = new UI.SplitWidget.SplitWidget(false, true, 'heapSnapshotSplitViewState', 200, 200);
        this._splitWidget.show(this._searchableView.element);
        const heapProfilerModel = profile.heapProfilerModel();
        this._containmentDataGrid = new HeapSnapshotContainmentDataGrid(heapProfilerModel, this, /* displayName */ i18nString(UIStrings.containment));
        this._containmentDataGrid.addEventListener(DataGrid.DataGrid.Events.SelectedNode, this._selectionChanged, this);
        this._containmentWidget = this._containmentDataGrid.asWidget();
        this._containmentWidget.setMinimumSize(50, 25);
        this._statisticsView = new HeapSnapshotStatisticsView();
        this._constructorsDataGrid = new HeapSnapshotConstructorsDataGrid(heapProfilerModel, this);
        this._constructorsDataGrid.addEventListener(DataGrid.DataGrid.Events.SelectedNode, this._selectionChanged, this);
        this._constructorsWidget = this._constructorsDataGrid.asWidget();
        this._constructorsWidget.setMinimumSize(50, 25);
        this._diffDataGrid = new HeapSnapshotDiffDataGrid(heapProfilerModel, this);
        this._diffDataGrid.addEventListener(DataGrid.DataGrid.Events.SelectedNode, this._selectionChanged, this);
        this._diffWidget = this._diffDataGrid.asWidget();
        this._diffWidget.setMinimumSize(50, 25);
        this._allocationDataGrid = null;
        if (isHeapTimeline) {
            this._allocationDataGrid = new AllocationDataGrid(heapProfilerModel, this);
            this._allocationDataGrid.addEventListener(DataGrid.DataGrid.Events.SelectedNode, this._onSelectAllocationNode, this);
            this._allocationWidget = this._allocationDataGrid.asWidget();
            this._allocationWidget.setMinimumSize(50, 25);
            this._allocationStackView = new HeapAllocationStackView(heapProfilerModel);
            this._allocationStackView.setMinimumSize(50, 25);
            this._tabbedPane = new UI.TabbedPane.TabbedPane();
        }
        this._retainmentDataGrid = new HeapSnapshotRetainmentDataGrid(heapProfilerModel, this);
        this._retainmentWidget = this._retainmentDataGrid.asWidget();
        this._retainmentWidget.setMinimumSize(50, 21);
        this._retainmentWidget.element.classList.add('retaining-paths-view');
        let splitWidgetResizer;
        if (this._allocationStackView) {
            this._tabbedPane = new UI.TabbedPane.TabbedPane();
            this._tabbedPane.appendTab('retainers', i18nString(UIStrings.retainers), this._retainmentWidget);
            this._tabbedPane.appendTab('allocation-stack', i18nString(UIStrings.allocationStack), this._allocationStackView);
            splitWidgetResizer = this._tabbedPane.headerElement();
            this._objectDetailsView = this._tabbedPane;
        }
        else {
            const retainmentViewHeader = document.createElement('div');
            retainmentViewHeader.classList.add('heap-snapshot-view-resizer');
            const retainingPathsTitleDiv = retainmentViewHeader.createChild('div', 'title');
            const retainingPathsTitle = retainingPathsTitleDiv.createChild('span');
            retainingPathsTitle.textContent = i18nString(UIStrings.retainers);
            splitWidgetResizer = retainmentViewHeader;
            this._objectDetailsView = new UI.Widget.VBox();
            this._objectDetailsView.element.appendChild(retainmentViewHeader);
            this._retainmentWidget.show(this._objectDetailsView.element);
        }
        this._splitWidget.hideDefaultResizer();
        this._splitWidget.installResizer(splitWidgetResizer);
        this._retainmentDataGrid.addEventListener(DataGrid.DataGrid.Events.SelectedNode, this._inspectedObjectChanged, this);
        this._retainmentDataGrid.reset();
        this._perspectives = [];
        this._comparisonPerspective = new ComparisonPerspective();
        this._perspectives.push(new SummaryPerspective());
        if (profile.profileType() !== instance.trackingHeapSnapshotProfileType) {
            this._perspectives.push(this._comparisonPerspective);
        }
        this._perspectives.push(new ContainmentPerspective());
        if (this._allocationWidget) {
            this._perspectives.push(new AllocationPerspective());
        }
        this._perspectives.push(new StatisticsPerspective());
        this._perspectiveSelect = new UI.Toolbar.ToolbarComboBox(this._onSelectedPerspectiveChanged.bind(this), i18nString(UIStrings.perspective));
        this._updatePerspectiveOptions();
        this._baseSelect = new UI.Toolbar.ToolbarComboBox(this._changeBase.bind(this), i18nString(UIStrings.baseSnapshot));
        this._baseSelect.setVisible(false);
        this._updateBaseOptions();
        this._filterSelect = new UI.Toolbar.ToolbarComboBox(this._changeFilter.bind(this), i18nString(UIStrings.filter));
        this._filterSelect.setVisible(false);
        this._updateFilterOptions();
        this._classNameFilter = new UI.Toolbar.ToolbarInput(i18nString(UIStrings.classFilter));
        this._classNameFilter.setVisible(false);
        this._constructorsDataGrid.setNameFilter(this._classNameFilter);
        this._diffDataGrid.setNameFilter(this._classNameFilter);
        this._selectedSizeText = new UI.Toolbar.ToolbarText();
        this._popoverHelper = new UI.PopoverHelper.PopoverHelper(this.element, this._getPopoverRequest.bind(this));
        this._popoverHelper.setDisableOnClick(true);
        this._popoverHelper.setHasPadding(true);
        this.element.addEventListener('scroll', this._popoverHelper.hidePopover.bind(this._popoverHelper), true);
        this._currentPerspectiveIndex = 0;
        this._currentPerspective = this._perspectives[0];
        this._currentPerspective.activate(this);
        this._dataGrid = this._currentPerspective.masterGrid(this);
        this._populate();
        this._searchThrottler = new Common.Throttler.Throttler(0);
        for (const existingProfile of this._profiles()) {
            existingProfile.addEventListener(ProfileHeaderEvents.ProfileTitleChanged, this._updateControls, this);
        }
    }
    _createOverview() {
        const profileType = this._profile.profileType();
        this._trackingOverviewGrid = new HeapTimelineOverview();
        this._trackingOverviewGrid.addEventListener(IdsRangeChanged, this._onIdsRangeChanged.bind(this));
        if (!this._profile.fromFile() && profileType.profileBeingRecorded() === this._profile) {
            profileType.addEventListener(TrackingHeapSnapshotProfileType.HeapStatsUpdate, this._onHeapStatsUpdate, this);
            profileType.addEventListener(TrackingHeapSnapshotProfileType.TrackingStopped, this._onStopTracking, this);
            this._trackingOverviewGrid.start();
        }
    }
    _onStopTracking() {
        this._profile.profileType().removeEventListener(TrackingHeapSnapshotProfileType.HeapStatsUpdate, this._onHeapStatsUpdate, this);
        this._profile.profileType().removeEventListener(TrackingHeapSnapshotProfileType.TrackingStopped, this._onStopTracking, this);
        if (this._trackingOverviewGrid) {
            this._trackingOverviewGrid.stop();
        }
    }
    _onHeapStatsUpdate(event) {
        const samples = event.data;
        if (samples && this._trackingOverviewGrid) {
            this._trackingOverviewGrid.setSamples(event.data);
        }
    }
    searchableView() {
        return this._searchableView;
    }
    showProfile(profile) {
        return this._parentDataDisplayDelegate.showProfile(profile);
    }
    showObject(snapshotObjectId, perspectiveName) {
        if (Number(snapshotObjectId) <= this._profile.maxJSObjectId) {
            this.selectLiveObject(perspectiveName, snapshotObjectId);
        }
        else {
            this._parentDataDisplayDelegate.showObject(snapshotObjectId, perspectiveName);
        }
    }
    async linkifyObject(nodeIndex) {
        const heapProfilerModel = this._profile.heapProfilerModel();
        // heapProfilerModel is null if snapshot was loaded from file
        if (!heapProfilerModel) {
            return null;
        }
        const location = await this._profile.getLocation(nodeIndex);
        if (!location) {
            return null;
        }
        const debuggerModel = heapProfilerModel.runtimeModel().debuggerModel();
        const rawLocation = debuggerModel.createRawLocationByScriptId(String(location.scriptId), location.lineNumber, location.columnNumber);
        if (!rawLocation) {
            return null;
        }
        const script = rawLocation.script();
        const sourceURL = script && script.sourceURL;
        return sourceURL && this._linkifier ? this._linkifier.linkifyRawLocation(rawLocation, sourceURL) : null;
    }
    async _populate() {
        const heapSnapshotProxy = await this._profile._loadPromise;
        this._retrieveStatistics(heapSnapshotProxy);
        if (this._dataGrid) {
            this._dataGrid.setDataSource(heapSnapshotProxy, 0);
        }
        if (this._profile.profileType().id === TrackingHeapSnapshotProfileType.TypeId && this._profile.fromFile()) {
            const samples = await heapSnapshotProxy.getSamples();
            if (samples) {
                console.assert(Boolean(samples.timestamps.length));
                const profileSamples = new Samples();
                profileSamples.sizes = samples.sizes;
                profileSamples.ids = samples.lastAssignedIds;
                profileSamples.timestamps = samples.timestamps;
                profileSamples.max = samples.sizes;
                profileSamples.totalTime = Math.max(samples.timestamps[samples.timestamps.length - 1] || 0, 10000);
                if (this._trackingOverviewGrid) {
                    this._trackingOverviewGrid.setSamples(profileSamples);
                }
            }
        }
        const list = this._profiles();
        const profileIndex = list.indexOf(this._profile);
        this._baseSelect.setSelectedIndex(Math.max(0, profileIndex - 1));
        if (this._trackingOverviewGrid) {
            this._trackingOverviewGrid.updateGrid();
        }
    }
    async _retrieveStatistics(heapSnapshotProxy) {
        const statistics = await heapSnapshotProxy.getStatistics();
        const records = [
            { value: statistics.code, color: '#f77', title: i18nString(UIStrings.code) },
            { value: statistics.strings, color: '#5e5', title: i18nString(UIStrings.strings) },
            { value: statistics.jsArrays, color: '#7af', title: i18nString(UIStrings.jsArrays) },
            { value: statistics.native, color: '#fc5', title: i18nString(UIStrings.typedArrays) },
            { value: statistics.system, color: '#98f', title: i18nString(UIStrings.systemObjects) },
        ];
        this._statisticsView.setTotalAndRecords(statistics.total, records);
        return statistics;
    }
    _onIdsRangeChanged(event) {
        const minId = event.data.minId;
        const maxId = event.data.maxId;
        this._selectedSizeText.setText(i18nString(UIStrings.selectedSizeS, { PH1: Platform.NumberUtilities.bytesToString(event.data.size) }));
        if (this._constructorsDataGrid.snapshot) {
            this._constructorsDataGrid.setSelectionRange(minId, maxId);
        }
    }
    async toolbarItems() {
        const result = [this._perspectiveSelect, this._classNameFilter];
        if (this._profile.profileType() !== instance.trackingHeapSnapshotProfileType) {
            result.push(this._baseSelect, this._filterSelect);
        }
        result.push(this._selectedSizeText);
        return result;
    }
    willHide() {
        this._currentSearchResultIndex = -1;
        this._popoverHelper.hidePopover();
    }
    supportsCaseSensitiveSearch() {
        return true;
    }
    supportsRegexSearch() {
        return false;
    }
    searchCanceled() {
        this._currentSearchResultIndex = -1;
        /** @type {!Array<number>} */
        this._searchResults = [];
    }
    _selectRevealedNode(node) {
        if (node) {
            node.select();
        }
    }
    performSearch(searchConfig, shouldJump, jumpBackwards) {
        const nextQuery = new HeapSnapshotModel.HeapSnapshotModel.SearchConfig(searchConfig.query.trim(), searchConfig.caseSensitive, searchConfig.isRegex, shouldJump, jumpBackwards || false);
        this._searchThrottler.schedule(this._performSearch.bind(this, nextQuery));
    }
    async _performSearch(nextQuery) {
        // Call searchCanceled since it will reset everything we need before doing a new search.
        this.searchCanceled();
        if (!this._currentPerspective.supportsSearch()) {
            return;
        }
        this.currentQuery = nextQuery;
        const query = nextQuery.query.trim();
        if (!query) {
            return;
        }
        if (query.charAt(0) === '@') {
            const snapshotNodeId = parseInt(query.substring(1), 10);
            if (isNaN(snapshotNodeId)) {
                return;
            }
            if (!this._dataGrid) {
                return;
            }
            const node = await this._dataGrid.revealObjectByHeapSnapshotId(String(snapshotNodeId));
            this._selectRevealedNode(node);
            return;
        }
        if (!this._profile._snapshotProxy || !this._dataGrid) {
            return;
        }
        const filter = this._dataGrid.nodeFilter();
        this._searchResults = filter ? await this._profile._snapshotProxy.search(this.currentQuery, filter) : [];
        this._searchableView.updateSearchMatchesCount(this._searchResults.length);
        if (this._searchResults.length) {
            this._currentSearchResultIndex = nextQuery.jumpBackward ? this._searchResults.length - 1 : 0;
        }
        await this._jumpToSearchResult(this._currentSearchResultIndex);
    }
    jumpToNextSearchResult() {
        if (!this._searchResults.length) {
            return;
        }
        this._currentSearchResultIndex = (this._currentSearchResultIndex + 1) % this._searchResults.length;
        this._searchThrottler.schedule(this._jumpToSearchResult.bind(this, this._currentSearchResultIndex));
    }
    jumpToPreviousSearchResult() {
        if (!this._searchResults.length) {
            return;
        }
        this._currentSearchResultIndex =
            (this._currentSearchResultIndex + this._searchResults.length - 1) % this._searchResults.length;
        this._searchThrottler.schedule(this._jumpToSearchResult.bind(this, this._currentSearchResultIndex));
    }
    async _jumpToSearchResult(searchResultIndex) {
        this._searchableView.updateCurrentMatchIndex(searchResultIndex);
        if (searchResultIndex === -1) {
            return;
        }
        if (!this._dataGrid) {
            return;
        }
        const node = await this._dataGrid.revealObjectByHeapSnapshotId(String(this._searchResults[searchResultIndex]));
        this._selectRevealedNode(node);
    }
    refreshVisibleData() {
        if (!this._dataGrid) {
            return;
        }
        let child = this._dataGrid.rootNode().children[0];
        while (child) {
            child.refresh();
            child = child.traverseNextNode(false, null, true);
        }
    }
    _changeBase() {
        if (this._baseProfile === this._profiles()[this._baseSelect.selectedIndex()]) {
            return;
        }
        this._baseProfile = this._profiles()[this._baseSelect.selectedIndex()];
        const dataGrid = this._dataGrid;
        // Change set base data source only if main data source is already set.
        if (dataGrid.snapshot) {
            this._baseProfile._loadPromise.then(dataGrid.setBaseDataSource.bind(dataGrid));
        }
        if (!this.currentQuery || !this._searchResults) {
            return;
        }
        // The current search needs to be performed again. First negate out previous match
        // count by calling the search finished callback with a negative number of matches.
        // Then perform the search again with the same query and callback.
        this.performSearch(this.currentQuery, false);
    }
    _changeFilter() {
        const profileIndex = this._filterSelect.selectedIndex() - 1;
        if (!this._dataGrid) {
            return;
        }
        this._dataGrid
            .filterSelectIndexChanged(this._profiles(), profileIndex);
        if (!this.currentQuery || !this._searchResults) {
            return;
        }
        // The current search needs to be performed again. First negate out previous match
        // count by calling the search finished callback with a negative number of matches.
        // Then perform the search again with the same query and callback.
        this.performSearch(this.currentQuery, false);
    }
    _profiles() {
        return this._profile.profileType().getProfiles();
    }
    _selectionChanged(event) {
        const selectedNode = event.data;
        this._setSelectedNodeForDetailsView(selectedNode);
        this._inspectedObjectChanged(event);
    }
    _onSelectAllocationNode(event) {
        const selectedNode = event.data;
        this._constructorsDataGrid.setAllocationNodeId(selectedNode.allocationNodeId());
        this._setSelectedNodeForDetailsView(null);
    }
    _inspectedObjectChanged(event) {
        const selectedNode = event.data;
        const heapProfilerModel = this._profile.heapProfilerModel();
        if (heapProfilerModel && selectedNode instanceof HeapSnapshotGenericObjectNode) {
            heapProfilerModel.addInspectedHeapObject(String(selectedNode.snapshotNodeId));
        }
    }
    _setSelectedNodeForDetailsView(nodeItem) {
        const dataSource = nodeItem && nodeItem.retainersDataSource();
        if (dataSource) {
            this._retainmentDataGrid.setDataSource(dataSource.snapshot, dataSource.snapshotNodeIndex);
            if (this._allocationStackView) {
                this._allocationStackView.setAllocatedObject(dataSource.snapshot, dataSource.snapshotNodeIndex);
            }
        }
        else {
            if (this._allocationStackView) {
                this._allocationStackView.clear();
            }
            this._retainmentDataGrid.reset();
        }
    }
    async _changePerspectiveAndWait(perspectiveTitle) {
        const perspectiveIndex = this._perspectives.findIndex(perspective => perspective.title() === perspectiveTitle);
        if (perspectiveIndex === -1 || this._currentPerspectiveIndex === perspectiveIndex) {
            return;
        }
        const dataGrid = this._perspectives[perspectiveIndex].masterGrid(this);
        if (!dataGrid) {
            return;
        }
        const promise = dataGrid.once(HeapSnapshotSortableDataGridEvents.ContentShown);
        const option = this._perspectiveSelect.options().find(option => option.value === String(perspectiveIndex));
        this._perspectiveSelect.select(option);
        this._changePerspective(perspectiveIndex);
        return promise;
    }
    async _updateDataSourceAndView() {
        const dataGrid = this._dataGrid;
        if (!dataGrid || dataGrid.snapshot) {
            return;
        }
        const snapshotProxy = await this._profile._loadPromise;
        if (this._dataGrid !== dataGrid) {
            return;
        }
        if (dataGrid.snapshot !== snapshotProxy) {
            dataGrid.setDataSource(snapshotProxy, 0);
        }
        if (dataGrid !== this._diffDataGrid) {
            return;
        }
        if (!this._baseProfile) {
            this._baseProfile = this._profiles()[this._baseSelect.selectedIndex()];
        }
        const baseSnapshotProxy = await this._baseProfile._loadPromise;
        if (this._diffDataGrid.baseSnapshot !== baseSnapshotProxy) {
            this._diffDataGrid.setBaseDataSource(baseSnapshotProxy);
        }
    }
    _onSelectedPerspectiveChanged(event) {
        this._changePerspective(Number(event.target.selectedOptions[0].value));
    }
    _changePerspective(selectedIndex) {
        if (selectedIndex === this._currentPerspectiveIndex) {
            return;
        }
        this._currentPerspectiveIndex = selectedIndex;
        this._currentPerspective.deactivate(this);
        const perspective = this._perspectives[selectedIndex];
        this._currentPerspective = perspective;
        this._dataGrid = perspective.masterGrid(this);
        perspective.activate(this);
        this.refreshVisibleData();
        if (this._dataGrid) {
            this._dataGrid.updateWidths();
        }
        this._updateDataSourceAndView();
        if (!this.currentQuery || !this._searchResults) {
            return;
        }
        // The current search needs to be performed again. First negate out previous match
        // count by calling the search finished callback with a negative number of matches.
        // Then perform the search again the with same query and callback.
        this.performSearch(this.currentQuery, false);
    }
    async selectLiveObject(perspectiveName, snapshotObjectId) {
        await this._changePerspectiveAndWait(perspectiveName);
        if (!this._dataGrid) {
            return;
        }
        const node = await this._dataGrid.revealObjectByHeapSnapshotId(snapshotObjectId);
        if (node) {
            node.select();
        }
        else {
            Common.Console.Console.instance().error('Cannot find corresponding heap snapshot node');
        }
    }
    _getPopoverRequest(event) {
        const span = 
        /** @type {?HTMLElement} */ (UI.UIUtils.enclosingNodeOrSelfWithNodeName(event.target, 'span'));
        const row = UI.UIUtils.enclosingNodeOrSelfWithNodeName(event.target, 'tr');
        if (!row) {
            return null;
        }
        if (!this._dataGrid) {
            return null;
        }
        const node = this._dataGrid.dataGridNodeFromNode(row) || this._containmentDataGrid.dataGridNodeFromNode(row) ||
            this._constructorsDataGrid.dataGridNodeFromNode(row) || this._diffDataGrid.dataGridNodeFromNode(row) ||
            (this._allocationDataGrid && this._allocationDataGrid.dataGridNodeFromNode(row)) ||
            this._retainmentDataGrid.dataGridNodeFromNode(row);
        const heapProfilerModel = this._profile.heapProfilerModel();
        if (!node || !span || !heapProfilerModel) {
            return null;
        }
        let objectPopoverHelper;
        return {
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
            // @ts-expect-error
            box: span.boxInWindow(),
            show: async (popover) => {
                if (!heapProfilerModel) {
                    return false;
                }
                const remoteObject = await node.queryObjectContent(heapProfilerModel, 'popover');
                if (!remoteObject) {
                    return false;
                }
                objectPopoverHelper =
                    await ObjectUI.ObjectPopoverHelper.ObjectPopoverHelper.buildObjectPopover(remoteObject, popover);
                if (!objectPopoverHelper) {
                    heapProfilerModel.runtimeModel().releaseObjectGroup('popover');
                    return false;
                }
                return true;
            },
            hide: () => {
                heapProfilerModel.runtimeModel().releaseObjectGroup('popover');
                if (objectPopoverHelper) {
                    objectPopoverHelper.dispose();
                }
            },
        };
    }
    _updatePerspectiveOptions() {
        const multipleSnapshots = this._profiles().length > 1;
        this._perspectiveSelect.removeOptions();
        this._perspectives.forEach((perspective, index) => {
            if (multipleSnapshots || perspective !== this._comparisonPerspective) {
                this._perspectiveSelect.createOption(perspective.title(), String(index));
            }
        });
    }
    _updateBaseOptions() {
        const list = this._profiles();
        const selectedIndex = this._baseSelect.selectedIndex();
        this._baseSelect.removeOptions();
        for (const item of list) {
            this._baseSelect.createOption(item.title);
        }
        if (selectedIndex > -1) {
            this._baseSelect.setSelectedIndex(selectedIndex);
        }
    }
    _updateFilterOptions() {
        const list = this._profiles();
        const selectedIndex = this._filterSelect.selectedIndex();
        this._filterSelect.removeOptions();
        this._filterSelect.createOption(i18nString(UIStrings.allObjects));
        for (let i = 0; i < list.length; ++i) {
            let title;
            if (!i) {
                title = i18nString(UIStrings.objectsAllocatedBeforeS, { PH1: list[i].title });
            }
            else {
                title = i18nString(UIStrings.objectsAllocatedBetweenSAndS, { PH1: list[i - 1].title, PH2: list[i].title });
            }
            this._filterSelect.createOption(title);
        }
        if (selectedIndex > -1) {
            this._filterSelect.setSelectedIndex(selectedIndex);
        }
    }
    _updateControls() {
        this._updatePerspectiveOptions();
        this._updateBaseOptions();
        this._updateFilterOptions();
    }
    _onReceiveSnapshot(event) {
        this._updateControls();
        const profile = event.data;
        profile.addEventListener(ProfileHeaderEvents.ProfileTitleChanged, this._updateControls, this);
    }
    _onProfileHeaderRemoved(event) {
        const profile = event.data;
        profile.removeEventListener(ProfileHeaderEvents.ProfileTitleChanged, this._updateControls, this);
        if (this._profile === profile) {
            this.detach();
            this._profile.profileType().removeEventListener(HeapSnapshotProfileType.SnapshotReceived, this._onReceiveSnapshot, this);
            this._profile.profileType().removeEventListener(ProfileTypeEvents.RemoveProfileHeader, this._onProfileHeaderRemoved, this);
            this.dispose();
        }
        else {
            this._updateControls();
        }
    }
    dispose() {
        this._linkifier.dispose();
        this._popoverHelper.dispose();
        if (this._allocationStackView) {
            this._allocationStackView.clear();
            if (this._allocationDataGrid) {
                this._allocationDataGrid.dispose();
            }
        }
        this._onStopTracking();
        if (this._trackingOverviewGrid) {
            this._trackingOverviewGrid.removeEventListener(IdsRangeChanged, this._onIdsRangeChanged.bind(this));
        }
    }
}
export class Perspective {
    _title;
    constructor(title) {
        this._title = title;
    }
    activate(_heapSnapshotView) {
    }
    deactivate(heapSnapshotView) {
        heapSnapshotView._baseSelect.setVisible(false);
        heapSnapshotView._filterSelect.setVisible(false);
        heapSnapshotView._classNameFilter.setVisible(false);
        if (heapSnapshotView._trackingOverviewGrid) {
            heapSnapshotView._trackingOverviewGrid.detach();
        }
        if (heapSnapshotView._allocationWidget) {
            heapSnapshotView._allocationWidget.detach();
        }
        if (heapSnapshotView._statisticsView) {
            heapSnapshotView._statisticsView.detach();
        }
        heapSnapshotView._splitWidget.detach();
        heapSnapshotView._splitWidget.detachChildWidgets();
    }
    masterGrid(_heapSnapshotView) {
        return null;
    }
    title() {
        return this._title;
    }
    supportsSearch() {
        return false;
    }
}
export class SummaryPerspective extends Perspective {
    constructor() {
        super(i18nString(UIStrings.summary));
    }
    activate(heapSnapshotView) {
        heapSnapshotView._splitWidget.setMainWidget(heapSnapshotView._constructorsWidget);
        heapSnapshotView._splitWidget.setSidebarWidget(heapSnapshotView._objectDetailsView);
        heapSnapshotView._splitWidget.show(heapSnapshotView._searchableView.element);
        heapSnapshotView._filterSelect.setVisible(true);
        heapSnapshotView._classNameFilter.setVisible(true);
        if (!heapSnapshotView._trackingOverviewGrid) {
            return;
        }
        heapSnapshotView._trackingOverviewGrid.show(heapSnapshotView._searchableView.element, heapSnapshotView._splitWidget.element);
        heapSnapshotView._trackingOverviewGrid.update();
        heapSnapshotView._trackingOverviewGrid.updateGrid();
    }
    masterGrid(heapSnapshotView) {
        return heapSnapshotView._constructorsDataGrid;
    }
    supportsSearch() {
        return true;
    }
}
export class ComparisonPerspective extends Perspective {
    constructor() {
        super(i18nString(UIStrings.comparison));
    }
    activate(heapSnapshotView) {
        heapSnapshotView._splitWidget.setMainWidget(heapSnapshotView._diffWidget);
        heapSnapshotView._splitWidget.setSidebarWidget(heapSnapshotView._objectDetailsView);
        heapSnapshotView._splitWidget.show(heapSnapshotView._searchableView.element);
        heapSnapshotView._baseSelect.setVisible(true);
        heapSnapshotView._classNameFilter.setVisible(true);
    }
    masterGrid(heapSnapshotView) {
        return heapSnapshotView._diffDataGrid;
    }
    supportsSearch() {
        return true;
    }
}
export class ContainmentPerspective extends Perspective {
    constructor() {
        super(i18nString(UIStrings.containment));
    }
    activate(heapSnapshotView) {
        heapSnapshotView._splitWidget.setMainWidget(heapSnapshotView._containmentWidget);
        heapSnapshotView._splitWidget.setSidebarWidget(heapSnapshotView._objectDetailsView);
        heapSnapshotView._splitWidget.show(heapSnapshotView._searchableView.element);
    }
    masterGrid(heapSnapshotView) {
        return heapSnapshotView._containmentDataGrid;
    }
}
export class AllocationPerspective extends Perspective {
    _allocationSplitWidget;
    constructor() {
        super(i18nString(UIStrings.allocation));
        this._allocationSplitWidget =
            new UI.SplitWidget.SplitWidget(false, true, 'heapSnapshotAllocationSplitViewState', 200, 200);
        this._allocationSplitWidget.setSidebarWidget(new UI.Widget.VBox());
    }
    activate(heapSnapshotView) {
        if (heapSnapshotView._allocationWidget) {
            this._allocationSplitWidget.setMainWidget(heapSnapshotView._allocationWidget);
        }
        heapSnapshotView._splitWidget.setMainWidget(heapSnapshotView._constructorsWidget);
        heapSnapshotView._splitWidget.setSidebarWidget(heapSnapshotView._objectDetailsView);
        const allocatedObjectsView = new UI.Widget.VBox();
        const resizer = document.createElement('div');
        resizer.classList.add('heap-snapshot-view-resizer');
        const title = resizer.createChild('div', 'title').createChild('span');
        title.textContent = i18nString(UIStrings.liveObjects);
        this._allocationSplitWidget.hideDefaultResizer();
        this._allocationSplitWidget.installResizer(resizer);
        allocatedObjectsView.element.appendChild(resizer);
        heapSnapshotView._splitWidget.show(allocatedObjectsView.element);
        this._allocationSplitWidget.setSidebarWidget(allocatedObjectsView);
        this._allocationSplitWidget.show(heapSnapshotView._searchableView.element);
        heapSnapshotView._constructorsDataGrid.clear();
        if (heapSnapshotView._allocationDataGrid) {
            const selectedNode = heapSnapshotView._allocationDataGrid.selectedNode;
            if (selectedNode) {
                heapSnapshotView._constructorsDataGrid.setAllocationNodeId(selectedNode.allocationNodeId());
            }
        }
    }
    deactivate(heapSnapshotView) {
        this._allocationSplitWidget.detach();
        super.deactivate(heapSnapshotView);
    }
    masterGrid(heapSnapshotView) {
        return heapSnapshotView._allocationDataGrid;
    }
}
export class StatisticsPerspective extends Perspective {
    constructor() {
        super(i18nString(UIStrings.statistics));
    }
    activate(heapSnapshotView) {
        heapSnapshotView._statisticsView.show(heapSnapshotView._searchableView.element);
    }
    masterGrid(_heapSnapshotView) {
        return null;
    }
}
export class HeapSnapshotProfileType extends ProfileType {
    _treatGlobalObjectsAsRoots;
    _captureNumericValue;
    _customContent;
    constructor(id, title) {
        super(id || HeapSnapshotProfileType.TypeId, title || i18nString(UIStrings.heapSnapshot));
        SDK.TargetManager.TargetManager.instance().observeModels(SDK.HeapProfilerModel.HeapProfilerModel, this);
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.HeapProfilerModel.HeapProfilerModel, SDK.HeapProfilerModel.Events.ResetProfiles, this._resetProfiles, this);
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.HeapProfilerModel.HeapProfilerModel, SDK.HeapProfilerModel.Events.AddHeapSnapshotChunk, this._addHeapSnapshotChunk, this);
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.HeapProfilerModel.HeapProfilerModel, SDK.HeapProfilerModel.Events.ReportHeapSnapshotProgress, this._reportHeapSnapshotProgress, this);
        this._treatGlobalObjectsAsRoots =
            Common.Settings.Settings.instance().createSetting('treatGlobalObjectsAsRoots', true);
        this._captureNumericValue = Common.Settings.Settings.instance().createSetting('captureNumericValue', false);
        this._customContent = null;
    }
    modelAdded(heapProfilerModel) {
        heapProfilerModel.enable();
    }
    modelRemoved(_heapProfilerModel) {
    }
    getProfiles() {
        return super.getProfiles();
    }
    fileExtension() {
        return '.heapsnapshot';
    }
    get buttonTooltip() {
        return i18nString(UIStrings.takeHeapSnapshot);
    }
    isInstantProfile() {
        return true;
    }
    buttonClicked() {
        this._takeHeapSnapshot();
        Host.userMetrics.actionTaken(Host.UserMetrics.Action.ProfilesHeapProfileTaken);
        return false;
    }
    get treeItemTitle() {
        return i18nString(UIStrings.heapSnapshots);
    }
    get description() {
        return i18nString(UIStrings.heapSnapshotProfilesShowMemory);
    }
    customContent() {
        const optionsContainer = document.createElement('div');
        const showOptionToNotTreatGlobalObjectsAsRoots = Root.Runtime.experiments.isEnabled('showOptionToNotTreatGlobalObjectsAsRoots');
        const omitParagraphElement = !showOptionToNotTreatGlobalObjectsAsRoots;
        if (showOptionToNotTreatGlobalObjectsAsRoots) {
            const treatGlobalObjectsAsRootsCheckbox = UI.SettingsUI.createSettingCheckbox(i18nString(UIStrings.treatGlobalObjectsAsRoots), this._treatGlobalObjectsAsRoots, omitParagraphElement);
            optionsContainer.appendChild(treatGlobalObjectsAsRootsCheckbox);
        }
        const captureNumericValueCheckbox = UI.SettingsUI.createSettingCheckbox(UIStrings.captureNumericValue, this._captureNumericValue, omitParagraphElement);
        optionsContainer.appendChild(captureNumericValueCheckbox);
        this._customContent = optionsContainer;
        return optionsContainer;
    }
    setCustomContentEnabled(enable) {
        if (this._customContent) {
            this._customContent.querySelectorAll('[is=dt-checkbox]').forEach(label => {
                label.checkboxElement.disabled = !enable;
            });
        }
    }
    createProfileLoadedFromFile(title) {
        return new HeapProfileHeader(null, this, title);
    }
    async _takeHeapSnapshot() {
        if (this.profileBeingRecorded()) {
            return;
        }
        const heapProfilerModel = UI.Context.Context.instance().flavor(SDK.HeapProfilerModel.HeapProfilerModel);
        if (!heapProfilerModel) {
            return;
        }
        let profile = new HeapProfileHeader(heapProfilerModel, this);
        this.setProfileBeingRecorded(profile);
        this.addProfile(profile);
        profile.updateStatus(i18nString(UIStrings.snapshotting));
        await heapProfilerModel.takeHeapSnapshot({
            reportProgress: true,
            treatGlobalObjectsAsRoots: this._treatGlobalObjectsAsRoots.get(),
            captureNumericValue: this._captureNumericValue.get(),
        });
        profile = this.profileBeingRecorded();
        if (!profile) {
            return;
        }
        profile.title = i18nString(UIStrings.snapshotD, { PH1: profile.uid });
        profile._finishLoad();
        this.setProfileBeingRecorded(null);
        this.dispatchEventToListeners(ProfileTypeEvents.ProfileComplete, profile);
    }
    _addHeapSnapshotChunk(event) {
        const profile = this.profileBeingRecorded();
        if (!profile) {
            return;
        }
        const chunk = event.data;
        profile.transferChunk(chunk);
    }
    _reportHeapSnapshotProgress(event) {
        const profile = this.profileBeingRecorded();
        if (!profile) {
            return;
        }
        const data = event.data;
        profile.updateStatus(i18nString(UIStrings.percentagePlaceholder, { PH1: ((data.done / data.total) * 100).toFixed(0) }), true);
        if (data.finished) {
            profile._prepareToLoad();
        }
    }
    _resetProfiles(event) {
        const heapProfilerModel = event.data;
        for (const profile of this.getProfiles()) {
            if (profile.heapProfilerModel() === heapProfilerModel) {
                this.removeProfile(profile);
            }
        }
    }
    _snapshotReceived(profile) {
        if (this.profileBeingRecorded() === profile) {
            this.setProfileBeingRecorded(null);
        }
        this.dispatchEventToListeners(HeapSnapshotProfileType.SnapshotReceived, profile);
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static TypeId = 'HEAP';
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static SnapshotReceived = 'SnapshotReceived';
}
export class TrackingHeapSnapshotProfileType extends HeapSnapshotProfileType {
    _recordAllocationStacksSetting;
    _customContent;
    _recording;
    _profileSamples;
    constructor() {
        super(TrackingHeapSnapshotProfileType.TypeId, i18nString(UIStrings.allocationInstrumentationOn));
        this._recordAllocationStacksSetting =
            Common.Settings.Settings.instance().createSetting('recordAllocationStacks', false);
        this._customContent = null;
        this._recording = false;
    }
    modelAdded(heapProfilerModel) {
        super.modelAdded(heapProfilerModel);
        heapProfilerModel.addEventListener(SDK.HeapProfilerModel.Events.HeapStatsUpdate, this._heapStatsUpdate, this);
        heapProfilerModel.addEventListener(SDK.HeapProfilerModel.Events.LastSeenObjectId, this._lastSeenObjectId, this);
    }
    modelRemoved(heapProfilerModel) {
        super.modelRemoved(heapProfilerModel);
        heapProfilerModel.removeEventListener(SDK.HeapProfilerModel.Events.HeapStatsUpdate, this._heapStatsUpdate, this);
        heapProfilerModel.removeEventListener(SDK.HeapProfilerModel.Events.LastSeenObjectId, this._lastSeenObjectId, this);
    }
    _heapStatsUpdate(event) {
        if (!this._profileSamples) {
            return;
        }
        const samples = event.data;
        let index;
        for (let i = 0; i < samples.length; i += 3) {
            index = samples[i];
            const size = samples[i + 2];
            this._profileSamples.sizes[index] = size;
            if (!this._profileSamples.max[index]) {
                this._profileSamples.max[index] = size;
            }
        }
    }
    _lastSeenObjectId(event) {
        const profileSamples = this._profileSamples;
        if (!profileSamples) {
            return;
        }
        const data = event.data;
        const currentIndex = Math.max(profileSamples.ids.length, profileSamples.max.length - 1);
        profileSamples.ids[currentIndex] = data.lastSeenObjectId;
        if (!profileSamples.max[currentIndex]) {
            profileSamples.max[currentIndex] = 0;
            profileSamples.sizes[currentIndex] = 0;
        }
        profileSamples.timestamps[currentIndex] = data.timestamp;
        if (profileSamples.totalTime < data.timestamp - profileSamples.timestamps[0]) {
            profileSamples.totalTime *= 2;
        }
        this.dispatchEventToListeners(TrackingHeapSnapshotProfileType.HeapStatsUpdate, this._profileSamples);
        const profile = this.profileBeingRecorded();
        if (profile) {
            profile.updateStatus(null, true);
        }
    }
    hasTemporaryView() {
        return true;
    }
    get buttonTooltip() {
        return this._recording ? i18nString(UIStrings.stopRecordingHeapProfile) :
            i18nString(UIStrings.startRecordingHeapProfile);
    }
    isInstantProfile() {
        return false;
    }
    buttonClicked() {
        return this._toggleRecording();
    }
    _startRecordingProfile() {
        if (this.profileBeingRecorded()) {
            return;
        }
        const heapProfilerModel = this._addNewProfile();
        if (!heapProfilerModel) {
            return;
        }
        heapProfilerModel.startTrackingHeapObjects(this._recordAllocationStacksSetting.get());
    }
    customContent() {
        const checkboxSetting = UI.SettingsUI.createSettingCheckbox(i18nString(UIStrings.recordAllocationStacksExtra), this._recordAllocationStacksSetting, true);
        this._customContent = checkboxSetting;
        return checkboxSetting;
    }
    setCustomContentEnabled(enable) {
        if (this._customContent) {
            this._customContent.checkboxElement.disabled = !enable;
        }
    }
    _addNewProfile() {
        const heapProfilerModel = UI.Context.Context.instance().flavor(SDK.HeapProfilerModel.HeapProfilerModel);
        if (!heapProfilerModel) {
            return null;
        }
        this.setProfileBeingRecorded(new HeapProfileHeader(heapProfilerModel, this, undefined));
        this._profileSamples = new Samples();
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.profileBeingRecorded()._profileSamples = this._profileSamples;
        this._recording = true;
        this.addProfile(this.profileBeingRecorded());
        this.profileBeingRecorded().updateStatus(i18nString(UIStrings.recording));
        this.dispatchEventToListeners(TrackingHeapSnapshotProfileType.TrackingStarted);
        return heapProfilerModel;
    }
    async _stopRecordingProfile() {
        let profile = this.profileBeingRecorded();
        profile.updateStatus(i18nString(UIStrings.snapshotting));
        const stopPromise = profile.heapProfilerModel().stopTrackingHeapObjects(true);
        this._recording = false;
        this.dispatchEventToListeners(TrackingHeapSnapshotProfileType.TrackingStopped);
        await stopPromise;
        profile = this.profileBeingRecorded();
        if (!profile) {
            return;
        }
        profile._finishLoad();
        this._profileSamples = null;
        this.setProfileBeingRecorded(null);
        this.dispatchEventToListeners(ProfileTypeEvents.ProfileComplete, profile);
    }
    _toggleRecording() {
        if (this._recording) {
            this._stopRecordingProfile();
        }
        else {
            this._startRecordingProfile();
        }
        return this._recording;
    }
    fileExtension() {
        return '.heaptimeline';
    }
    get treeItemTitle() {
        return i18nString(UIStrings.allocationTimelines);
    }
    get description() {
        return i18nString(UIStrings.AllocationTimelinesShowInstrumented);
    }
    _resetProfiles(event) {
        const wasRecording = this._recording;
        // Clear current profile to avoid stopping backend.
        this.setProfileBeingRecorded(null);
        super._resetProfiles(event);
        this._profileSamples = null;
        if (wasRecording) {
            this._addNewProfile();
        }
    }
    profileBeingRecordedRemoved() {
        this._stopRecordingProfile();
        this._profileSamples = null;
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static TypeId = 'HEAP-RECORD';
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static HeapStatsUpdate = 'HeapStatsUpdate';
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static TrackingStarted = 'TrackingStarted';
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static TrackingStopped = 'TrackingStopped';
}
export class HeapProfileHeader extends ProfileHeader {
    _heapProfilerModel;
    maxJSObjectId;
    _workerProxy;
    _receiver;
    _snapshotProxy;
    _loadPromise;
    _fulfillLoad;
    _totalNumberOfChunks;
    _bufferedWriter;
    _onTempFileReady;
    _failedToCreateTempFile;
    _wasDisposed;
    _fileName;
    constructor(heapProfilerModel, type, title) {
        super(type, title || i18nString(UIStrings.snapshotD, { PH1: type.nextProfileUid() }));
        this._heapProfilerModel = heapProfilerModel;
        this.maxJSObjectId = -1;
        this._workerProxy = null;
        this._receiver = null;
        this._snapshotProxy = null;
        this._loadPromise = new Promise(resolve => {
            this._fulfillLoad = resolve;
        });
        this._totalNumberOfChunks = 0;
        this._bufferedWriter = null;
        this._onTempFileReady = null;
    }
    heapProfilerModel() {
        return this._heapProfilerModel;
    }
    async getLocation(nodeIndex) {
        if (!this._snapshotProxy) {
            return null;
        }
        return this._snapshotProxy.getLocation(nodeIndex);
    }
    createSidebarTreeElement(dataDisplayDelegate) {
        return new ProfileSidebarTreeElement(dataDisplayDelegate, this, 'heap-snapshot-sidebar-tree-item');
    }
    createView(dataDisplayDelegate) {
        return new HeapSnapshotView(dataDisplayDelegate, this);
    }
    _prepareToLoad() {
        console.assert(!this._receiver, 'Already loading');
        this._setupWorker();
        this.updateStatus(i18nString(UIStrings.loading), true);
    }
    _finishLoad() {
        if (!this._wasDisposed && this._receiver) {
            this._receiver.close();
        }
        if (!this._bufferedWriter) {
            return;
        }
        this._didWriteToTempFile(this._bufferedWriter);
    }
    _didWriteToTempFile(tempFile) {
        if (this._wasDisposed) {
            if (tempFile) {
                tempFile.remove();
            }
            return;
        }
        this.tempFile = tempFile;
        if (!tempFile) {
            this._failedToCreateTempFile = true;
        }
        if (this._onTempFileReady) {
            this._onTempFileReady();
            this._onTempFileReady = null;
        }
    }
    _setupWorker() {
        console.assert(!this._workerProxy, 'HeapSnapshotWorkerProxy already exists');
        this._workerProxy = new HeapSnapshotWorkerProxy(this._handleWorkerEvent.bind(this));
        this._workerProxy.addEventListener("Wait" /* Wait */, event => {
            this.updateStatus(null, event.data);
        }, this);
        this._receiver = this._workerProxy.createLoader(this.uid, this._snapshotReceived.bind(this));
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _handleWorkerEvent(eventName, data) {
        if (HeapSnapshotModel.HeapSnapshotModel.HeapSnapshotProgressEvent.BrokenSnapshot === eventName) {
            const error = data;
            Common.Console.Console.instance().error(error);
            return;
        }
        if (HeapSnapshotModel.HeapSnapshotModel.HeapSnapshotProgressEvent.Update !== eventName) {
            return;
        }
        const serializedMessage = data;
        const messageObject = i18n.i18n.deserializeUIString(serializedMessage);
        // We know all strings from the worker are declared inside a single file so we can
        // use a custom function.
        this.updateStatus(moduleI18nString(messageObject.string, messageObject.values));
    }
    dispose() {
        if (this._workerProxy) {
            this._workerProxy.dispose();
        }
        this.removeTempFile();
        this._wasDisposed = true;
    }
    _didCompleteSnapshotTransfer() {
        if (!this._snapshotProxy) {
            return;
        }
        this.updateStatus(Platform.NumberUtilities.bytesToString(this._snapshotProxy.totalSize), false);
    }
    transferChunk(chunk) {
        if (!this._bufferedWriter) {
            this._bufferedWriter = new Bindings.TempFile.TempFile();
        }
        this._bufferedWriter.write([chunk]);
        ++this._totalNumberOfChunks;
        if (this._receiver) {
            this._receiver.write(chunk);
        }
    }
    _snapshotReceived(snapshotProxy) {
        if (this._wasDisposed) {
            return;
        }
        this._receiver = null;
        this._snapshotProxy = snapshotProxy;
        this.maxJSObjectId = snapshotProxy.maxJSObjectId();
        this._didCompleteSnapshotTransfer();
        if (this._workerProxy) {
            this._workerProxy.startCheckingForLongRunningCalls();
        }
        this.notifySnapshotReceived();
    }
    notifySnapshotReceived() {
        if (this._snapshotProxy && this._fulfillLoad) {
            this._fulfillLoad(this._snapshotProxy);
        }
        this.profileType()._snapshotReceived(this);
        if (this.canSaveToFile()) {
            this.dispatchEventToListeners(ProfileHeaderEvents.ProfileReceived);
        }
    }
    canSaveToFile() {
        return !this.fromFile() && Boolean(this._snapshotProxy);
    }
    saveToFile() {
        const fileOutputStream = new Bindings.FileUtils.FileOutputStream();
        this._fileName = this._fileName ||
            'Heap-' + Platform.DateUtilities.toISO8601Compact(new Date()) + this.profileType().fileExtension();
        const onOpen = async (accepted) => {
            if (!accepted) {
                return;
            }
            if (this._failedToCreateTempFile) {
                Common.Console.Console.instance().error('Failed to open temp file with heap snapshot');
                fileOutputStream.close();
                return;
            }
            if (this.tempFile) {
                const error = await this.tempFile.copyToOutputStream(fileOutputStream, this._onChunkTransferred.bind(this));
                if (error) {
                    Common.Console.Console.instance().error('Failed to read heap snapshot from temp file: ' + error.message);
                }
                this._didCompleteSnapshotTransfer();
                return;
            }
            this._onTempFileReady = () => {
                onOpen(accepted);
            };
            this._updateSaveProgress(0, 1);
        };
        fileOutputStream.open(this._fileName).then(onOpen.bind(this));
    }
    _onChunkTransferred(reader) {
        this._updateSaveProgress(reader.loadedSize(), reader.fileSize());
    }
    _updateSaveProgress(value, total) {
        const percentValue = ((total && value / total) * 100).toFixed(0);
        this.updateStatus(i18nString(UIStrings.savingD, { PH1: percentValue }));
    }
    async loadFromFile(file) {
        this.updateStatus(i18nString(UIStrings.loading), true);
        this._setupWorker();
        const reader = new Bindings.FileUtils.ChunkedFileReader(file, 10000000);
        const success = await reader.read(this._receiver);
        if (!success) {
            const error = reader.error();
            if (error) {
                this.updateStatus(error.message);
            }
        }
        return success ? null : reader.error();
    }
}
export class HeapSnapshotStatisticsView extends UI.Widget.VBox {
    _pieChart;
    constructor() {
        super();
        this.element.classList.add('heap-snapshot-statistics-view');
        this._pieChart = new PerfUI.PieChart.PieChart();
        this.setTotalAndRecords(0, []);
        this._pieChart.classList.add('heap-snapshot-stats-pie-chart');
        this.element.appendChild(this._pieChart);
    }
    static _valueFormatter(value) {
        return i18nString(UIStrings.sKb, { PH1: Platform.NumberUtilities.withThousandsSeparator(Math.round(value / 1000)) });
    }
    setTotalAndRecords(total, records) {
        this._pieChart.data = {
            chartName: i18nString(UIStrings.heapMemoryUsage),
            size: 150,
            formatter: HeapSnapshotStatisticsView._valueFormatter,
            showLegend: true,
            total,
            slices: records,
        };
    }
}
export class HeapAllocationStackView extends UI.Widget.Widget {
    _heapProfilerModel;
    _linkifier;
    _frameElements;
    constructor(heapProfilerModel) {
        super();
        this._heapProfilerModel = heapProfilerModel;
        this._linkifier = new Components.Linkifier.Linkifier();
        this._frameElements = [];
    }
    _onContextMenu(link, event) {
        const contextMenu = new UI.ContextMenu.ContextMenu(event);
        if (!contextMenu.containsTarget(link)) {
            contextMenu.appendApplicableItems(link);
        }
        contextMenu.show();
        event.consume(true);
    }
    _onStackViewKeydown(event) {
        const target = event.target;
        if (!target) {
            return;
        }
        if (event.key === 'Enter') {
            const link = stackFrameToURLElement.get(target);
            if (!link) {
                return;
            }
            const linkInfo = Components.Linkifier.Linkifier.linkInfo(link);
            if (!linkInfo) {
                return;
            }
            if (Components.Linkifier.Linkifier.invokeFirstAction(linkInfo)) {
                event.consume(true);
            }
            return;
        }
        let navDown;
        const keyboardEvent = event;
        if (keyboardEvent.key === 'ArrowUp') {
            navDown = false;
        }
        else if (keyboardEvent.key === 'ArrowDown') {
            navDown = true;
        }
        else {
            return;
        }
        const index = this._frameElements.indexOf(target);
        if (index === -1) {
            return;
        }
        const nextIndex = navDown ? index + 1 : index - 1;
        if (nextIndex < 0 || nextIndex >= this._frameElements.length) {
            return;
        }
        const nextFrame = this._frameElements[nextIndex];
        nextFrame.tabIndex = 0;
        target.tabIndex = -1;
        nextFrame.focus();
        event.consume(true);
    }
    async setAllocatedObject(snapshot, snapshotNodeIndex) {
        this.clear();
        const frames = await snapshot.allocationStack(snapshotNodeIndex);
        if (!frames) {
            const stackDiv = this.element.createChild('div', 'no-heap-allocation-stack');
            UI.UIUtils.createTextChild(stackDiv, i18nString(UIStrings.stackWasNotRecordedForThisObject));
            return;
        }
        const stackDiv = this.element.createChild('div', 'heap-allocation-stack');
        stackDiv.addEventListener('keydown', this._onStackViewKeydown.bind(this), false);
        for (const frame of frames) {
            const frameDiv = stackDiv.createChild('div', 'stack-frame');
            this._frameElements.push(frameDiv);
            frameDiv.tabIndex = -1;
            const name = frameDiv.createChild('div');
            name.textContent = UI.UIUtils.beautifyFunctionName(frame.functionName);
            if (!frame.scriptId) {
                continue;
            }
            const target = this._heapProfilerModel ? this._heapProfilerModel.target() : null;
            const options = { columnNumber: frame.column - 1 };
            const urlElement = this._linkifier.linkifyScriptLocation(target, String(frame.scriptId), frame.scriptName, frame.line - 1, options);
            frameDiv.appendChild(urlElement);
            stackFrameToURLElement.set(frameDiv, urlElement);
            frameDiv.addEventListener('contextmenu', this._onContextMenu.bind(this, urlElement));
        }
        this._frameElements[0].tabIndex = 0;
    }
    clear() {
        this.element.removeChildren();
        this._frameElements = [];
        this._linkifier.reset();
    }
}
const stackFrameToURLElement = new WeakMap();
//# sourceMappingURL=HeapSnapshotView.js.map