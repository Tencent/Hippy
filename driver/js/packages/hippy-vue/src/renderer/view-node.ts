/* eslint-disable @typescript-eslint/no-this-alias */
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

import { RelativeToRefType, findNotToSkipNode } from '../util/node';
import { insertChild, removeChild, moveChild } from '../native';
import { CallbackType, NeedToTyped } from '../types/native';

const ROOT_VIEW_ID = 0;
let currentNodeId = 0;
if (global.__GLOBAL__ && Number.isInteger(global.__GLOBAL__.nodeId)) {
  currentNodeId = global.__GLOBAL__.nodeId;
}

function getNodeId() {
  currentNodeId += 1;
  if (currentNodeId % 10 === 0) {
    currentNodeId += 1;
  }
  if (currentNodeId % 10 === ROOT_VIEW_ID) {
    currentNodeId += 1;
  }
  return currentNodeId;
}

export type Meta = {
  [key: string]: NeedToTyped;
};

class ViewNode {
  public childNodes: ViewNode[];
  public index: number;
  public nextSibling?: ViewNode;
  public nodeId: number;
  public parentNode?: ViewNode;
  public prevSibling?: ViewNode;
  protected _meta?: Meta;
  private _isMounted: boolean;
  private _ownerDocument: NeedToTyped;

  constructor() {
    // Point to root document element.
    this._ownerDocument = null;
    // Component meta information, such as native component will use.
    // Will change to be true after insert into Native dom.
    this._isMounted = false;
    // Virtual DOM node id, will be used in native to identify.
    this.nodeId = getNodeId();
    // Index number in children, will update at traverseChildren method.
    this.index = 0;
    // Relation nodes.
    this.childNodes = [];
  }

  /* istanbul ignore next */
  toString() {
    return this.constructor.name;
  }

  get firstChild() {
    return this.childNodes.length ? this.childNodes[0] : null;
  }

  get lastChild() {
    const len = this.childNodes.length;
    return len ? this.childNodes[len - 1] : null;
  }

  get meta() {
    if (!this._meta) {
      return {};
    }
    return this._meta;
  }

  /* istanbul ignore next */
  get ownerDocument() {
    if (this._ownerDocument) {
      return this._ownerDocument;
    }

    let el: any = this;
    while (el.constructor.name !== 'DocumentNode') {
      el = el.parentNode;
      if (!el) {
        break;
      }
    }
    this._ownerDocument = el;
    return el;
  }

  get isMounted() {
    return this._isMounted;
  }

  set isMounted(isMounted) {
    this._isMounted = isMounted;
  }

  insertBefore(childNode: ViewNode, referenceNode: ViewNode) {
    if (!childNode) {
      throw new Error('Can\'t insert child.');
    }
    if (!referenceNode) {
      return this.appendChild(childNode);
    }
    if (referenceNode.parentNode !== this) {
      throw new Error('Can\'t insert child, because the reference node has a different parent.');
    }
    if (childNode.parentNode && childNode.parentNode !== this) {
      throw new Error('Can\'t insert child, because it already has a different parent.');
    }
    const index = this.childNodes.indexOf(referenceNode);

    let notToSkipRefNode = referenceNode;
    // if it is text/comment(skipAddToDom) node, it cannot be the reference node
    if (referenceNode.meta.skipAddToDom) {
      notToSkipRefNode = findNotToSkipNode(this.childNodes, index);
    }

    childNode.parentNode = this;
    childNode.nextSibling = referenceNode;
    childNode.prevSibling = this.childNodes[index - 1];
    // update previous node's nextSibling to prevent patch bug
    if (this.childNodes[index - 1]) {
      this.childNodes[index - 1].nextSibling = childNode;
    }
    referenceNode.prevSibling = childNode;
    this.childNodes.splice(index, 0, childNode);

    if (notToSkipRefNode.meta.skipAddToDom) {
      // if childNodes cannot find non-skipAddToDom node as referenceNode,
      // use parentNode append it to the end.
      return insertChild(
        this,
        childNode,
      );
    }
    return insertChild(
      this,
      childNode,
      { refId: notToSkipRefNode.nodeId, relativeToRef: RelativeToRefType.BEFORE },
    );
  }

  moveChild(childNode: ViewNode, referenceNode: ViewNode) {
    if (!childNode) {
      throw new Error('Can\'t move child.');
    }
    if (!referenceNode) {
      return this.appendChild(childNode);
    }
    if (referenceNode.parentNode !== this) {
      throw new Error('Can\'t move child, because the reference node has a different parent.');
    }
    if (childNode.parentNode && childNode.parentNode !== this) {
      throw new Error('Can\'t move child, because it already has a different parent.');
    }
    const oldIndex = this.childNodes.indexOf(childNode);
    const referenceIndex = this.childNodes.indexOf(referenceNode);
    let notToSkipRefNode = referenceNode;
    // if it is text/comment(skipAddToDom) node, it cannot be the reference node
    if (referenceNode.meta.skipAddToDom) {
      notToSkipRefNode = findNotToSkipNode(this.childNodes, referenceIndex);
    }
    // return if the moved index is the same as the previous one
    if (referenceIndex === oldIndex) {
      return childNode;
    }
    // set new siblings relations
    childNode.nextSibling = referenceNode;
    childNode.prevSibling = referenceNode.prevSibling;
    referenceNode.prevSibling = childNode;
    if (this.childNodes[referenceIndex - 1]) {
      this.childNodes[referenceIndex - 1].nextSibling = childNode;
    }
    if (this.childNodes[referenceIndex + 1]) {
      this.childNodes[referenceIndex + 1].prevSibling = childNode;
    }
    if (this.childNodes[oldIndex - 1]) {
      this.childNodes[oldIndex - 1].nextSibling = this.childNodes[oldIndex + 1];
    }
    if (this.childNodes[oldIndex + 1]) {
      this.childNodes[oldIndex + 1].prevSibling = this.childNodes[oldIndex - 1];
    }
    this.childNodes.splice(oldIndex, 1);
    const newIndex = this.childNodes.indexOf(referenceNode);
    this.childNodes.splice(newIndex, 0, childNode);
    if (notToSkipRefNode.meta.skipAddToDom) {
      return insertChild(
        this,
        childNode,
      );
    }
    return moveChild(
      this,
      childNode,
      { refId: notToSkipRefNode.nodeId, relativeToRef: RelativeToRefType.BEFORE },
    );
  }

  appendChild(childNode: ViewNode) {
    if (!childNode) {
      throw new Error('Can\'t append child.');
    }
    if (childNode.parentNode && childNode.parentNode !== this) {
      throw new Error('Can\'t append child, because it already has a different parent.');
    }
    // if childNode is the same as the last child, skip appending
    if (this.lastChild === childNode) return;
    // remove childNode if exist
    if (childNode.isMounted) {
      this.removeChild(childNode);
    }
    childNode.parentNode = this;
    if (this.lastChild) {
      childNode.prevSibling = this.lastChild;
      this.lastChild.nextSibling = childNode;
    }
    this.childNodes.push(childNode);
    insertChild(
      this,
      childNode,
    );
  }

  removeChild(childNode: ViewNode) {
    if (!childNode) {
      throw new Error('Can\'t remove child.');
    }
    if (!childNode.parentNode) {
      throw new Error('Can\'t remove child, because it has no parent.');
    }
    if (childNode.parentNode !== this) {
      throw new Error('Can\'t remove child, because it has a different parent.');
    }
    if (childNode.meta.skipAddToDom) {
      return;
    }
    if (childNode.prevSibling) {
      childNode.prevSibling.nextSibling = childNode.nextSibling;
    }
    if (childNode.nextSibling) {
      childNode.nextSibling.prevSibling = childNode.prevSibling;
    }
    childNode.prevSibling = undefined;
    childNode.nextSibling = undefined;
    const index = this.childNodes.indexOf(childNode);
    this.childNodes.splice(index, 1);
    removeChild(this, childNode);
  }

  /**
   * Find a specific target with condition
   */
  public findChild(condition: CallbackType): ViewNode | null {
    const yes = condition(this);
    if (yes) {
      return this;
    }
    if (this.childNodes.length) {
      for (let i = 0; i < this.childNodes.length; i += 1) {
        const childNode = this.childNodes[i];
        const targetChild = this.findChild.call(childNode, condition);
        if (targetChild) {
          return targetChild;
        }
      }
    }
    return null;
  }

  /**
   * Traverse the children and execute callback
   */
  traverseChildren(callback: CallbackType, refInfo: NeedToTyped) {
    callback(this, refInfo);
    // Find the children
    if (this.childNodes.length) {
      this.childNodes.forEach((childNode: ViewNode) => {
        this.traverseChildren.call(childNode, callback, {});
      });
    }
  }
}

export default ViewNode;
