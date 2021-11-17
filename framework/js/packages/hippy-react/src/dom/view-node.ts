/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

import { insertChild, removeChild } from '../renderer/render';
import '../../../types/global';

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
  private mounted = false;

  // Index number in children, will update at traverseChildren method.
  public index = 0;

  // Relation nodes.
  public childNodes: ViewNode[] = [];

  public parentNode: ViewNode | null = null;

  constructor() {
    // Virtual DOM node id, will used in native to identify.
    this.nodeId = getNodeId();
  }

  /* istanbul ignore next */
  toString() {
    return this.constructor.name;
  }

  get isMounted() {
    return this.mounted;
  }

  set isMounted(isMounted: boolean) {
    // TODO: Maybe need validation, maybe not.
    this.mounted = isMounted;
  }

  insertBefore(childNode: ViewNode, referenceNode: ViewNode) {
    if (!childNode) {
      throw new Error('Can\'t insert child.');
    }
    if (childNode.meta.skipAddToDom) {
      return;
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
    childNode.parentNode = this;
    this.childNodes.splice(index, 0, childNode);
    return insertChild(this, childNode, index);
  }

  moveChild(childNode: ViewNode, referenceNode: ViewNode) {
    if (!childNode) {
      throw new Error('Can\'t move child.');
    }
    if (childNode.meta.skipAddToDom) {
      return;
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
    // return if the moved index is the same as the previous one
    if (referenceIndex === oldIndex) {
      return childNode;
    }
    // remove old child and insert new child, which is like moving child
    this.childNodes.splice(oldIndex, 1);
    removeChild(this, childNode, oldIndex);
    const newIndex = this.childNodes.indexOf(referenceNode);
    this.childNodes.splice(newIndex, 0, childNode);
    return insertChild(this, childNode, newIndex);
  }

  appendChild(childNode: ViewNode) {
    if (!childNode) {
      throw new Error('Can\'t append child.');
    }
    if (childNode.meta.skipAddToDom) {
      return;
    }
    if (childNode.parentNode && childNode.parentNode !== this) {
      throw new Error('Can\'t append child, because it already has a different parent.');
    }
    childNode.parentNode = this;
    this.childNodes.push(childNode);
    insertChild(this, childNode, this.childNodes.length - 1);
  }

  removeChild(childNode: ViewNode) {
    if (!childNode) {
      throw new Error('Can\'t remove child.');
    }
    if (childNode.meta.skipAddToDom) {
      return;
    }
    if (!childNode.parentNode) {
      throw new Error('Can\'t remove child, because it has no parent.');
    }
    if (childNode.parentNode !== this) {
      throw new Error('Can\'t remove child, because it has a different parent.');
    }
    const index = this.childNodes.indexOf(childNode);
    this.childNodes.splice(index, 1);
    removeChild(this, childNode, index);
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
   * @param callback - callback function
   * @param newIndex - index to be updated
   */
  traverseChildren(callback: Function, newIndex: number | undefined = 0) {
    this.index = !this.parentNode ? 0 : newIndex;
    callback(this);
    // Find the children
    if (this.childNodes.length) {
      this.childNodes.forEach((childNode, index) => {
        this.traverseChildren.call(childNode, callback, index);
      });
    }
  }
}

export default ViewNode;
