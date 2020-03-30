/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

/**
 * Virtual DOM to Native DOM
 */

import Native, { UIManagerModule } from '../../runtime/native';
import { fromAstNodes, SelectorsMap } from './style';
import { GLOBAL_STYLE_NAME } from '../../runtime/constants';
import {
  getApp,
  trace,
  warn,
  isFunction,
  capitalizeFirstLetter,
} from '../../util';

const componentName = ['%c[native]%c', 'color: red', 'color: auto'];

if (typeof global.Symbol !== 'function') {
  global.Symbol = str => str;
}

/**
 * UI Operations
 */
const NODE_OPERATION_TYPES = {
  createNode: Symbol('createNode'),
  updateNode: Symbol('updateNode'),
  deleteNode: Symbol('deleteNode'),
};
let __batchIdle = true;
let __batchNodes = [];

/**
 * Convert an ordered node array into multiple fragments
 */
function chunkNodes(batchNodes) {
  const result = [];
  for (let i = 0; i < batchNodes.length; i += 1) {
    const chunk = batchNodes[i];
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

/**
 * Initial CSS Map;
 */
let __cssMap;

function startBatch() {
  if (__batchIdle) {
    UIManagerModule.startBatch();
  }
}

function endBatch(app) {
  if (!__batchIdle) {
    return;
  }
  __batchIdle = false;
  const {
    $nextTick,
    $options: {
      rootViewId,
    },
  } = app;

  $nextTick(() => {
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
          if (__PLATFORM__ === 'ios' || Native.Platform === 'ios') {
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
          if (__PLATFORM__ === 'ios' || Native.Platform === 'ios') {
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
    __batchIdle = true;
    __batchNodes = [];
  });
}
function getCssMap() {
  const { $options } = getApp();

  if (__cssMap) {
    return __cssMap;
  }
  // HERE IS A SECRET STARTUP OPTION: beforeStyleLoadHook
  // Usage for process the styles while styles loading.
  const cssRules = fromAstNodes(global[GLOBAL_STYLE_NAME], $options.beforeLoadStyle);
  __cssMap = new SelectorsMap(cssRules);
  delete global[GLOBAL_STYLE_NAME];
  return __cssMap;
}

/**
 * Translate to native props from attributes and meta
 */
function getNativeProps(node) {
  // Initial the props with empty
  const props = {};

  // Get the default native props from meta
  if (node.meta.component.defaultNativeProps) {
    Object.keys(node.meta.component.defaultNativeProps).forEach((key) => {
      // Skip the defined attribute
      if (node.getAttribute(key) !== undefined) {
        return;
      }
      // Get the default props
      const defaultNativeProps = node.meta.component.defaultNativeProps[key];
      if (isFunction(defaultNativeProps)) {
        props[key] = defaultNativeProps(node);
      } else {
        props[key] = defaultNativeProps;
      }
    });
  }

  // Get the proceed props from node attributes
  Object.keys(node.attributes).forEach((key) => {
    let value = node.getAttribute(key);

    // No defined map
    if (!node.meta.component.attributeMaps) {
      props[key] = value;
      return;
    }
    if (!node.meta.component.attributeMaps[key]) {
      props[key] = value;
      return;
    }

    // Defined mapped props.
    const map = node.meta.component.attributeMaps[key];
    if (typeof map === 'string') {
      props[map] = value;
      return;
    }

    // Define mapped props is a function.
    if (isFunction(map)) {
      props[key] = map(value);
      return;
    }

    // Defined object map with value
    const { name: propsKey, propsValue } = map;
    if (isFunction(propsValue)) {
      value = propsValue(value);
    }
    props[propsKey] = value;
  });

  // Get the force props from meta, it's can't be override
  if (node.meta.component.nativeProps) {
    Object.assign(props, node.meta.component.nativeProps);
  }

  // FIXME: Workaround for Image src props, should unify to use src.
  if (node.tagName === 'img' && (__PLATFORM__ === 'ios' || Native.Platform === 'ios')) {
    props.source = [{
      uri: props.src,
    }];
    delete props.src;
  }

  return props;
}

/**
 * Render Element to native
 */
function renderToNative(rootViewId, targetNode) {
  if (targetNode.meta.skipAddToDom) {
    return null;
  }
  if (!targetNode.meta.component) {
    throw new Error(`Specific tag is not supported yet: ${targetNode.tagName}`);
  }

  let style = {};
  // Apply styles when the targetNode attach to document at first time.
  if (targetNode.meta.component.defaultNativeStyle) {
    style = { ...targetNode.meta.component.defaultNativeStyle };
  }

  // Apply styles from CSS
  const matchedSelectors = getCssMap().query(targetNode);
  matchedSelectors.selectors.forEach((matchedSelector) => {
    matchedSelector.ruleSet.declarations.forEach((cssStyle) => {
      style[cssStyle.property] = cssStyle.value;
    });
  });

  // Apply style from style attribute.
  style = { ...style, ...targetNode.style };

  // Convert to real native event
  const events = {};
  // FIXME: Bad accessing the private property.
  if (targetNode._emitter) {
    const vueEventNames = Object.keys(targetNode._emitter.getEventListeners());
    const { eventNamesMap } = targetNode.meta.component;
    if (eventNamesMap) {
      vueEventNames.forEach((vueEventName) => {
        const nativeEventName = eventNamesMap[vueEventName];
        if (nativeEventName) {
          events[nativeEventName] = true;
        } else {
          events[`on${capitalizeFirstLetter(vueEventName)}`] = true;
        }
      });
    } else {
      vueEventNames.forEach((vueEventName) => {
        events[`on${capitalizeFirstLetter(vueEventName)}`] = true;
      });
    }
  }

  // Translate to native node
  const nativeNode = {
    id: targetNode.nodeId,
    pId: (targetNode.parentNode && targetNode.parentNode.nodeId) || rootViewId,
    index: targetNode.index,
    name: targetNode.meta.component.name,
    props: {
      ...getNativeProps(targetNode),
      ...events,
      style,
    },
  };

  // Change View to ScrollView when meet overflow=scroll style.
  if (targetNode.meta.component.name === 'View') {
    if (style.overflowX === 'scroll' && style.overflowY === 'scroll') {
      warn('overflow-x and overflow-y for View can not work together');
    }

    if (style.overflowY === 'scroll') {
      nativeNode.name = 'ScrollView';
    } else if (style.overflowX === 'scroll') {
      nativeNode.name = 'ScrollView';
      nativeNode.props.horizontal = true; // Necessary for horizontal scrolling
    }

    // Change the ScrollView child collapsable attribute
    if (nativeNode.name === 'ScrollView') {
      if (targetNode.childNodes.length !== 1) {
        warn('Only one child node is acceptable for View with overflow');
      }
      if (targetNode.childNodes.length) {
        targetNode.childNodes[0].setStyle('collapsable', false);
      }
    }
  }

  return nativeNode;
}

/**
 * Render Element with child to native
 */
function renderToNativeWithChildren(rootViewId, node) {
  const nativeLanguages = [];
  node.traverseChildren((targetNode) => {
    const nativeNode = renderToNative(rootViewId, targetNode);
    if (nativeNode) {
      nativeLanguages.push(nativeNode);
    }
  });
  return nativeLanguages;
}

function isLayout(node, rootView) {
  // First time init rootViewId always be 3.
  if (node.nodeId === 3) {
    return true;
  }
  // Check the id is specific for rootView.
  if (process.env.NODE_ENV !== 'production') {
    if (!rootView) {
      warn('rootView option is necessary for new HippyVue()');
    }
    if (rootView.charAt(0) !== '#') {
      warn('rootView option must be unique ID selector start with # ');
    }
  }
  return node.id === rootView.slice(1 - rootView.length);
}

function insertChild(parentNode, childNode, atIndex = -1) {
  if (!parentNode) {
    return;
  }

  if (parentNode.meta && isFunction(parentNode.meta.insertChild)) {
    parentNode.meta.insertChild(parentNode, childNode, atIndex);
  }

  if (childNode.meta.skipAddToDom) {
    return;
  }

  const app = getApp();
  if (!app) {
    return;
  }
  const { $options: { rootViewId, rootView } } = app;
  // Render the root node
  if (isLayout(parentNode, rootView) && !parentNode.isMounted) {
    // Start real native work.
    const translated = renderToNativeWithChildren(rootViewId, parentNode);
    startBatch();
    __batchNodes.push({
      type: NODE_OPERATION_TYPES.createNode,
      nodes: translated,
    });
    endBatch(app);
    parentNode.traverseChildren((node) => {
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
    endBatch(app);
    childNode.traverseChildren((node) => {
      if (!node.isMounted) {
        node.isMounted = true;
      }
    });
  }
}

function removeChild(parentNode, childNode) {
  if (parentNode && parentNode.meta && isFunction(parentNode.meta.removeChild)) {
    parentNode.meta.removeChild(parentNode, childNode);
  }

  if (!childNode || childNode.meta.skipAddToDom) {
    return;
  }

  childNode.isMounted = false;
  childNode.traverseChildren((node) => {
    if (node.isMounted) {
      node.isMounted = false;
    }
  });
  const app = getApp();
  const deleteNodeIds = [];
  childNode.traverseChildren((targetNode) => {
    if (targetNode.meta.skipAddToDom) {
      return;
    }
    deleteNodeIds.push({
      id: targetNode.nodeId,
      index: targetNode.index,
      pId: targetNode.parentNode.nodeId,
    });
  });
  startBatch();
  __batchNodes.push({
    type: NODE_OPERATION_TYPES.deleteNode,
    nodes: deleteNodeIds,
  });
  endBatch(app);
}

function updateChild(parentNode) {
  if (!parentNode.isMounted) {
    return;
  }
  const app = getApp();
  const { $options: { rootViewId } } = app;
  const translated = renderToNative(rootViewId, parentNode);
  if (translated) {
    startBatch();
    __batchNodes.push({
      type: NODE_OPERATION_TYPES.updateNode,
      nodes: [translated],
    });
    endBatch(app);
  }
}

function updateWithChildren(parentNode) {
  if (!parentNode.isMounted) {
    return;
  }
  const app = getApp();
  const { $options: { rootViewId } } = app;
  const translated = renderToNativeWithChildren(rootViewId, parentNode);
  startBatch();
  __batchNodes.push({
    type: NODE_OPERATION_TYPES.updateNode,
    nodes: translated,
  });
  endBatch(app);
}

export {
  renderToNative,
  renderToNativeWithChildren,
  insertChild,
  removeChild,
  updateChild,
  updateWithChildren,
};
