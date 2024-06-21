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

import {
  GLOBAL_STYLE_NAME,
  GLOBAL_DISPOSE_STYLE_NAME,
  ROOT_VIEW_ID,
} from '../runtime/constants';
import {
  getApp,
  trace,
  warn,
  isDev,
  isFunction,
  convertImageLocalPath,
  deepCopy,
  isTraceEnabled,
  getBeforeRenderToNative,
  isStyleNotEmpty,
} from '../util';
import {
  EventHandlerType,
  NativeEventMap,
  translateToNativeEventName,
  isNativeGesture,
} from '../util/event';
import {
  isRTL,
} from '../util/i18n';
import {
  setCacheNodeStyle,
  getCacheNodeStyle,
} from '../util/node-style';
import { isHippyTextNode, isStyleMatched, preCacheNode } from '../util/node';
import { fromAstNodes, SelectorsMap } from '../style';
import { CallbackType, NeedToTyped } from '../types/native';
import ElementNode from '../renderer/element-node';
import ViewNode from '../renderer/view-node';

const LOG_TYPE = ['%c[native]%c', 'color: red', 'color: auto'];

interface BatchType {
  [key: string]: any;
}

/**
 * UI Operations
 */
const NODE_OPERATION_TYPES: BatchType = {
  createNode: Symbol('createNode'),
  updateNode: Symbol('updateNode'),
  deleteNode: Symbol('deleteNode'),
  moveNode: Symbol('moveNode'),
  updateEvent: Symbol('updateEvent'),
};

let batchIdle = true;
let batchNodes: NeedToTyped = [];

/**
 * Convert an ordered node array into multiple fragments
 */
function chunkNodes(batchNodes: NeedToTyped) {
  const result: NeedToTyped = [];
  for (let i = 0; i < batchNodes.length; i += 1) {
    const chunk = batchNodes[i];
    const { type, nodes, eventNodes, printedNodes } = chunk;
    const lastChunk = result[result.length - 1];
    if (!lastChunk || lastChunk.type !== type) {
      result.push({
        type,
        nodes,
        eventNodes,
        printedNodes,
      });
    } else {
      lastChunk.nodes = lastChunk.nodes.concat(nodes);
      lastChunk.eventNodes = lastChunk.eventNodes.concat(eventNodes);
      lastChunk.printedNodes = lastChunk.printedNodes.concat(printedNodes);
    }
  }
  return result;
}

function handleEventListeners(eventNodes: HippyTypes.EventNode[] = [], sceneBuilder: NeedToTyped) {
  eventNodes.forEach((eventNode) => {
    if (eventNode) {
      const { id, eventList } = eventNode;
      (eventList as any).forEach((eventAttribute: NeedToTyped) => {
        const { name, type, listener } = eventAttribute;
        let nativeEventName;
        if (isNativeGesture(name)) {
          nativeEventName = NativeEventMap[name];
        } else {
          nativeEventName = translateToNativeEventName(name);
        }
        if (type === EventHandlerType.REMOVE) {
          sceneBuilder.removeEventListener(id, nativeEventName, listener);
        }
        if (type === EventHandlerType.ADD) {
          sceneBuilder.removeEventListener(id, nativeEventName, listener);
          sceneBuilder.addEventListener(id, nativeEventName, listener);
        }
      });
    }
  });
}

/**
 * Initial CSS Map;
 */
let cssMap: NeedToTyped;

/**
 * print nodes operation log
 * @param {HippyTypes.PrintedNode[]} printedNodes
 * @param {string} nodeType
 */
function printNodeOperation(printedNodes: HippyTypes.PrintedNode[], nodeType: NeedToTyped) {
  if (isTraceEnabled()) {
    trace(...LOG_TYPE, nodeType, printedNodes);
  }
}

function endBatch(app: NeedToTyped) {
  if (!batchIdle) return;
  batchIdle = false;
  if (batchNodes.length === 0) {
    batchIdle = true;
    return;
  }
  const {
    $nextTick,
    $options: {
      rootViewId,
    },
  } = app;
  $nextTick(() => {
    const chunks = chunkNodes(batchNodes);
    const sceneBuilder = new global.Hippy.SceneBuilder(rootViewId);
    chunks.forEach((chunk) => {
      switch (chunk.type) {
        case NODE_OPERATION_TYPES.createNode:
          printNodeOperation(chunk.printedNodes, 'createNode');
          sceneBuilder.create(chunk.nodes);
          handleEventListeners(chunk.eventNodes, sceneBuilder);
          break;
        case NODE_OPERATION_TYPES.updateNode:
          printNodeOperation(chunk.printedNodes, 'updateNode');
          sceneBuilder.update(chunk.nodes);
          handleEventListeners(chunk.eventNodes, sceneBuilder);
          break;
        case NODE_OPERATION_TYPES.deleteNode:
          printNodeOperation(chunk.printedNodes, 'deleteNode');
          sceneBuilder.delete(chunk.nodes);
          break;
        case NODE_OPERATION_TYPES.moveNode:
          printNodeOperation(chunk.printedNodes, 'moveNode');
          sceneBuilder.move(chunk.nodes);
          break;
        case NODE_OPERATION_TYPES.updateEvent:
          handleEventListeners(chunk.eventNodes, sceneBuilder);
          break;
        default:
      }
    });
    sceneBuilder.build();
    batchIdle = true;
    batchNodes = [];
  });
}

function getCssMap() {
  /**
   * To support dynamic import, cssMap can be loaded from different js file.
   * cssMap should be 'create/append' if global[GLOBAL_STYLE_NAME] exists;
   */
  if (!cssMap || global[GLOBAL_STYLE_NAME]) {
    /**
     *  Here is a secret startup option: beforeStyleLoadHook.
     *  Usage for process the styles while styles loading.
     */
    const cssRules = fromAstNodes(global[GLOBAL_STYLE_NAME]);
    if (cssMap) {
      cssMap.append(cssRules);
    } else {
      cssMap = new SelectorsMap(cssRules);
    }
    global[GLOBAL_STYLE_NAME] = undefined;
  }

  if (global[GLOBAL_DISPOSE_STYLE_NAME]) {
    global[GLOBAL_DISPOSE_STYLE_NAME].forEach((id: NeedToTyped) => {
      cssMap.delete(id);
    });
    global[GLOBAL_DISPOSE_STYLE_NAME] = undefined;
  }

  return cssMap;
}

/**
 * Translate to native props from attributes and meta
 */
function getNativeProps(node: ElementNode) {
  // Initial the props with empty
  const props: NeedToTyped = {};
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
  // Get the processed props from node attributes
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

  // Get the force props from meta, it can't be overridden
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
function parseTextInputComponent(targetNode: NeedToTyped, style: NeedToTyped) {
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
function parseViewComponent(targetNode: NeedToTyped, nativeNode: NeedToTyped, style: NeedToTyped) {
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
 * getElemCss
 * @param {ElementNode} element
 * @returns {{}}
 */
function getElemCss(element: NeedToTyped) {
  const style = Object.create(null);
  try {
    getCssMap().query(element).selectors.forEach((matchedSelector: NeedToTyped) => {
      if (!isStyleMatched(matchedSelector, element)) return;
      matchedSelector.ruleSet.declarations.forEach((cssStyle: NeedToTyped) => {
        style[cssStyle.property] = cssStyle.value;
      });
    });
  } catch (err) {
    console.error('getDomCss Error:', err);
  }
  return style;
}

/**
 * Get target node attributes, use to chrome devTool tag attribute show while debugging
 * @param targetNode
 * @returns attributes|{}
 */
function getTargetNodeAttributes(targetNode: NeedToTyped) {
  try {
    const targetNodeAttributes = deepCopy(targetNode.attributes);
    const classInfo = Array.from(targetNode.classList || []).join(' ');
    const { id, nodeId } = targetNode;
    const attributes = {
      id,
      hippyNodeId: `${nodeId}`,
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

function processModalView(nativeNode: NeedToTyped) {
  if (nativeNode.props.__modalFirstChild__) {
    const nodeStyle = nativeNode.props.style;
    Object.keys(nodeStyle).some((styleKey) => {
      if (styleKey === 'position' && nodeStyle[styleKey] === 'absolute') {
        if (isDev()) {
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
 * getEventNode - translate event info event node.
 * @param targetNode
 */
function getEventNode(targetNode: NeedToTyped) {
  let eventNode: NeedToTyped = undefined;
  const eventsAttributes = targetNode.events;
  if (eventsAttributes) {
    const eventList: NeedToTyped = [];
    Object.keys(eventsAttributes)
      .forEach((key) => {
        const { name, type, isCapture, listener } = eventsAttributes[key];
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
  return eventNode;
}

/**
 * Render Element to native
 */
function renderToNative(rootViewId, targetNode, refInfo = {}, notUpdateStyle = false) {
  if (targetNode.meta.skipAddToDom) {
    return [];
  }
  if (!targetNode.meta.component) {
    throw new Error(`Specific tag is not supported yet: ${targetNode.tagName}`);
  }

  let style;
  let resultStyle;
  if (notUpdateStyle) {
    // No need to update CSS, use cache directly
    style = getCacheNodeStyle(targetNode.nodeId);
    resultStyle = style;
  } else {
    // Recalculate CSS styles style
    style = getElemCss(targetNode);
    // Merge styles style
    style = { ...style, ...targetNode.style };
    // CSS preprocessing
    getBeforeRenderToNative()();

    // style before merge inherit style
    const originStyle = Object.assign({}, style);

    if (targetNode.parentNode) {
      const parentNodeStyle = getCacheNodeStyle(targetNode.parentNode.nodeId);
      const styleAttributes = ['color', 'fontSize', 'fontWeight', 'fontFamily', 'fontStyle', 'textAlign', 'lineHeight'];

      styleAttributes.forEach((attribute) => {
        if (!isStyleNotEmpty(style[attribute]) && isStyleNotEmpty(parentNodeStyle[attribute])) {
          style[attribute] = parentNodeStyle[attribute];
        }
      });
    }

    // Cache css result
    setCacheNodeStyle(targetNode.nodeId, style);

    // style after merge inherit style
    resultStyle = isHippyTextNode(targetNode) ? style : originStyle;

    // use defaultNativeStyle later to avoid incorrect compute style from inherit node
    // in beforeRenderToNative hook
    if (targetNode.meta.component.defaultNativeStyle) {
      resultStyle = { ...targetNode.meta.component.defaultNativeStyle, ...resultStyle };
    }
  }
  // Translate to native node
  const nativeNode: NeedToTyped = {
    id: targetNode.nodeId,
    pId: (targetNode.parentNode?.nodeId) || rootViewId,
    name: targetNode.meta.component.name,
    props: {
      ...getNativeProps(targetNode),
      style: resultStyle,
    },
    tagName: targetNode.tagName,
  };

  processModalView(nativeNode);
  parseViewComponent(targetNode, nativeNode, resultStyle);
  parseTextInputComponent(targetNode, resultStyle);
  // Convert to real native event
  const eventNode: NeedToTyped = getEventNode(targetNode);
  let printedNode: NeedToTyped = undefined;
  // Add nativeNode attributes info for Element debugging
  if (isDev()) {
    // generate printedNode for debugging
    const listenerProp = {};
    if (eventNode && Array.isArray(eventNode.eventList)) {
      eventNode.eventList.forEach((eventListItem) => {
        const { name, listener, type } = eventListItem;
        type === EventHandlerType.ADD && Object.assign(listenerProp, { [name]: listener });
      });
    }
    // Add nativeNode attributes info for debugging
    (nativeNode.props as any).attributes = getTargetNodeAttributes(targetNode);
    Object.assign(printedNode = {}, nativeNode, refInfo);
    (printedNode as any).listeners = listenerProp;
  }
  // convert to translatedNode
  const translatedNode = [nativeNode, refInfo];
  return [translatedNode, eventNode, printedNode];
}

/**
 * Render Element with children to native
 * @param {number} rootViewId - root view id
 * @param {ViewNode} node - target node to be traversed
 * @param {Function} [callback] - function called on each traversing process
 * @param {Object} refInfo - referenceNode information
 * @returns {[]}
 */
function renderToNativeWithChildren(rootViewId: NeedToTyped, node: NeedToTyped, callback?: CallbackType, refInfo = {}) {
  const nativeLanguages: NeedToTyped = [];
  const eventLanguages: NeedToTyped = [];
  const printedLanguages: NeedToTyped = [];
  node.traverseChildren((targetNode: NeedToTyped, refInfo: NeedToTyped) => {
    const [nativeNode, eventNode, printedNode] = renderToNative(rootViewId, targetNode, refInfo);
    if (nativeNode) {
      nativeLanguages.push(nativeNode);
    }
    if (eventNode) {
      eventLanguages.push(eventNode);
    }
    if (printedNode) {
      printedLanguages.push(printedNode);
    }
    if (typeof callback === 'function') {
      callback(targetNode);
    }
  }, refInfo);
  return [nativeLanguages, eventLanguages, printedLanguages];
}

function isLayout(node: NeedToTyped, rootView: NeedToTyped) {
  if (node.nodeId === ROOT_VIEW_ID) {
    return true;
  }
  // Check the id is specific for rootView.
  if (isDev()) {
    if (!rootView) {
      warn('rootView option is necessary for new HippyVue()');
    }
    if (rootView.charAt(0) !== '#') {
      warn('rootView option must be unique ID selector start with # ');
    }
  }
  return node.id === rootView.slice(1 - rootView.length);
}

function insertChild(parentNode: ViewNode, childNode: ViewNode, refInfo = {}) {
  if (!parentNode || !childNode) {
    return;
  }
  if (childNode.meta.skipAddToDom) {
    return;
  }
  const app = getApp();
  if (!app) {
    return;
  }
  const { $options: { rootViewId, rootView } } = app;
  const renderRootNodeCondition = isLayout(parentNode, rootView) && !parentNode.isMounted;
  const renderOtherNodeCondition = parentNode.isMounted && !childNode.isMounted;
  // Render the root node or other nodes
  if (renderRootNodeCondition || renderOtherNodeCondition) {
    // Start real native work.
    const [nativeLanguages, eventLanguages, printedLanguages] = renderToNativeWithChildren(
      rootViewId,
      renderRootNodeCondition ? parentNode : childNode,
      (node: ViewNode) => {
        if (!node.isMounted) {
          node.isMounted = true;
        }
        preCacheNode(node, node.nodeId);
      },
      refInfo,
    );
    batchNodes.push({
      type: NODE_OPERATION_TYPES.createNode,
      nodes: nativeLanguages,
      eventNodes: eventLanguages,
      printedNodes: printedLanguages,
    });
    endBatch(app);
  }
}

function removeChild(parentNode: NeedToTyped, childNode: NeedToTyped) {
  if (!childNode || childNode.meta.skipAddToDom) {
    return;
  }
  childNode.isMounted = false;
  const app = getApp();
  const { $options: { rootViewId } } = app;
  const nativeNode =    {
    id: childNode.nodeId,
    pId: childNode.parentNode ? childNode.parentNode.nodeId : rootViewId,
  };
  const deleteNodeIds = [
    [
      nativeNode,
      {},
    ],
  ];
  const printedNodes = isDev() ? [nativeNode] : [];
  batchNodes.push({
    printedNodes,
    type: NODE_OPERATION_TYPES.deleteNode,
    nodes: deleteNodeIds,
    eventNodes: [],
  });
  endBatch(app);
}

function moveChild(parentNode: NeedToTyped, childNode: NeedToTyped, refInfo = {}) {
  if (parentNode?.meta && isFunction(parentNode.meta.removeChild)) {
    parentNode.meta.removeChild(parentNode, childNode);
  }
  if (!childNode || childNode.meta.skipAddToDom) {
    return;
  }
  if (refInfo && (refInfo as any).refId === childNode.nodeId) {
    // ref节点与childNode节点相同, 属于无效操作, 这里先过滤
    return;
  }
  const app = getApp();
  const { $options: { rootViewId } } = app;
  const nativeNode =  {
    id: childNode.nodeId,
    pId: childNode.parentNode ? childNode.parentNode.nodeId : rootViewId,
  };
  const moveNodeIds = [
    [
      nativeNode,
      refInfo,
    ],
  ];
  const printedNodes = isDev() ? [{ ...nativeNode, ...refInfo }] : [];
  batchNodes.push({
    printedNodes,
    type: NODE_OPERATION_TYPES.moveNode,
    nodes: moveNodeIds,
    eventNodes: [],
  });
  endBatch(app);
}

function updateEvent(parentNode: NeedToTyped) {
  if (!parentNode.isMounted) {
    return;
  }
  const app = getApp();
  const eventNode = getEventNode(parentNode);
  batchNodes.push({
    type: NODE_OPERATION_TYPES.updateEvent,
    nodes: [],
    eventNodes: [eventNode],
    printedNodes: [],
  });
  endBatch(app);
}

function updateChild(parentNode: NeedToTyped, notUpdateStyle = false) {
  if (!parentNode.isMounted) {
    return;
  }
  const app = getApp();
  const { $options: { rootViewId } } = app;
  const [nativeNode, eventNode, printedNode] = renderToNative(rootViewId, parentNode, {}, notUpdateStyle);
  if (nativeNode) {
    batchNodes.push({
      type: NODE_OPERATION_TYPES.updateNode,
      nodes: nativeNode ? [nativeNode] : [],
      eventNodes: eventNode ? [eventNode] : [],
      printedNodes: isDev() && printedNode ? [printedNode] : [],
    });
    endBatch(app);
  }
}

function updateWithChildren(parentNode: NeedToTyped) {
  if (!parentNode.isMounted) {
    return;
  }
  const app = getApp();
  const { $options: { rootViewId } } = app;
  const [nativeLanguages, eventLanguages, printedLanguages] = renderToNativeWithChildren(rootViewId, parentNode);
  batchNodes.push({
    type: NODE_OPERATION_TYPES.updateNode,
    nodes: nativeLanguages,
    eventNodes: eventLanguages,
    printedNodes: printedLanguages,
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
  updateEvent,
  moveChild,
  updateWithChildren,
  getElemCss,
};
