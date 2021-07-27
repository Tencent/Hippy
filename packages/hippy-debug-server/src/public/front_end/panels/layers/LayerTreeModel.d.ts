import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import type * as Protocol from '../../generated/protocol.js';
export declare class LayerTreeModel extends SDK.SDKModel.SDKModel {
    _layerTreeAgent: ProtocolProxyApi.LayerTreeApi;
    _paintProfilerModel: SDK.PaintProfiler.PaintProfilerModel;
    _layerTree: SDK.LayerTreeBase.LayerTreeBase | null;
    _throttler: Common.Throttler.Throttler;
    _enabled?: boolean;
    _lastPaintRectByLayerId?: Map<string, Protocol.DOM.Rect>;
    constructor(target: SDK.Target.Target);
    disable(): Promise<void>;
    enable(): void;
    _forceEnable(): Promise<void>;
    layerTree(): SDK.LayerTreeBase.LayerTreeBase | null;
    _layerTreeChanged(layers: Protocol.LayerTree.Layer[] | null): Promise<void>;
    _innerSetLayers(layers: Protocol.LayerTree.Layer[] | null): Promise<void>;
    _layerPainted(layerId: string, clipRect: Protocol.DOM.Rect): void;
    _onMainFrameNavigated(): void;
}
export declare enum Events {
    LayerTreeChanged = "LayerTreeChanged",
    LayerPainted = "LayerPainted"
}
export declare class AgentLayerTree extends SDK.LayerTreeBase.LayerTreeBase {
    _layerTreeModel: LayerTreeModel;
    constructor(layerTreeModel: LayerTreeModel);
    setLayers(payload: Protocol.LayerTree.Layer[] | null): Promise<void>;
    _innerSetLayers(layers: Protocol.LayerTree.Layer[] | null): void;
}
export declare class AgentLayer implements SDK.LayerTreeBase.Layer {
    _scrollRects: Protocol.LayerTree.ScrollRect[];
    _quad: number[];
    _children: AgentLayer[];
    _image: HTMLImageElement | null;
    _parent: AgentLayer | null;
    _layerPayload: Protocol.LayerTree.Layer;
    _layerTreeModel: LayerTreeModel;
    _node?: SDK.DOMModel.DOMNode | null;
    _lastPaintRect?: Protocol.DOM.Rect;
    _paintCount?: number;
    _stickyPositionConstraint?: SDK.LayerTreeBase.StickyPositionConstraint | null;
    constructor(layerTreeModel: LayerTreeModel, layerPayload: Protocol.LayerTree.Layer);
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
    requestCompositingReasonIds(): Promise<string[]>;
    drawsContent(): boolean;
    gpuMemoryUsage(): number;
    snapshots(): Promise<SDK.PaintProfiler.SnapshotWithRect | null>[];
    _didPaint(rect: Protocol.DOM.Rect): void;
    _reset(layerPayload: Protocol.LayerTree.Layer): void;
    _matrixFromArray(a: number[]): DOMMatrix;
    _calculateTransformToViewport(parentTransform: DOMMatrix): DOMMatrix;
    _createVertexArrayForRect(width: number, height: number): number[];
    _calculateQuad(parentTransform: DOMMatrix): void;
}
