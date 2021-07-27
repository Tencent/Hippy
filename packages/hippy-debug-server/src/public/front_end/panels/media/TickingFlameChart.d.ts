import * as Common from '../../core/common/common.js';
import type * as SDK from '../../core/sdk/sdk.js';
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import * as UI from '../../ui/legacy/legacy.js';
import { Bounds } from './TickingFlameChartHelpers.js';
export declare const HotColorScheme: string[];
export declare const ColdColorScheme: string[];
interface EventHandlers {
    setLive: (arg0: number) => number;
    setComplete: (arg0: number) => void;
    updateMaxTime: (arg0: number) => void;
}
export interface EventProperties {
    level: number;
    startTime: number;
    duration?: number;
    name: string;
    color?: string;
    hoverData?: Object | null;
}
/**
 * Wrapper class for each event displayed on the timeline.
 */
export declare class Event {
    _timelineData: PerfUI.FlameChart.TimelineData;
    _setLive: (arg0: number) => number;
    _setComplete: (arg0: number) => void;
    _updateMaxTime: (arg0: number) => void;
    _selfIndex: number;
    _live: boolean;
    _title: string;
    _color: string;
    _fontColor: string;
    _hoverData: Object;
    constructor(timelineData: PerfUI.FlameChart.TimelineData, eventHandlers: EventHandlers, eventProperties?: EventProperties | undefined);
    /**
     * Render hovertext into the |htmlElement|
     */
    decorate(htmlElement: HTMLElement): void;
    /**
     * set an event to be "live" where it's ended time is always the chart maximum
     * or to be a fixed time.
     * @param {number} time
     */
    set endTime(time: number);
    get id(): number;
    set level(level: number);
    set title(text: string);
    get title(): string;
    set color(color: string);
    get color(): string;
    get fontColor(): string;
    get startTime(): number;
    get duration(): number;
    get live(): boolean;
}
export declare class TickingFlameChart extends UI.Widget.VBox {
    _intervalTimer: number;
    _lastTimestamp: number;
    _canTick: boolean;
    _ticking: boolean;
    _isShown: boolean;
    _bounds: Bounds;
    _dataProvider: TickingFlameChartDataProvider;
    _delegate: TickingFlameChartDelegate;
    _chartGroupExpansionSetting: Common.Settings.Setting<Object>;
    _chart: PerfUI.FlameChart.FlameChart;
    _stoppedPermanently?: boolean;
    constructor();
    /**
     * Add a marker with |properties| at |time|.
     */
    addMarker(properties: EventProperties): void;
    /**
     * Create an event which will be set to live by default.
     */
    startEvent(properties: EventProperties): Event;
    /**
     * Add a group with |name| that can contain |depth| different tracks.
     */
    addGroup(name: Common.UIString.LocalizedString, depth: number): void;
    _updateMaxTime(time: number): void;
    _onScroll(e: WheelEvent): void;
    willHide(): void;
    wasShown(): void;
    set canTick(allowed: boolean);
    _start(): void;
    _stop(permanently?: boolean): void;
    _updateRender(): void;
}
/**
 * Doesn't do much right now, but can be used in the future for selecting events.
 */
declare class TickingFlameChartDelegate implements PerfUI.FlameChart.FlameChartDelegate {
    constructor();
    windowChanged(_windowStartTime: number, _windowEndTime: number, _animate: boolean): void;
    updateRangeSelection(_startTime: number, _endTime: number): void;
    updateSelectedGroup(_flameChart: PerfUI.FlameChart.FlameChart, _group: PerfUI.FlameChart.Group | null): void;
}
declare class TickingFlameChartDataProvider implements PerfUI.FlameChart.FlameChartDataProvider {
    _updateMaxTimeHandle: (arg0: number) => void;
    _bounds: Bounds;
    _liveEvents: Set<number>;
    _eventMap: Map<number, Event>;
    _timelineData: PerfUI.FlameChart.TimelineData;
    _maxLevel: number;
    constructor(initialBounds: Bounds, updateMaxTime: (arg0: number) => void);
    /**
     * Add a group with |name| that can contain |depth| different tracks.
     */
    addGroup(name: Common.UIString.LocalizedString, depth: number): void;
    /**
     * Create an event which will be set to live by default.
     */
    startEvent(properties: EventProperties): Event;
    _setLive(index: number): number;
    _setComplete(index: number): void;
    updateMaxTime(bounds: Bounds): void;
    maxStackDepth(): number;
    timelineData(): PerfUI.FlameChart.TimelineData;
    /** time in milliseconds
       */
    minimumBoundary(): number;
    totalTime(): number;
    entryColor(index: number): string;
    textColor(index: number): string;
    entryTitle(index: number): string | null;
    entryFont(_index: number): string | null;
    decorateEntry(_index: number, _context: CanvasRenderingContext2D, _text: string | null, _barX: number, _barY: number, _barWidth: number, _barHeight: number, _unclippedBarX: number, _timeToPixelRatio: number): boolean;
    forceDecoration(_index: number): boolean;
    prepareHighlightedEntryInfo(index: number): Element | null;
    formatValue(value: number, _precision?: number): string;
    canJumpToEntry(_entryIndex: number): boolean;
    navStartTimes(): Map<string, SDK.TracingModel.Event>;
}
export {};
