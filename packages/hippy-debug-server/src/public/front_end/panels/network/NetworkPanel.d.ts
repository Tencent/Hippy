import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as Search from '../search/search.js';
import type { Tabs as NetworkItemViewTabs } from './NetworkItemView.js';
import { NetworkItemView } from './NetworkItemView.js';
import type { FilterType } from './NetworkLogView.js';
import { NetworkLogView } from './NetworkLogView.js';
import { NetworkOverview } from './NetworkOverview.js';
import type { NetworkTimeCalculator } from './NetworkTimeCalculator.js';
import { NetworkTransferTimeCalculator } from './NetworkTimeCalculator.js';
export declare class NetworkPanel extends UI.Panel.Panel implements UI.ContextMenu.Provider, UI.View.ViewLocationResolver {
    _networkLogShowOverviewSetting: Common.Settings.Setting<boolean>;
    _networkLogLargeRowsSetting: Common.Settings.Setting<boolean>;
    _networkRecordFilmStripSetting: Common.Settings.Setting<boolean>;
    _toggleRecordAction: UI.ActionRegistration.Action;
    _pendingStopTimer: number | undefined;
    _networkItemView: NetworkItemView | null;
    _filmStripView: PerfUI.FilmStripView.FilmStripView | null;
    _filmStripRecorder: FilmStripRecorder | null;
    _currentRequest: SDK.NetworkRequest.NetworkRequest | null;
    _panelToolbar: UI.Toolbar.Toolbar;
    _rightToolbar: UI.Toolbar.Toolbar;
    _filterBar: UI.FilterBar.FilterBar;
    _settingsPane: UI.Widget.HBox;
    _showSettingsPaneSetting: Common.Settings.Setting<boolean>;
    _filmStripPlaceholderElement: HTMLElement;
    _overviewPane: PerfUI.TimelineOverviewPane.TimelineOverviewPane;
    _networkOverview: NetworkOverview;
    _overviewPlaceholderElement: HTMLElement;
    _calculator: NetworkTransferTimeCalculator;
    _splitWidget: UI.SplitWidget.SplitWidget;
    _sidebarLocation: UI.View.TabbedViewLocation;
    _progressBarContainer: HTMLDivElement;
    _networkLogView: NetworkLogView;
    _fileSelectorElement: HTMLElement;
    _detailsWidget: UI.Widget.VBox;
    _closeButtonElement: HTMLDivElement;
    _preserveLogSetting: Common.Settings.Setting<boolean>;
    _recordLogSetting: Common.Settings.Setting<boolean>;
    _throttlingSelect: UI.Toolbar.ToolbarComboBox;
    constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): NetworkPanel;
    static revealAndFilter(filters: {
        filterType: FilterType | null;
        filterValue: string;
    }[]): void;
    static selectAndShowRequest(request: SDK.NetworkRequest.NetworkRequest, tab: NetworkItemViewTabs, options?: FilterOptions): Promise<void>;
    static _instance(): NetworkPanel;
    throttlingSelectForTest(): UI.Toolbar.ToolbarComboBox;
    _onWindowChanged(event: Common.EventTarget.EventTargetEvent): void;
    _searchToggleClick(_event: Common.EventTarget.EventTargetEvent): Promise<void>;
    _setupToolbarButtons(splitWidget: UI.SplitWidget.SplitWidget): void;
    _updateSettingsPaneVisibility(): void;
    _createThrottlingConditionsSelect(): UI.Toolbar.ToolbarComboBox;
    _toggleRecord(toggled: boolean): void;
    _filmStripAvailable(filmStripModel: SDK.FilmStripModel.FilmStripModel | null): void;
    _onNetworkLogReset(event: Common.EventTarget.EventTargetEvent): void;
    _willReloadPage(_event: Common.EventTarget.EventTargetEvent): void;
    _load(_event: Common.EventTarget.EventTargetEvent): void;
    _stopFilmStripRecording(): void;
    _toggleLargerRequests(): void;
    _toggleShowOverview(): void;
    _toggleRecordFilmStrip(): void;
    _resetFilmStripView(): void;
    elementsToRestoreScrollPositionsFor(): Element[];
    wasShown(): void;
    willHide(): void;
    revealAndHighlightRequest(request: SDK.NetworkRequest.NetworkRequest): void;
    selectAndActivateRequest(request: SDK.NetworkRequest.NetworkRequest, shownTab?: NetworkItemViewTabs, options?: FilterOptions): Promise<NetworkItemView | null>;
    _handleFilterChanged(_event: Common.EventTarget.EventTargetEvent): void;
    _onRowSizeChanged(_event: Common.EventTarget.EventTargetEvent): void;
    _onRequestSelected(event: Common.EventTarget.EventTargetEvent): void;
    _onRequestActivated(event: {
        data: any;
    }): void;
    _showRequestPanel(shownTab?: NetworkItemViewTabs, takeFocus?: boolean): void;
    _hideRequestPanel(): void;
    _updateNetworkItemView(): void;
    _clearNetworkItemView(): void;
    _createNetworkItemView(initialTab?: NetworkItemViewTabs): NetworkItemView | undefined;
    _updateUI(): void;
    appendApplicableItems(this: NetworkPanel, event: Event, contextMenu: UI.ContextMenu.ContextMenu, target: Object): void;
    _onFilmFrameSelected(event: Common.EventTarget.EventTargetEvent): void;
    _onFilmFrameEnter(event: Common.EventTarget.EventTargetEvent): void;
    _onFilmFrameExit(_event: Common.EventTarget.EventTargetEvent): void;
    _onUpdateRequest(event: Common.EventTarget.EventTargetEvent): void;
    resolveLocation(locationName: string): UI.View.ViewLocation | null;
}
export declare const displayScreenshotDelay = 1000;
export declare class ContextMenuProvider implements UI.ContextMenu.Provider {
    static instance(opts?: {
        forceNew: boolean | null;
    }): ContextMenuProvider;
    appendApplicableItems(event: Event, contextMenu: UI.ContextMenu.ContextMenu, target: Object): void;
}
export declare class RequestRevealer implements Common.Revealer.Revealer {
    static instance(opts?: {
        forceNew: boolean | null;
    }): RequestRevealer;
    reveal(request: Object): Promise<void>;
}
export declare class FilmStripRecorder implements SDK.TracingManager.TracingManagerClient {
    _tracingManager: SDK.TracingManager.TracingManager | null;
    _resourceTreeModel: SDK.ResourceTreeModel.ResourceTreeModel | null;
    _timeCalculator: NetworkTimeCalculator;
    _filmStripView: PerfUI.FilmStripView.FilmStripView;
    _tracingModel: SDK.TracingModel.TracingModel | null;
    _callback: ((arg0: SDK.FilmStripModel.FilmStripModel | null) => void) | null;
    constructor(timeCalculator: NetworkTimeCalculator, filmStripView: PerfUI.FilmStripView.FilmStripView);
    traceEventsCollected(events: SDK.TracingManager.EventPayload[]): void;
    tracingComplete(): void;
    tracingBufferUsage(): void;
    eventsRetrievalProgress(_progress: number): void;
    startRecording(): void;
    isRecording(): boolean;
    stopRecording(callback: (arg0: SDK.FilmStripModel.FilmStripModel | null) => void): void;
}
export declare class ActionDelegate implements UI.ActionRegistration.ActionDelegate {
    static instance(opts?: {
        forceNew: boolean | null;
    } | undefined): ActionDelegate;
    handleAction(context: UI.Context.Context, actionId: string): boolean;
}
export declare class RequestLocationRevealer implements Common.Revealer.Revealer {
    static instance(opts?: {
        forceNew: boolean | null;
    } | undefined): RequestLocationRevealer;
    reveal(match: Object): Promise<void>;
}
export declare class SearchNetworkView extends Search.SearchView.SearchView {
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): SearchNetworkView;
    static openSearch(query: string, searchImmediately?: boolean): Promise<Search.SearchView.SearchView>;
    createScope(): Search.SearchConfig.SearchScope;
}
export interface FilterOptions {
    clearFilter: boolean;
}
