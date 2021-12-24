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

import Hippy from '@localTypes/hippy';
import ViewNode from '../dom/view-node';
import Element from '../dom/element-node';
import * as UIManagerModule from '../modules/ui-manager-module';
import { Device } from '../global';
import { getRootViewId, getRootContainer } from '../utils/node';
import { trace, warn } from '../utils';

const componentName = ['%c[native]%c', 'color: red', 'color: auto'];

interface BatchType {
  [key: string]: Symbol;
}

const NODE_OPERATION_TYPES: BatchType = {
  createNode: Symbol('createNode'),
  updateNode: Symbol('updateNode'),
  deleteNode: Symbol('deleteNode'),
};

interface BatchChunk {
  type: Symbol,
  nodes: Hippy.NativeNode[]
}

let batchIdle: boolean = true;
let batchNodes: BatchChunk[] = [];

/**
 * Convert an ordered node array into multiple fragments
 */
function chunkNodes(batchNodes: BatchChunk[]) {
  const result: BatchChunk[] = [];
  for (let i = 0; i < batchNodes.length; i += 1) {
    const chunk: BatchChunk = batchNodes[i];
    const { type, nodes } = chunk;
    const lastChunk = result[result.length - 1];
    if (!lastChunk || lastChunk.type !== type) {
      result.push({
        type,
        nodes,
      });
    } else {
      lastChunk.nodes = lastChunk.nodes.concat(nodes);
    }
  }
  return result;
}

function startBatch(): void {
  if (batchIdle) {
    UIManagerModule.startBatch();
  }
}

/**
 * batch Updates from js to native
 * @param {number} rootViewId
 */
function batchUpdate(rootViewId: number): void {
  const chunks = chunkNodes(batchNodes);
  chunks.forEach((chunk) => {
    switch (chunk.type) {
      case NODE_OPERATION_TYPES.createNode:
        trace(...componentName, 'createNode', chunk.nodes);
        UIManagerModule.createNode(rootViewId, chunk.nodes);
        break;
      case NODE_OPERATION_TYPES.updateNode:
        trace(...componentName, 'updateNode', chunk.nodes);
        // FIXME: iOS should be able to update multiple nodes at once.
        // @ts-ignore
        if (__PLATFORM__ === 'ios' || Device.platform.OS === 'ios') {
          chunk.nodes.forEach(node => (
            UIManagerModule.updateNode(rootViewId, [node])
          ));
        } else {
          UIManagerModule.updateNode(rootViewId, chunk.nodes);
        }
        break;
      case NODE_OPERATION_TYPES.deleteNode:
        trace(...componentName, 'deleteNode', chunk.nodes);
        // FIXME: iOS should be able to delete mutiple nodes at once.
        // @ts-ignore
        if (__PLATFORM__ === 'ios' || Device.platform.OS === 'ios') {
          chunk.nodes.forEach(node => (
            UIManagerModule.deleteNode(rootViewId, [node])
          ));
        } else {
          UIManagerModule.deleteNode(rootViewId, chunk.nodes);
        }
        break;
      default:
        // pass
    }
  });
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
    UIManagerModule.endBatch();
    batchNodes = [];
    batchIdle = true;
  } else {
    Promise.resolve().then(() => {
      batchUpdate(rootViewId);
      UIManagerModule.endBatch();
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
    const targetNodeAttributes = JSON.parse(JSON.stringify(targetNode.attributes));
    const attributes = {
      id: targetNode.id,
      ...targetNodeAttributes,
    };
    // delete special __bind__event attribute, which is used in C DOM
    Object.keys(attributes).forEach((key) => {
      if (key.indexOf('__bind__') === 0 && typeof attributes[key] === 'boolean') {
        delete attributes[key];
      }
    });
    delete attributes.text;
    delete attributes.value;
    return attributes;
  } catch (e) {
    warn('getTargetNodeAttributes error:', e);
    return {};
  }
}

/**
 * Render Element to native
 */
function renderToNative(rootViewId: number, targetNode: Element): Hippy.NativeNode | null {
  if (!targetNode.nativeName) {
    warn('Component need to define the native name', targetNode);
    return null;
  }
  if (targetNode.meta.skipAddToDom) {
    return null;
  }
  if (!targetNode.meta.component) {
    throw new Error(`Specific tag is not supported yet: ${targetNode.tagName}`);
  }
  // Translate to native node
  const nativeNode: Hippy.NativeNode = {
    id: targetNode.nodeId,
    pId: (targetNode.parentNode && targetNode.parentNode.nodeId) || rootViewId,
    index: targetNode.index,
    name: targetNode.nativeName,
    props: {
      ...getNativeProps(targetNode),
      style: targetNode.style,
    },
  };
  // Add nativeNode attributes info for debugging
  if (process.env.NODE_ENV !== 'production') {
    nativeNode.tagName = targetNode.nativeName;
    if (nativeNode.props) {
      nativeNode.props.attributes = getTargetNodeAttributes(targetNode);
    }
  }
  return nativeNode;
}

/**
 * Render Element with children to native
 * @param {number} rootViewId - rootView id
 * @param {ViewNode} node - current node
 * @param {number} [atIndex] - current node index
 * @param {Function} [callback] - function called on each traversing process
 * @returns {Hippy.NativeNode[]}
 */
function renderToNativeWithChildren(
  rootViewId: number,
  node: ViewNode,
  atIndex?: number,
  callback?: Function,
): Hippy.NativeNode[] {
  const nativeLanguages: Hippy.NativeNode[] = [];
  let index = atIndex;
  if (typeof index === 'undefined' && node && node.parentNode) {
    index = node.parentNode.childNodes.indexOf(node);
  }
  node.traverseChildren((targetNode: Element) => {
    const nativeNode = renderToNative(rootViewId, targetNode);
    if (nativeNode) {
      nativeLanguages.push(nativeNode);
    }
    if (typeof callback === 'function') {
      callback(targetNode);
    }
  }, index);
  return nativeLanguages;
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
    const translated = renderToNativeWithChildren(
      rootViewId,
      childNode,
      atIndex,
      (node: ViewNode) => {
        if (!node.isMounted) {
          node.isMounted = true;
        }
      },
    );
    startBatch();
    batchNodes.push({
      type: NODE_OPERATION_TYPES.createNode,
      nodes: translated,
    });
    // endBatch();
    // Render others child nodes.
  } else if (parentNode.isMounted && !childNode.isMounted) {
    const translated = renderToNativeWithChildren(
      rootViewId,
      childNode,
      atIndex,
      (node: ViewNode) => {
        if (!node.isMounted) {
          node.isMounted = true;
        }
      },
    );
    startBatch();
    batchNodes.push({
      type: NODE_OPERATION_TYPES.createNode,
      nodes: translated,
    });
    // endBatch();
  }
}

function removeChild(parentNode: ViewNode, childNode: ViewNode | null, index: number) {
  if (!childNode || childNode.meta.skipAddToDom) {
    return;
  }
  childNode.isMounted = false;
  childNode.index = index;
  const rootViewId = getRootViewId();
  const deleteNodeIds: Hippy.NativeNode[] = [{
    id: childNode.nodeId,
    pId: childNode.parentNode ? childNode.parentNode.nodeId : rootViewId,
    index: childNode.index,
  }];
  startBatch();
  batchNodes.push({
    type: NODE_OPERATION_TYPES.deleteNode,
    nodes: deleteNodeIds,
  });
  // endBatch();
}

function updateChild(parentNode: Element) {
  if (!parentNode.isMounted) {
    return;
  }
  const rootViewId = getRootViewId();
  const translated = renderToNative(rootViewId, parentNode);
  startBatch();
  if (translated) {
    batchNodes.push({
      type: NODE_OPERATION_TYPES.updateNode,
      nodes: [translated],
    });
  }
  // endBatch();
}

function updateWithChildren(parentNode: ViewNode) {
  if (!parentNode.isMounted) {
    return;
  }
  const rootViewId = getRootViewId();
  const translated = renderToNativeWithChildren(rootViewId, parentNode);
  startBatch();
  batchNodes.push({
    type: NODE_OPERATION_TYPES.updateNode,
    nodes: translated,
  });
  // endBatch();
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
