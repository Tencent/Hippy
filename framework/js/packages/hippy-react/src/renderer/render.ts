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

/* eslint-disable no-param-reassign */

import ViewNode from '../dom/view-node';
import Element from '../dom/element-node';
// import * as UIManagerModule from '../modules/ui-manager-module';
import {
  EVENT_ATTRIBUTE_NAME,
  getRootViewId,
  getRootContainer,
  translateToNativeEventName,
  eventHandlerType,
  nativeEventMap,
} from '../utils/node';
import { deepCopy, trace, warn } from '../utils';
import { EventDispatcher } from '../event';

const componentName = ['%c[native]%c', 'color: red', 'color: auto'];

interface BatchType {
  [key: string]: symbol;
}

const NODE_OPERATION_TYPES: BatchType = {
  createNode: Symbol('createNode'),
  updateNode: Symbol('updateNode'),
  deleteNode: Symbol('deleteNode'),
};

interface BatchChunk {
  type: symbol,
  nodes: HippyTypes.NativeNode[]
  eventNodes: HippyTypes.EventNode[]
}

let batchIdle = true;
let batchNodes: BatchChunk[] = [];

/**
 * Convert an ordered node array into multiple fragments
 */
function chunkNodes(batchNodes: BatchChunk[]) {
  const result: BatchChunk[] = [];
  for (let i = 0; i < batchNodes.length; i += 1) {
    const chunk: BatchChunk = batchNodes[i];
    const { type, nodes, eventNodes } = chunk;
    const lastChunk = result[result.length - 1];
    if (!lastChunk || lastChunk.type !== type) {
      result.push({
        type,
        nodes,
        eventNodes,
      });
    } else {
      lastChunk.nodes = lastChunk.nodes.concat(nodes);
      lastChunk.eventNodes = lastChunk.eventNodes.concat(eventNodes);
    }
  }
  return result;
}


function isNativeGesture(name) {
  return !!nativeEventMap[name];
}

function handleEventListeners(eventNodes: HippyTypes.EventNode[] = [], sceneBuilder: any) {
  eventNodes.forEach((eventNode) => {
    if (eventNode) {
      const { id, eventList } = eventNode;
      eventList.forEach((eventAttribute) => {
        const { name,
          listener,
          type,
          // isCapture,
        } = eventAttribute;
        let nativeEventName;
        if (isNativeGesture(name)) {
          nativeEventName = nativeEventMap[name];
        } else {
          nativeEventName = translateToNativeEventName(name);
        }
        if (type === eventHandlerType.REMOVE) {
          // console.log('RemoveEventListener', id, nativeEventName, isCapture);
          sceneBuilder.RemoveEventListener(id, nativeEventName, listener);
        }
        if (type === eventHandlerType.ADD) {
          eventAttribute.listener = listener;
          // console.log('AddEventListener', id, nativeEventName, isCapture);
          const callback = (event) => {
            const { id,  currentId, params } = event;
            // console.log('callback event', id, JSON.stringify(params));
            if (isNativeGesture(name)) {
              const dispatcherEvent = {
                id, name, currentId,
              };
              Object.assign(dispatcherEvent, params);
              EventDispatcher.receiveNativeGesture(dispatcherEvent);
            } else {
              const dispatcherEvent = [id, name, params];
              EventDispatcher.receiveUIComponentEvent(dispatcherEvent);
            }
          };
          sceneBuilder.AddEventListener(id, nativeEventName, callback);
        }
      });
    }
  });
}

/**
 * batch Updates from js to native
 * @param {number} rootViewId
 */
function batchUpdate(rootViewId: number): void {
  const chunks = chunkNodes(batchNodes);
  const sceneBuilder = new global.SceneBuilder(rootViewId);
  chunks.forEach((chunk) => {
    switch (chunk.type) {
      case NODE_OPERATION_TYPES.createNode:
        trace(...componentName, 'createNode', chunk.nodes);
        sceneBuilder.Create(chunk.nodes);
        handleEventListeners(chunk.eventNodes, sceneBuilder);
        // UIManagerModule.createNode(rootViewId, chunk.nodes);
        break;
      case NODE_OPERATION_TYPES.updateNode:
        trace(...componentName, 'updateNode', chunk.nodes);
        sceneBuilder.Update(chunk.nodes);
        handleEventListeners(chunk.eventNodes, sceneBuilder);
        // UIManagerModule.updateNode(rootViewId, chunk.nodes);
        break;
      case NODE_OPERATION_TYPES.deleteNode:
        trace(...componentName, 'deleteNode', chunk.nodes);
        sceneBuilder.Delete(chunk.nodes);
        // UIManagerModule.deleteNode(rootViewId, chunk.nodes);
        break;
      default:
    }
  });
  sceneBuilder.Build();
}

/**
 * endBatch - end batch update
 * @param {boolean} isHookUsed - whether used commitEffects hook
 */
function endBatch(isHookUsed = false): void {
  if (!batchIdle) return;
  batchIdle = false;
  if (batchNodes.length === 0) {
    batchIdle = true;
    return;
  }
  const rootViewId = getRootViewId();
  // if commitEffectsHook used, call batchUpdate synchronously
  if (isHookUsed) {
    batchUpdate(rootViewId);
    batchNodes = [];
    batchIdle = true;
  } else {
    Promise.resolve().then(() => {
      batchUpdate(rootViewId);
      // UIManagerModule.endBatch();
      batchNodes = [];
      batchIdle = true;
    });
  }
}

/**
 * Translate to native props from attributes and meta
 */
function getNativeProps(node: Element) {
  const { children, ...otherProps } = node.attributes;
  return otherProps;
}

/**
 * Get target node attributes, used to chrome devTool tag attribute show while debugging
 */
function getTargetNodeAttributes(targetNode: Element) {
  try {
    const { [EVENT_ATTRIBUTE_NAME]: eventAttributes, ...devAttributes } = targetNode.attributes;
    const targetNodeAttributes = deepCopy(devAttributes);
    const attributes = {
      id: targetNode.id,
      ...targetNodeAttributes,
    };
    delete attributes.text;
    delete attributes.value;
    return attributes;
  } catch (e) {
    warn('getTargetNodeAttributes error:', e);
    return {};
  }
}

/**
 * getEventNode - translate event attributes to event node.
 * @param targetNode
 */
function getEventNode(targetNode): HippyTypes.EventNode {
  let eventNode: HippyTypes.EventNode = undefined;
  const eventsAttributes = targetNode.attributes[EVENT_ATTRIBUTE_NAME] as Object;
  if (eventsAttributes) {
    const eventList = Object.keys(eventsAttributes).map((key) => {
      const { name, listener, type, isCapture, hasBound } = eventsAttributes[key];
      return {
        name,
        listener,
        type,
        isCapture,
        hasBound,
      };
    });
    eventNode = {
      id: targetNode.nodeId,
      eventList,
    };
  }
  return eventNode;
}

type renderToNativeReturnVal = { nativeNode?: HippyTypes.NativeNode, eventNode?: HippyTypes.EventNode };

/**
 * Render Element to native
 */
function renderToNative(rootViewId: number, targetNode: Element): renderToNativeReturnVal {
  if (!targetNode.nativeName) {
    warn('Component need to define the native name', targetNode);
    return {};
  }
  if (targetNode.meta.skipAddToDom) {
    return {};
  }
  if (!targetNode.meta.component) {
    throw new Error(`Specific tag is not supported yet: ${targetNode.tagName}`);
  }
  // Translate to native node
  const nativeNode: HippyTypes.NativeNode = {
    id: targetNode.nodeId,
    pId: (targetNode.parentNode?.nodeId) || rootViewId,
    index: targetNode.index,
    name: targetNode.nativeName,
    props: {
      ...getNativeProps(targetNode),
      style: targetNode.style,
    },
  };
  const eventNode = getEventNode(targetNode);
  // Add nativeNode attributes info for debugging
  if (process.env.NODE_ENV !== 'production') {
    nativeNode.tagName = targetNode.nativeName;
    if (nativeNode.props) {
      nativeNode.props.attributes = getTargetNodeAttributes(targetNode);
    }
  }
  return { nativeNode, eventNode };
}

/**
 * Render Element with children to native
 * @param {number} rootViewId - rootView id
 * @param {ViewNode} node - current node
 * @param {number} [atIndex] - current node index
 * @param {Function} [callback] - function called on each traversing process
 * @returns { nativeLanguages: HippyTypes.NativeNode[], eventLanguages: HippyTypes.EventNode[]}
 */
function renderToNativeWithChildren(
  rootViewId: number,
  node: ViewNode,
  atIndex?: number,
  callback?: Function,
): { nativeLanguages: HippyTypes.NativeNode[], eventLanguages: HippyTypes.EventNode[]} {
  const nativeLanguages: HippyTypes.NativeNode[] = [];
  const eventLanguages: HippyTypes.EventNode[] = [];
  let index = atIndex;
  if (typeof index === 'undefined' && node && node.parentNode) {
    index = node.parentNode.childNodes.indexOf(node);
  }
  node.traverseChildren((targetNode: Element) => {
    const { nativeNode, eventNode } = renderToNative(rootViewId, targetNode);
    if (nativeNode) {
      nativeLanguages.push(nativeNode);
    }
    if (eventNode) {
      eventLanguages.push(eventNode);
    }
    if (typeof callback === 'function') {
      callback(targetNode);
    }
  }, index);
  return { nativeLanguages, eventLanguages };
}

function isLayout(node: ViewNode) {
  const container = getRootContainer();
  if (!container) {
    return false;
  }
  // Determine node is a Document instance
  return node instanceof container.containerInfo.constructor;
}

function insertChild(parentNode: ViewNode, childNode: ViewNode, atIndex = -1) {
  if (!parentNode || !childNode) {
    return;
  }
  if (childNode.meta.skipAddToDom) {
    return;
  }
  const rootViewId = getRootViewId();
  // Render the root node
  if (isLayout(parentNode) && !parentNode.isMounted) {
    // Start real native work.
    const { nativeLanguages, eventLanguages } = renderToNativeWithChildren(
      rootViewId,
      childNode,
      atIndex,
      (node: ViewNode) => {
        if (!node.isMounted) {
          node.isMounted = true;
        }
      },
    );
    batchNodes.push({
      type: NODE_OPERATION_TYPES.createNode,
      nodes: nativeLanguages,
      eventNodes: eventLanguages,
    });
    // Render others child nodes.
  } else if (parentNode.isMounted && !childNode.isMounted) {
    const { nativeLanguages, eventLanguages } = renderToNativeWithChildren(
      rootViewId,
      childNode,
      atIndex,
      (node: ViewNode) => {
        if (!node.isMounted) {
          node.isMounted = true;
        }
      },
    );
    batchNodes.push({
      type: NODE_OPERATION_TYPES.createNode,
      nodes: nativeLanguages,
      eventNodes: eventLanguages,
    });
  }
}

function removeChild(parentNode: ViewNode, childNode: ViewNode | null, index: number) {
  if (!childNode || childNode.meta.skipAddToDom) {
    return;
  }
  childNode.isMounted = false;
  childNode.index = index;
  const rootViewId = getRootViewId();
  const deleteNodeIds: HippyTypes.NativeNode[] = [{
    id: childNode.nodeId,
    pId: childNode.parentNode ? childNode.parentNode.nodeId : rootViewId,
    index: childNode.index,
  }];
  const eventNode = getEventNode(childNode);
  batchNodes.push({
    type: NODE_OPERATION_TYPES.deleteNode,
    nodes: deleteNodeIds,
    eventNodes: [eventNode],
  });
}

function updateChild(parentNode: Element) {
  if (!parentNode.isMounted) {
    return;
  }
  const rootViewId = getRootViewId();
  const { nativeNode, eventNode } = renderToNative(rootViewId, parentNode);
  if (nativeNode) {
    batchNodes.push({
      type: NODE_OPERATION_TYPES.updateNode,
      nodes: [nativeNode],
      eventNodes: [eventNode],
    });
  }
}

function updateWithChildren(parentNode: ViewNode) {
  if (!parentNode.isMounted) {
    return;
  }
  const rootViewId = getRootViewId();
  const { nativeLanguages, eventLanguages } = renderToNativeWithChildren(rootViewId, parentNode) || {};
  if (nativeLanguages) {
    batchNodes.push({
      type: NODE_OPERATION_TYPES.updateNode,
      nodes: nativeLanguages,
      eventNodes: eventLanguages,
    });
  }
}

export {
  endBatch,
  renderToNative,
  renderToNativeWithChildren,
  insertChild,
  removeChild,
  updateChild,
  updateWithChildren,
};
