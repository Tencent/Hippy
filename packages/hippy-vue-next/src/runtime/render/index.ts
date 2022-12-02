/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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
 * Render in Native, include create, update and delete native node operations
 */
import { nextTick } from '@vue/runtime-core';

import { trace } from '../../util';
import { getHippyCachedInstance } from '../../util/instance';
import { Native } from '../native';
import type { NativeNode } from '../../types';

// operation type of native node
enum NodeOperateType {
  CREATE,
  UPDATE,
  DELETE,
}

// batch operation of native node
interface BatchNativeNode {
  // operation type
  type: NodeOperateType;
  // node list
  nodes: NativeNode[];
}

// is operating node
let isHandling = false;

// list of nodes waiting to be batched operated
let batchNativeNodes: BatchNativeNode[] = [];

const componentName = ['%c[native]%c', 'color: red', 'color: auto'];

/**
 * Rearrange and combine the nodes in batchNodes, and put adjacent nodes of the same type together
 *
 * @param batchNodes - list of nodes waiting to be batched operated
 */
function chunkNodes(batchNodes: BatchNativeNode[]): BatchNativeNode[] {
  // original node list：
  // [ { type: 1, nodes: [1] }, { type: 1, nodes: [2] }, { type: 2, nodes: [3] }, { type: 1, nodes: [4] },  ]
  // after rearranging the combination：
  // [ { type: 1, nodes: [1, 2] }, { type: 2, nodes: [3] }, { type: 1, nodes: [4] },  ]
  const result: BatchNativeNode[] = [];

  for (const batchNode of batchNodes) {
    const { type, nodes } = batchNode;
    const chunk = result[result.length - 1];

    if (!chunk || chunk.type !== type) {
      result.push({
        type,
        nodes,
      });
    } else {
      chunk.nodes = chunk.nodes.concat(nodes);
    }
  }

  return result;
}

/**
 * Call the Native interface to render the Native Node to the terminal interface
 *
 * @param nativeNodes - list of native nodes
 * @param operateType - operate type
 */
function renderToNative(
  nativeNodes: NativeNode[],
  operateType: NodeOperateType,
) {
  // First insert the node into the pending list
  batchNativeNodes.push({
    type: operateType,
    nodes: nativeNodes,
  });

  // Then judge whether it is currently being processed, and if it is still processing, return first
  if (isHandling) {
    return;
  }
  isHandling = true;

  // If the node has been processed, open the lock and process it directly next time
  if (batchNativeNodes.length === 0) {
    isHandling = false;
    return;
  }

  // start to batch
  Native.hippyNativeDocument.startBatch();
  // invoke native action after nextTick
  nextTick().then(() => {
    // put adjacent nodes of the same type together to the number of operations
    const chunks = chunkNodes(batchNativeNodes);

    // get native root view id
    const { rootViewId } = getHippyCachedInstance();
    // batch operations on nodes based on operation type
    chunks.forEach((chunk) => {
      switch (chunk.type) {
        case NodeOperateType.CREATE:
          trace(...componentName, 'createNode', chunk.nodes);
          Native.hippyNativeDocument.createNode(rootViewId, chunk.nodes);
          break;
        case NodeOperateType.UPDATE:
          trace(...componentName, 'updateNode', chunk.nodes);
          // iOS currently cannot update nodes in batches, this requires ios client repair
          if (Native.isIOS()) {
            chunk.nodes.forEach((node) => {
              Native.hippyNativeDocument.updateNode(rootViewId, [node]);
            });
          } else {
            Native.hippyNativeDocument.updateNode(rootViewId, chunk.nodes);
          }
          break;
        case NodeOperateType.DELETE:
          trace(...componentName, 'deleteNode', chunk.nodes);
          // iOS currently cannot delete nodes in batches, this requires ios client repair
          if (Native.isIOS()) {
            chunk.nodes.forEach((node) => {
              Native.hippyNativeDocument.deleteNode(rootViewId, [node]);
            });
          } else {
            Native.hippyNativeDocument.deleteNode(rootViewId, chunk.nodes);
          }
          break;
        default:
          break;
      }
    });

    // after the node operation is processed, call native to turn off the batch processing switch
    Native.hippyNativeDocument.endBatch();

    // reset flag
    isHandling = false;
    // clear list
    batchNativeNodes = [];
  });
}

/**
 * insert native nodes
 *
 * @param nativeNodes - nodes list
 */
export function renderInsertChildNativeNode(nativeNodes: NativeNode[]): void {
  renderToNative(nativeNodes, NodeOperateType.CREATE);
}

/**
 * delete native nodes
 *
 * @param deleteNodes - nodes list
 */
export function renderRemoveChildNativeNode(deleteNodes: NativeNode[]): void {
  renderToNative(deleteNodes, NodeOperateType.DELETE);
}

/**
 * update native nodes
 *
 * @param updateNodes - nodes list
 */
export function renderUpdateChildNativeNode(updateNodes: NativeNode[]): void {
  renderToNative(updateNodes, NodeOperateType.UPDATE);
}
