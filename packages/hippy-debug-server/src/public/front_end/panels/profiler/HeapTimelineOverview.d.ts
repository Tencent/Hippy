import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class HeapTimelineOverview extends UI.Widget.VBox {
    _overviewCalculator: OverviewCalculator;
    _overviewContainer: HTMLElement;
    _overviewGrid: PerfUI.OverviewGrid.OverviewGrid;
    _overviewCanvas: HTMLCanvasElement;
    _windowLeft: number;
    _windowRight: number;
    _yScale: SmoothScale;
    _xScale: SmoothScale;
    _profileSamples: Samples;
    _running?: boolean;
    _updateOverviewCanvas?: boolean;
    _updateGridTimerId?: number;
    _updateTimerId?: number | null;
    _windowWidth?: number;
    constructor();
    start(): void;
    stop(): void;
    setSamples(samples: Samples): void;
    _drawOverviewCanvas(width: number, height: number): void;
    onResize(): void;
    _onWindowChanged(): void;
    _scheduleUpdate(): void;
    _updateBoundaries(): void;
    update(): void;
    updateGrid(): void;
}
export declare const IdsRangeChanged: unique symbol;
export declare class SmoothScale {
    _lastUpdate: number;
    _currentScale: number;
    constructor();
    nextScale(target: number): number;
}
export declare class Samples {
    sizes: number[];
    ids: number[];
    timestamps: number[];
    max: number[];
    totalTime: number;
    constructor();
}
export declare class OverviewCalculator implements PerfUI.TimelineGrid.Calculator {
    _maximumBoundaries: number;
    _minimumBoundaries: number;
    _xScaleFactor: number;
    constructor();
    _updateBoundaries(chart: HeapTimelineOverview): void;
    computePosition(time: number): number;
    formatValue(value: number, precision?: number): string;
    maximumBoundary(): number;
    minimumBoundary(): number;
    zeroTime(): number;
    boundarySpan(): number;
}
