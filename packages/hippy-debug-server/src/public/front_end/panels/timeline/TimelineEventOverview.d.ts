import type * as SDK from '../../core/sdk/sdk.js';
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import * as Coverage from '../coverage/coverage.js';
import type { PerformanceModel } from './PerformanceModel.js';
export declare class TimelineEventOverview extends PerfUI.TimelineOverviewPane.TimelineOverviewBase {
    _model: PerformanceModel | null;
    constructor(id: string, title: string | null);
    setModel(model: PerformanceModel | null): void;
    _renderBar(begin: number, end: number, position: number, height: number, color: string): void;
}
export declare class TimelineEventOverviewInput extends TimelineEventOverview {
    constructor();
    update(): void;
}
export declare class TimelineEventOverviewNetwork extends TimelineEventOverview {
    constructor();
    update(): void;
}
export declare class TimelineEventOverviewCPUActivity extends TimelineEventOverview {
    _backgroundCanvas: HTMLCanvasElement;
    constructor();
    resetCanvas(): void;
    update(): void;
}
export declare class TimelineEventOverviewResponsiveness extends TimelineEventOverview {
    constructor();
    update(): void;
}
export declare class TimelineFilmStripOverview extends TimelineEventOverview {
    _frameToImagePromise: Map<SDK.FilmStripModel.Frame, Promise<HTMLImageElement>>;
    _lastFrame: SDK.FilmStripModel.Frame | null;
    _lastElement: Element | null;
    _drawGeneration?: symbol;
    _emptyImage?: HTMLImageElement;
    _imageWidth?: number;
    constructor();
    update(): void;
    _imageByFrame(frame: SDK.FilmStripModel.Frame): Promise<HTMLImageElement | null>;
    _drawFrames(imageWidth: number, imageHeight: number): void;
    overviewInfoPromise(x: number): Promise<Element | null>;
    reset(): void;
    static readonly Padding = 2;
}
export declare class TimelineEventOverviewFrames extends TimelineEventOverview {
    constructor();
    update(): void;
}
export declare class TimelineEventOverviewMemory extends TimelineEventOverview {
    _heapSizeLabel: HTMLElement;
    constructor();
    resetHeapSizeLabels(): void;
    update(): void;
}
export declare class Quantizer {
    _lastTime: number;
    _quantDuration: number;
    _callback: (arg0: Array<number>) => void;
    _counters: number[];
    _remainder: number;
    constructor(startTime: number, quantDuration: number, callback: (arg0: Array<number>) => void);
    appendInterval(time: number, group: number): void;
}
export declare class TimelineEventOverviewCoverage extends TimelineEventOverview {
    _heapSizeLabel: HTMLElement;
    _coverageModel?: Coverage.CoverageModel.CoverageModel | null;
    constructor();
    resetHeapSizeLabels(): void;
    setModel(model: PerformanceModel | null): void;
    update(): void;
}
