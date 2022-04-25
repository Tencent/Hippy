/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * heap data refer to src/__mock__
 * node:
 *    jsc: id, size, classNameTableIndex, flags
 *    v8: type, nameIndex of strings, id, size, edgeCount
 * edge:
 *    jsc: fromId, toId, typeTableIndex, edgeDataIndexOrEdgeNameIndex
 *    v8: type, nameOrIndex, toNodeIndex
 * edge is sort by fromId
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
  public static jsc2v8(json: JscHeapSnapshot): V8HeapSnapshot {
    const { nodes, nodeClassNames, edges, edgeNames } = json;
    const nodeCount = nodes.length / nodeFieldCount;
    const edgeCount = edges.length / edgeFieldCount;
    const v8Nodes = new Array(nodeCount * v8NodeFieldCount).fill(0);
    const v8Edges = [];
    // key: id, value: index in _nodes
    const nodeIdToIndex = new Map();

    let v8NodeIndex = 0;
    for (let jscNodeIndex = 0; jscNodeIndex < nodes.length; jscNodeIndex += nodeFieldCount) {
      const flags = nodes[jscNodeIndex + nodeFlagsOffset];
      // const internal = flags & internalFlagMask ? true : false;
      const isObjectType = !!(flags & objectTypeMask);
      let type;
      if (isObjectType) type = objectNodeTypeIndex;
      else type = nativeNodeTypeIndex;

      nodeIdToIndex.set(nodes[jscNodeIndex], v8NodeIndex);

      // type
      v8Nodes[v8NodeIndex] = type;
      v8NodeIndex += 1;
      // name
      v8Nodes[v8NodeIndex] = nodes[jscNodeIndex + nodeClassNameOffset];
      v8NodeIndex += 1;
      // id
      v8Nodes[v8NodeIndex] = nodes[jscNodeIndex + nodeIdOffset];
      v8NodeIndex += 1;
      // size
      v8Nodes[v8NodeIndex] = nodes[jscNodeIndex + nodeSizeOffset];
      v8NodeIndex += 1;
      // edge count
      v8Nodes[v8NodeIndex] = nodeNoEdgeValue;
      v8NodeIndex += 1;
    }

    const nodeIdEdgeMap = new Map();
    let prevFromId = edges[edgeFromIdOffset];
    let prevEdgeIndex = 0;
    for (let edgeIndex = 0; edgeIndex < edges.length; edgeIndex += edgeFieldCount) {
      const fromId = edges[edgeIndex + edgeFromIdOffset];
      if (prevFromId !== fromId) {
        const edgeCount = (edgeIndex - prevEdgeIndex) / edgeFieldCount;
        v8Nodes[nodeIdToIndex.get(prevFromId) + nodeEdgeCountOffset] = edgeCount;
        prevFromId = fromId;
        prevEdgeIndex = edgeIndex;
      }
      if (!nodeIdEdgeMap.has(fromId)) nodeIdEdgeMap.set(fromId, []);
      const edgeType = edgeTypeMap[edges[edgeIndex + edgeTypeOffset]];
      const toNodeIndex = nodeIdToIndex.get(edges[edgeIndex + edgeToIdOffset]);
      nodeIdEdgeMap.get(fromId).push(edgeType, edges[edgeIndex + edgeDataOffset], toNodeIndex);
    }

    for (let jscNodeIndex = 0; jscNodeIndex < nodes.length; jscNodeIndex += nodeFieldCount) {
      const nodeId = nodes[jscNodeIndex + nodeIdOffset];
      const edges = nodeIdEdgeMap.get(nodeId);
      if (edges?.length) v8Edges.push(...edges);
    }

    return {
      ...HeapAdapter.getV8Meta({
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

  private static getV8Meta({ nodeCount, edgeCount }) {
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
            // ['Internal', 'Property', 'Index', 'Variable'],
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

type JscHeapSnapshot = {
  version: number;
  type: string;
  nodes: number[];
  edges: number[];
  edgeTypes: string[];
  edgeNames: string[];
  nodeClassNames: string[];
};

type V8HeapSnapshot = {
  snapshot: {
    meta: {
      node_fields: string[];
      node_types: Array<string | Array<string>>;
      edge_fields: string[];
      edge_types: Array<string | Array<string>>;
      trace_function_info_fields: string[];
      trace_node_fields: string[];
    };
    node_count: number;
    edge_count: number;
    trace_function_count: number;
  };
  nodes: number[];
  edges: number[];
  trace_function_infos: [];
  trace_tree: [];
  samples: [];
  locations: string[];
  strings: string[];
};
