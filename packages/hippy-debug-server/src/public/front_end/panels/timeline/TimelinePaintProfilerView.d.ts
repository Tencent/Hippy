import type * as SDK from '../../core/sdk/sdk.js';
import * as TimelineModel from '../../models/timeline_model/timeline_model.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as LayerViewer from '../layer_viewer/layer_viewer.js';
import type * as Protocol from '../../generated/protocol.js';
export declare class TimelinePaintProfilerView extends UI.SplitWidget.SplitWidget {
    _frameModel: TimelineModel.TimelineFrameModel.TimelineFrameModel;
    _logAndImageSplitWidget: UI.SplitWidget.SplitWidget;
    _imageView: TimelinePaintImageView;
    _paintProfilerView: LayerViewer.PaintProfilerView.PaintProfilerView;
    _logTreeView: LayerViewer.PaintProfilerView.PaintProfilerCommandLogView;
    _needsUpdateWhenVisible: boolean;
    _pendingSnapshot: SDK.PaintProfiler.PaintProfilerSnapshot | null;
    _event: SDK.TracingModel.Event | null;
    _paintProfilerModel: SDK.PaintProfiler.PaintProfilerModel | null;
    _lastLoadedSnapshot: SDK.PaintProfiler.PaintProfilerSnapshot | null;
    constructor(frameModel: TimelineModel.TimelineFrameModel.TimelineFrameModel);
    wasShown(): void;
    setSnapshot(snapshot: SDK.PaintProfiler.PaintProfilerSnapshot): void;
    setEvent(paintProfilerModel: SDK.PaintProfiler.PaintProfilerModel, event: SDK.TracingModel.Event): boolean;
    _updateWhenVisible(): void;
    _update(): void;
    _releaseSnapshot(): void;
    _onWindowChanged(): void;
}
export declare class TimelinePaintImageView extends UI.Widget.Widget {
    _imageContainer: HTMLElement;
    _imageElement: HTMLImageElement;
    _maskElement: HTMLElement;
    _transformController: LayerViewer.TransformController.TransformController;
    _maskRectangle?: Protocol.DOM.Rect | null;
    constructor();
    onResize(): void;
    _updateImagePosition(): void;
    showImage(imageURL?: string): void;
    setMask(maskRectangle: Protocol.DOM.Rect | null): void;
}
