import * as LayerViewer from '../layer_viewer/layer_viewer.js';
import type * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class LayerPaintProfilerView extends UI.SplitWidget.SplitWidget {
    _logTreeView: LayerViewer.PaintProfilerView.PaintProfilerCommandLogView;
    _paintProfilerView: LayerViewer.PaintProfilerView.PaintProfilerView;
    constructor(showImageCallback: (arg0?: string | undefined) => void);
    reset(): void;
    profile(snapshot: SDK.PaintProfiler.PaintProfilerSnapshot): void;
    setScale(scale: number): void;
    _onWindowChanged(): void;
}
