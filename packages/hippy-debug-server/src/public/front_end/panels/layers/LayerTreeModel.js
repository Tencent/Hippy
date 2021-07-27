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
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
export class LayerTreeModel extends SDK.SDKModel.SDKModel {
    _layerTreeAgent;
    _paintProfilerModel;
    _layerTree;
    _throttler;
    _enabled;
    _lastPaintRectByLayerId;
    constructor(target) {
        super(target);
        this._layerTreeAgent = target.layerTreeAgent();
        target.registerLayerTreeDispatcher(new LayerTreeDispatcher(this));
        this._paintProfilerModel =
            target.model(SDK.PaintProfiler.PaintProfilerModel);
        const resourceTreeModel = target.model(SDK.ResourceTreeModel.ResourceTreeModel);
        if (resourceTreeModel) {
            resourceTreeModel.addEventListener(SDK.ResourceTreeModel.Events.MainFrameNavigated, this._onMainFrameNavigated, this);
        }
        this._layerTree = null;
        this._throttler = new Common.Throttler.Throttler(20);
    }
    async disable() {
        if (!this._enabled) {
            return;
        }
        this._enabled = false;
        await this._layerTreeAgent.invoke_disable();
    }
    enable() {
        if (this._enabled) {
            return;
        }
        this._enabled = true;
        this._forceEnable();
    }
    async _forceEnable() {
        this._lastPaintRectByLayerId = new Map();
        if (!this._layerTree) {
            this._layerTree = new AgentLayerTree(this);
        }
        await this._layerTreeAgent.invoke_enable();
    }
    layerTree() {
        return this._layerTree;
    }
    async _layerTreeChanged(layers) {
        if (!this._enabled) {
            return;
        }
        this._throttler.schedule(this._innerSetLayers.bind(this, layers));
    }
    async _innerSetLayers(layers) {
        const layerTree = this._layerTree;
        await layerTree.setLayers(layers);
        if (!this._lastPaintRectByLayerId) {
            this._lastPaintRectByLayerId = new Map();
        }
        for (const layerId of this._lastPaintRectByLayerId.keys()) {
            const lastPaintRect = this._lastPaintRectByLayerId.get(layerId);
            const layer = layerTree.layerById(layerId);
            if (layer) {
                layer._lastPaintRect = lastPaintRect;
            }
        }
        this._lastPaintRectByLayerId = new Map();
        this.dispatchEventToListeners(Events.LayerTreeChanged);
    }
    _layerPainted(layerId, clipRect) {
        if (!this._enabled) {
            return;
        }
        const layerTree = this._layerTree;
        const layer = layerTree.layerById(layerId);
        if (!layer) {
            if (!this._lastPaintRectByLayerId) {
                this._lastPaintRectByLayerId = new Map();
            }
            this._lastPaintRectByLayerId.set(layerId, clipRect);
            return;
        }
        layer._didPaint(clipRect);
        this.dispatchEventToListeners(Events.LayerPainted, layer);
    }
    _onMainFrameNavigated() {
        this._layerTree = null;
        if (this._enabled) {
            this._forceEnable();
        }
    }
}
SDK.SDKModel.SDKModel.register(LayerTreeModel, { capabilities: SDK.Target.Capability.DOM, autostart: false });
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["LayerTreeChanged"] = "LayerTreeChanged";
    Events["LayerPainted"] = "LayerPainted";
})(Events || (Events = {}));
export class AgentLayerTree extends SDK.LayerTreeBase.LayerTreeBase {
    _layerTreeModel;
    constructor(layerTreeModel) {
        super(layerTreeModel.target());
        this._layerTreeModel = layerTreeModel;
    }
    async setLayers(payload) {
        if (!payload) {
            this._innerSetLayers(payload);
            return;
        }
        const idsToResolve = new Set();
        for (let i = 0; i < payload.length; ++i) {
            const backendNodeId = payload[i].backendNodeId;
            if (!backendNodeId || this.backendNodeIdToNode().has(backendNodeId)) {
                continue;
            }
            idsToResolve.add(backendNodeId);
        }
        await this.resolveBackendNodeIds(idsToResolve);
        this._innerSetLayers(payload);
    }
    _innerSetLayers(layers) {
        this.setRoot(null);
        this.setContentRoot(null);
        // Payload will be null when not in the composited mode.
        if (!layers) {
            return;
        }
        let root;
        const oldLayersById = this.layersById;
        this.layersById = new Map();
        for (let i = 0; i < layers.length; ++i) {
            const layerId = layers[i].layerId;
            let layer = oldLayersById.get(layerId);
            if (layer) {
                layer._reset(layers[i]);
            }
            else {
                layer = new AgentLayer(this._layerTreeModel, layers[i]);
            }
            this.layersById.set(layerId, layer);
            const backendNodeId = layers[i].backendNodeId;
            if (backendNodeId) {
                layer._setNode(this.backendNodeIdToNode().get(backendNodeId) || null);
            }
            if (!this.contentRoot() && layer.drawsContent()) {
                this.setContentRoot(layer);
            }
            const parentId = layer.parentId();
            if (parentId) {
                const parent = this.layersById.get(parentId);
                if (!parent) {
                    throw new Error(`Missing parent ${parentId} for layer ${layerId}`);
                }
                parent.addChild(layer);
            }
            else {
                if (root) {
                    console.assert(false, 'Multiple root layers');
                }
                root = layer;
            }
        }
        if (root) {
            this.setRoot(root);
            root._calculateQuad(new WebKitCSSMatrix());
        }
    }
}
export class AgentLayer {
    _scrollRects;
    _quad;
    _children;
    _image;
    _parent;
    _layerPayload;
    _layerTreeModel;
    _node;
    _lastPaintRect;
    _paintCount;
    _stickyPositionConstraint;
    constructor(layerTreeModel, layerPayload) {
        this._layerTreeModel = layerTreeModel;
        this._reset(layerPayload);
    }
    id() {
        return this._layerPayload.layerId;
    }
    parentId() {
        return this._layerPayload.parentLayerId || null;
    }
    parent() {
        return this._parent;
    }
    isRoot() {
        return !this.parentId();
    }
    children() {
        return this._children;
    }
    addChild(childParam) {
        const child = childParam;
        if (child._parent) {
            console.assert(false, 'Child already has a parent');
        }
        this._children.push(child);
        child._parent = this;
    }
    _setNode(node) {
        this._node = node;
    }
    node() {
        return this._node || null;
    }
    nodeForSelfOrAncestor() {
        let layer = this;
        for (; layer; layer = layer._parent) {
            if (layer._node) {
                return layer._node;
            }
        }
        return null;
    }
    offsetX() {
        return this._layerPayload.offsetX;
    }
    offsetY() {
        return this._layerPayload.offsetY;
    }
    width() {
        return this._layerPayload.width;
    }
    height() {
        return this._layerPayload.height;
    }
    transform() {
        return this._layerPayload.transform || null;
    }
    quad() {
        return this._quad;
    }
    anchorPoint() {
        return [
            this._layerPayload.anchorX || 0,
            this._layerPayload.anchorY || 0,
            this._layerPayload.anchorZ || 0,
        ];
    }
    invisible() {
        return this._layerPayload.invisible || false;
    }
    paintCount() {
        return this._paintCount || this._layerPayload.paintCount;
    }
    lastPaintRect() {
        return this._lastPaintRect || null;
    }
    scrollRects() {
        return this._scrollRects;
    }
    stickyPositionConstraint() {
        return this._stickyPositionConstraint || null;
    }
    async requestCompositingReasonIds() {
        const reasons = await this._layerTreeModel._layerTreeAgent.invoke_compositingReasons({ layerId: this.id() });
        return reasons.compositingReasonIds || [];
    }
    drawsContent() {
        return this._layerPayload.drawsContent;
    }
    gpuMemoryUsage() {
        /**
         * @const
         */
        const bytesPerPixel = 4;
        return this.drawsContent() ? this.width() * this.height() * bytesPerPixel : 0;
    }
    snapshots() {
        const promise = this._layerTreeModel._paintProfilerModel.makeSnapshot(this.id()).then(snapshot => {
            if (!snapshot) {
                return null;
            }
            return { rect: { x: 0, y: 0, width: this.width(), height: this.height() }, snapshot: snapshot };
        });
        return [promise];
    }
    _didPaint(rect) {
        this._lastPaintRect = rect;
        this._paintCount = this.paintCount() + 1;
        this._image = null;
    }
    _reset(layerPayload) {
        /** @type {?SDK.DOMModel.DOMNode} */
        this._node = null;
        this._children = [];
        this._parent = null;
        this._paintCount = 0;
        this._layerPayload = layerPayload;
        this._image = null;
        this._scrollRects = this._layerPayload.scrollRects || [];
        this._stickyPositionConstraint = this._layerPayload.stickyPositionConstraint ?
            new SDK.LayerTreeBase.StickyPositionConstraint(this._layerTreeModel.layerTree(), this._layerPayload.stickyPositionConstraint) :
            null;
    }
    _matrixFromArray(a) {
        function toFixed9(x) {
            return x.toFixed(9);
        }
        return new WebKitCSSMatrix('matrix3d(' + a.map(toFixed9).join(',') + ')');
    }
    _calculateTransformToViewport(parentTransform) {
        const offsetMatrix = new WebKitCSSMatrix().translate(this._layerPayload.offsetX, this._layerPayload.offsetY);
        let matrix = offsetMatrix;
        if (this._layerPayload.transform) {
            const transformMatrix = this._matrixFromArray(this._layerPayload.transform);
            const anchorVector = new UI.Geometry.Vector(this._layerPayload.width * this.anchorPoint()[0], this._layerPayload.height * this.anchorPoint()[1], this.anchorPoint()[2]);
            const anchorPoint = UI.Geometry.multiplyVectorByMatrixAndNormalize(anchorVector, matrix);
            const anchorMatrix = new WebKitCSSMatrix().translate(-anchorPoint.x, -anchorPoint.y, -anchorPoint.z);
            matrix = anchorMatrix.inverse().multiply(transformMatrix.multiply(anchorMatrix.multiply(matrix)));
        }
        matrix = parentTransform.multiply(matrix);
        return matrix;
    }
    _createVertexArrayForRect(width, height) {
        return [0, 0, 0, width, 0, 0, width, height, 0, 0, height, 0];
    }
    _calculateQuad(parentTransform) {
        const matrix = this._calculateTransformToViewport(parentTransform);
        this._quad = [];
        const vertices = this._createVertexArrayForRect(this._layerPayload.width, this._layerPayload.height);
        for (let i = 0; i < 4; ++i) {
            const point = UI.Geometry.multiplyVectorByMatrixAndNormalize(new UI.Geometry.Vector(vertices[i * 3], vertices[i * 3 + 1], vertices[i * 3 + 2]), matrix);
            this._quad.push(point.x, point.y);
        }
        function calculateQuadForLayer(layer) {
            layer._calculateQuad(matrix);
        }
        this._children.forEach(calculateQuadForLayer);
    }
}
class LayerTreeDispatcher {
    _layerTreeModel;
    constructor(layerTreeModel) {
        this._layerTreeModel = layerTreeModel;
    }
    layerTreeDidChange({ layers }) {
        this._layerTreeModel._layerTreeChanged(layers || null);
    }
    layerPainted({ layerId, clip }) {
        this._layerTreeModel._layerPainted(layerId, clip);
    }
}
//# sourceMappingURL=LayerTreeModel.js.map