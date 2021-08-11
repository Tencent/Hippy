/**
 * node:
 *    jsc: id, size, classNameTableIndex, flags
 *    v8: type, nameIndex of strings, id, size, edgeCount
 * edge:
 *    jsc: fromId, toId, typeTableIndex, edgeDataIndexOrEdgeNameIndex
 *    v8: type, nameOrIndex, toNodeIndex
 *
 */

const nodeFieldCount = 4;
const nodeIdOffset = 0;
const nodeSizeOffset = 1;
const nodeClassNameOffset = 2;
const nodeFlagsOffset = 3;
const nodeEdgeCountOffset = 4;
const nodeNoEdgeValue = 0;
const objectNodeTypeIndex = 3;
const nativeNodeTypeIndex = 8;

// Node Flags.
// const internalFlagMask = 1 << 0;
const objectTypeMask = 1 << 1;

const edgeFieldCount = 4;
const edgeFromIdOffset = 0;
const edgeToIdOffset = 1;
const edgeTypeOffset = 2;
const edgeDataOffset = 3;
const edgeTypeMap = {
  0: 3,
  1: 2,
  2: 0,
  3: 6,
};

const v8NodeFieldCount = 5;
// const v8EdgeFieldCount = 3;

export default class HeapAdapter {
  jsc2v8(json) {
    const { nodes, nodeClassNames, edges, edgeNames } = json;

    const nodeCount = nodes.length / nodeFieldCount;
    const edgeCount = edges.length / edgeFieldCount;
    const v8Nodes = new Array(nodeCount * v8NodeFieldCount).fill(0);
    const v8Edges = [];
    const nodeIdToIndex = new Map(); // <id> => index in _nodes

    let m = 0;
    for (let i = 0; i < nodes.length; i += nodeFieldCount) {
      const flags = nodes[i + nodeFlagsOffset];
      // const internal = flags & internalFlagMask ? true : false;
      const isObjectType = !!(flags & objectTypeMask);
      let type;
      if (isObjectType) type = objectNodeTypeIndex;
      else type = nativeNodeTypeIndex;

      nodeIdToIndex.set(nodes[i], m);

      // type
      v8Nodes[m] = type;
      m += 1;
      // name
      v8Nodes[m] = nodes[i + nodeClassNameOffset];
      m += 1;
      // id
      v8Nodes[m] = nodes[i + nodeIdOffset];
      m += 1;
      // size
      v8Nodes[m] = nodes[i + nodeSizeOffset];
      m += 1;
      // edge count
      v8Nodes[m] = nodeNoEdgeValue;
      m += 1;
    }

    const nodeIdEdgeMap = new Map();
    let prevFromId = edges[edgeFromIdOffset];
    let prevEdgeIndex = 0;
    for (let i = 0; i < edges.length; i += edgeFieldCount) {
      const fromId = edges[i + edgeFromIdOffset];
      if (prevFromId !== fromId) {
        const edgeCount = (i - prevEdgeIndex) / edgeFieldCount;
        v8Nodes[nodeIdToIndex.get(prevFromId) + nodeEdgeCountOffset] = edgeCount;
        prevFromId = fromId;
        prevEdgeIndex = i;
      }
      if (!nodeIdEdgeMap.has(fromId)) nodeIdEdgeMap.set(fromId, []);
      const edgeType = edgeTypeMap[edges[i + edgeTypeOffset]];
      const toNodeIndex = nodeIdToIndex.get(edges[i + edgeToIdOffset]);
      nodeIdEdgeMap.get(fromId).push(edgeType, edges[i + edgeDataOffset], toNodeIndex);
    }

    for (let i = 0; i < nodes.length; i += nodeFieldCount) {
      const nodeId = nodes[i + nodeIdOffset];
      const edges = nodeIdEdgeMap.get(nodeId);
      if (edges?.length) v8Edges.push(...edges);
    }

    return {
      ...this.getV8Meta({
        nodeCount,
        edgeCount,
      }),
      nodes: v8Nodes,
      edges: v8Edges,
      trace_function_infos: [],
      trace_tree: [],
      samples: [],
      locations: [],
      strings: nodeClassNames.concat(edgeNames),
    };
  }

  getV8Meta({ nodeCount, edgeCount }) {
    return {
      snapshot: {
        meta: {
          node_fields: ['type', 'name', 'id', 'self_size', 'edge_count'],
          node_types: [
            [
              'hidden',
              'array',
              'string',
              'object',
              'code',
              'closure',
              'regexp',
              'number',
              'native',
              'synthetic',
              'concatenated string',
              'sliced string',
              'symbol',
              'bigint',
            ],
            // nodeTypes,
            'string',
            'number',
            'number',
            'number',
            'number',
            'number',
          ],
          edge_fields: ['type', 'name_or_index', 'to_node'],
          edge_types: [
            // ["Internal", "Property", "Index", "Variable"],
            ['context', 'element', 'property', 'internal', 'hidden', 'shortcut', 'weak'],
            'string_or_number',
            'node',
          ],
          trace_function_info_fields: ['function_id', 'name', 'script_name', 'script_id', 'line', 'column'],
          trace_node_fields: ['id', 'function_info_index', 'count', 'size', 'children'],
        },
        node_count: nodeCount,
        edge_count: edgeCount,
        trace_function_count: 0,
      },
    };
  }
}
