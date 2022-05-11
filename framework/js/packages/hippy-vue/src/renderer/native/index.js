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

// import { UIManagerModule } from '../../runtime/native';
import { GLOBAL_STYLE_NAME, GLOBAL_DISPOSE_STYLE_NAME } from '../../runtime/constants';
import {
  getApp,
  trace,
  warn,
  isFunction,
  convertImageLocalPath,
  deepCopy,
} from '../../util';
import {
  isRTL,
} from '../../util/i18n';
import { preCacheNode, eventHandlerType, nativeEventMap, translateToNativeEventName } from '../../util/node';
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
    const { type, nodes, eventNodes } = chunk;
    const lastChunk = result[result.length - 1];
    if (!lastChunk || lastChunk.type !== type) {
      result.push({
        type,
        nodes,
        eventNodes,
      });
    } else {
      lastChunk.nodes = lastChunk.nodes.concat(nodes);
      lastChunk.eventNodes = lastChunk.eventNodes.concat(eventNodes);
    }
  }
  return result;
}

function isNativeGesture(name) {
  return !!nativeEventMap[name];
}

function handleEventListeners(eventNodes = [], sceneBuilder) {
  eventNodes.forEach((eventNode) => {
    if (eventNode) {
      const { id, eventList } = eventNode;
      eventList.forEach((eventAttribute) => {
        const { name, type, isCapture, listener } = eventAttribute;
        let nativeEventName;
        if (isNativeGesture(name)) {
          nativeEventName = nativeEventMap[name];
        } else {
          nativeEventName = translateToNativeEventName(name);
        }
        if (type === eventHandlerType.REMOVE) {
          console.log('RemoveEventListener', id, nativeEventName, isCapture);
          sceneBuilder.RemoveEventListener(id, nativeEventName, listener);
        }
        if (type === eventHandlerType.ADD) {
          console.log('RemoveEventListener', id, nativeEventName, isCapture);
          sceneBuilder.RemoveEventListener(id, nativeEventName, listener);
          console.log('AddEventListener', id, nativeEventName, isCapture);
          sceneBuilder.AddEventListener(id, nativeEventName, listener);
        }
      });
    }
  });
}

/**
 * Initial CSS Map;
 */
let __cssMap;

function endBatch(app) {
  if (!__batchIdle) return;
  __batchIdle = false;
  if (__batchNodes.length === 0) {
    __batchIdle = true;
    return;
  }
  const {
    $nextTick,
    $options: {
      rootViewId,
    },
  } = app;
  $nextTick(() => {
    const chunks = chunkNodes(__batchNodes);
    const sceneBuilder = new global.SceneBuilder(rootViewId);
    chunks.forEach((chunk) => {
      switch (chunk.type) {
        case NODE_OPERATION_TYPES.createNode:
          trace(...componentName, 'createNode', chunk.nodes);
          sceneBuilder.Create(chunk.nodes);
          handleEventListeners(chunk.eventNodes, sceneBuilder);
          break;
        case NODE_OPERATION_TYPES.updateNode:
          trace(...componentName, 'updateNode', chunk.nodes);
          sceneBuilder.Update(chunk.nodes);
          handleEventListeners(chunk.eventNodes, sceneBuilder);
          break;
        case NODE_OPERATION_TYPES.deleteNode:
          trace(...componentName, 'deleteNode', chunk.nodes);
          sceneBuilder.Delete(chunk.nodes);
          break;
        default:
      }
    });
    sceneBuilder.Build();
    __batchIdle = true;
    __batchNodes = [];
  });
}

function getCssMap() {
  /**
   * To support dynamic import, __cssMap can be loaded from different js file.
   * __cssMap should be create/append if global[GLOBAL_STYLE_NAME] exists;
   */
  if (!__cssMap || global[GLOBAL_STYLE_NAME]) {
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
  }

  if (global[GLOBAL_DISPOSE_STYLE_NAME]) {
    global[GLOBAL_DISPOSE_STYLE_NAME].forEach((id) => {
      __cssMap.delete(id);
    });
    global[GLOBAL_DISPOSE_STYLE_NAME] = undefined;
  }

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
    if (style.backgroundImage) {
      style.backgroundImage = convertImageLocalPath(style.backgroundImage);
    }
  }
}

/**
 * Get target node attributes, use to chrome devTool tag attribute show while debugging
 * @param targetNode
 * @param events
 * @returns attributes|{}
 */
function getTargetNodeAttributes(targetNode, events) {
  try {
    const mergedProps = Object.assign({}, targetNode.attributes, events);
    const targetNodeAttributes = deepCopy(mergedProps);
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

function processModalView(nativeNode) {
  if (nativeNode.props.__modalFirstChild__) {
    const nodeStyle = nativeNode.props.style;
    Object.keys(nodeStyle).some((styleKey) => {
      if (styleKey === 'position' && nodeStyle[styleKey] === 'absolute') {
        if (process.env.NODE_ENV !== 'production') {
          console.error(`it cannot set { position: absolute } for the first child node of <dialog /> , please remove it.
If you want to make dialog cover fullscreen, please use { flex: 1 } or set height and width to the first child node of <dialog />`);
        }
        ['position', 'left', 'right', 'top', 'bottom'].forEach(positionProp => delete nodeStyle[positionProp]);
        return true;
      }
      return false;
    });
  }
}

/**
 * getEventAttributeAndNode - translate event info to event attribute & event node.
 * @param targetNode
 */
function getEventAttributeAndNode(targetNode) {
  const events = {};
  let eventNode;
  const eventsAttributes = targetNode.events;
  if (eventsAttributes) {
    const eventList = [];
    Object.keys(eventsAttributes)
      .forEach((key) => {
        const { name, type, isCapture, listener } = eventsAttributes[key];
        // if (!targetNode.isListenerHandled(key, type)) {
        //   targetNode.setListenerHandledType(key, type);
        //   eventList.push({
        //     name,
        //     type,
        //     isCapture,
        //     listener,
        //   });
        // }
        Object.assign(events, {
          [name]: () => {},
        });
        eventList.push({
          name,
          type,
          isCapture,
          listener,
        });
      });
    eventNode = {
      id: targetNode.nodeId,
      eventList,
    };
  }
  return { events, eventNode };
}

/**
 * Render Element to native
 */
function renderToNative(rootViewId, targetNode) {
  if (targetNode.meta.skipAddToDom) {
    return {};
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
  const { events, eventNode } = getEventAttributeAndNode(targetNode);
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
  processModalView(nativeNode);
  // Add nativeNode attributes info for Element debugging
  if (process.env.NODE_ENV !== 'production') {
    nativeNode.tagName = targetNode.tagName;
    nativeNode.props.attributes = getTargetNodeAttributes(targetNode, events);
  }
  parseViewComponent(targetNode, nativeNode, style);
  parseTextInputComponent(targetNode, style);
  return { nativeNode, eventNode };
}

/**
 * Render Element with children to native
 * @param {number} rootViewId - root view id
 * @param {ViewNode} node - target node to be traversed
 * @param {Function} [callback] - function called on each traversing process
 * @returns {{}}
 */
function renderToNativeWithChildren(rootViewId, node, callback) {
  const nativeLanguages = [];
  const eventLanguages = [];
  node.traverseChildren((targetNode) => {
    const { nativeNode, eventNode } = renderToNative(rootViewId, targetNode);
    if (nativeNode) {
      nativeLanguages.push(nativeNode);
    }
    if (eventNode) {
      eventLanguages.push(eventNode);
    }
    if (typeof callback === 'function') {
      callback(targetNode);
    }
  });
  return { nativeLanguages, eventLanguages };
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
    const { nativeLanguages, eventLanguages } = renderToNativeWithChildren(rootViewId, parentNode, (node) => {
      if (!node.isMounted) {
        node.isMounted = true;
      }
      preCacheNode(node, node.nodeId);
    });
    __batchNodes.push({
      type: NODE_OPERATION_TYPES.createNode,
      nodes: nativeLanguages,
      eventNodes: eventLanguages,
    });
    endBatch(app);
  // Render others child nodes.
  } else if (parentNode.isMounted && !childNode.isMounted) {
    const { nativeLanguages, eventLanguages } = renderToNativeWithChildren(rootViewId, childNode, (node) => {
      if (!node.isMounted) {
        node.isMounted = true;
      }
      preCacheNode(node, node.nodeId);
    });
    __batchNodes.push({
      type: NODE_OPERATION_TYPES.createNode,
      nodes: nativeLanguages,
      eventNodes: eventLanguages,
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
  const  { nativeNode, eventNode } = renderToNative(rootViewId, parentNode);
  if (nativeNode) {
    __batchNodes.push({
      type: NODE_OPERATION_TYPES.updateNode,
      nodes: [nativeNode],
      eventNodes: [eventNode],
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
  const { nativeLanguages, eventLanguages } = renderToNativeWithChildren(rootViewId, parentNode);
  __batchNodes.push({
    type: NODE_OPERATION_TYPES.updateNode,
    nodes: nativeLanguages,
    eventNodes: eventLanguages,
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
