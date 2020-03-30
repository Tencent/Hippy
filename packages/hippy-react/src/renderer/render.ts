/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

import Hippy from '@localTypes/hippy';
import ViewNode from '../dom/view-node';
import Element from '../dom/element-node';
import * as UIManagerModule from '../modules/ui-manager-module';
import { getRootViewId, getRootContainer } from '../utils/node';
import { trace, warn } from '../utils';

const componentName = ['%c[native]%c', 'color: red', 'color: auto'];

const enum batchType {
  createNode = 'createNode',
  updateNode = 'updateNode',
  deleteNode = 'deleteNode'
}
interface batchChunk {
  type: batchType,
  nodes: Hippy.NativeNode[]
}

let __batchIdle: boolean = true;
let __renderId: number = 0;
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
    __renderId = Date.now();
    UIManagerModule.startBatch(__renderId);
  }
}

function endBatch() {
  if (__batchIdle) {
    __batchIdle = false;
    Promise.resolve().then(() => {
      const chunks = chunkNodes(__batchNodes);
      const rootViewId = getRootViewId();
      chunks.forEach((chunk) => {
        const optType = chunk.type;
        if (optType === batchType.createNode) {
          trace(...componentName, optType, chunk.nodes);
          UIManagerModule.createNode(rootViewId, chunk.nodes);
        } else {
          // batch updates and creations look problematic, so keep the original call-by-call logic
          chunk.nodes.forEach((node) => {
            trace(...componentName, optType, chunk.nodes);
            UIManagerModule[optType](rootViewId, [node]);
          });
        }
      });
      UIManagerModule.endBatch(__renderId);
      __batchNodes = [];
      __batchIdle = true;
    });
  }
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
      type: batchType.createNode,
      nodes: translated,
    });
    endBatch();
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
      type: batchType.createNode,
      nodes: translated,
    });
    endBatch();
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
    type: batchType.deleteNode,
    nodes: deleteNodeIds,
  });
  endBatch();
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
      type: batchType.updateNode,
      nodes: [translated],
    });
  }
  endBatch();
}

function updateWithChildren(parentNode: ViewNode) {
  if (!parentNode.isMounted) {
    return;
  }
  const rootViewId = getRootViewId();
  const translated = renderToNativeWithChildren(rootViewId, parentNode);
  startBatch();
  __batchNodes.push({
    type: batchType.updateNode,
    nodes: translated,
  });
  endBatch();
}

export {
  renderToNative,
  renderToNativeWithChildren,
  insertChild,
  removeChild,
  updateChild,
  updateWithChildren,
};
