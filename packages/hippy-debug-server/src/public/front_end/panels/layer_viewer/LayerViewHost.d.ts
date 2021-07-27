import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import type * as UI from '../../ui/legacy/legacy.js';
export declare abstract class LayerView {
    abstract hoverObject(selection: Selection | null): void;
    abstract selectObject(selection: Selection | null): void;
    abstract setLayerTree(layerTree: SDK.LayerTreeBase.LayerTreeBase | null): void;
}
export declare class Selection {
    _type: Type;
    _layer: SDK.LayerTreeBase.Layer;
    constructor(type: Type, layer: SDK.LayerTreeBase.Layer);
    static isEqual(a: Selection | null, b: Selection | null): boolean;
    type(): Type;
    layer(): SDK.LayerTreeBase.Layer;
    _isEqual(_other: Selection): boolean;
}
export declare const enum Type {
    Layer = "Layer",
    ScrollRect = "ScrollRect",
    Snapshot = "Snapshot"
}
export declare class LayerSelection extends Selection {
    constructor(layer: SDK.LayerTreeBase.Layer);
    _isEqual(other: Selection): boolean;
}
export declare class ScrollRectSelection extends Selection {
    scrollRectIndex: number;
    constructor(layer: SDK.LayerTreeBase.Layer, scrollRectIndex: number);
    _isEqual(other: Selection): boolean;
}
export declare class SnapshotSelection extends Selection {
    _snapshot: SDK.PaintProfiler.SnapshotWithRect;
    constructor(layer: SDK.LayerTreeBase.Layer, snapshot: SDK.PaintProfiler.SnapshotWithRect);
    _isEqual(other: Selection): boolean;
    snapshot(): SDK.PaintProfiler.SnapshotWithRect;
}
export declare class LayerViewHost {
    _views: LayerView[];
    _selectedObject: Selection | null;
    _hoveredObject: Selection | null;
    _showInternalLayersSetting: Common.Settings.Setting<boolean>;
    _snapshotLayers: Map<SDK.LayerTreeBase.Layer, SnapshotSelection>;
    _target?: SDK.Target.Target | null;
    constructor();
    registerView(layerView: LayerView): void;
    setLayerSnapshotMap(snapshotLayers: Map<SDK.LayerTreeBase.Layer, SnapshotSelection>): void;
    getLayerSnapshotMap(): Map<SDK.LayerTreeBase.Layer, SnapshotSelection>;
    setLayerTree(layerTree: SDK.LayerTreeBase.LayerTreeBase | null): void;
    hoverObject(selection: Selection | null): void;
    selectObject(selection: Selection | null): void;
    selection(): Selection | null;
    showContextMenu(contextMenu: UI.ContextMenu.ContextMenu, selection: Selection | null): void;
    showInternalLayersSetting(): Common.Settings.Setting<boolean>;
    _toggleShowInternalLayers(): void;
    _toggleNodeHighlight(node: SDK.DOMModel.DOMNode | null): void;
}
