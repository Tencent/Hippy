import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as TimelineModel from '../../models/timeline_model/timeline_model.js';
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import * as UI from '../../ui/legacy/legacy.js';
import { CountersGraph } from './CountersGraph.js';
import type { PerformanceModel } from './PerformanceModel.js';
import { TimelineDetailsView } from './TimelineDetailsView.js';
import { TimelineFlameChartDataProvider } from './TimelineFlameChartDataProvider.js';
import { TimelineFlameChartNetworkDataProvider } from './TimelineFlameChartNetworkDataProvider.js';
import type { TimelineModeViewDelegate } from './TimelinePanel.js';
import { TimelineSelection } from './TimelinePanel.js';
import type { TimelineMarkerStyle } from './TimelineUIUtils.js';
import { WebVitalsIntegrator } from './WebVitalsTimelineUtils.js';
declare class MainSplitWidget extends UI.SplitWidget.SplitWidget {
    _webVitals: WebVitalsIntegrator;
    _model: PerformanceModel | null;
    constructor(isVertical: boolean, secondIsSidebar: boolean, settingName?: string, defaultSidebarWidth?: number, defaultSidebarHeight?: number, constraintsInDip?: boolean);
    setWebVitals(webVitals: WebVitalsIntegrator): void;
    setWindowTimes(left: number, right: number, animate: boolean): void;
    setModelAndUpdateBoundaries(model: PerformanceModel | null): void;
}
export declare class TimelineFlameChartView extends UI.Widget.VBox implements PerfUI.FlameChart.FlameChartDelegate, UI.SearchableView.Searchable {
    _delegate: TimelineModeViewDelegate;
    _model: PerformanceModel | null;
    _searchResults: number[] | undefined;
    _eventListeners: Common.EventTarget.EventDescriptor[];
    _showMemoryGraphSetting: Common.Settings.Setting<any>;
    _showWebVitalsSetting: Common.Settings.Setting<any>;
    _networkSplitWidget: UI.SplitWidget.SplitWidget;
    _mainDataProvider: TimelineFlameChartDataProvider;
    _mainFlameChart: PerfUI.FlameChart.FlameChart;
    _networkFlameChartGroupExpansionSetting: Common.Settings.Setting<any>;
    _networkDataProvider: TimelineFlameChartNetworkDataProvider;
    _networkFlameChart: PerfUI.FlameChart.FlameChart;
    _networkPane: UI.Widget.VBox;
    _splitResizer: HTMLElement;
    _webVitals: WebVitalsIntegrator;
    _mainSplitWidget: MainSplitWidget;
    _chartSplitWidget: UI.SplitWidget.SplitWidget;
    _countersView: CountersGraph;
    _detailsSplitWidget: UI.SplitWidget.SplitWidget;
    _detailsView: TimelineDetailsView;
    _onMainEntrySelected: (event?: Common.EventTarget.EventTargetEvent) => void;
    _onNetworkEntrySelected: (event?: Common.EventTarget.EventTargetEvent) => void;
    _nextExtensionIndex: number;
    _boundRefresh: () => void;
    _selectedTrack: TimelineModel.TimelineModel.Track | null;
    _groupBySetting: Common.Settings.Setting<any>;
    _searchableView: UI.SearchableView.SearchableView;
    _urlToColorCache?: Map<string, string>;
    _needsResizeToPreferredHeights?: boolean;
    _selectedSearchResult?: number;
    _searchRegex?: RegExp;
    constructor(delegate: TimelineModeViewDelegate);
    toggleWebVitalsLane(): void;
    _updateColorMapper(): void;
    _onWindowChanged(event: Common.EventTarget.EventTargetEvent): void;
    windowChanged(windowStartTime: number, windowEndTime: number, animate: boolean): void;
    updateRangeSelection(startTime: number, endTime: number): void;
    updateSelectedGroup(flameChart: PerfUI.FlameChart.FlameChart, group: PerfUI.FlameChart.Group | null): void;
    setModel(model: PerformanceModel | null): void;
    _updateTrack(): void;
    _refresh(): void;
    _appendExtensionData(): void;
    _onEntryHighlighted(commonEvent: Common.EventTarget.EventTargetEvent): void;
    highlightEvent(event: SDK.TracingModel.Event | null): void;
    willHide(): void;
    wasShown(): void;
    _updateCountersGraphToggle(): void;
    setSelection(selection: TimelineSelection | null): void;
    _onEntrySelected(dataProvider: PerfUI.FlameChart.FlameChartDataProvider, event: Common.EventTarget.EventTargetEvent): void;
    resizeToPreferredHeights(): void;
    setSearchableView(searchableView: UI.SearchableView.SearchableView): void;
    jumpToNextSearchResult(): void;
    jumpToPreviousSearchResult(): void;
    supportsCaseSensitiveSearch(): boolean;
    supportsRegexSearch(): boolean;
    _selectSearchResult(index: number): void;
    _updateSearchResults(shouldJump: boolean, jumpBackwards?: boolean): void;
    searchCanceled(): void;
    performSearch(searchConfig: UI.SearchableView.SearchConfig, shouldJump: boolean, jumpBackwards?: boolean): void;
}
export declare class Selection {
    timelineSelection: TimelineSelection;
    entryIndex: number;
    constructor(selection: TimelineSelection, entryIndex: number);
}
export declare const FlameChartStyle: {
    textColor: string;
};
export declare class TimelineFlameChartMarker implements PerfUI.FlameChart.FlameChartMarker {
    _startTime: number;
    _startOffset: number;
    _style: TimelineMarkerStyle;
    constructor(startTime: number, startOffset: number, style: TimelineMarkerStyle);
    startTime(): number;
    color(): string;
    title(): string | null;
    draw(context: CanvasRenderingContext2D, x: number, height: number, pixelsPerMillisecond: number): void;
}
export declare enum ColorBy {
    URL = "URL"
}
export {};
