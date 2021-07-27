import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as TimelineModel from '../../models/timeline_model/timeline_model.js';
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import type { PerformanceModel } from './PerformanceModel.js';
import { Selection, TimelineFlameChartMarker } from './TimelineFlameChartView.js';
import { TimelineSelection } from './TimelinePanel.js';
import type { TimelineCategory } from './TimelineUIUtils.js';
export declare class TimelineFlameChartDataProvider extends Common.ObjectWrapper.ObjectWrapper implements PerfUI.FlameChart.FlameChartDataProvider {
    _font: string;
    _timelineData: PerfUI.FlameChart.TimelineData | null;
    _currentLevel: number;
    _performanceModel: PerformanceModel | null;
    _model: TimelineModel.TimelineModel.TimelineModelImpl | null;
    _minimumBoundary: number;
    _maximumBoundary: number;
    _timeSpan: number;
    _consoleColorGenerator: Common.Color.Generator;
    _extensionColorGenerator: Common.Color.Generator;
    _headerLevel1: PerfUI.FlameChart.GroupStyle;
    _headerLevel2: PerfUI.FlameChart.GroupStyle;
    _staticHeader: PerfUI.FlameChart.GroupStyle;
    _framesHeader: PerfUI.FlameChart.GroupStyle;
    _collapsibleTimingsHeader: PerfUI.FlameChart.GroupStyle;
    _timingsHeader: PerfUI.FlameChart.GroupStyle;
    _screenshotsHeader: PerfUI.FlameChart.GroupStyle;
    _interactionsHeaderLevel1: PerfUI.FlameChart.GroupStyle;
    _interactionsHeaderLevel2: PerfUI.FlameChart.GroupStyle;
    _experienceHeader: PerfUI.FlameChart.GroupStyle;
    _flowEventIndexById: Map<string, number>;
    _entryData: (SDK.FilmStripModel.Frame | SDK.TracingModel.Event | TimelineModel.TimelineFrameModel.TimelineFrame | TimelineModel.TimelineIRModel.Phases)[];
    _entryTypeByLevel: EntryType[];
    _markers: TimelineFlameChartMarker[];
    _asyncColorByInteractionPhase: Map<TimelineModel.TimelineIRModel.Phases, string>;
    _screenshotImageCache: Map<SDK.FilmStripModel.Frame, HTMLImageElement | null>;
    _extensionInfo: {
        title: string;
        model: SDK.TracingModel.TracingModel;
    }[];
    _entryIndexToTitle: string[];
    _asyncColorByCategory: Map<TimelineCategory, string>;
    _lastInitiatorEntry: number;
    _entryParent: SDK.TracingModel.Event[];
    _frameGroup?: PerfUI.FlameChart.Group;
    _lastSelection?: Selection;
    _colorForEvent?: ((arg0: SDK.TracingModel.Event) => string);
    constructor();
    _buildGroupStyle(extra: Object): PerfUI.FlameChart.GroupStyle;
    setModel(performanceModel: PerformanceModel | null): void;
    groupTrack(group: PerfUI.FlameChart.Group): TimelineModel.TimelineModel.Track | null;
    navStartTimes(): Map<any, any>;
    entryTitle(entryIndex: number): string | null;
    textColor(index: number): string;
    entryFont(_index: number): string | null;
    reset(): void;
    maxStackDepth(): number;
    timelineData(): PerfUI.FlameChart.TimelineData;
    _processGenericTrace(): void;
    _processInspectorTrace(): void;
    minimumBoundary(): number;
    totalTime(): number;
    search(startTime: number, endTime: number, filter: TimelineModel.TimelineModelFilter.TimelineModelFilter): number[];
    _appendSyncEvents(track: TimelineModel.TimelineModel.Track | null, events: SDK.TracingModel.Event[], title: string | null, style: PerfUI.FlameChart.GroupStyle | null, entryType: EntryType, selectable: boolean): PerfUI.FlameChart.Group | null;
    _isIgnoreListedEvent(event: SDK.TracingModel.Event): boolean;
    _isIgnoreListedURL(url: string): boolean;
    _appendAsyncEventsGroup(track: TimelineModel.TimelineModel.Track | null, title: string | null, events: SDK.TracingModel.AsyncEvent[], style: PerfUI.FlameChart.GroupStyle | null, entryType: EntryType, selectable: boolean): PerfUI.FlameChart.Group | null;
    _appendInteractionRecords(): void;
    _appendPageMetrics(): void;
    /**
     * This function pushes a copy of each performance.mark() event from the Main track
     * into Timings so they can be appended to the performance UI.
     * Performance.mark() are a part of the "blink.user_timing" category alongside
     * Navigation and Resource Timing events, so we must filter them out before pushing.
     */
    _copyPerfMarkEvents(timingTrack: TimelineModel.TimelineModel.Track | null): void;
    _appendFrames(): void;
    _entryType(entryIndex: number): EntryType;
    prepareHighlightedEntryInfo(entryIndex: number): Element | null;
    entryColor(entryIndex: number): string;
    _genericTraceEventColor(event: SDK.TracingModel.Event): string;
    _drawFrame(entryIndex: number, context: CanvasRenderingContext2D, text: string | null, barX: number, barY: number, barWidth: number, barHeight: number): void;
    _drawScreenshot(entryIndex: number, context: CanvasRenderingContext2D, barX: number, barY: number, barWidth: number, barHeight: number): Promise<void>;
    decorateEntry(entryIndex: number, context: CanvasRenderingContext2D, text: string | null, barX: number, barY: number, barWidth: number, barHeight: number, unclippedBarX: number, timeToPixels: number): boolean;
    forceDecoration(entryIndex: number): boolean;
    appendExtensionEvents(entry: {
        title: string;
        model: SDK.TracingModel.TracingModel;
    }): void;
    _innerAppendExtensionEvents(index: number): void;
    _appendHeader(title: string, style: PerfUI.FlameChart.GroupStyle, selectable: boolean): PerfUI.FlameChart.Group;
    _appendEvent(event: SDK.TracingModel.Event, level: number): number;
    _appendAsyncEvent(asyncEvent: SDK.TracingModel.AsyncEvent, level: number): void;
    _appendFrame(frame: TimelineModel.TimelineFrameModel.TimelineFrame): void;
    createSelection(entryIndex: number): TimelineSelection | null;
    formatValue(value: number, precision?: number): string;
    canJumpToEntry(_entryIndex: number): boolean;
    entryIndexForSelection(selection: TimelineSelection | null): number;
    buildFlowForInitiator(entryIndex: number): boolean;
    _eventParent(event: SDK.TracingModel.Event): SDK.TracingModel.Event | null;
    eventByIndex(entryIndex: number): SDK.TracingModel.Event | null;
    setEventColorMapping(colorForEvent: (arg0: SDK.TracingModel.Event) => string): void;
}
export declare const InstantEventVisibleDurationMs = 0.001;
export declare enum Events {
    DataChanged = "DataChanged"
}
export declare enum EntryType {
    Frame = "Frame",
    Event = "Event",
    InteractionRecord = "InteractionRecord",
    ExtensionEvent = "ExtensionEvent",
    Screenshot = "Screenshot"
}
