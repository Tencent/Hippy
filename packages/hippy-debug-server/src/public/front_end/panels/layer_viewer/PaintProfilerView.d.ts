import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import type * as Protocol from '../../generated/protocol.js';
import type * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class PaintProfilerView extends UI.Widget.HBox {
    _canvasContainer: HTMLElement;
    _progressBanner: HTMLElement;
    _pieChart: PerfUI.PieChart.PieChart;
    _showImageCallback: (arg0?: string | undefined) => void;
    _canvas: HTMLCanvasElement;
    _context: CanvasRenderingContext2D;
    _selectionWindow: PerfUI.OverviewGrid.Window;
    _innerBarWidth: number;
    _minBarHeight: number;
    _barPaddingWidth: number;
    _outerBarWidth: number;
    _pendingScale: number;
    _scale: number;
    _samplesPerBar: number;
    _log: SDK.PaintProfiler.PaintProfilerLogItem[];
    _snapshot?: SDK.PaintProfiler.PaintProfilerSnapshot | null;
    _logCategories?: PaintProfilerCategory[];
    _profiles?: Protocol.LayerTree.PaintProfile[] | null;
    _updateImageTimer?: number;
    constructor(showImageCallback: (arg0?: string | undefined) => void);
    static categories(): {
        [x: string]: PaintProfilerCategory;
    };
    static _initLogItemCategories(): {
        [x: string]: PaintProfilerCategory;
    };
    static _categoryForLogItem(logItem: SDK.PaintProfiler.PaintProfilerLogItem): PaintProfilerCategory;
    onResize(): void;
    setSnapshotAndLog(snapshot: SDK.PaintProfiler.PaintProfilerSnapshot | null, log: SDK.PaintProfiler.PaintProfilerLogItem[], clipRect: Protocol.DOM.Rect | null): Promise<void>;
    setScale(scale: number): void;
    _update(): void;
    _renderBar(index: number, heightByCategory: {
        [x: string]: number;
    }): void;
    _onWindowChanged(): void;
    _updatePieChart(): void;
    _calculatePieChart(): {
        total: number;
        slices: Array<{
            value: number;
            color: string;
            title: string;
        }>;
    };
    _populatePieChart(total: number, slices: PerfUI.PieChart.Slice[]): void;
    _formatPieChartTime(value: number): string;
    selectionWindow(): {
        left: number;
        right: number;
    } | null;
    _updateImage(): void;
    _reset(): void;
}
export declare enum Events {
    WindowChanged = "WindowChanged"
}
export declare class PaintProfilerCommandLogView extends UI.ThrottledWidget.ThrottledWidget {
    _treeOutline: UI.TreeOutline.TreeOutlineInShadow;
    _log: SDK.PaintProfiler.PaintProfilerLogItem[];
    _treeItemCache: Map<SDK.PaintProfiler.PaintProfilerLogItem, LogTreeElement>;
    _selectionWindow?: {
        left: number;
        right: number;
    } | null;
    constructor();
    setCommandLog(log: SDK.PaintProfiler.PaintProfilerLogItem[]): void;
    _appendLogItem(logItem: SDK.PaintProfiler.PaintProfilerLogItem): void;
    updateWindow(selectionWindow: {
        left: number;
        right: number;
    } | null): void;
    doUpdate(): Promise<void>;
}
export declare class LogTreeElement extends UI.TreeOutline.TreeElement {
    _logItem: SDK.PaintProfiler.PaintProfilerLogItem;
    _ownerView: PaintProfilerCommandLogView;
    _filled: boolean;
    constructor(ownerView: PaintProfilerCommandLogView, logItem: SDK.PaintProfiler.PaintProfilerLogItem);
    onattach(): void;
    onpopulate(): Promise<void>;
    _paramToString(param: SDK.PaintProfiler.RawPaintProfilerLogItemParamValue, name: string): string;
    _paramsToString(params: SDK.PaintProfiler.RawPaintProfilerLogItemParams | null): string;
    _update(): void;
}
export declare class LogPropertyTreeElement extends UI.TreeOutline.TreeElement {
    _property: {
        name: string;
        value: SDK.PaintProfiler.RawPaintProfilerLogItemParamValue;
    };
    constructor(property: {
        name: string;
        value: SDK.PaintProfiler.RawPaintProfilerLogItemParamValue;
    });
    static _appendLogPropertyItem(element: UI.TreeOutline.TreeElement, name: string, value: SDK.PaintProfiler.RawPaintProfilerLogItemParamValue): void;
    onattach(): void;
}
export declare class PaintProfilerCategory {
    name: string;
    title: string;
    color: string;
    constructor(name: string, title: string, color: string);
}
