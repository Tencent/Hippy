// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../../core/common/common.js';
import * as Platform from '../../../core/platform/platform.js';
import { EdgeTypes, EdgeView, generateEdgePortIdsByData } from './EdgeView.js';
import { NodeLabelGenerator, NodeView } from './NodeView.js';
// A class that tracks all the nodes and edges of an audio graph.
export class GraphView extends Common.ObjectWrapper.ObjectWrapper {
    contextId;
    _nodes;
    _edges;
    _outboundEdgeMap;
    _inboundEdgeMap;
    _nodeLabelGenerator;
    _paramIdToNodeIdMap;
    constructor(contextId) {
        super();
        this.contextId = contextId;
        this._nodes = new Map();
        this._edges = new Map();
        /**
         * For each node ID, keep a set of all out-bound edge IDs.
         */
        this._outboundEdgeMap = new Platform.MapUtilities.Multimap();
        /**
         * For each node ID, keep a set of all in-bound edge IDs.
         */
        this._inboundEdgeMap = new Platform.MapUtilities.Multimap();
        // Use concise node label to replace the long UUID.
        // Each graph has its own label generator so that the label starts from 0.
        this._nodeLabelGenerator = new NodeLabelGenerator();
        /**
         * For each param ID, save its corresponding node Id.
          */
        this._paramIdToNodeIdMap = new Map();
    }
    /**
     * Add a node to the graph.
     */
    addNode(data) {
        const label = this._nodeLabelGenerator.generateLabel(data.nodeType);
        const node = new NodeView(data, label);
        this._nodes.set(data.nodeId, node);
        this._notifyShouldRedraw();
    }
    /**
     * Remove a node by id and all related edges.
     */
    removeNode(nodeId) {
        this._outboundEdgeMap.get(nodeId).forEach(edgeId => this._removeEdge(edgeId));
        this._inboundEdgeMap.get(nodeId).forEach(edgeId => this._removeEdge(edgeId));
        this._nodes.delete(nodeId);
        this._notifyShouldRedraw();
    }
    /**
     * Add a param to the node.
     */
    addParam(data) {
        const node = this.getNodeById(data.nodeId);
        if (!node) {
            console.error('AudioNode should be added before AudioParam');
            return;
        }
        node.addParamPort(data.paramId, data.paramType);
        this._paramIdToNodeIdMap.set(data.paramId, data.nodeId);
        this._notifyShouldRedraw();
    }
    /**
     * Remove a param.
     */
    removeParam(paramId) {
        // Only need to delete the entry from the param id to node id map.
        this._paramIdToNodeIdMap.delete(paramId);
        // No need to remove the param port from the node because removeParam will always happen with
        // removeNode(). Since the whole Node will be gone, there is no need to remove port individually.
    }
    /**
     * Add a Node-to-Node connection to the graph.
     */
    addNodeToNodeConnection(edgeData) {
        const edge = new EdgeView(edgeData, EdgeTypes.NodeToNode);
        this._addEdge(edge);
    }
    /**
     * Remove a Node-to-Node connection from the graph.
     */
    removeNodeToNodeConnection(edgeData) {
        if (edgeData.destinationId) {
            // Remove a single edge if destinationId is specified.
            const edgePortIds = generateEdgePortIdsByData(edgeData, EdgeTypes.NodeToNode);
            if (!edgePortIds) {
                throw new Error('Unable to generate edge port IDs');
            }
            const { edgeId } = edgePortIds;
            this._removeEdge(edgeId);
        }
        else {
            // Otherwise, remove all outgoing edges from source node.
            this._outboundEdgeMap.get(edgeData.sourceId).forEach(edgeId => this._removeEdge(edgeId));
        }
    }
    /**
     * Add a Node-to-Param connection to the graph.
     */
    addNodeToParamConnection(edgeData) {
        const edge = new EdgeView(edgeData, EdgeTypes.NodeToParam);
        this._addEdge(edge);
    }
    /**
     * Remove a Node-to-Param connection from the graph.
     */
    removeNodeToParamConnection(edgeData) {
        const edgePortIds = generateEdgePortIdsByData(edgeData, EdgeTypes.NodeToParam);
        if (!edgePortIds) {
            throw new Error('Unable to generate edge port IDs');
        }
        const { edgeId } = edgePortIds;
        this._removeEdge(edgeId);
    }
    getNodeById(nodeId) {
        return this._nodes.get(nodeId) || null;
    }
    getNodes() {
        return this._nodes;
    }
    getEdges() {
        return this._edges;
    }
    getNodeIdByParamId(paramId) {
        return this._paramIdToNodeIdMap.get(paramId) || null;
    }
    /**
     * Add an edge to the graph.
     */
    _addEdge(edge) {
        const sourceId = edge.sourceId;
        // Do nothing if the edge already exists.
        if (this._outboundEdgeMap.hasValue(sourceId, edge.id)) {
            return;
        }
        this._edges.set(edge.id, edge);
        this._outboundEdgeMap.set(sourceId, edge.id);
        this._inboundEdgeMap.set(edge.destinationId, edge.id);
        this._notifyShouldRedraw();
    }
    /**
     * Given an edge id, remove the edge from the graph.
     * Also remove the edge from inbound and outbound edge maps.
     */
    _removeEdge(edgeId) {
        const edge = this._edges.get(edgeId);
        if (!edge) {
            return;
        }
        this._outboundEdgeMap.delete(edge.sourceId, edgeId);
        this._inboundEdgeMap.delete(edge.destinationId, edgeId);
        this._edges.delete(edgeId);
        this._notifyShouldRedraw();
    }
    _notifyShouldRedraw() {
        this.dispatchEventToListeners("ShouldRedraw" /* ShouldRedraw */, this);
    }
}
//# sourceMappingURL=GraphView.js.map