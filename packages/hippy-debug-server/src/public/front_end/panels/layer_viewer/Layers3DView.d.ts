import * as Common from '../../core/common/common.js';
import type * as Protocol from '../../generated/protocol.js';
import type * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import type { LayerView, LayerViewHost } from './LayerViewHost.js';
import { Selection, SnapshotSelection } from './LayerViewHost.js';
import { TransformController } from './TransformController.js';
export declare class Layers3DView extends UI.Widget.VBox implements LayerView {
    _failBanner: UI.Widget.VBox;
    _layerViewHost: LayerViewHost;
    _transformController: TransformController;
    _canvasElement: HTMLCanvasElement;
    _lastSelection: {
        [x: string]: Selection | null;
    };
    _layerTree: SDK.LayerTreeBase.LayerTreeBase | null;
    _textureManager: LayerTextureManager;
    _chromeTextures: (WebGLTexture | undefined)[];
    _rects: Rectangle[];
    _snapshotLayers: Map<SDK.LayerTreeBase.Layer, SnapshotSelection>;
    _shaderProgram: WebGLProgram | null;
    _oldTextureScale: number | undefined;
    _depthByLayerId: Map<string, number>;
    _visibleLayers: Set<SDK.LayerTreeBase.Layer>;
    _maxDepth: number;
    _scale: number;
    _layerTexture?: {
        layer: SDK.LayerTreeBase.Layer;
        texture: WebGLTexture;
    } | null;
    _projectionMatrix?: DOMMatrix;
    _whiteTexture?: WebGLTexture | null;
    _gl?: WebGLRenderingContext | null;
    _dimensionsForAutoscale?: {
        width: number;
        height: number;
    };
    _needsUpdate?: boolean;
    _panelToolbar?: UI.Toolbar.Toolbar;
    _showSlowScrollRectsSetting?: Common.Settings.Setting<boolean>;
    _showPaintsSetting?: Common.Settings.Setting<boolean>;
    _mouseDownX?: number;
    _mouseDownY?: number;
    constructor(layerViewHost: LayerViewHost);
    setLayerTree(layerTree: SDK.LayerTreeBase.LayerTreeBase | null): void;
    showImageForLayer(layer: SDK.LayerTreeBase.Layer, imageURL?: string): void;
    onResize(): void;
    willHide(): void;
    wasShown(): void;
    updateLayerSnapshot(layer: SDK.LayerTreeBase.Layer): void;
    _setOutline(type: OutlineType, selection: Selection | null): void;
    hoverObject(selection: Selection | null): void;
    selectObject(selection: Selection | null): void;
    snapshotForSelection(selection: Selection): Promise<SDK.PaintProfiler.SnapshotWithRect | null>;
    _initGL(canvas: HTMLCanvasElement): WebGLRenderingContext | null;
    _createShader(type: number, script: string): void;
    _initShaders(): void;
    _resizeCanvas(): void;
    _updateTransformAndConstraints(): void;
    _arrayFromMatrix(m: DOMMatrix): Float32Array;
    _initWhiteTexture(): void;
    _initChromeTextures(): void;
    _initGLIfNecessary(): WebGLRenderingContext | null;
    _calculateDepthsAndVisibility(): void;
    _depthForLayer(layer: SDK.LayerTreeBase.Layer): number;
    _calculateScrollRectDepth(layer: SDK.LayerTreeBase.Layer, index: number): number;
    _updateDimensionsForAutoscale(layer: SDK.LayerTreeBase.Layer): void;
    _calculateLayerRect(layer: SDK.LayerTreeBase.Layer): void;
    _appendRect(rect: Rectangle): void;
    _calculateLayerScrollRects(layer: SDK.LayerTreeBase.Layer): void;
    _calculateLayerTileRects(layer: SDK.LayerTreeBase.Layer): void;
    _calculateRects(): void;
    _makeColorsArray(color: number[]): number[];
    _setVertexAttribute(attribute: number, array: number[], length: number): void;
    _drawRectangle(vertices: number[], mode: number, color?: number[], texture?: Object): void;
    _drawTexture(vertices: number[], texture: WebGLTexture, color?: number[]): void;
    _drawViewportAndChrome(): void;
    _drawViewRect(rect: Rectangle): void;
    _update(): void;
    _webglDisabledBanner(): Node;
    _selectionFromEventPoint(event: Event): Selection | null;
    _createVisibilitySetting(caption: string, name: string, value: boolean, toolbar: UI.Toolbar.Toolbar): Common.Settings.Setting<boolean>;
    _initToolbar(): void;
    _onContextMenu(event: Event): void;
    _onMouseMove(event: Event): void;
    _onMouseDown(event: Event): void;
    _onMouseUp(event: Event): void;
    _onDoubleClick(event: Event): void;
    _updatePaints(): void;
    _showPaints(): boolean;
}
export declare enum OutlineType {
    Hovered = "hovered",
    Selected = "selected"
}
export declare enum Events {
    PaintProfilerRequested = "PaintProfilerRequested",
    ScaleChanged = "ScaleChanged"
}
export declare const enum ChromeTexture {
    Left = 0,
    Middle = 1,
    Right = 2
}
export declare const FragmentShader: string;
export declare const VertexShader: string;
export declare const HoveredBorderColor: number[];
export declare const SelectedBorderColor: number[];
export declare const BorderColor: number[];
export declare const ViewportBorderColor: number[];
export declare const ScrollRectBackgroundColor: number[];
export declare const HoveredImageMaskColor: number[];
export declare const BorderWidth = 1;
export declare const SelectedBorderWidth = 2;
export declare const ViewportBorderWidth = 3;
export declare const LayerSpacing = 20;
export declare const ScrollRectSpacing = 4;
export declare class LayerTextureManager {
    _textureUpdatedCallback: () => void;
    _throttler: Common.Throttler.Throttler;
    _scale: number;
    _active: boolean;
    _queue: SDK.LayerTreeBase.Layer[];
    _tilesByLayer: Map<SDK.LayerTreeBase.Layer, Tile[]>;
    _gl?: WebGLRenderingContext;
    constructor(textureUpdatedCallback: () => void);
    static _createTextureForImage(gl: WebGLRenderingContext | null, image: HTMLImageElement): WebGLTexture;
    reset(): void;
    setContext(glContext: WebGLRenderingContext): void;
    suspend(): void;
    resume(): void;
    setLayerTree(layerTree: SDK.LayerTreeBase.LayerTreeBase | null): void;
    _setSnapshotsForLayer(layer: SDK.LayerTreeBase.Layer, snapshots: SDK.PaintProfiler.SnapshotWithRect[]): Promise<void>;
    setScale(scale: number): void;
    tilesForLayer(layer: SDK.LayerTreeBase.Layer): Tile[];
    layerNeedsUpdate(layer: SDK.LayerTreeBase.Layer): void;
    forceUpdate(): void;
    _update(): Promise<void>;
    _updateLayer(layer: SDK.LayerTreeBase.Layer): Promise<void>;
    _updateTextures(): void;
}
export declare class Rectangle {
    relatedObject: Selection | null;
    lineWidth: number;
    borderColor: number[] | null;
    fillColor: number[] | null;
    texture: WebGLTexture | null;
    vertices: number[];
    constructor(relatedObject: Selection | null);
    setVertices(quad: number[], z: number): void;
    /**
     * Finds coordinates of point on layer quad, having offsets (ratioX * width) and (ratioY * height)
     * from the left corner of the initial layer rect, where width and heigth are layer bounds.
     */
    _calculatePointOnQuad(quad: number[], ratioX: number, ratioY: number): number[];
    calculateVerticesFromRect(layer: SDK.LayerTreeBase.Layer, rect: Protocol.DOM.Rect, z: number): void;
    /**
     * Intersects quad with given transform matrix and line l(t) = (x0, y0, t)
     */
    intersectWithLine(matrix: DOMMatrix, x0: number, y0: number): number | undefined;
}
export declare class Tile {
    snapshot: SDK.PaintProfiler.PaintProfilerSnapshot;
    rect: Protocol.DOM.Rect;
    scale: number;
    texture: WebGLTexture | null;
    _gl: WebGLRenderingContext;
    constructor(snapshotWithRect: SDK.PaintProfiler.SnapshotWithRect);
    dispose(): void;
    updateScale(glContext: WebGLRenderingContext, scale: number): Promise<void> | null;
    update(glContext: WebGLRenderingContext, scale: number): Promise<void>;
}
