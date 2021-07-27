import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class PerformanceMonitorImpl extends UI.Widget.HBox implements SDK.TargetManager.SDKModelObserver<SDK.PerformanceMetricsModel.PerformanceMetricsModel> {
    _metricsBuffer: {
        timestamp: number;
        metrics: Map<string, number>;
    }[];
    _pixelsPerMs: number;
    _pollIntervalMs: number;
    _scaleHeight: number;
    _graphHeight: number;
    _gridColor: string;
    _controlPane: ControlPane;
    _canvas: HTMLCanvasElement;
    _animationId: number;
    _width: number;
    _height: number;
    _model?: SDK.PerformanceMetricsModel.PerformanceMetricsModel | null;
    _startTimestamp?: number;
    _pollTimer?: number;
    constructor();
    static instance(opts?: {
        forceNew: null;
    }): PerformanceMonitorImpl;
    wasShown(): void;
    willHide(): void;
    modelAdded(model: SDK.PerformanceMetricsModel.PerformanceMetricsModel): void;
    modelRemoved(model: SDK.PerformanceMetricsModel.PerformanceMetricsModel): void;
    _suspendStateChanged(): void;
    _startPolling(): void;
    _stopPolling(): void;
    _poll(): Promise<void>;
    _draw(): void;
    _drawHorizontalGrid(ctx: CanvasRenderingContext2D): void;
    _drawChart(ctx: CanvasRenderingContext2D, chartInfo: ChartInfo, height: number): void;
    _calcMax(chartInfo: ChartInfo): number;
    _drawVerticalGrid(ctx: CanvasRenderingContext2D, height: number, max: number, info: ChartInfo): void;
    _buildMetricPath(chartInfo: ChartInfo, metricInfo: MetricInfo, height: number, scaleMax: number, stackedChartBaseLandscape: Map<number, number> | null): Path2D;
    onResize(): void;
    _recalcChartHeight(): void;
}
export declare const enum Format {
    Percent = "Percent",
    Bytes = "Bytes"
}
export declare class ControlPane extends Common.ObjectWrapper.ObjectWrapper {
    element: Element;
    _enabledChartsSetting: Common.Settings.Setting<string[]>;
    _enabledCharts: Set<string>;
    _chartsInfo: ChartInfo[];
    _indicators: Map<string, MetricIndicator>;
    constructor(parent: Element);
    _onToggle(chartName: string, active: boolean): void;
    charts(): ChartInfo[];
    isActive(metricName: string): boolean;
    updateMetrics(metrics: Map<string, number>): void;
}
export declare const enum Events {
    MetricChanged = "MetricChanged"
}
export declare class MetricIndicator {
    _info: ChartInfo;
    _active: boolean;
    _onToggle: (arg0: boolean) => void;
    element: HTMLElement;
    _swatchElement: UI.Icon.Icon;
    _valueElement: HTMLElement;
    constructor(parent: Element, info: ChartInfo, active: boolean, onToggle: (arg0: boolean) => void);
    static _formatNumber(value: number, info: ChartInfo): string;
    setValue(value: number): void;
    _toggleIndicator(): void;
    _handleKeypress(event: Event): void;
}
export declare const format: Intl.NumberFormat;
export interface MetricInfo {
    name: string;
    color: string;
}
export interface ChartInfo {
    title: string;
    metrics: {
        name: string;
        color: string;
    }[];
    max?: number;
    currentMax?: number;
    format?: Format;
    smooth?: boolean;
    color?: string;
    stacked?: boolean;
}
