// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { generateInputPortId, generateOutputPortId, generateParamPortId } from './NodeView.js';
// A class that represents an edge of a graph, including node-to-node connection,
// and node-to-param connection.
export class EdgeView {
    id;
    type;
    sourceId;
    destinationId;
    sourcePortId;
    destinationPortId;
    constructor(data, type) {
        const edgePortsIds = generateEdgePortIdsByData(data, type);
        if (!edgePortsIds) {
            throw new Error('Unable to generate edge port IDs');
        }
        const { edgeId, sourcePortId, destinationPortId } = edgePortsIds;
        this.id = edgeId;
        this.type = type;
        this.sourceId = data.sourceId;
        this.destinationId = data.destinationId;
        this.sourcePortId = sourcePortId;
        this.destinationPortId = destinationPortId;
    }
}
/**
 * Generates the edge id and source/destination portId using edge data and type.
 */
export const generateEdgePortIdsByData = (data, type) => {
    if (!data.sourceId || !data.destinationId) {
        console.error(`Undefined node message: ${JSON.stringify(data)}`);
        return null;
    }
    const sourcePortId = generateOutputPortId(data.sourceId, data.sourceOutputIndex);
    const destinationPortId = getDestinationPortId(data, type);
    return {
        edgeId: `${sourcePortId}->${destinationPortId}`,
        sourcePortId: sourcePortId,
        destinationPortId: destinationPortId,
    };
    /**
     * Get the destination portId based on connection type.
     */
    function getDestinationPortId(data, type) {
        if (type === EdgeTypes.NodeToNode) {
            const portData = data;
            return generateInputPortId(data.destinationId, portData.destinationInputIndex);
        }
        if (type === EdgeTypes.NodeToParam) {
            const portData = data;
            return generateParamPortId(data.destinationId, portData.destinationParamId);
        }
        console.error(`Unknown edge type: ${type}`);
        return '';
    }
};
/**
 * Supported edge types.
 */
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var EdgeTypes;
(function (EdgeTypes) {
    EdgeTypes["NodeToNode"] = "NodeToNode";
    EdgeTypes["NodeToParam"] = "NodeToParam";
})(EdgeTypes || (EdgeTypes = {}));
//# sourceMappingURL=EdgeView.js.map