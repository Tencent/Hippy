// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { DOMModel } from './DOMModel.js'; // eslint-disable-line no-unused-vars
export var Layer;
(function (Layer) {
    // TODO(crbug.com/1167717): Make this a const enum again
    // eslint-disable-next-line rulesdir/const_enum
    let ScrollRectType;
    (function (ScrollRectType) {
        ScrollRectType["NonFastScrollable"] = "NonFastScrollable";
        ScrollRectType["TouchEventHandler"] = "TouchEventHandler";
        ScrollRectType["WheelEventHandler"] = "WheelEventHandler";
        ScrollRectType["RepaintsOnScroll"] = "RepaintsOnScroll";
        ScrollRectType["MainThreadScrollingReason"] = "MainThreadScrollingReason";
    })(ScrollRectType = Layer.ScrollRectType || (Layer.ScrollRectType = {}));
})(Layer || (Layer = {}));
export class StickyPositionConstraint {
    _stickyBoxRect;
    _containingBlockRect;
    _nearestLayerShiftingStickyBox;
    _nearestLayerShiftingContainingBlock;
    constructor(layerTree, constraint) {
        this._stickyBoxRect = constraint.stickyBoxRect;
        this._containingBlockRect = constraint.containingBlockRect;
        this._nearestLayerShiftingStickyBox = null;
        if (layerTree && constraint.nearestLayerShiftingStickyBox) {
            this._nearestLayerShiftingStickyBox = layerTree.layerById(constraint.nearestLayerShiftingStickyBox);
        }
        this._nearestLayerShiftingContainingBlock = null;
        if (layerTree && constraint.nearestLayerShiftingContainingBlock) {
            this._nearestLayerShiftingContainingBlock = layerTree.layerById(constraint.nearestLayerShiftingContainingBlock);
        }
    }
    stickyBoxRect() {
        return this._stickyBoxRect;
    }
    containingBlockRect() {
        return this._containingBlockRect;
    }
    nearestLayerShiftingStickyBox() {
        return this._nearestLayerShiftingStickyBox;
    }
    nearestLayerShiftingContainingBlock() {
        return this._nearestLayerShiftingContainingBlock;
    }
}
export class LayerTreeBase {
    _target;
    _domModel;
    layersById;
    _root;
    _contentRoot;
    _backendNodeIdToNode;
    _viewportSize;
    constructor(target) {
        this._target = target;
        this._domModel = target ? target.model(DOMModel) : null;
        this.layersById = new Map();
        this._root = null;
        this._contentRoot = null;
        this._backendNodeIdToNode = new Map();
    }
    target() {
        return this._target;
    }
    root() {
        return this._root;
    }
    setRoot(root) {
        this._root = root;
    }
    contentRoot() {
        return this._contentRoot;
    }
    setContentRoot(contentRoot) {
        this._contentRoot = contentRoot;
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    forEachLayer(callback, root) {
        if (!root) {
            root = this.root();
            if (!root) {
                return false;
            }
        }
        return callback(root) || root.children().some(this.forEachLayer.bind(this, callback));
    }
    layerById(id) {
        return this.layersById.get(id) || null;
    }
    async resolveBackendNodeIds(requestedNodeIds) {
        if (!requestedNodeIds.size || !this._domModel) {
            return;
        }
        const nodesMap = await this._domModel.pushNodesByBackendIdsToFrontend(requestedNodeIds);
        if (!nodesMap) {
            return;
        }
        for (const nodeId of nodesMap.keys()) {
            this._backendNodeIdToNode.set(nodeId, nodesMap.get(nodeId) || null);
        }
    }
    backendNodeIdToNode() {
        return this._backendNodeIdToNode;
    }
    setViewportSize(viewportSize) {
        this._viewportSize = viewportSize;
    }
    viewportSize() {
        return this._viewportSize;
    }
    _nodeForId(id) {
        return this._domModel ? this._domModel.nodeForId(id) : null;
    }
}
//# sourceMappingURL=LayerTreeBase.js.map