import type * as Protocol from '../../generated/protocol.js';
import type { DOMNode } from './DOMModel.js';
import { DOMModel } from './DOMModel.js';
import type { SnapshotWithRect } from './PaintProfiler.js';
import type { Target } from './Target.js';
export interface Layer {
    id(): string;
    parentId(): string | null;
    parent(): Layer | null;
    isRoot(): boolean;
    children(): Layer[];
    addChild(child: Layer): void;
    node(): DOMNode | null;
    nodeForSelfOrAncestor(): DOMNode | null;
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
    stickyPositionConstraint(): StickyPositionConstraint | null;
    gpuMemoryUsage(): number;
    requestCompositingReasonIds(): Promise<string[]>;
    drawsContent(): boolean;
    snapshots(): Promise<SnapshotWithRect | null>[];
}
export declare namespace Layer {
    enum ScrollRectType {
        NonFastScrollable = "NonFastScrollable",
        TouchEventHandler = "TouchEventHandler",
        WheelEventHandler = "WheelEventHandler",
        RepaintsOnScroll = "RepaintsOnScroll",
        MainThreadScrollingReason = "MainThreadScrollingReason"
    }
}
export declare class StickyPositionConstraint {
    _stickyBoxRect: Protocol.DOM.Rect;
    _containingBlockRect: Protocol.DOM.Rect;
    _nearestLayerShiftingStickyBox: Layer | null;
    _nearestLayerShiftingContainingBlock: Layer | null;
    constructor(layerTree: LayerTreeBase | null, constraint: Protocol.LayerTree.StickyPositionConstraint);
    stickyBoxRect(): Protocol.DOM.Rect;
    containingBlockRect(): Protocol.DOM.Rect;
    nearestLayerShiftingStickyBox(): Layer | null;
    nearestLayerShiftingContainingBlock(): Layer | null;
}
export declare class LayerTreeBase {
    _target: Target | null;
    _domModel: DOMModel | null;
    layersById: Map<string | number, Layer>;
    _root: Layer | null;
    _contentRoot: Layer | null;
    _backendNodeIdToNode: Map<number, DOMNode | null>;
    _viewportSize?: {
        width: number;
        height: number;
    };
    constructor(target: Target | null);
    target(): Target | null;
    root(): Layer | null;
    setRoot(root: Layer | null): void;
    contentRoot(): Layer | null;
    setContentRoot(contentRoot: Layer | null): void;
    forEachLayer(callback: (arg0: Layer) => any, root?: Layer | null): any;
    layerById(id: string): Layer | null;
    resolveBackendNodeIds(requestedNodeIds: Set<number>): Promise<void>;
    backendNodeIdToNode(): Map<number, DOMNode | null>;
    setViewportSize(viewportSize: {
        width: number;
        height: number;
    }): void;
    viewportSize(): {
        width: number;
        height: number;
    } | undefined;
    _nodeForId(id: number): DOMNode | null;
}
