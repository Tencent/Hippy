/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

/**
 * Implement the operation method of el in the Vue3 custom renderer
 */
import type { HippyComment } from './runtime/comment/hippy-comment';
import { HippyDocument } from './runtime/document/hippy-document';
import type { HippyElement } from './runtime/element/hippy-element';
import type { HippyNode } from './runtime/node/hippy-node';
import type { HippyText } from './runtime/text/hippy-text';
import { unCacheNodeOnIdle } from './util/node-cache';

/**
 * Insert the node at the specified position
 *
 * @param child - child node
 * @param parent - parent node
 * @param anchor - anchor node
 */
function insert(
  child: HippyNode,
  parent: HippyNode,
  anchor: HippyNode | null = null,
): void {
  if (parent.childNodes.indexOf(child) >= 0) {
    // Move node if node already exists
    parent.moveChild(child, anchor);
  } else {
    // Insert the node at the anchor position
    parent.insertBefore(child, anchor);
  }
}

/**
 * remove the specified child node
 *
 * @param child - child node
 */
function remove(child: HippyNode): void {
  const parent: HippyNode | null = child.parentNode;

  if (parent) {
    parent.removeChild(child);
    // 移除节点时，也将缓存的节点移除
    unCacheNodeOnIdle(child);
  }
}

/**
 * create Element node
 *
 * @param name - tag name
 */
function createElement(name: string): HippyElement {
  return HippyDocument.createElement(name);
}

/**
 * create text node
 *
 * @param text - text content
 */
function createText(text: string): HippyText {
  return HippyDocument.createTextNode(text);
}

/**
 * create comment node
 *
 * @param text - comment content
 */
function createComment(text: string): HippyComment {
  return HippyDocument.createComment(text);
}

/**
 * set the text content
 *
 * @param node - the node to be set text content
 * @param text - text content
 */
function setText(node: HippyText, text: string): void {
  node.setText(text);
}

/**
 * Set the text attribute of the element node
 *
 * @param element - the element node to be set text attribute
 * @param text - text content
 */
function setElementText(element: HippyElement, text: string): void {
  element.setText(text);
}

/**
 * return the parent node
 *
 * @param node - target node
 */
function parentNode(node: HippyNode): HippyNode | null {
  return node.parentNode;
}

/**
 * return next sibling node
 *
 * @param node - target node
 */
function nextSibling(node: HippyNode): HippyNode | null {
  return node.nextSibling;
}

export const nodeOps = {
  insert,
  remove,
  setText,
  setElementText,
  createElement,
  createComment,
  createText,
  parentNode,
  nextSibling,
};
