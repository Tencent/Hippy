import * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import type { LayerPaintEvent } from './TimelineFrameModel.js';
export declare class TracingLayerTree extends SDK.LayerTreeBase.LayerTreeBase {
    _tileById: Map<string, TracingLayerTile>;
    _paintProfilerModel: SDK.PaintProfiler.PaintProfilerModel | null;
    constructor(target: SDK.Target.Target | null);
    setLayers(root: TracingLayerPayload | null, layers: TracingLayerPayload[] | null, paints: LayerPaintEvent[]): Promise<void>;
    setTiles(tiles: TracingLayerTile[]): void;
    pictureForRasterTile(tileId: string): Promise<SDK.PaintProfiler.SnapshotWithRect | null>;
    _setPaints(paints: LayerPaintEvent[]): void;
    _innerSetLayers(oldLayersById: Map<string | number, SDK.LayerTreeBase.Layer>, payload: TracingLayerPayload): TracingLayer;
    _extractNodeIdsToResolve(nodeIdsToResolve: Set<number>, seenNodeIds: Object, payload: TracingLayerPayload): void;
}
export declare class TracingLayer implements SDK.LayerTreeBase.Layer {
    _parentLayerId: string | null;
    _parent: SDK.LayerTreeBase.Layer | null;
    _layerId: string;
    _node: SDK.DOMModel.DOMNode | null;
    _offsetX: number;
    _offsetY: number;
    _width: number;
    _height: number;
    _children: SDK.LayerTreeBase.Layer[];
    _quad: number[];
    _scrollRects: Protocol.LayerTree.ScrollRect[];
    _gpuMemoryUsage: number;
    _paints: LayerPaintEvent[];
    _compositingReasonIds: string[];
    _drawsContent: boolean;
    _paintProfilerModel: SDK.PaintProfiler.PaintProfilerModel | null;
    constructor(paintProfilerModel: SDK.PaintProfiler.PaintProfilerModel | null, payload: TracingLayerPayload);
    _reset(payload: TracingLayerPayload): void;
    id(): string;
    parentId(): string | null;
    parent(): SDK.LayerTreeBase.Layer | null;
    isRoot(): boolean;
    children(): SDK.LayerTreeBase.Layer[];
    addChild(childParam: SDK.LayerTreeBase.Layer): void;
    _setNode(node: SDK.DOMModel.DOMNode | null): void;
    node(): SDK.DOMModel.DOMNode | null;
    nodeForSelfOrAncestor(): SDK.DOMModel.DOMNode | null;
    offsetX(): number;
    offsetY(): number;
    width(): number;
    height(): number;
    transform(): number[] | null;
    quad(): number[];
    anchorPoint(): number[];
    invisible(): boolean;
    paintCount(): number;
    lastPaintRect(): Protocol.DOM.Rect | null;
    scrollRects(): Protocol.LayerTree.ScrollRect[];
    stickyPositionConstraint(): SDK.LayerTreeBase.StickyPositionConstraint | null;
    gpuMemoryUsage(): number;
    snapshots(): Promise<SDK.PaintProfiler.SnapshotWithRect | null>[];
    _pictureForRect(targetRect: number[]): Promise<SDK.PaintProfiler.SnapshotWithRect | null>;
    _scrollRectsFromParams(params: number[], type: Protocol.LayerTree.ScrollRectType): Protocol.LayerTree.ScrollRect;
    _createScrollRects(payload: TracingLayerPayload): void;
    _addPaintEvent(paint: LayerPaintEvent): void;
    requestCompositingReasonIds(): Promise<string[]>;
    drawsContent(): boolean;
}
export interface TracingLayerPayload {
    bounds: {
        height: number;
        width: number;
    };
    children: TracingLayerPayload[];
    layer_id: number;
    position: number[];
    scroll_offset: number[];
    layer_quad: number[];
    draws_content: number;
    gpu_memory_usage: number;
    transform: number[];
    owner_node: number;
    reasons: string[];
    compositing_reason: string[];
    compositing_reason_ids: string[];
    debug_info: {
        compositing_reason_ids: string[];
    };
    non_fast_scrollable_region: number[];
    touch_event_handler_region: number[];
    wheel_event_handler_region: number[];
    scroll_event_handler_region: number[];
}
export interface TracingLayerTile {
    id: string;
    layer_id: string;
    gpu_memory_usage: number;
    content_rect: number[];
}
