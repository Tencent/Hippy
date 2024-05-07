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

import { isTraceEnabled, trace } from '../../util';
import { getHippyCachedInstance } from '../../util/instance';
import type { NativeNode } from '../../types';
import { EventHandlerType, isNativeGesture, NativeEventMap, translateToNativeEventName } from '../../util/event';

// operation type of native node
enum NodeOperateType {
  CREATE,
  UPDATE,
  DELETE,
  MOVE,
  UPDATE_EVENT,
}

// batch operation of native node
interface BatchNativeNode {
  // operation type
  type: NodeOperateType;
  // node list
  nodes: NativeNode[];
  eventNodes: HippyTypes.EventNode[];
  printedNodes: HippyTypes.PrintedNode[];
}

// is operating node
let isHandling = false;

// list of nodes waiting to be batched operated
let batchNativeNodes: BatchNativeNode[] = [];

const LOG_TYPE = ['%c[native]%c', 'color: red', 'color: auto'];

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
    const { type, nodes, eventNodes, printedNodes } = batchNode;
    const lastChunk = result[result.length - 1];
    if (!lastChunk || lastChunk.type !== type) {
      result.push({
        type,
        nodes,
        eventNodes,
        printedNodes,
      });
    } else {
      lastChunk.nodes = lastChunk.nodes.concat(nodes);
      lastChunk.eventNodes = lastChunk.eventNodes.concat(eventNodes);
      lastChunk.printedNodes = lastChunk.printedNodes.concat(printedNodes);
    }
  }

  return result;
}

function handleEventListeners(eventNodes: HippyTypes.EventNode[] = [], sceneBuilder) {
  eventNodes.forEach((eventNode) => {
    if (eventNode) {
      const { id, eventList } = eventNode;
      eventList.forEach((eventAttribute) => {
        const { name, type, listener } = eventAttribute;
        let nativeEventName;
        if (isNativeGesture(name)) {
          nativeEventName = NativeEventMap[name];
        } else {
          nativeEventName = translateToNativeEventName(name);
        }
        if (type === EventHandlerType.REMOVE) {
          sceneBuilder.removeEventListener(id, nativeEventName, listener);
        }
        if (type === EventHandlerType.ADD) {
          sceneBuilder.removeEventListener(id, nativeEventName, listener);
          sceneBuilder.addEventListener(id, nativeEventName, listener);
        }
      });
    }
  });
}

/**
 * print nodes operation log
 * @param {HippyTypes.PrintedNode[]} printedNodes
 * @param {string} nodeType
 */
function printNodeOperation(printedNodes, nodeType) {
  if (isTraceEnabled()) {
    trace(...LOG_TYPE, nodeType, printedNodes);
  }
}

/**
 * Call the Native interface to render the Native Node to the terminal interface
 */
function endBatch() {
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
  // invoke native action after nextTick
  nextTick().then(() => {
    // put adjacent nodes of the same type together to the number of operations
    const chunks = chunkNodes(batchNativeNodes);
    // get native root view id
    const { rootViewId } = getHippyCachedInstance();
    // create Scene Builder with rootView id
    const sceneBuilder = new global.Hippy.SceneBuilder(rootViewId);
    // nodes need sort by index
    const needSortByIndex = true;
    // batch operations on nodes based on operation type
    chunks.forEach((chunk) => {
      switch (chunk.type) {
        case NodeOperateType.CREATE:
          printNodeOperation(chunk.printedNodes, 'createNode');
          sceneBuilder.create(chunk.nodes, needSortByIndex);
          handleEventListeners(chunk.eventNodes, sceneBuilder);
          break;
        case NodeOperateType.UPDATE:
          printNodeOperation(chunk.printedNodes, 'updateNode');
          sceneBuilder.update(chunk.nodes);
          handleEventListeners(chunk.eventNodes, sceneBuilder);
          break;
        case NodeOperateType.DELETE:
          printNodeOperation(chunk.printedNodes, 'deleteNode');
          sceneBuilder.delete(chunk.nodes);
          break;
        case NodeOperateType.MOVE:
          printNodeOperation(chunk.printedNodes, 'moveNode');
          sceneBuilder.move(chunk.nodes);
          break;
        case NodeOperateType.UPDATE_EVENT:
          handleEventListeners(chunk.eventNodes, sceneBuilder);
          break;
        default:
          break;
      }
    });
    sceneBuilder.build();
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
export function renderInsertChildNativeNode([nativeLanguages, eventLanguages, printedLanguages]): void {
  // First insert the node into the pending list
  batchNativeNodes.push({
    type: NodeOperateType.CREATE,
    nodes: nativeLanguages,
    eventNodes: eventLanguages,
    printedNodes: printedLanguages,
  });
  endBatch();
}

/**
 * move native nodes
 *
 * @param  moveNodes - move nodes list
 */
export function renderMoveChildNativeNode([nativeLanguages,, printedLanguages]): void {
  if (nativeLanguages) {
    batchNativeNodes.push({
      type: NodeOperateType.MOVE,
      nodes: nativeLanguages,
      eventNodes: [],
      printedNodes: printedLanguages,
    });
    endBatch();
  }
}

/**
 * delete native nodes
 *
 * @param deleteNodes - nodes list
 */
export function renderRemoveChildNativeNode([nativeLanguages,, printedLanguages]): void {
  if (nativeLanguages) {
    batchNativeNodes.push({
      type: NodeOperateType.DELETE,
      nodes: nativeLanguages,
      eventNodes: [],
      printedNodes: printedLanguages,
    });
    endBatch();
  }
}

/**
 * update native nodes
 *
 * @param updateNodes - nodes list
 */
export function renderUpdateChildNativeNode([nativeLanguages, eventLanguages, printedLanguages]): void {
  if (nativeLanguages) {
    batchNativeNodes.push({
      type: NodeOperateType.UPDATE,
      nodes: nativeLanguages,
      eventNodes: eventLanguages,
      printedNodes: printedLanguages,
    });
    endBatch();
  }
}

/**
 * update native event
 *
 * @param eventNode
 */
export function renderUpdateChildNativeEvent(eventNode): void {
  batchNativeNodes.push({
    type: NodeOperateType.UPDATE_EVENT,
    nodes: [],
    eventNodes: [eventNode],
    printedNodes: [],
  });
  endBatch();
}
