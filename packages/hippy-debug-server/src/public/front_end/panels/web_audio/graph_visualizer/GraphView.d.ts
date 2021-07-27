import * as Common from '../../../core/common/common.js';
import * as Platform from '../../../core/platform/platform.js';
import { EdgeView } from './EdgeView.js';
import type { NodeCreationData, NodeParamConnectionData, NodeParamDisconnectionData, NodesConnectionData, NodesDisconnectionData, ParamCreationData } from './GraphStyle.js';
import { NodeLabelGenerator, NodeView } from './NodeView.js';
export declare class GraphView extends Common.ObjectWrapper.ObjectWrapper {
    contextId: string;
    _nodes: Map<string, NodeView>;
    _edges: Map<string, EdgeView>;
    _outboundEdgeMap: Platform.MapUtilities.Multimap<string, string>;
    _inboundEdgeMap: Platform.MapUtilities.Multimap<string, string>;
    _nodeLabelGenerator: NodeLabelGenerator;
    _paramIdToNodeIdMap: Map<string, string>;
    constructor(contextId: string);
    /**
     * Add a node to the graph.
     */
    addNode(data: NodeCreationData): void;
    /**
     * Remove a node by id and all related edges.
     */
    removeNode(nodeId: string): void;
    /**
     * Add a param to the node.
     */
    addParam(data: ParamCreationData): void;
    /**
     * Remove a param.
     */
    removeParam(paramId: string): void;
    /**
     * Add a Node-to-Node connection to the graph.
     */
    addNodeToNodeConnection(edgeData: NodesConnectionData): void;
    /**
     * Remove a Node-to-Node connection from the graph.
     */
    removeNodeToNodeConnection(edgeData: NodesDisconnectionData): void;
    /**
     * Add a Node-to-Param connection to the graph.
     */
    addNodeToParamConnection(edgeData: NodeParamConnectionData): void;
    /**
     * Remove a Node-to-Param connection from the graph.
     */
    removeNodeToParamConnection(edgeData: NodeParamDisconnectionData): void;
    getNodeById(nodeId: string): NodeView | null;
    getNodes(): Map<string, NodeView>;
    getEdges(): Map<string, EdgeView>;
    getNodeIdByParamId(paramId: string): string | null;
    /**
     * Add an edge to the graph.
     */
    _addEdge(edge: EdgeView): void;
    /**
     * Given an edge id, remove the edge from the graph.
     * Also remove the edge from inbound and outbound edge maps.
     */
    _removeEdge(edgeId: string): void;
    _notifyShouldRedraw(): void;
}
export declare const enum Events {
    ShouldRedraw = "ShouldRedraw"
}
