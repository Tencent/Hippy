import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as HeapSnapshotModel from '../../models/heap_snapshot_model/heap_snapshot_model.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import type { HeapSnapshotSortableDataGrid } from './HeapSnapshotDataGrids.js';
import { AllocationDataGrid, HeapSnapshotConstructorsDataGrid, HeapSnapshotDiffDataGrid, HeapSnapshotRetainmentDataGrid, HeapSnapshotContainmentDataGrid } from './HeapSnapshotDataGrids.js';
import type { HeapSnapshotGridNode } from './HeapSnapshotGridNodes.js';
import type { HeapSnapshotProxy } from './HeapSnapshotProxy.js';
import { HeapSnapshotWorkerProxy } from './HeapSnapshotProxy.js';
import { HeapTimelineOverview, Samples } from './HeapTimelineOverview.js';
import type { DataDisplayDelegate } from './ProfileHeader.js';
import { ProfileHeader, ProfileType } from './ProfileHeader.js';
import { ProfileSidebarTreeElement } from './ProfileSidebarTreeElement.js';
export declare class HeapSnapshotView extends UI.View.SimpleView implements DataDisplayDelegate, UI.SearchableView.Searchable {
    _searchResults: number[];
    _profile: HeapProfileHeader;
    _linkifier: Components.Linkifier.Linkifier;
    _parentDataDisplayDelegate: DataDisplayDelegate;
    _searchableView: UI.SearchableView.SearchableView;
    _splitWidget: UI.SplitWidget.SplitWidget;
    _containmentDataGrid: HeapSnapshotContainmentDataGrid;
    _containmentWidget: DataGrid.DataGrid.DataGridWidget<HeapSnapshotGridNode>;
    _statisticsView: HeapSnapshotStatisticsView;
    _constructorsDataGrid: HeapSnapshotConstructorsDataGrid;
    _constructorsWidget: DataGrid.DataGrid.DataGridWidget<HeapSnapshotGridNode>;
    _diffDataGrid: HeapSnapshotDiffDataGrid;
    _diffWidget: DataGrid.DataGrid.DataGridWidget<HeapSnapshotGridNode>;
    _allocationDataGrid: AllocationDataGrid | null;
    _allocationWidget: DataGrid.DataGrid.DataGridWidget<HeapSnapshotGridNode> | undefined;
    _allocationStackView: HeapAllocationStackView | undefined;
    _tabbedPane: UI.TabbedPane.TabbedPane | undefined;
    _retainmentDataGrid: HeapSnapshotRetainmentDataGrid;
    _retainmentWidget: DataGrid.DataGrid.DataGridWidget<HeapSnapshotGridNode>;
    _objectDetailsView: UI.Widget.VBox;
    _perspectives: (SummaryPerspective | ComparisonPerspective | ContainmentPerspective | AllocationPerspective | StatisticsPerspective)[];
    _comparisonPerspective: ComparisonPerspective;
    _perspectiveSelect: UI.Toolbar.ToolbarComboBox;
    _baseSelect: UI.Toolbar.ToolbarComboBox;
    _filterSelect: UI.Toolbar.ToolbarComboBox;
    _classNameFilter: UI.Toolbar.ToolbarInput;
    _selectedSizeText: UI.Toolbar.ToolbarText;
    _popoverHelper: UI.PopoverHelper.PopoverHelper;
    _currentPerspectiveIndex: number;
    _currentPerspective: SummaryPerspective | ComparisonPerspective | ContainmentPerspective | AllocationPerspective | StatisticsPerspective;
    _dataGrid: HeapSnapshotSortableDataGrid | null;
    _searchThrottler: Common.Throttler.Throttler;
    _baseProfile: HeapProfileHeader | null;
    _trackingOverviewGrid?: HeapTimelineOverview;
    _currentSearchResultIndex: number;
    currentQuery?: HeapSnapshotModel.HeapSnapshotModel.SearchConfig;
    constructor(dataDisplayDelegate: DataDisplayDelegate, profile: HeapProfileHeader);
    _createOverview(): void;
    _onStopTracking(): void;
    _onHeapStatsUpdate(event: Common.EventTarget.EventTargetEvent): void;
    searchableView(): UI.SearchableView.SearchableView;
    showProfile(profile: ProfileHeader | null): UI.Widget.Widget | null;
    showObject(snapshotObjectId: string, perspectiveName: string): void;
    linkifyObject(nodeIndex: number): Promise<Element | null>;
    _populate(): Promise<void>;
    _retrieveStatistics(heapSnapshotProxy: HeapSnapshotProxy): Promise<HeapSnapshotModel.HeapSnapshotModel.Statistics>;
    _onIdsRangeChanged(event: Common.EventTarget.EventTargetEvent): void;
    toolbarItems(): Promise<UI.Toolbar.ToolbarItem[]>;
    willHide(): void;
    supportsCaseSensitiveSearch(): boolean;
    supportsRegexSearch(): boolean;
    searchCanceled(): void;
    _selectRevealedNode(node: HeapSnapshotGridNode | null): void;
    performSearch(searchConfig: UI.SearchableView.SearchConfig, shouldJump: boolean, jumpBackwards?: boolean): void;
    _performSearch(nextQuery: HeapSnapshotModel.HeapSnapshotModel.SearchConfig): Promise<void>;
    jumpToNextSearchResult(): void;
    jumpToPreviousSearchResult(): void;
    _jumpToSearchResult(searchResultIndex: number): Promise<void>;
    refreshVisibleData(): void;
    _changeBase(): void;
    _changeFilter(): void;
    _profiles(): ProfileHeader[];
    _selectionChanged(event: Common.EventTarget.EventTargetEvent): void;
    _onSelectAllocationNode(event: Common.EventTarget.EventTargetEvent): void;
    _inspectedObjectChanged(event: Common.EventTarget.EventTargetEvent): void;
    _setSelectedNodeForDetailsView(nodeItem: HeapSnapshotGridNode | null): void;
    _changePerspectiveAndWait(perspectiveTitle: string): Promise<void>;
    _updateDataSourceAndView(): Promise<void>;
    _onSelectedPerspectiveChanged(event: Event): void;
    _changePerspective(selectedIndex: number): void;
    selectLiveObject(perspectiveName: string, snapshotObjectId: string): Promise<void>;
    _getPopoverRequest(event: Event): UI.PopoverHelper.PopoverRequest | null;
    _updatePerspectiveOptions(): void;
    _updateBaseOptions(): void;
    _updateFilterOptions(): void;
    _updateControls(): void;
    _onReceiveSnapshot(event: Common.EventTarget.EventTargetEvent): void;
    _onProfileHeaderRemoved(event: Common.EventTarget.EventTargetEvent): void;
    dispose(): void;
}
export declare class Perspective {
    _title: string;
    constructor(title: string);
    activate(_heapSnapshotView: HeapSnapshotView): void;
    deactivate(heapSnapshotView: HeapSnapshotView): void;
    masterGrid(_heapSnapshotView: HeapSnapshotView): DataGrid.DataGrid.DataGridImpl<HeapSnapshotGridNode> | null;
    title(): string;
    supportsSearch(): boolean;
}
export declare class SummaryPerspective extends Perspective {
    constructor();
    activate(heapSnapshotView: HeapSnapshotView): void;
    masterGrid(heapSnapshotView: HeapSnapshotView): DataGrid.DataGrid.DataGridImpl<HeapSnapshotGridNode> | null;
    supportsSearch(): boolean;
}
export declare class ComparisonPerspective extends Perspective {
    constructor();
    activate(heapSnapshotView: HeapSnapshotView): void;
    masterGrid(heapSnapshotView: HeapSnapshotView): DataGrid.DataGrid.DataGridImpl<HeapSnapshotGridNode> | null;
    supportsSearch(): boolean;
}
export declare class ContainmentPerspective extends Perspective {
    constructor();
    activate(heapSnapshotView: HeapSnapshotView): void;
    masterGrid(heapSnapshotView: HeapSnapshotView): DataGrid.DataGrid.DataGridImpl<HeapSnapshotGridNode> | null;
}
export declare class AllocationPerspective extends Perspective {
    _allocationSplitWidget: UI.SplitWidget.SplitWidget;
    constructor();
    activate(heapSnapshotView: HeapSnapshotView): void;
    deactivate(heapSnapshotView: HeapSnapshotView): void;
    masterGrid(heapSnapshotView: HeapSnapshotView): DataGrid.DataGrid.DataGridImpl<HeapSnapshotGridNode> | null;
}
export declare class StatisticsPerspective extends Perspective {
    constructor();
    activate(heapSnapshotView: HeapSnapshotView): void;
    masterGrid(_heapSnapshotView: HeapSnapshotView): DataGrid.DataGrid.DataGridImpl<HeapSnapshotGridNode> | null;
}
export declare class HeapSnapshotProfileType extends ProfileType implements SDK.TargetManager.SDKModelObserver<SDK.HeapProfilerModel.HeapProfilerModel> {
    _treatGlobalObjectsAsRoots: Common.Settings.Setting<boolean>;
    _captureNumericValue: Common.Settings.Setting<boolean>;
    _customContent: HTMLElement | null;
    constructor(id?: string, title?: string);
    modelAdded(heapProfilerModel: SDK.HeapProfilerModel.HeapProfilerModel): void;
    modelRemoved(_heapProfilerModel: SDK.HeapProfilerModel.HeapProfilerModel): void;
    getProfiles(): HeapProfileHeader[];
    fileExtension(): string;
    get buttonTooltip(): Common.UIString.LocalizedString;
    isInstantProfile(): boolean;
    buttonClicked(): boolean;
    get treeItemTitle(): Common.UIString.LocalizedString;
    get description(): Common.UIString.LocalizedString;
    customContent(): Element | null;
    setCustomContentEnabled(enable: boolean): void;
    createProfileLoadedFromFile(title: string): ProfileHeader;
    _takeHeapSnapshot(): Promise<void>;
    _addHeapSnapshotChunk(event: Common.EventTarget.EventTargetEvent): void;
    _reportHeapSnapshotProgress(event: Common.EventTarget.EventTargetEvent): void;
    _resetProfiles(event: Common.EventTarget.EventTargetEvent): void;
    _snapshotReceived(profile: ProfileHeader): void;
    static readonly TypeId: string;
    static readonly SnapshotReceived = "SnapshotReceived";
}
export declare class TrackingHeapSnapshotProfileType extends HeapSnapshotProfileType {
    _recordAllocationStacksSetting: Common.Settings.Setting<boolean>;
    _customContent: UI.UIUtils.CheckboxLabel | null;
    _recording: boolean;
    _profileSamples?: Samples | null;
    constructor();
    modelAdded(heapProfilerModel: SDK.HeapProfilerModel.HeapProfilerModel): void;
    modelRemoved(heapProfilerModel: SDK.HeapProfilerModel.HeapProfilerModel): void;
    _heapStatsUpdate(event: Common.EventTarget.EventTargetEvent): void;
    _lastSeenObjectId(event: Common.EventTarget.EventTargetEvent): void;
    hasTemporaryView(): boolean;
    get buttonTooltip(): Common.UIString.LocalizedString;
    isInstantProfile(): boolean;
    buttonClicked(): boolean;
    _startRecordingProfile(): void;
    customContent(): Element | null;
    setCustomContentEnabled(enable: boolean): void;
    _addNewProfile(): SDK.HeapProfilerModel.HeapProfilerModel | null;
    _stopRecordingProfile(): Promise<void>;
    _toggleRecording(): boolean;
    fileExtension(): string;
    get treeItemTitle(): Common.UIString.LocalizedString;
    get description(): Common.UIString.LocalizedString;
    _resetProfiles(event: Common.EventTarget.EventTargetEvent): void;
    profileBeingRecordedRemoved(): void;
    static readonly TypeId = "HEAP-RECORD";
    static readonly HeapStatsUpdate = "HeapStatsUpdate";
    static readonly TrackingStarted = "TrackingStarted";
    static readonly TrackingStopped = "TrackingStopped";
}
export declare class HeapProfileHeader extends ProfileHeader {
    _heapProfilerModel: SDK.HeapProfilerModel.HeapProfilerModel | null;
    maxJSObjectId: number;
    _workerProxy: HeapSnapshotWorkerProxy | null;
    _receiver: Common.StringOutputStream.OutputStream | null;
    _snapshotProxy: HeapSnapshotProxy | null;
    _loadPromise: Promise<HeapSnapshotProxy>;
    _fulfillLoad?: (value: HeapSnapshotProxy | PromiseLike<HeapSnapshotProxy>) => void;
    _totalNumberOfChunks: number;
    _bufferedWriter: Bindings.TempFile.TempFile | null;
    _onTempFileReady: (() => void) | null;
    _failedToCreateTempFile?: boolean;
    _wasDisposed?: boolean;
    _fileName?: string;
    constructor(heapProfilerModel: SDK.HeapProfilerModel.HeapProfilerModel | null, type: HeapSnapshotProfileType, title?: string);
    heapProfilerModel(): SDK.HeapProfilerModel.HeapProfilerModel | null;
    getLocation(nodeIndex: number): Promise<HeapSnapshotModel.HeapSnapshotModel.Location | null>;
    createSidebarTreeElement(dataDisplayDelegate: DataDisplayDelegate): ProfileSidebarTreeElement;
    createView(dataDisplayDelegate: DataDisplayDelegate): HeapSnapshotView;
    _prepareToLoad(): void;
    _finishLoad(): void;
    _didWriteToTempFile(tempFile: Bindings.TempFile.TempFile): void;
    _setupWorker(): void;
    _handleWorkerEvent(eventName: string, data: any): void;
    dispose(): void;
    _didCompleteSnapshotTransfer(): void;
    transferChunk(chunk: string): void;
    _snapshotReceived(snapshotProxy: HeapSnapshotProxy): void;
    notifySnapshotReceived(): void;
    canSaveToFile(): boolean;
    saveToFile(): void;
    _onChunkTransferred(reader: Bindings.FileUtils.ChunkedReader): void;
    _updateSaveProgress(value: number, total: number): void;
    loadFromFile(file: File): Promise<DOMError | null>;
}
export declare class HeapSnapshotStatisticsView extends UI.Widget.VBox {
    _pieChart: PerfUI.PieChart.PieChart;
    constructor();
    static _valueFormatter(value: number): string;
    setTotalAndRecords(total: number, records: PerfUI.PieChart.Slice[]): void;
}
export declare class HeapAllocationStackView extends UI.Widget.Widget {
    _heapProfilerModel: SDK.HeapProfilerModel.HeapProfilerModel | null;
    _linkifier: Components.Linkifier.Linkifier;
    _frameElements: HTMLElement[];
    constructor(heapProfilerModel: SDK.HeapProfilerModel.HeapProfilerModel | null);
    _onContextMenu(link: Element, event: Event): void;
    _onStackViewKeydown(event: KeyboardEvent): void;
    setAllocatedObject(snapshot: HeapSnapshotProxy, snapshotNodeIndex: number): Promise<void>;
    clear(): void;
}
