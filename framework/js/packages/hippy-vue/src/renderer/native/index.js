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

/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

/**
 * Virtual DOM to Native DOM
 */

import Native, { UIManagerModule } from '../../runtime/native';
import { GLOBAL_STYLE_NAME } from '../../runtime/constants';
import {
  getApp,
  trace,
  warn,
  isFunction,
  capitalizeFirstLetter,
  convertImageLocalPath,
} from '../../util';
import {
  isRTL,
} from '../../util/i18n';
import { preCacheNode } from '../../util/node';
import { fromAstNodes, SelectorsMap } from './style';

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
          // FIXME: iOS should be able to update multiple nodes at once.
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
  /**
   * To support dynamic import, __cssMap can be loaded from different js file.
   * __cssMap should be create/append if global[GLOBAL_STYLE_NAME] exists;
   */
  if (__cssMap && !global[GLOBAL_STYLE_NAME]) {
    return __cssMap;
  }
  /**
   *  Here is a secret startup option: beforeStyleLoadHook.
   *  Usage for process the styles while styles loading.
   */
  const cssRules = fromAstNodes(global[GLOBAL_STYLE_NAME]);
  if (__cssMap) {
    __cssMap.append(cssRules);
  } else {
    __cssMap = new SelectorsMap(cssRules);
  }
  global[GLOBAL_STYLE_NAME] = undefined;
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
    if (!node.meta.component.attributeMaps || !node.meta.component.attributeMaps[key]) {
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
    const { name: propsKey, propsValue, jointKey } = map;
    if (isFunction(propsValue)) {
      value = propsValue(value);
    }
    // if jointKey set, multi attributes will be assigned to the same jointKey object.
    if (jointKey) {
      props[jointKey] = props[jointKey] || {};
      Object.assign(props[jointKey], {
        [propsKey]: value,
      });
    } else {
      props[propsKey] = value;
    }
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
    props.src = undefined;
  }

  return props;
}

/**
 * parse TextInput component on special condition
 * @param targetNode
 * @param style
 */
function parseTextInputComponent(targetNode, style) {
  if (targetNode.meta.component.name === 'TextInput') {
    // Change textAlign to right if display direction is right to left.
    if (isRTL()) {
      if (!style.textAlign) {
        style.textAlign = 'right';
      }
    }
  }
}

/**
 * parse view component on special condition
 * @param targetNode
 * @param nativeNode
 * @param style
 */
function parseViewComponent(targetNode, nativeNode, style) {
  if (targetNode.meta.component.name === 'View') {
    // Change View to ScrollView when meet overflow=scroll style.
    if (style.overflowX === 'scroll' && style.overflowY === 'scroll') {
      warn('overflow-x and overflow-y for View can not work together');
    }
    if (style.overflowY === 'scroll') {
      nativeNode.name = 'ScrollView';
    } else if (style.overflowX === 'scroll') {
      nativeNode.name = 'ScrollView';
      // Necessary for horizontal scrolling
      nativeNode.props.horizontal = true;
      // Change flexDirection to row-reverse if display direction is right to left.
      style.flexDirection = isRTL() ? 'row-reverse' : 'row';
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
    // TODO backgroundImage would use local path if webpack file-loader active, which needs native support
    if (style.backgroundImage) {
      style.backgroundImage = convertImageLocalPath(style.backgroundImage);
    }
  }
}

/**
 * Get target node attributes, use to chrome devTool tag attribute show while debugging
 * @param targetNode
 * @returns attributes|{}
 */
function getTargetNodeAttributes(targetNode) {
  try {
    const targetNodeAttributes = JSON.parse(JSON.stringify(targetNode.attributes));
    const classInfo = Array.from(targetNode.classList || []).join(' ');
    const attributes = {
      id: targetNode.id,
      class: classInfo,
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
  // Add nativeNode attributes info for Element debugging
  if (process.env.NODE_ENV !== 'production') {
    nativeNode.tagName = targetNode.tagName;
    nativeNode.props.attributes = getTargetNodeAttributes(targetNode);
  }
  parseViewComponent(targetNode, nativeNode, style);
  parseTextInputComponent(targetNode, style);
  return nativeNode;
}

/**
 * Render Element with children to native
 * @param {number} rootViewId - root view id
 * @param {ViewNode} node - target node to be traversed
 * @param {Function} [callback] - function called on each traversing process
 * @returns {[]}
 */
function renderToNativeWithChildren(rootViewId, node, callback) {
  const nativeLanguages = [];
  node.traverseChildren((targetNode) => {
    const nativeNode = renderToNative(rootViewId, targetNode);
    if (nativeNode) {
      nativeLanguages.push(nativeNode);
    }
    if (typeof callback === 'function') {
      callback(targetNode);
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
  if (!parentNode || !childNode) {
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
    const translated = renderToNativeWithChildren(rootViewId, parentNode, (node) => {
      if (!node.isMounted) {
        node.isMounted = true;
      }
      preCacheNode(node, node.nodeId);
    });
    startBatch();
    __batchNodes.push({
      type: NODE_OPERATION_TYPES.createNode,
      nodes: translated,
    });
    endBatch(app);
  // Render others child nodes.
  } else if (parentNode.isMounted && !childNode.isMounted) {
    const translated = renderToNativeWithChildren(rootViewId, childNode, (node) => {
      if (!node.isMounted) {
        node.isMounted = true;
      }
      preCacheNode(node, node.nodeId);
    });
    startBatch();
    __batchNodes.push({
      type: NODE_OPERATION_TYPES.createNode,
      nodes: translated,
    });
    endBatch(app);
  }
}

function removeChild(parentNode, childNode, index) {
  if (parentNode && parentNode.meta && isFunction(parentNode.meta.removeChild)) {
    parentNode.meta.removeChild(parentNode, childNode);
  }
  if (!childNode || childNode.meta.skipAddToDom) {
    return;
  }
  childNode.isMounted = false;
  childNode.index = index;
  const app = getApp();
  const { $options: { rootViewId } } = app;
  const deleteNodeIds = [{
    id: childNode.nodeId,
    pId: childNode.parentNode ? childNode.parentNode.nodeId : rootViewId,
    index: childNode.index,
  }];
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
  getCssMap,
  renderToNative,
  renderToNativeWithChildren,
  insertChild,
  removeChild,
  updateChild,
  updateWithChildren,
};
