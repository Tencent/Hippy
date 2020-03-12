/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

import Hippy from '@localTypes/hippy';
import ViewNode from '../dom/view-node';
import Element from '../dom/element-node';
import * as UIManagerModule from '../modules/ui-manager-module';
import { getRootViewId, getRootContainer } from '../utils/node';
import { trace, warn } from '../utils';


interface Style {
  [key: string]: null | string | number | number[];
}

const componentName = ['%c[native]%c', 'color: red', 'color: auto'];

let __batchIdle = true;
let __renderId: number = 0;

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
      UIManagerModule.endBatch(__renderId);
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
    trace(...componentName, 'insertChild layout', translated);
    startBatch();
    UIManagerModule.createNode(rootViewId, translated);
    endBatch();
    parentNode.traverseChildren((node: ViewNode) => {
      if (!node.isMounted) {
        node.isMounted = true;
      }
    });
  // Render others child nodes.
  } else if (parentNode.isMounted && !childNode.isMounted) {
    const translated = renderToNativeWithChildren(rootViewId, childNode);
    trace(...componentName, 'insertChild child', translated);
    startBatch();
    UIManagerModule.createNode(rootViewId, translated);
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
  trace(...componentName, 'deleteNode', deleteNodeIds);
  startBatch();
  UIManagerModule.deleteNode(rootViewId, deleteNodeIds);
  endBatch();
}

function updateChild(parentNode: Element) {
  if (!parentNode.isMounted) {
    return;
  }
  const rootViewId = getRootViewId();
  const translated = renderToNative(rootViewId, parentNode);
  trace(...componentName, 'updateNode', translated);
  startBatch();
  UIManagerModule.updateNode(rootViewId, [translated]);
  endBatch();
}

function updateWithChildren(parentNode: ViewNode) {
  if (!parentNode.isMounted) {
    return;
  }
  const rootViewId = getRootViewId();
  const translated = renderToNativeWithChildren(rootViewId, parentNode);
  trace(...componentName, 'updateWithChildren', translated);
  startBatch();
  translated.forEach((item) => {
    UIManagerModule.updateNode(rootViewId, [item]);
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
