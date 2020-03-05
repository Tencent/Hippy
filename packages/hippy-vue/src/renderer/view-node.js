/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

import { insertChild, removeChild } from './native';

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

class ViewNode {
  constructor() {
    // Point to root document element.
    this._ownerDocument = null;

    // Component meta information, such as native component will use.
    this._meta = null;

    // Will change to be true after insert into Native dom.
    this._isMounted = false;

    // Virtual DOM node id, will used in native to identify.
    this.nodeId = getNodeId();

    // Index number in children, will update at traverseChildren method.
    this.index = 0;

    // Relation nodes.
    this.childNodes = [];
    this.parentNode = null;
    this.prevSibling = null;
    this.nextSibling = null;
  }

  /* istanbul ignore next */
  toString() {
    return this.constructor.name;
  }

  get firstChild() {
    return this.childNodes.length ? this.childNodes[0] : null;
  }

  get lastChild() {
    return this.childNodes.length
      ? this.childNodes[this.childNodes.length - 1]
      : null;
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

    let el = this;
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
    // TODO: Maybe need validation, maybe not.
    this._isMounted = isMounted;
  }

  insertBefore(childNode, referenceNode) {
    if (!childNode) {
      throw new Error('Can\'t insert child.');
    }

    if (!referenceNode) {
      return this.appendChild(childNode);
    }

    if (referenceNode.parentNode !== this) {
      throw new Error(
        'Can\'t insert child, because the reference node has a different parent.',
      );
    }

    if (childNode.parentNode && childNode.parentNode !== this) {
      throw new Error(
        'Can\'t insert child, because it already has a different parent.',
      );
    }

    const index = this.childNodes.indexOf(referenceNode);

    childNode.parentNode = this;
    childNode.nextSibling = referenceNode;
    childNode.prevSibling = this.childNodes[index - 1];

    // update previous node's nextSibling to prevent patch bug
    if (this.childNodes[index - 1]) {
      this.childNodes[index - 1].nextSibling = childNode;
    }

    referenceNode.prevSibling = childNode;
    this.childNodes.splice(index, 0, childNode);

    return insertChild(this, childNode, index);
  }

  moveChild(childNode, referenceNode) {
    if (!childNode) {
      throw new Error('Can\'t mvoe child.');
    }

    if (!referenceNode) {
      return this.appendChild(childNode);
    }

    if (referenceNode.parentNode !== this) {
      throw new Error(
        'Can\'t move child, because the reference node has a different parent.',
      );
    }

    if (childNode.parentNode && childNode.parentNode !== this) {
      throw new Error(
        'Can\'t move child, because it already has a different parent.',
      );
    }

    const oldIndex = this.childNodes.indexOf(childNode);
    const newIndex = this.childNodes.indexOf(referenceNode);

    // return if the moved index is the same as the previous one
    if (newIndex === oldIndex) {
      return childNode;
    }

    // set new siblings relations
    childNode.nextSibling = referenceNode;
    childNode.prevSibling = referenceNode.prevSibling;
    referenceNode.prevSibling = childNode;

    if (this.childNodes[newIndex - 1]) {
      this.childNodes[newIndex - 1].nextSibling = childNode;
    }
    if (this.childNodes[newIndex + 1]) {
      this.childNodes[newIndex + 1].prevSibling = childNode;
    }
    if (this.childNodes[oldIndex - 1]) {
      this.childNodes[oldIndex - 1].nextSibling = this.childNodes[oldIndex + 1];
    }
    if (this.childNodes[oldIndex + 1]) {
      this.childNodes[oldIndex + 1].prevSibling = this.childNodes[oldIndex - 1];
    }

    // remove old child node from native
    removeChild(this, childNode);

    // remove old child and insert new child, which is like moving child
    this.childNodes.splice(newIndex, 0, childNode);
    this.childNodes.splice(oldIndex + (newIndex < oldIndex ? 1 : 0), 1);

    // should filter empty nodes before finding the index of node
    const atIndex = this.childNodes.filter(ch => ch.index > -1).indexOf(childNode);
    return insertChild(this, childNode, atIndex);
  }

  appendChild(childNode) {
    if (!childNode) {
      throw new Error('Can\'t append child.');
    }

    if (childNode.parentNode && childNode.parentNode !== this) {
      throw new Error(
        'Can\'t append child, because it already has a different parent.',
      );
    }

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

    insertChild(this, childNode, this.childNodes.length - 1);
  }

  removeChild(childNode) {
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

    removeChild(this, childNode);

    // FIXME: parentNode should be null when removeChild, But it breaks add the node again.
    //        Issue position: https://github.com/vuejs/vue/tree/master/src/core/vdom/patch.js#L250
    // childNode.parentNode = null;

    if (childNode.prevSibling) {
      childNode.prevSibling.nextSibling = childNode.nextSibling;
    }

    if (childNode.nextSibling) {
      childNode.nextSibling.prevSibling = childNode.prevSibling;
    }

    childNode.prevSibling = null;
    childNode.nextSibling = null;
    this.childNodes = this.childNodes.filter(node => node !== childNode);
  }

  /**
   * Find a specific target with condition
   */
  findChild(condition) {
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
  traverseChildren(callback) {
    // Find the index and apply callback
    let index;
    if (this.parentNode) {
      index = this.parentNode.childNodes.filter(node => !node.meta.skipAddToDom).indexOf(this);
    } else {
      index = 0;
    }
    this.index = index;
    callback(this);

    // Find the children
    if (this.childNodes.length) {
      this.childNodes.forEach((childNode) => {
        this.traverseChildren.call(childNode, callback);
      });
    }
  }
}

export default ViewNode;
