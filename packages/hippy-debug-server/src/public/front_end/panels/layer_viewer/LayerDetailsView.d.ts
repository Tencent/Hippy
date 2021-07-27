import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import type * as Protocol from '../../generated/protocol.js';
import type { LayerView, LayerViewHost, Selection, SnapshotSelection } from './LayerViewHost.js';
export declare class LayerDetailsView extends UI.Widget.Widget implements LayerView {
    _layerViewHost: LayerViewHost;
    _emptyWidget: UI.EmptyWidget.EmptyWidget;
    _layerSnapshotMap: Map<SDK.LayerTreeBase.Layer, SnapshotSelection>;
    _tableElement: HTMLElement;
    _tbodyElement: HTMLElement;
    _sizeCell: HTMLElement;
    _compositingReasonsCell: HTMLElement;
    _memoryEstimateCell: HTMLElement;
    _paintCountCell: HTMLElement;
    _scrollRectsCell: HTMLElement;
    _stickyPositionConstraintCell: HTMLElement;
    _paintProfilerLink: HTMLElement;
    _selection: Selection | null;
    constructor(layerViewHost: LayerViewHost);
    hoverObject(_selection: Selection | null): void;
    selectObject(selection: Selection | null): void;
    setLayerTree(_layerTree: SDK.LayerTreeBase.LayerTreeBase | null): void;
    wasShown(): void;
    _onScrollRectClicked(index: number, event: Event): void;
    _invokeProfilerLink(): void;
    _createScrollRectElement(scrollRect: Protocol.LayerTree.ScrollRect, index: number): void;
    _formatStickyAncestorLayer(title: string, layer: SDK.LayerTreeBase.Layer | null): string;
    _createStickyAncestorChild(title: string, layer: SDK.LayerTreeBase.Layer | null): void;
    _populateStickyPositionConstraintCell(constraint: SDK.LayerTreeBase.StickyPositionConstraint | null): void;
    update(): void;
    _buildContent(): void;
    _createRow(title: string): HTMLElement;
    _updateCompositingReasons(compositingReasonIds: string[]): void;
    static getCompositingReasons(compositingReasonIds: string[]): string[];
}
export declare enum Events {
    PaintProfilerRequested = "PaintProfilerRequested"
}
export declare const slowScrollRectNames: Map<SDK.LayerTreeBase.Layer.ScrollRectType, () => Platform.UIString.LocalizedString>;
