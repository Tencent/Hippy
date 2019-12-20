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
  const renderId = Date.now();
  // Render the root node
  if (isLayout(parentNode) && !parentNode.isMounted) {
    // Start real native work.
    const translated = renderToNativeWithChildren(rootViewId, childNode);
    trace(...componentName, 'insertChild layout', translated);
    UIManagerModule.startBatch(renderId);
    UIManagerModule.createNode(rootViewId, translated);
    UIManagerModule.endBatch(renderId);
    parentNode.traverseChildren((node: ViewNode) => {
      if (!node.isMounted) {
        node.isMounted = true;
      }
    });
  // Render others child nodes.
  } else if (parentNode.isMounted && !childNode.isMounted) {
    const translated = renderToNativeWithChildren(rootViewId, childNode);
    trace(...componentName, 'insertChild child', translated);
    UIManagerModule.startBatch(renderId);
    UIManagerModule.createNode(rootViewId, translated);
    UIManagerModule.endBatch(renderId);
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
  const renderId = Date.now();
  const rootViewId = getRootViewId();
  const deleteNodeIds: Hippy.NativeNode[] = [{
    id: childNode.nodeId,
    pId: childNode.parentNode ? childNode.parentNode.nodeId : rootViewId,
    index: childNode.index,
  }];
  trace(...componentName, 'deleteNode', deleteNodeIds);
  UIManagerModule.startBatch(renderId);
  UIManagerModule.deleteNode(rootViewId, deleteNodeIds);
  UIManagerModule.endBatch(renderId);
}

function updateChild(parentNode: Element) {
  if (!parentNode.isMounted) {
    return;
  }
  const rootViewId = getRootViewId();
  const renderId = Date.now();
  const translated = renderToNative(rootViewId, parentNode);
  trace(...componentName, 'updateNode', translated);
  UIManagerModule.startBatch(renderId);
  UIManagerModule.updateNode(rootViewId, [translated]);
  UIManagerModule.endBatch(renderId);
}

function updateWithChildren(parentNode: ViewNode) {
  if (!parentNode.isMounted) {
    return;
  }
  const rootViewId = getRootViewId();
  const renderId = Date.now();
  const translated = renderToNativeWithChildren(rootViewId, parentNode);
  trace(...componentName, 'updateWithChildren', translated);
  UIManagerModule.startBatch(renderId);
  translated.forEach((item) => {
    UIManagerModule.updateNode(rootViewId, [item]);
  });
  UIManagerModule.endBatch(renderId);
}

export {
  renderToNative,
  renderToNativeWithChildren,
  insertChild,
  removeChild,
  updateChild,
  updateWithChildren,
};
