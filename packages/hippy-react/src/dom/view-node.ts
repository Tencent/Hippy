/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

import { insertChild, removeChild } from '../renderer/render';
import '../../../../types/global';

let currentNodeId: number = 0;
function getNodeId() {
  currentNodeId += 1;
  // currentNodeId % 10 === 0 is rootView
  // It's a limitation of iOS SDK.
  if (currentNodeId % 10 === 0) {
    currentNodeId += 1;
  }
  return currentNodeId;
}

interface NodeMeta {
  skipAddToDom?: boolean;
  component: {
    name?: string;
    skipAddToDom?: boolean;
  };
}

class ViewNode {
  public nodeId: number;

  // Component meta information, such as native component will use.
  public meta: NodeMeta = {
    component: {},
  };

  // Will change to be true after insert into Native dom.
  private _isMounted = false;

  // Index number in children, will update at traverseChildren method.
  public index = 0;

  // Relation nodes.
  public childNodes: ViewNode[] = [];

  public parentNode: ViewNode | null = null;

  public prevSibling: ViewNode | null = null;

  public nextSibling: ViewNode | null = null;

  constructor() {
    // Virtual DOM node id, will used in native to identify.
    this.nodeId = getNodeId();
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

  get isMounted() {
    return this._isMounted;
  }

  set isMounted(isMounted) {
    // TODO: Maybe need validation, maybe not.
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

    referenceNode.prevSibling = childNode;
    this.childNodes.splice(index, 0, childNode);

    return insertChild(this, childNode, index);
  }

  moveChild(childNode: ViewNode, referenceNode: ViewNode) {
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

  appendChild(childNode: ViewNode) {
    if (!childNode) {
      throw new Error('Can\'t append child.');
    }

    if (childNode.parentNode && childNode.parentNode !== this) {
      throw new Error(
        'Can\'t append child, because it already has a different parent.',
      );
    }

    childNode.parentNode = this;

    if (this.lastChild) {
      childNode.prevSibling = this.lastChild;
      this.lastChild.nextSibling = childNode;
    }

    this.childNodes.push(childNode);

    insertChild(this, childNode, this.childNodes.length - 1);
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

    removeChild(this, childNode);

    // FIXME: parentNode should be null when removeChild, But it breaks add the node again.
    //        Issue position: https://github.com/vuejs/vue/tree/master/src/core/vdom/patch.js#L250
    // childNode.parentNode = null;

    if (childNode.prevSibling) {
      childNode.prevSibling.nextSibling = childNode.nextSibling;
      childNode.prevSibling = null;
    }

    if (childNode.nextSibling) {
      childNode.nextSibling.prevSibling = childNode.prevSibling;
      childNode.nextSibling = null;
    }

    this.childNodes = this.childNodes.filter(node => node !== childNode);
  }

  /**
   * Find a specific target with condition
   */
  findChild(condition: Function): ViewNode | null {
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
  traverseChildren(callback: Function) {
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
