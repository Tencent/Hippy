// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as UI from '../../ui/legacy/legacy.js';
import * as LayerViewer from '../layer_viewer/layer_viewer.js';
export class TimelineLayersView extends UI.SplitWidget.SplitWidget {
    _model;
    _showPaintProfilerCallback;
    _rightSplitWidget;
    _layerViewHost;
    _layers3DView;
    _frameLayerTree;
    _updateWhenVisible;
    constructor(model, showPaintProfilerCallback) {
        super(true, false, 'timelineLayersView');
        this._model = model;
        this._showPaintProfilerCallback = showPaintProfilerCallback;
        this.element.classList.add('timeline-layers-view');
        this._rightSplitWidget = new UI.SplitWidget.SplitWidget(true, true, 'timelineLayersViewDetails');
        this._rightSplitWidget.element.classList.add('timeline-layers-view-properties');
        this.setMainWidget(this._rightSplitWidget);
        const vbox = new UI.Widget.VBox();
        this.setSidebarWidget(vbox);
        this._layerViewHost = new LayerViewer.LayerViewHost.LayerViewHost();
        const layerTreeOutline = new LayerViewer.LayerTreeOutline.LayerTreeOutline(this._layerViewHost);
        vbox.element.appendChild(layerTreeOutline.element);
        this._layers3DView = new LayerViewer.Layers3DView.Layers3DView(this._layerViewHost);
        this._layers3DView.addEventListener(LayerViewer.Layers3DView.Events.PaintProfilerRequested, this._onPaintProfilerRequested, this);
        this._rightSplitWidget.setMainWidget(this._layers3DView);
        const layerDetailsView = new LayerViewer.LayerDetailsView.LayerDetailsView(this._layerViewHost);
        this._rightSplitWidget.setSidebarWidget(layerDetailsView);
        layerDetailsView.addEventListener(LayerViewer.LayerDetailsView.Events.PaintProfilerRequested, this._onPaintProfilerRequested, this);
    }
    showLayerTree(frameLayerTree) {
        this._frameLayerTree = frameLayerTree;
        if (this.isShowing()) {
            this._update();
        }
        else {
            this._updateWhenVisible = true;
        }
    }
    wasShown() {
        if (this._updateWhenVisible) {
            this._updateWhenVisible = false;
            this._update();
        }
    }
    _onPaintProfilerRequested(event) {
        const selection = event.data;
        this._layers3DView.snapshotForSelection(selection).then(snapshotWithRect => {
            if (snapshotWithRect) {
                this._showPaintProfilerCallback(snapshotWithRect.snapshot);
            }
        });
    }
    _update() {
        if (this._frameLayerTree) {
            this._frameLayerTree.layerTreePromise().then(layerTree => this._layerViewHost.setLayerTree(layerTree));
        }
    }
}
//# sourceMappingURL=TimelineLayersView.js.map