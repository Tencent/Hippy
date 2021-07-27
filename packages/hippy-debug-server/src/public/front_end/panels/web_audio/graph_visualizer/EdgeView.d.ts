import type { NodeParamConnectionData, NodesConnectionData } from './GraphStyle.js';
export declare class EdgeView {
    id: string;
    type: EdgeTypes;
    sourceId: string;
    destinationId: string;
    sourcePortId: string;
    destinationPortId: string;
    constructor(data: NodesConnectionData | NodeParamConnectionData, type: EdgeTypes);
}
/**
 * Generates the edge id and source/destination portId using edge data and type.
 */
export declare const generateEdgePortIdsByData: (data: NodesConnectionData | NodeParamConnectionData, type: EdgeTypes) => {
    edgeId: string;
    sourcePortId: string;
    destinationPortId: string;
} | null;
/**
 * Supported edge types.
 */
export declare enum EdgeTypes {
    NodeToNode = "NodeToNode",
    NodeToParam = "NodeToParam"
}
