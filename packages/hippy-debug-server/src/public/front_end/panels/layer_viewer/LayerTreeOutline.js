/*
 * Copyright (C) 2013 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as UI from '../../ui/legacy/legacy.js';
import { LayerSelection } from './LayerViewHost.js';
const UIStrings = {
    /**
    *@description Label for layers sidepanel tree
    */
    layersTreePane: 'Layers Tree Pane',
    /**
    *@description A context menu item in the DView of the Layers panel
    */
    showPaintProfiler: 'Show Paint Profiler',
    /**
    *@description Details text content in Layer Tree Outline of the Layers panel
    *@example {10} PH1
    *@example {10} PH2
    */
    updateChildDimension: ' ({PH1} × {PH2})',
};
const str_ = i18n.i18n.registerUIStrings('panels/layer_viewer/LayerTreeOutline.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class LayerTreeOutline extends Common.ObjectWrapper.ObjectWrapper {
    _layerViewHost;
    _treeOutline;
    _lastHoveredNode;
    element;
    _layerTree;
    _layerSnapshotMap;
    constructor(layerViewHost) {
        super();
        this._layerViewHost = layerViewHost;
        this._layerViewHost.registerView(this);
        this._treeOutline = new UI.TreeOutline.TreeOutlineInShadow();
        this._treeOutline.element.classList.add('layer-tree', 'overflow-auto');
        this._treeOutline.element.addEventListener('mousemove', this._onMouseMove.bind(this), false);
        this._treeOutline.element.addEventListener('mouseout', this._onMouseMove.bind(this), false);
        this._treeOutline.element.addEventListener('contextmenu', this._onContextMenu.bind(this), true);
        UI.ARIAUtils.setAccessibleName(this._treeOutline.contentElement, i18nString(UIStrings.layersTreePane));
        this._lastHoveredNode = null;
        this.element = this._treeOutline.element;
        this._layerViewHost.showInternalLayersSetting().addChangeListener(this._update, this);
    }
    focus() {
        this._treeOutline.focus();
    }
    selectObject(selection) {
        this.hoverObject(null);
        const layer = selection && selection.layer();
        const node = layer && layerToTreeElement.get(layer);
        if (node) {
            node.revealAndSelect(true);
        }
        else if (this._treeOutline.selectedTreeElement) {
            this._treeOutline.selectedTreeElement.deselect();
        }
    }
    hoverObject(selection) {
        const layer = selection && selection.layer();
        const node = layer && layerToTreeElement.get(layer);
        if (node === this._lastHoveredNode) {
            return;
        }
        if (this._lastHoveredNode) {
            this._lastHoveredNode.setHovered(false);
        }
        if (node) {
            node.setHovered(true);
        }
        this._lastHoveredNode = node;
    }
    setLayerTree(layerTree) {
        this._layerTree = layerTree;
        this._update();
    }
    _update() {
        const showInternalLayers = this._layerViewHost.showInternalLayersSetting().get();
        const seenLayers = new Map();
        let root = null;
        if (this._layerTree) {
            if (!showInternalLayers) {
                root = this._layerTree.contentRoot();
            }
            if (!root) {
                root = this._layerTree.root();
            }
        }
        function updateLayer(layer) {
            if (!layer.drawsContent() && !showInternalLayers) {
                return;
            }
            if (seenLayers.get(layer)) {
                console.assert(false, 'Duplicate layer: ' + layer.id());
            }
            seenLayers.set(layer, true);
            let node = layerToTreeElement.get(layer) || null;
            let parentLayer = layer.parent();
            // Skip till nearest visible ancestor.
            while (parentLayer && parentLayer !== root && !parentLayer.drawsContent() && !showInternalLayers) {
                parentLayer = parentLayer.parent();
            }
            const parent = layer === root ? this._treeOutline.rootElement() : parentLayer && layerToTreeElement.get(parentLayer);
            if (!parent) {
                console.assert(false, 'Parent is not in the tree');
                return;
            }
            if (!node) {
                node = new LayerTreeElement(this, layer);
                parent.appendChild(node);
                // Expand all new non-content layers to expose content layers better.
                if (!layer.drawsContent()) {
                    node.expand();
                }
            }
            else {
                if (node.parent !== parent) {
                    const oldSelection = this._treeOutline.selectedTreeElement;
                    if (node.parent) {
                        node.parent.removeChild(node);
                    }
                    parent.appendChild(node);
                    if (oldSelection && oldSelection !== this._treeOutline.selectedTreeElement) {
                        oldSelection.select();
                    }
                }
                node._update();
            }
        }
        if (root && this._layerTree) {
            this._layerTree.forEachLayer(updateLayer.bind(this), root);
        }
        // Cleanup layers that don't exist anymore from tree.
        const rootElement = this._treeOutline.rootElement();
        for (let node = rootElement.firstChild(); node instanceof LayerTreeElement && !node.root;) {
            if (seenLayers.get(node._layer)) {
                node = node.traverseNextTreeElement(false);
            }
            else {
                const nextNode = node.nextSibling || node.parent;
                if (node.parent) {
                    node.parent.removeChild(node);
                }
                if (node === this._lastHoveredNode) {
                    this._lastHoveredNode = null;
                }
                node = nextNode;
            }
        }
        if (!this._treeOutline.selectedTreeElement && this._layerTree) {
            const elementToSelect = this._layerTree.contentRoot() || this._layerTree.root();
            if (elementToSelect) {
                const layer = layerToTreeElement.get(elementToSelect);
                if (layer) {
                    layer.revealAndSelect(true);
                }
            }
        }
    }
    _onMouseMove(event) {
        const node = this._treeOutline.treeElementFromEvent(event);
        if (node === this._lastHoveredNode) {
            return;
        }
        this._layerViewHost.hoverObject(this._selectionForNode(node));
    }
    _selectedNodeChanged(node) {
        this._layerViewHost.selectObject(this._selectionForNode(node));
    }
    _onContextMenu(event) {
        const selection = this._selectionForNode(this._treeOutline.treeElementFromEvent(event));
        const contextMenu = new UI.ContextMenu.ContextMenu(event);
        const layer = selection && selection.layer();
        if (layer) {
            this._layerSnapshotMap = this._layerViewHost.getLayerSnapshotMap();
            if (this._layerSnapshotMap.has(layer)) {
                contextMenu.defaultSection().appendItem(i18nString(UIStrings.showPaintProfiler), this.dispatchEventToListeners.bind(this, Events.PaintProfilerRequested, selection), false);
            }
        }
        this._layerViewHost.showContextMenu(contextMenu, selection);
    }
    _selectionForNode(node) {
        return node && node._layer ? new LayerSelection(node._layer) : null;
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["PaintProfilerRequested"] = "PaintProfilerRequested";
})(Events || (Events = {}));
export class LayerTreeElement extends UI.TreeOutline.TreeElement {
    _treeOutline;
    _layer;
    constructor(tree, layer) {
        super();
        this._treeOutline = tree;
        this._layer = layer;
        layerToTreeElement.set(layer, this);
        this._update();
    }
    _update() {
        const node = this._layer.nodeForSelfOrAncestor();
        const title = document.createDocumentFragment();
        UI.UIUtils.createTextChild(title, node ? node.simpleSelector() : '#' + this._layer.id());
        const details = title.createChild('span', 'dimmed');
        details.textContent =
            i18nString(UIStrings.updateChildDimension, { PH1: this._layer.width(), PH2: this._layer.height() });
        this.title = title;
    }
    onselect() {
        this._treeOutline._selectedNodeChanged(this);
        return false;
    }
    setHovered(hovered) {
        this.listItemElement.classList.toggle('hovered', hovered);
    }
}
export const layerToTreeElement = new WeakMap();
//# sourceMappingURL=LayerTreeOutline.js.map