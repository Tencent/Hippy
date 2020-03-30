/* eslint-disable no-underscore-dangle */
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

interface batchChunk {
  type: Symbol,
  nodes: Hippy.NativeNode[]
}

let __batchIdle: boolean = true;
let __batchNodes: batchChunk[] = [];

/**
 * Convert an ordered node array into multiple fragments
 */
function chunkNodes(batchNodes: batchChunk[]) {
  const result: batchChunk[] = [];
  for (let i = 0; i < batchNodes.length; i += 1) {
    const chunk: batchChunk = batchNodes[i];
    const { type, nodes } = chunk;
    const _chunk = result[result.length - 1];
    if (!_chunk || _chunk.type !== type) {
      result.push({
        type,
        nodes,
      });
    } else {
      _chunk.nodes = _chunk.nodes.concat(nodes);
    }
  }
  return result;
}

function startBatch() {
  if (__batchIdle) {
    UIManagerModule.startBatch();
  }
}

function endBatch(rootViewId) {
  if (!__batchIdle) {
    return;
  }
  __batchIdle = false;
  Promise.resolve().then(() => {
    const chunks = chunkNodes(__batchNodes);
    chunks.forEach((chunk) => {
      switch (chunk.type) {
        case NODE_OPERATION_TYPES.createNode:
          trace(...componentName, 'createNode', chunk.nodes);
          UIManagerModule.createNode(rootViewId, chunk.nodes);
          break;
        case NODE_OPERATION_TYPES.updateNode:
          trace(...componentName, 'updateNode', chunk.nodes);
          // FIXME: iOS should be able to update mutiple nodes at once.
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
    UIManagerModule.endBatch();
    __batchNodes = [];
    __batchIdle = true;
  });
}

/**
 * Translate to native props from attributes and meta
 */
function getNativeProps(node: Element) {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const { children, ...otherProps } = node.attributes;
  return otherProps;
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
  return {
    id: targetNode.nodeId,
    pId: (targetNode.parentNode && targetNode.parentNode.nodeId) || rootViewId,
    index: targetNode.index,
    name: targetNode.nativeName,
    props: {
      ...getNativeProps(targetNode),
      style: targetNode.style,
    },
  };
}

/**
 * Render Element with child to native
 */
function renderToNativeWithChildren(rootViewId: number, node: ViewNode) {
  const nativeLanguages: Hippy.NativeNode[] = [];
  node.traverseChildren((targetNode: Element) => {
    const nativeNode = renderToNative(rootViewId, targetNode);
    if (nativeNode) {
      nativeLanguages.push(nativeNode);
    }
  });
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

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
function insertChild(parentNode: ViewNode, childNode: ViewNode, atIndex = -1) {
  if (!parentNode) {
    return;
  }

  if (childNode.meta.skipAddToDom) {
    return;
  }

  const rootViewId = getRootViewId();
  // Render the root node
  if (isLayout(parentNode) && !parentNode.isMounted) {
    // Start real native work.
    const translated = renderToNativeWithChildren(rootViewId, childNode);
    startBatch();
    __batchNodes.push({
      type: NODE_OPERATION_TYPES.createNode,
      nodes: translated,
    });
    endBatch(rootViewId);
    parentNode.traverseChildren((node: ViewNode) => {
      if (!node.isMounted) {
        node.isMounted = true;
      }
    });
  // Render others child nodes.
  } else if (parentNode.isMounted && !childNode.isMounted) {
    const translated = renderToNativeWithChildren(rootViewId, childNode);
    startBatch();
    __batchNodes.push({
      type: NODE_OPERATION_TYPES.createNode,
      nodes: translated,
    });
    endBatch(rootViewId);
    childNode.traverseChildren((node: ViewNode) => {
      if (!node.isMounted) {
        node.isMounted = true;
      }
    });
  }
}

function removeChild(parentNode: ViewNode, childNode: ViewNode) {
  if (!childNode || childNode.meta.skipAddToDom) {
    return;
  }
  childNode.isMounted = false;
  childNode.traverseChildren((targetNode: ViewNode) => {
    if (targetNode.isMounted) {
      targetNode.isMounted = false;
    }
  });
  const rootViewId = getRootViewId();
  const deleteNodeIds: Hippy.NativeNode[] = [{
    id: childNode.nodeId,
    pId: childNode.parentNode ? childNode.parentNode.nodeId : rootViewId,
    index: childNode.index,
  }];
  startBatch();
  __batchNodes.push({
    type: NODE_OPERATION_TYPES.deleteNode,
    nodes: deleteNodeIds,
  });
  endBatch(rootViewId);
}

function updateChild(parentNode: Element) {
  if (!parentNode.isMounted) {
    return;
  }
  const rootViewId = getRootViewId();
  const translated = renderToNative(rootViewId, parentNode);
  startBatch();
  if (translated) {
    __batchNodes.push({
      type: NODE_OPERATION_TYPES.updateNode,
      nodes: [translated],
    });
  }
  endBatch(rootViewId);
}

function updateWithChildren(parentNode: ViewNode) {
  if (!parentNode.isMounted) {
    return;
  }
  const rootViewId = getRootViewId();
  const translated = renderToNativeWithChildren(rootViewId, parentNode);
  startBatch();
  __batchNodes.push({
    type: NODE_OPERATION_TYPES.updateNode,
    nodes: translated,
  });
  endBatch(rootViewId);
}

export {
  renderToNative,
  renderToNativeWithChildren,
  insertChild,
  removeChild,
  updateChild,
  updateWithChildren,
};
