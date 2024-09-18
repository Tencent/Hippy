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

import document from '../renderer/document-node';
import { unCacheNodeOnIdle } from '../util/node';
import { NeedToTyped } from '../types/native';
import ElementNode from '../renderer/element-node';
import { setAttrs } from './modules/attrs';
import { setStyle } from './modules/style';
import { setClass } from './modules/class';
import { ROOT_VIEW_ID } from './constants';

const namespaceMap = {};

function setRootViewAttr(elm: ElementNode, vnode: NeedToTyped) {
  // If it is root container, Vue would not call createElement, which resulted in attributes missed to set.
  // So set root view attributes explicitly.
  let isRootView = false;
  if (elm.nodeId === ROOT_VIEW_ID) {
    isRootView = true;
  }
  if (isRootView) {
    setAttrs(vnode, elm, { notToNative: true });
    setStyle(vnode, elm, { notToNative: true });
    setClass(vnode, elm, { notToNative: true });
  }
}

function createElement(name: string, vnode: NeedToTyped) {
  const elm = document.createElement(name);
  setRootViewAttr(elm, vnode);
  return elm;
}

function createElementNS(namespace: string, name: string) {
  return document.createElementNS(namespace, name);
}

function createTextNode(text: string) {
  return document.createTextNode(text);
}

function createComment(text: string) {
  return document.createComment(text);
}

function insertBefore(pNode: NeedToTyped, newNode: NeedToTyped, referenceNode: NeedToTyped) {
  if (pNode.childNodes.indexOf(newNode) >= 0) {
    // move it if the node has existed
    pNode.moveChild(newNode, referenceNode);
  } else {
    pNode.insertBefore(newNode, referenceNode);
  }
}

function removeChild(node: ElementNode, child: ElementNode) {
  node.removeChild(child);
  unCacheNodeOnIdle(child);
}

function appendChild(node: ElementNode, child: ElementNode) {
  node.appendChild(child);
}

function parentNode(node: ElementNode) {
  return node.parentNode;
}

function nextSibling(node: ElementNode) {
  return node.nextSibling;
}

function tagName(elementNode: ElementNode) {
  return elementNode.tagName;
}

function setTextContent(node: ElementNode, text: string) {
  node.setText(text);
}

function setAttribute(node: ElementNode, key: string, val: NeedToTyped) {
  node.setAttribute(key, val);
}

function setStyleScope(node: ElementNode, styleScopeId: string) {
  // Just ignore it so far.
  node.setStyleScope(styleScopeId);
}

export {
  namespaceMap,
  createElement,
  createElementNS,
  createTextNode,
  createComment,
  insertBefore,
  removeChild,
  appendChild,
  parentNode,
  nextSibling,
  tagName,
  setTextContent,
  setAttribute,
  setStyleScope,
};
