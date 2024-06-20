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
import {
  getRootViewId,
  getRootContainer,
  translateToNativeEventName,
  eventHandlerType,
  nativeEventMap,
  isTextNode,
} from '../utils/node';
import { deepCopy, isDev, isTraceEnabled, trace, warn, isStyleNotEmpty } from '../utils';

const componentName = ['%c[native]%c', 'color: red', 'color: auto'];

interface BatchType {
  [key: string]: symbol;
}

const NODE_OPERATION_TYPES: BatchType = {
  createNode: Symbol('createNode'),
  updateNode: Symbol('updateNode'),
  deleteNode: Symbol('deleteNode'),
  moveNode: Symbol('moveNode'),
};

interface BatchChunk {
  type: symbol,
  nodes: HippyTypes.TranslatedNodes[],
  eventNodes: HippyTypes.EventNode[],
  printedNodes: HippyTypes.PrintedNode[],
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
    const { type, nodes, eventNodes, printedNodes } = chunk;
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


function isNativeGesture(name) {
  return !!nativeEventMap[name];
}

function handleEventListeners(eventNodes: HippyTypes.EventNode[] = [], sceneBuilder: any) {
  eventNodes.forEach((eventNode) => {
    if (eventNode) {
      const { id, eventList } = eventNode;
      eventList.forEach((eventAttribute) => {
        const { name, type, listener, isCapture } = eventAttribute;
        let nativeEventName;
        if (isNativeGesture(name)) {
          nativeEventName = nativeEventMap[name];
        } else {
          nativeEventName = translateToNativeEventName(name);
        }
        if (type === eventHandlerType.REMOVE) {
          sceneBuilder.removeEventListener(id, nativeEventName, listener);
        }
        if (type === eventHandlerType.ADD) {
          sceneBuilder.addEventListener(id, nativeEventName, listener, isCapture);
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
function printNodesOperation(printedNodes: HippyTypes.PrintedNode[], nodeType: string): void {
  if (isTraceEnabled()) {
    trace(...componentName, nodeType, printedNodes);
  }
}

/**
 * batch Updates from js to native
 * @param {number} rootViewId
 */
function batchUpdate(rootViewId: number): void {
  const chunks = chunkNodes(batchNodes);
  const sceneBuilder = new global.Hippy.SceneBuilder(rootViewId);
  chunks.forEach((chunk) => {
    switch (chunk.type) {
      case NODE_OPERATION_TYPES.createNode:
        printNodesOperation(chunk.printedNodes, 'createNode');
        sceneBuilder.create(chunk.nodes);
        handleEventListeners(chunk.eventNodes, sceneBuilder);
        break;
      case NODE_OPERATION_TYPES.updateNode:
        printNodesOperation(chunk.printedNodes, 'updateNode');
        sceneBuilder.update(chunk.nodes);
        handleEventListeners(chunk.eventNodes, sceneBuilder);
        break;
      case NODE_OPERATION_TYPES.deleteNode:
        printNodesOperation(chunk.printedNodes, 'deleteNode');
        sceneBuilder.delete(chunk.nodes);
        break;
      case NODE_OPERATION_TYPES.moveNode:
        printNodesOperation(chunk.printedNodes, 'moveNode');
        sceneBuilder.move(chunk.nodes);
        break;
      default:
    }
  });
  sceneBuilder.build();
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
    const targetNodeAttributes = deepCopy(targetNode.attributes);
    const { id, nodeId } = targetNode;
    const attributes = {
      id,
      hippyNodeId: `${nodeId}`,
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
  const eventsAttributes = targetNode.events;
  if (eventsAttributes) {
    const eventList: HippyTypes.EventAttribute[] = [];
    Object.keys(eventsAttributes)
      .forEach((key) => {
        const { name, type, isCapture, listener } = eventsAttributes[key];
        if (!targetNode.isListenerHandled(key, type)) {
          targetNode.setListenerHandledType(key, type);
          eventList.push({
            name,
            type,
            isCapture,
            listener,
          });
        }
      });
    eventNode = {
      id: targetNode.nodeId,
      eventList,
    };
  }
  return eventNode;
}

type renderToNativeReturnedVal = [
  translatedNode?: HippyTypes.TranslatedNodes,
  eventNode?: HippyTypes.EventNode,
  printedNode?: HippyTypes.PrintedNode,
];

/**
 * Render Element to native
 */
function renderToNative(
  rootViewId: number,
  targetNode: Element,
  refInfo: HippyTypes.ReferenceInfo = {},
): renderToNativeReturnedVal {
  if (!targetNode.nativeName) {
    warn('Component need to define the native name', targetNode);
    return [];
  }
  if (targetNode.meta.skipAddToDom) {
    return [];
  }
  if (!targetNode.meta.component) {
    throw new Error(`Specific tag is not supported yet: ${targetNode.tagName}`);
  }
  let resultStyle = targetNode.style;
  if (targetNode.parentNode instanceof Element) {
    // Implement attribute inheritance logic
    // Only inherit color and font properties
    const parentNodeStyle = Object.assign({}, targetNode.parentNode.inheritStyle, targetNode.parentNode.style);
    const { style, inheritStyle } = targetNode;
    const styleAttributes = ['color', 'fontSize', 'fontWeight', 'fontFamily', 'fontStyle', 'textAlign', 'lineHeight'];

    styleAttributes.forEach((attribute) => {
      if (!isStyleNotEmpty(style[attribute]) && isStyleNotEmpty(parentNodeStyle[attribute])) {
        inheritStyle[attribute] = parentNodeStyle[attribute];
      }
    });
    if (isTextNode(targetNode)) {
      resultStyle = Object.assign({}, inheritStyle, style);
    }
  }
  // Translate to native node
  const nativeNode: HippyTypes.NativeNode = {
    id: targetNode.nodeId,
    pId: (targetNode.parentNode?.nodeId) || rootViewId,
    name: targetNode.nativeName,
    props: {
      ...getNativeProps(targetNode),
      style: resultStyle,
    },
    tagName: targetNode.tagName,
  };
  const eventNode = getEventNode(targetNode);

  let printedNode: HippyTypes.PrintedNode = undefined;
  if (isDev()) {
    // generate printedNode for debugging
    const listenerProp = {};
    if (eventNode && Array.isArray(eventNode.eventList)) {
      eventNode.eventList.forEach((eventListItem) => {
        const { name, listener, type } = eventListItem;
        type === eventHandlerType.ADD && Object.assign(listenerProp, { [name]: listener });
      });
    }
    // Add nativeNode attributes info for debugging
    nativeNode.props!.attributes = getTargetNodeAttributes(targetNode);
    Object.assign(printedNode = {}, nativeNode, refInfo);
    printedNode.listeners = listenerProp;
  }
  // convert to translatedNode
  const translatedNode: HippyTypes.TranslatedNodes = [nativeNode, refInfo];
  return [translatedNode, eventNode, printedNode];
}

type renderToNativeWithChildrenReturnedVal = [
  nativeLanguages: HippyTypes.TranslatedNodes[],
  eventLanguages: HippyTypes.EventNode[],
  printedLanguages: HippyTypes.PrintedNode[]
];
/**
 * Render Element with children to native
 * @param {number} rootViewId - rootView id
 * @param {ViewNode} node - current node
 * @param {Function} [callback] - function called on each traversing process
 * @param {HippyTypes.ReferenceInfo} [refInfo] - reference information
 * @returns [nativeLanguages: HippyTypes.NativeNode[], eventLanguages: HippyTypes.EventNode[]]
 */
function renderToNativeWithChildren(
  rootViewId: number,
  node: ViewNode,
  callback?: Function,
  refInfo: HippyTypes.ReferenceInfo = {},
): renderToNativeWithChildrenReturnedVal {
  const nativeLanguages: HippyTypes.TranslatedNodes[] = [];
  const eventLanguages: HippyTypes.EventNode[] = [];
  const printedLanguages: HippyTypes.PrintedNode[] = [];
  node.traverseChildren((targetNode: Element, refInfo: HippyTypes.ReferenceInfo) => {
    const [nativeNode, eventNode, printedNode] = renderToNative(rootViewId, targetNode, refInfo);
    if (nativeNode) {
      nativeLanguages.push(nativeNode);
    }
    if (eventNode) {
      eventLanguages.push(eventNode);
    }
    if (printedNode) {
      printedLanguages.push(printedNode);
    }
    if (typeof callback === 'function') {
      callback(targetNode);
    }
  }, refInfo);
  return [nativeLanguages, eventLanguages, printedLanguages];
}

function isLayout(node: ViewNode) {
  const container = getRootContainer();
  if (!container) {
    return false;
  }
  // Determine node is a Document instance
  return node instanceof container.containerInfo.constructor;
}

function insertChild(parentNode: ViewNode, childNode: ViewNode, refInfo: HippyTypes.ReferenceInfo = {}) {
  if (!parentNode || !childNode) {
    return;
  }
  if (childNode.meta.skipAddToDom) {
    return;
  }
  const rootViewId = getRootViewId();
  const renderRootNodeCondition = isLayout(parentNode) && !parentNode.isMounted;
  const renderOtherNodeCondition = parentNode.isMounted && !childNode.isMounted;
  // Render the root node or other nodes
  if (renderRootNodeCondition || renderOtherNodeCondition) {
    const [nativeLanguages, eventLanguages, printedLanguages] = renderToNativeWithChildren(
      rootViewId,
      childNode,
      (node: ViewNode) => {
        if (!node.isMounted) {
          node.isMounted = true;
        }
      },
      refInfo,
    );
    batchNodes.push({
      type: NODE_OPERATION_TYPES.createNode,
      nodes: nativeLanguages,
      eventNodes: eventLanguages,
      printedNodes: printedLanguages,
    });
  }
}

function removeChild(parentNode: ViewNode, childNode: ViewNode | null) {
  if (!childNode || childNode.meta.skipAddToDom) {
    return;
  }
  childNode.isMounted = false;
  const rootViewId = getRootViewId();
  const nativeNode =  {
    id: childNode.nodeId,
    pId: childNode.parentNode ? childNode.parentNode.nodeId : rootViewId,
  };
  const deleteNodeIds: HippyTypes.TranslatedNodes[] = [
    [
      nativeNode,
      {},
    ],
  ];
  const printedNodes = isDev() ? [nativeNode] : [];
  batchNodes.push({
    printedNodes,
    type: NODE_OPERATION_TYPES.deleteNode,
    nodes: deleteNodeIds,
    eventNodes: [],
  });
}

function moveChild(parentNode: ViewNode, childNode: ViewNode, refInfo: HippyTypes.ReferenceInfo = {}) {
  if (!parentNode || !childNode) {
    return;
  }
  if (childNode.meta.skipAddToDom) {
    return;
  }
  const rootViewId = getRootViewId();
  const nativeNode =  {
    id: childNode.nodeId,
    pId: childNode.parentNode ? childNode.parentNode.nodeId : rootViewId,
  };
  const moveNodeIds: HippyTypes.TranslatedNodes[] = [
    [
      nativeNode,
      refInfo,
    ],
  ];
  const printedNodes = isDev() ? [{ ...nativeNode, ...refInfo }] : [];
  batchNodes.push({
    printedNodes,
    type: NODE_OPERATION_TYPES.moveNode,
    nodes: moveNodeIds,
    eventNodes: [],
  });
}

function updateChild(parentNode: Element) {
  if (!parentNode.isMounted) {
    return;
  }
  const rootViewId = getRootViewId();
  const [nativeNode, eventNode, printedNode] = renderToNative(rootViewId, parentNode);
  if (nativeNode) {
    batchNodes.push({
      type: NODE_OPERATION_TYPES.updateNode,
      nodes: [nativeNode],
      eventNodes: [eventNode],
      printedNodes: isDev() ? [printedNode] : [],
    });
  }
}

function updateWithChildren(parentNode: ViewNode) {
  if (!parentNode.isMounted) {
    return;
  }
  const rootViewId = getRootViewId();
  const [nativeLanguages, eventLanguages, printedLanguages] = renderToNativeWithChildren(rootViewId, parentNode) || {};
  if (nativeLanguages) {
    batchNodes.push({
      type: NODE_OPERATION_TYPES.updateNode,
      nodes: nativeLanguages,
      eventNodes: eventLanguages,
      printedNodes: printedLanguages,
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
  moveChild,
  updateWithChildren,
};
