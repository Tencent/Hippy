import { Fiber } from 'react-reconciler';
import { LayoutContent } from '@localTypes/events';
import { Bridge, Device, UIManager } from '../global';
import { getRootViewId, findNodeById, findNodeByCondition } from '../utils/node';
import { isFunction, warn } from '../utils';
import Element from '../dom/element-node';

const {
  createNode,
  updateNode,
  deleteNode,
  flushBatch,
  startBatch,
  endBatch,
  sendRenderError,
} = UIManager;

const getNodeById = findNodeById;

/**
 * Get the nodeId from FiberNode ref.
 *
 * @param {Fiber} ref - ref instance.
 */
function getElementFromFiberRef(ref: Fiber | Element) {
  if (ref instanceof Element) {
    return ref;
  }
  // FIXME: should not use the private _reactInternalFiber
  const internalFiber = (ref as any)._reactInternalFiber;
  if (internalFiber && internalFiber.child) {
    let targetNode = internalFiber.child;
    while (targetNode && !(targetNode.stateNode instanceof Element)) {
      targetNode = targetNode.child;
    }
    if (!targetNode || !targetNode.stateNode) {
      return null;
    }
    return targetNode.stateNode;
  }
  return null;
}

/**
 * Get the nodeId number by ref
 * Most use in the module access components.
 *
 * @param {string | Fiber | Fiber} ref - ref instance, reference to the class is recommend
 */
function getNodeIdByRef(ref: string | Fiber | Element): number {
  // typeof ref === 'string'
  if (typeof ref === 'string') {
    warn(`getNodeIdByRef('${ref}') use string ref will affect to performance, recommend use reference to the ref instead`);
    const targetElement = findNodeByCondition((node: Fiber) => {
      /* eslint-disable-next-line no-underscore-dangle */
      if (!node.return || !node.return.ref || !(node.return.ref as any)._stringRef) {
        return false;
      }
      /* eslint-disable-next-line no-underscore-dangle */
      return (node.return.ref as any)._stringRef === ref;
    });
    if (!targetElement || !targetElement.stateNode) {
      return 0;
    }
    return targetElement.stateNode.nodeId;
  }

  // typeof ref === 'Fiber'
  if (!(ref as Element).nodeId) {
    const targetElement = getElementFromFiberRef(ref);
    if (!targetElement) {
      return 0;
    }
    return targetElement.nodeId;
  }
  // typeof ref === 'Element'
  return (ref as Element).nodeId;
}

/**
 * Component access UI functions
 *
 * @param {ViewNode} ref - Element ref that have nodeId.
 * @param {string} funcName - function name.
 * @param {Array} option - fucntion options.
 * @param {function} callback - get result from callUIFunction.
 */
function callUIFunction(ref: Element | Fiber, funcName: string, ...options: any[]): void {
  let { nativeName: componentName, nodeId } = ref as Element;

  if (!nodeId || !componentName) {
    const targetElement = getElementFromFiberRef(ref);
    if (targetElement) {
      ({ nodeId, nativeName: componentName } = targetElement);
    }
  }

  if (!componentName) {
    throw new Error('callUIFunction is calling a unnamed component');
  }

  if (!nodeId) {
    throw new Error('callUIFunction is calling a component have no nodeId');
  }

  let [paramList, callback] = options;
  if (isFunction(paramList)) {
    callback = paramList;
    paramList = [];
  }

  const rootViewId = getRootViewId();

  if (rootViewId === null) {
    return;
  }

  if (Device.platform.OS === 'ios') {
    if (isFunction(callback) && Array.isArray(paramList)) {
      paramList.push(callback);
    }
    Bridge.callNative('UIManagerModule', 'callUIFunction', [componentName, nodeId, funcName, paramList]);
  } else if (Device.platform.OS === 'android') {
    if (isFunction(callback)) {
      Bridge.callNative('UIManagerModule', 'callUIFunction', [nodeId, funcName, paramList], callback);
    } else {
      Bridge.callNative('UIManagerModule', 'callUIFunction', [nodeId, funcName, paramList]);
    }
  }
}

/**
 * Get the ref position and size in the visible window.
 * > For the position and size in the layout, use onLayout event.
 *
 * @param {string} method
 * @param {Fiber | Element} ref - ref that need to measure.
 * @param {function} callBack
 */
function measureInWindowByMethod(
  method: string,
  ref: Fiber,
  callback?: (layout: LayoutContent) => void,
) {
  const nodeId = getNodeIdByRef(ref);
  return new Promise((resolve, reject) => {
    if (!nodeId) {
      if (callback && isFunction(callback)) {
        // Forward compatibility for old callback
        callback('this view is null');
      }
      return reject(new Error(`${method} cannot get nodeId`));
    }
    return Bridge.callNative('UIManagerModule', method, nodeId, (layout: LayoutContent | string) => {
      if (callback && isFunction(callback)) {
        callback(layout);
      }
      if (layout === 'this view is null') {
        return reject(new Error('Android cannot get the node'));
      }
      return resolve(layout);
    });
  });
}

/**
 * Get the ref position and size in the visible window.
 * > For the position and size in the layout, use onLayout event.
 *
 * @param {Fiber | Element} ref - ref that need to measure.
 * @param {function} callBack
 */
function measureInWindow(ref: Fiber, callback?: (layout: LayoutContent) => void) {
  return measureInWindowByMethod('measureInWindow', ref, callback);
}

/**
 * Get the ref position and size in the visible window.
 * > For the position and size in the layout, use onLayout event.
 *
 * @param {Fiber | Element} ref - ref that need to measure.
 * @param {function} callBack
 */
function measureInAppWindow(ref: Fiber, callback?: (layout: LayoutContent) => void) {
  if (Device.platform.OS === 'android') {
    return measureInWindowByMethod('measureInWindow', ref, callback);
  }

  return measureInWindowByMethod('measureInAppWindow', ref, callback);
}

export {
  createNode,
  updateNode,
  deleteNode,
  flushBatch,
  startBatch,
  endBatch,
  sendRenderError,
  getNodeById,
  getNodeIdByRef,
  getElementFromFiberRef,
  callUIFunction,
  measureInWindow,
  measureInAppWindow,
};
