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

/**
 * Initial CSS Map;
 */
let __cssMap;
let __batchIdle = true;

function startBatch() {
  if (__batchIdle) {
    UIManagerModule.startBatch();
  }
}

function endBatch() {
  if (__batchIdle) {
    __batchIdle = false;
    const { $nextTick } = getApp();
    $nextTick(() => {
      UIManagerModule.endBatch();
      __batchIdle = true;
    });
  }
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
    trace(...componentName, 'insertChild layout', translated);
    startBatch();
    UIManagerModule.createNode(rootViewId, translated);
    endBatch();
    parentNode.traverseChildren((node) => {
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
  const { $options: { rootViewId } } = getApp();
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
  trace(...componentName, 'deleteNode', deleteNodeIds);
  startBatch();
  UIManagerModule.deleteNode(rootViewId, deleteNodeIds);
  endBatch();
}

function updateChild(parentNode) {
  if (!parentNode.isMounted) {
    return;
  }
  const { $options: { rootViewId } } = getApp();
  const translated = renderToNative(rootViewId, parentNode);
  trace(...componentName, 'updateNode', translated);
  startBatch();
  UIManagerModule.updateNode(rootViewId, [translated]);
  endBatch();
}

function updateWithChildren(parentNode) {
  if (!parentNode.isMounted) {
    return;
  }
  const { $options: { rootViewId } } = getApp();
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
