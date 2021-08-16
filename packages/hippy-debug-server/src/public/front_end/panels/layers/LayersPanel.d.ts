import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as LayerViewer from '../layer_viewer/layer_viewer.js';
import { LayerPaintProfilerView } from './LayerPaintProfilerView.js';
import { LayerTreeModel } from './LayerTreeModel.js';
export declare class LayersPanel extends UI.Panel.PanelWithSidebar implements SDK.TargetManager.Observer {
    _model: LayerTreeModel | null;
    _layerViewHost: LayerViewer.LayerViewHost.LayerViewHost;
    _layerTreeOutline: LayerViewer.LayerTreeOutline.LayerTreeOutline;
    _rightSplitWidget: UI.SplitWidget.SplitWidget;
    _layers3DView: LayerViewer.Layers3DView.Layers3DView;
    _tabbedPane: UI.TabbedPane.TabbedPane;
    _layerDetailsView: LayerViewer.LayerDetailsView.LayerDetailsView;
    _paintProfilerView: LayerPaintProfilerView;
    _updateThrottler: Common.Throttler.Throttler;
    _layerBeingProfiled?: SDK.LayerTreeBase.Layer | null;
    constructor();
    static instance(opts?: {
        forceNew: null;
    }): LayersPanel;
    focus(): void;
    wasShown(): void;
    willHide(): void;
    targetAdded(target: SDK.Target.Target): void;
    targetRemoved(target: SDK.Target.Target): void;
    _onLayerTreeUpdated(): void;
    _update(): Promise<void>;
    _onLayerPainted(event: Common.EventTarget.EventTargetEvent): void;
    _onPaintProfileRequested(event: Common.EventTarget.EventTargetEvent): void;
    _onTabClosed(event: Common.EventTarget.EventTargetEvent): void;
    _showImage(imageURL?: string): void;
    _onScaleChanged(event: Common.EventTarget.EventTargetEvent): void;
}
export declare const DetailsViewTabs: {
    Details: string;
    Profiler: string;
};
