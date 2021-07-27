import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as TimelineComponents from './components/components.js';
export declare class WebVitalsIntegrator extends UI.Widget.VBox implements PerfUI.ChartViewport.ChartViewportDelegate {
    delegate: PerfUI.FlameChart.FlameChartDelegate;
    webVitalsTimeline: TimelineComponents.WebVitalsTimeline.WebVitalsTimeline;
    chartViewport: PerfUI.ChartViewport.ChartViewport;
    constructor(delegate: PerfUI.FlameChart.FlameChartDelegate);
    windowChanged(startTime: number, endTime: number, animate: boolean): void;
    updateRangeSelection(startTime: number, endTime: number): void;
    setSize(width: number, height: number): void;
    update(): void;
}
