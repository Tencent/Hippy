import * as Common from '../../core/common/common.js';
import type * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import type { LayerView, LayerViewHost, Selection, SnapshotSelection } from './LayerViewHost.js';
export declare class LayerTreeOutline extends Common.ObjectWrapper.ObjectWrapper implements LayerView {
    _layerViewHost: LayerViewHost;
    _treeOutline: UI.TreeOutline.TreeOutlineInShadow;
    _lastHoveredNode: LayerTreeElement | null;
    element: HTMLElement;
    _layerTree?: SDK.LayerTreeBase.LayerTreeBase | null;
    _layerSnapshotMap?: Map<SDK.LayerTreeBase.Layer, SnapshotSelection>;
    constructor(layerViewHost: LayerViewHost);
    focus(): void;
    selectObject(selection: Selection | null): void;
    hoverObject(selection: Selection | null): void;
    setLayerTree(layerTree: SDK.LayerTreeBase.LayerTreeBase | null): void;
    _update(): void;
    _onMouseMove(event: MouseEvent): void;
    _selectedNodeChanged(node: LayerTreeElement): void;
    _onContextMenu(event: MouseEvent): void;
    _selectionForNode(node: LayerTreeElement | null): Selection | null;
}
export declare enum Events {
    PaintProfilerRequested = "PaintProfilerRequested"
}
export declare class LayerTreeElement extends UI.TreeOutline.TreeElement {
    _treeOutline: LayerTreeOutline;
    _layer: SDK.LayerTreeBase.Layer;
    constructor(tree: LayerTreeOutline, layer: SDK.LayerTreeBase.Layer);
    _update(): void;
    onselect(): boolean;
    setHovered(hovered: boolean): void;
}
export declare const layerToTreeElement: WeakMap<SDK.LayerTreeBase.Layer, LayerTreeElement>;
