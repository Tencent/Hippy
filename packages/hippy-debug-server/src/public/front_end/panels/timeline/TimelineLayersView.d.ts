import type * as Common from '../../core/common/common.js';
import type * as SDK from '../../core/sdk/sdk.js';
import type * as TimelineModel from '../../models/timeline_model/timeline_model.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as LayerViewer from '../layer_viewer/layer_viewer.js';
export declare class TimelineLayersView extends UI.SplitWidget.SplitWidget {
    _model: TimelineModel.TimelineModel.TimelineModelImpl;
    _showPaintProfilerCallback: (arg0: SDK.PaintProfiler.PaintProfilerSnapshot) => void;
    _rightSplitWidget: UI.SplitWidget.SplitWidget;
    _layerViewHost: LayerViewer.LayerViewHost.LayerViewHost;
    _layers3DView: LayerViewer.Layers3DView.Layers3DView;
    _frameLayerTree?: TimelineModel.TimelineFrameModel.TracingFrameLayerTree;
    _updateWhenVisible?: boolean;
    constructor(model: TimelineModel.TimelineModel.TimelineModelImpl, showPaintProfilerCallback: (arg0: SDK.PaintProfiler.PaintProfilerSnapshot) => void);
    showLayerTree(frameLayerTree: TimelineModel.TimelineFrameModel.TracingFrameLayerTree): void;
    wasShown(): void;
    _onPaintProfilerRequested(event: Common.EventTarget.EventTargetEvent): void;
    _update(): void;
}
