// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
const UIStrings = {
    /**
    *@description Text in Layer View Host of the Layers panel
    */
    showInternalLayers: 'Show internal layers',
};
const str_ = i18n.i18n.registerUIStrings('panels/layer_viewer/LayerViewHost.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class LayerView {
}
export class Selection {
    _type;
    _layer;
    constructor(type, layer) {
        this._type = type;
        this._layer = layer;
    }
    static isEqual(a, b) {
        return a && b ? a._isEqual(b) : a === b;
    }
    type() {
        return this._type;
    }
    layer() {
        return this._layer;
    }
    _isEqual(_other) {
        return false;
    }
}
export class LayerSelection extends Selection {
    constructor(layer) {
        console.assert(Boolean(layer), 'LayerSelection with empty layer');
        super("Layer" /* Layer */, layer);
    }
    _isEqual(other) {
        return other._type === "Layer" /* Layer */ && other.layer().id() === this.layer().id();
    }
}
export class ScrollRectSelection extends Selection {
    scrollRectIndex;
    constructor(layer, scrollRectIndex) {
        super("ScrollRect" /* ScrollRect */, layer);
        this.scrollRectIndex = scrollRectIndex;
    }
    _isEqual(other) {
        return other._type === "ScrollRect" /* ScrollRect */ && this.layer().id() === other.layer().id() &&
            this.scrollRectIndex === other.scrollRectIndex;
    }
}
export class SnapshotSelection extends Selection {
    _snapshot;
    constructor(layer, snapshot) {
        super("Snapshot" /* Snapshot */, layer);
        this._snapshot = snapshot;
    }
    _isEqual(other) {
        return other._type === "Snapshot" /* Snapshot */ && this.layer().id() === other.layer().id() &&
            this._snapshot === other._snapshot;
    }
    snapshot() {
        return this._snapshot;
    }
}
export class LayerViewHost {
    _views;
    _selectedObject;
    _hoveredObject;
    _showInternalLayersSetting;
    _snapshotLayers;
    _target;
    constructor() {
        this._views = [];
        this._selectedObject = null;
        this._hoveredObject = null;
        this._showInternalLayersSetting =
            Common.Settings.Settings.instance().createSetting('layersShowInternalLayers', false);
        this._snapshotLayers = new Map();
    }
    registerView(layerView) {
        this._views.push(layerView);
    }
    setLayerSnapshotMap(snapshotLayers) {
        this._snapshotLayers = snapshotLayers;
    }
    getLayerSnapshotMap() {
        return this._snapshotLayers;
    }
    setLayerTree(layerTree) {
        if (!layerTree) {
            return;
        }
        this._target = layerTree.target();
        const selectedLayer = this._selectedObject && this._selectedObject.layer();
        if (selectedLayer && (!layerTree || !layerTree.layerById(selectedLayer.id()))) {
            this.selectObject(null);
        }
        const hoveredLayer = this._hoveredObject && this._hoveredObject.layer();
        if (hoveredLayer && (!layerTree || !layerTree.layerById(hoveredLayer.id()))) {
            this.hoverObject(null);
        }
        for (const view of this._views) {
            view.setLayerTree(layerTree);
        }
    }
    hoverObject(selection) {
        if (Selection.isEqual(this._hoveredObject, selection)) {
            return;
        }
        this._hoveredObject = selection;
        const layer = selection && selection.layer();
        this._toggleNodeHighlight(layer ? layer.nodeForSelfOrAncestor() : null);
        for (const view of this._views) {
            view.hoverObject(selection);
        }
    }
    selectObject(selection) {
        if (Selection.isEqual(this._selectedObject, selection)) {
            return;
        }
        this._selectedObject = selection;
        for (const view of this._views) {
            view.selectObject(selection);
        }
    }
    selection() {
        return this._selectedObject;
    }
    showContextMenu(contextMenu, selection) {
        contextMenu.defaultSection().appendCheckboxItem(i18nString(UIStrings.showInternalLayers), this._toggleShowInternalLayers.bind(this), this._showInternalLayersSetting.get());
        const node = selection && selection.layer() && selection.layer().nodeForSelfOrAncestor();
        if (node) {
            contextMenu.appendApplicableItems(node);
        }
        contextMenu.show();
    }
    showInternalLayersSetting() {
        return this._showInternalLayersSetting;
    }
    _toggleShowInternalLayers() {
        this._showInternalLayersSetting.set(!this._showInternalLayersSetting.get());
    }
    _toggleNodeHighlight(node) {
        if (node) {
            node.highlightForTwoSeconds();
            return;
        }
        SDK.OverlayModel.OverlayModel.hideDOMNodeHighlight();
    }
}
//# sourceMappingURL=LayerViewHost.js.map