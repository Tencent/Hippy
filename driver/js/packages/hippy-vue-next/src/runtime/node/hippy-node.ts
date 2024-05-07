/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2022 THL A29 Limited, a Tencent company.
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
import type { CallbackType, NativeNode, NativeNodeProps, SsrNode } from '../../types';
import { getUniqueId, DEFAULT_ROOT_ID } from '../../util';
import { getHippyCachedInstance } from '../../util/instance';
import { findNotToSkipNode, preCacheNode, RelativeToRefType } from '../../util/node';
import type { TagComponent } from '../component';
import { IS_PROD } from '../../config';
import { HippyEventTarget } from '../event/hippy-event-target';
import {
  renderInsertChildNativeNode,
  renderRemoveChildNativeNode,
  renderUpdateChildNativeNode,
  renderMoveChildNativeNode,
  renderUpdateChildNativeEvent,
} from '../render';
import { EventHandlerType } from '../../util/event';

// NodeType, same with vue
export enum NodeType {
  ElementNode = 1, // element node
  TextNode = 3, // text node
  CommentNode = 8, // comment node
  DocumentNode = 4, // document node
}

export type convertToNativeNodesReturnedVal = [
  nativeLanguages: HippyTypes.TranslatedNodes[],
  eventLanguages: HippyTypes.EventNode[],
  printedLanguages: HippyTypes.PrintedNode[]
];

/**
 * whether it needs to be inserted into the native node tree
 * @param nodeType - node type
 */
function needInsertToNative(nodeType: NodeType): boolean {
  return nodeType === NodeType.ElementNode;
}

/**
 * getEventNode - translate event info event node.
 * @param targetNode
 */
function getEventNode(targetNode: HippyNode): HippyTypes.EventNode {
  let eventNode;
  const eventsAttributes = targetNode.events;
  if (eventsAttributes) {
    const eventList: HippyTypes.EventAttribute[] = [];
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
 * hippy node base class, including the basic Node operation methods
 * and attributes required to build a tree structure Node
 * inherited from the EventTarget class
 *
 * @public
 */
export class HippyNode extends HippyEventTarget {
  /**
   * get the unique node id, which is used to uniquely identify the terminal Native node
   */
  private static getUniqueNodeId(): number {
    return getUniqueId();
  }

  // whether it needs to be inserted into the native node tree
  public isNeedInsertToNative: boolean;

  // whether the node is mounted
  public isMounted = false;

  // node id
  public nodeId: number;

  // node type
  public nodeType: NodeType;

  // events map
  public events: NativeNodeProps = {};

  // child nodes
  public childNodes: HippyNode[] = [];

  // parent node
  public parentNode: HippyNode | null = null;

  // previous sibling
  public prevSibling: HippyNode | null = null;

  // next sibling
  public nextSibling: HippyNode | null = null;

  // native component information corresponding to the node
  protected tagComponent: TagComponent | null = null;

  constructor(nodeType: NodeType, ssrNode?: SsrNode) {
    super();
    // ssr node has already created node id in server side, we just used it
    this.nodeId = ssrNode?.id ?? HippyNode.getUniqueNodeId();
    this.nodeType = nodeType;
    this.isNeedInsertToNative = needInsertToNative(nodeType);

    // ssr node has been inserted to native, so we direct set isMounted true
    if (ssrNode?.id) {
      this.isMounted = true;
    }
  }

  /**
   * get the first child node
   */
  public get firstChild(): HippyNode | null {
    return this.childNodes.length ? this.childNodes[0] : null;
  }

  /**
   * get the last child node
   */
  public get lastChild(): HippyNode | null {
    const len = this.childNodes.length;
    return len ? this.childNodes[len - 1] : null;
  }

  /**
   * get the native component information corresponding to the node
   */
  public get component(): TagComponent {
    return this.tagComponent as TagComponent;
  }

  /**
   * get the index of this node in the sibling node, starting from zero
   */
  public get index(): number {
    let index = 0;

    if (this.parentNode) {
      // filter out nodes that do not need to be inserted
      const needInsertToNativeChildNodes: HippyNode[] = this.parentNode.childNodes
        .filter(node => node.isNeedInsertToNative);
      index = needInsertToNativeChildNodes.indexOf(this);
    }

    return index;
  }

  /**
   * whether the current node is the root node
   */
  public isRootNode(): boolean {
    return this.nodeId === DEFAULT_ROOT_ID;
  }

  /**
   * has child nodes or not, used for hydrate
   */
  public hasChildNodes(): boolean {
    return !!this.childNodes.length;
  }

  /**
   * Insert the node before the specified node
   *
   * @param rawChild - node to be added
   * @param rawAnchor - anchor node
   */
  public insertBefore(rawChild: HippyNode, rawAnchor: HippyNode | null): void {
    const child = rawChild;
    const anchor = rawAnchor;

    if (!child) {
      throw new Error('No child to insert');
    }

    // If there is no anchor node, it will be inserted at the end.
    // For the case of keep-alive components, when deactivated,
    // the node will be moved to the virtual container. At this time, the anchor is null, so appendChild is triggered.
    // The activation and deactivation of keep-alive nodes
    // are essentially implemented by calling the insert => insertBefore interface.
    // The active node is added under the actual node,
    // and the deactivated node is moved under the virtual container node
    if (!anchor) {
      this.appendChild(child);
      return;
    }

    if (child.parentNode && child.parentNode !== this) {
      // the child node to be inserted already has a parent node and will not be inserted
      throw new Error('Can not insert child, because the child node is already has a different parent');
    }

    // determine parent node
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let parentNode: HippyNode = this;
    if (anchor.parentNode !== this) {
      parentNode = anchor.parentNode as HippyNode;
    }

    // the index of the anchor node in the child node
    const index = parentNode.childNodes.indexOf(anchor);
    let notToSkipRefNode = anchor;
    // if it is text/comment(skipAddToDom) node, it cannot be the reference node
    if (!anchor.isNeedInsertToNative) {
      notToSkipRefNode = findNotToSkipNode(this.childNodes, index);
    }

    // modify node hierarchy
    child.parentNode = parentNode;
    child.nextSibling = anchor;
    child.prevSibling = parentNode.childNodes[index - 1];

    // If the previous sibling node exists, set the next sibling node of the previous node to child node
    if (parentNode.childNodes[index - 1]) {
      parentNode.childNodes[index - 1].nextSibling = child;
    }
    // set the previous sibling of the anchor node
    anchor.prevSibling = child;
    // insert the node
    parentNode.childNodes.splice(index, 0, child);

    if (!notToSkipRefNode.isNeedInsertToNative) {
      this.insertChildNativeNode(child);
      return;
    }

    // call the native interface to insert a node
    this.insertChildNativeNode(
      child,
      { refId: notToSkipRefNode.nodeId, relativeToRef: RelativeToRefType.BEFORE },
    );
  }

  /**
   * move child node before specified node
   *
   * @param rawChild - child node that needs to be moved
   * @param rawAnchor - anchor node
   */
  // eslint-disable-next-line complexity
  public moveChild(rawChild: HippyNode, rawAnchor: HippyNode | null): void {
    const child = rawChild;
    const anchor = rawAnchor;

    if (!child) {
      throw new Error('No child to move');
    }

    // If there is no anchor node, it will be inserted at the end.
    if (!anchor) {
      this.appendChild(child);
      return;
    }

    if (anchor.parentNode && anchor.parentNode !== this) {
      // The child node to be inserted already has a parent node and will not be moved
      throw new Error('Can not move child, because the anchor node is already has a different parent');
    }

    if (child.parentNode && child.parentNode !== this) {
      throw new Error('Can\'t move child, because it already has a different parent');
    }

    const oldIndex = this.childNodes.indexOf(child);
    const anchorIndex = this.childNodes.indexOf(anchor);
    let notToSkipRefNode = anchor;
    // if it is text/comment(skipAddToDom) node, it cannot be the reference node
    if (!anchor.isNeedInsertToNative) {
      notToSkipRefNode = findNotToSkipNode(this.childNodes, anchorIndex);
    }
    // same location, no need to move
    if (anchorIndex === oldIndex) {
      return;
    }

    // reset sibling relationship
    child.nextSibling = anchor;
    child.prevSibling = anchor.prevSibling;
    anchor.prevSibling = child;

    // new location sibling relationship update
    if (this.childNodes[anchorIndex - 1]) {
      this.childNodes[anchorIndex - 1].nextSibling = child;
    }
    if (this.childNodes[anchorIndex + 1]) {
      this.childNodes[anchorIndex + 1].prevSibling = child;
    }

    // old location sibling relationship update
    if (this.childNodes[oldIndex - 1]) {
      this.childNodes[oldIndex - 1].nextSibling = this.childNodes[oldIndex + 1];
    }
    if (this.childNodes[oldIndex + 1]) {
      this.childNodes[oldIndex + 1].prevSibling = this.childNodes[oldIndex - 1];
    }

    // move old node first
    this.childNodes.splice(oldIndex, 1);
    // find the new position to insert
    const newIndex = this.childNodes.indexOf(anchor);
    // insert new node
    this.childNodes.splice(newIndex, 0, child);
    if (!notToSkipRefNode.isNeedInsertToNative) {
      this.insertChildNativeNode(child);
      return;
    }
    // call the Native interface to insert node
    this.moveChildNativeNode(
      child,
      { refId: notToSkipRefNode.nodeId, relativeToRef: RelativeToRefType.BEFORE },
    );
  }

  /**
   * append child node
   *
   * @param rawChild - child node to be added
   * @param isHydrate - is hydrate operate or not
   */
  public appendChild(rawChild: HippyNode, isHydrate = false): void {
    const child = rawChild;

    if (!child) {
      throw new Error('No child to append');
    }

    // if childNode is the same as the last child, skip appending
    if (this.lastChild === child) return;
    // If the node to be added has a parent node and
    // the parent node is not the current node, remove it from the container first
    // In the case of keep-alive, the node still exists and will be moved to the virtual container
    if (child.parentNode && child.parentNode !== this) {
      child.parentNode.removeChild(child);
      return;
    }

    // If the node is already mounted, remove it first, but do not remove when is hydrate.
    // Because hydrate node just rendered in native, but do not add to hippy node list
    if (child.isMounted && !isHydrate) {
      this.removeChild(child);
    }

    // save the parent node of the node
    child.parentNode = this;

    // modify the pointer of the last child
    if (this.lastChild) {
      child.prevSibling = this.lastChild;
      this.lastChild.nextSibling = child;
    }

    // add node
    this.childNodes.push(child);

    if (!isHydrate) {
      // call the native interface to insert a node
      this.insertChildNativeNode(child);
    } else {
      // for hydrate case, node has been inserted to native. so we do not need to insert to native
      // just pre cache the node
      preCacheNode(child, child.nodeId);
    }
  }

  /**
   * remove child node
   *
   * @param rawChild - child node to be removed
   */
  public removeChild(rawChild: HippyNode): void {
    const child = rawChild;

    if (!child) {
      throw new Error('Can\'t remove child.');
    }

    if (!child.parentNode) {
      throw new Error('Can\'t remove child, because it has no parent.');
    }

    if (child.parentNode !== this) {
      // If the current container is not the parent node of the node to be deleted,
      // call the delete method of the parent node of the node to be deleted
      // The main consideration here is that in the case of keep-alive,
      // deleting a node is to remove the node from the actual container
      // and cache it in the virtual keep-alive component,
      // so "this" is the virtual container at this time,
      // not the actual container, so it is necessary to call the node the actual parentNode to remove the current node
      child.parentNode.removeChild(child);
      return;
    }

    if (!child.isNeedInsertToNative) {
      return;
    }

    // fix the relationship of sibling nodes
    if (child.prevSibling) {
      child.prevSibling.nextSibling = child.nextSibling;
    }
    if (child.nextSibling) {
      child.nextSibling.prevSibling = child.prevSibling;
    }

    // In theory, the parent node of the child node should be removed,
    // but this will result in repeated insertion of the node
    // child.parentNode = null;

    // sever the relationship of the node to be deleted from other nodes
    child.prevSibling = null;
    child.nextSibling = null;

    // find the index
    const index = this.childNodes.indexOf(child);
    // remove the node
    this.childNodes.splice(index, 1);

    // call the Native interface to remove node
    this.removeChildNativeNode(child);
  }

  /**
   * Find child nodes that match a given condition
   *
   * @param condition - condition callback
   */
  public findChild(condition: CallbackType): HippyNode | null {
    // determine whether the current node meets the conditions
    const yes = condition(this);

    if (yes) {
      return this;
    }

    if (this.childNodes.length) {
      for (const childNode of this.childNodes) {
        const targetChild = this.findChild.call(childNode, condition);
        if (targetChild) {
          return targetChild;
        }
      }
    }

    return null;
  }

  /**
   * Traverse all child nodes including its own node and execute the incoming callback
   *
   * @param callback - callback
   */
  public eachNode(callback: CallbackType): void {
    // call back the node itself first
    if (callback) {
      callback(this);
    }

    // execute callback for child node traversal
    if (this.childNodes.length) {
      this.childNodes.forEach((child) => {
        this.eachNode.call(child, callback);
      });
    }
  }

  /**
   * insert native node
   *
   * @param child - to be inserted node
   */
  public insertChildNativeNode(child: HippyNode, refInfo: HippyTypes.ReferenceInfo = {}): void {
    if (!child || !child.isNeedInsertToNative) return;

    const renderRootNodeCondition = this.isRootNode() && !this.isMounted;
    const renderOtherNodeCondition = this.isMounted && !child.isMounted;

    if (renderRootNodeCondition || renderOtherNodeCondition) {
      // Determine parentNode node based on rendering conditions
      const parentNode = renderRootNodeCondition ? this : child;

      // if the root node is not rendered on the screen, start rendering from the root node first
      // render the child node if the child node is not rendered
      renderInsertChildNativeNode(parentNode.convertToNativeNodes(true, refInfo));
      // update the isMounted flag
      parentNode.eachNode((rawNode: HippyNode) => {
        const node = rawNode;
        if (!node.isMounted && node.isNeedInsertToNative) {
          node.isMounted = true;
        }
        // cache the nodes inserted into the native to improve the search speed
        preCacheNode(node, node.nodeId);
      });
    }
  }

  /**
   * move native node
   *
   * @param child - to be removed node
   */
  // eslint-disable-next-line class-methods-use-this
  public moveChildNativeNode(child: HippyNode, refInfo: HippyTypes.ReferenceInfo = {}): void {
    if (!child || !child.isNeedInsertToNative) {
      return;
    }
    if (refInfo && refInfo.refId === child.nodeId) {
      // ref节点与childNode节点相同, 属于无效操作, 这里先过滤
      return;
    }
    const toMoveNode = child;
    renderMoveChildNativeNode(toMoveNode.convertToNativeNodes(false, refInfo));
  }

  /**
   * remove native node
   *
   * @param child - to be removed node
   */
  // eslint-disable-next-line class-methods-use-this
  public removeChildNativeNode(child: HippyNode): void {
    if (!child || !child.isNeedInsertToNative) return;
    const toRemoveNode = child;
    if (toRemoveNode.isMounted) {
      // update the isMounted flag
      toRemoveNode.isMounted = false;
      renderRemoveChildNativeNode(toRemoveNode.convertToNativeNodes(false, {}));
    }
  }

  /**
   * update native node
   *
   * @param isIncludeChildren - whether to update all descendant nodes at the same time
   */
  public updateNativeNode(isIncludeChildren = false): void {
    // nodes that are not inserted into Native do not need to be processed
    if (!this.isMounted) {
      return;
    }

    // get native nodes
    const updateNodes: convertToNativeNodesReturnedVal = this.convertToNativeNodes(isIncludeChildren, {});
    renderUpdateChildNativeNode(updateNodes);
  }

  /**
   * update native event
   */
  public updateNativeEvent(): void {
    // nodes that are not inserted into Native do not need to be processed
    if (!this.isMounted) {
      return;
    }

    // get event nodes
    const eventNode = getEventNode(this);
    renderUpdateChildNativeEvent(eventNode);
  }

  /**
   * get native nodes
   * @param isIncludeChild - whether to update all descendant nodes at the same time
   * @param refInfo - reference information
   * @param extraAttributes - extra attributes
   */
  public convertToNativeNodes(
    isIncludeChild: boolean,
    refInfo: HippyTypes.ReferenceInfo = {},
    extraAttributes?: Partial<NativeNode>,
  ): convertToNativeNodesReturnedVal {
    // If the node does not need to be inserted into native, return directly
    if (!this.isNeedInsertToNative) {
      return [[], [], []];
    }

    // need update all descendant nodes at the same time
    if (isIncludeChild) {
      const nativeNodes: HippyTypes.TranslatedNodes[] = [];
      const eventNodes: HippyTypes.EventNode[] = [];
      const printedNodes: HippyTypes.PrintedNode[] = [];
      // Convert to real native event   // recursively transform each node
      this.eachNode((targetNode: HippyNode) => {
        const [nativeChildNodes, eventChildNodes, printedChildNodes] = targetNode.convertToNativeNodes(false, refInfo);
        if (Array.isArray(nativeChildNodes) && nativeChildNodes.length) {
          nativeNodes.push(...nativeChildNodes);
        }
        if (Array.isArray(eventChildNodes) && eventChildNodes.length) {
          eventNodes.push(...eventChildNodes);
        }
        if (Array.isArray(printedChildNodes) && printedChildNodes.length) {
          printedNodes.push(...printedChildNodes);
        }
      });
      return [nativeNodes, eventNodes, printedNodes];
    }

    // If the node does not have a component attribute,
    // it means that the component has not been registered and an error needs to be thrown
    if (!this.component) {
      throw new Error('tagName is not supported yet');
    }

    const { rootViewId } = getHippyCachedInstance();
    const attributes = extraAttributes ?? {};
    const nativeNode =  {
      id: this.nodeId,
      pId: this.parentNode?.nodeId ?? rootViewId,
      ...attributes,
    };
    // Convert to real native event
    const eventNode = getEventNode(this);
    let printedNode: HippyTypes.PrintedNode = undefined;
    // hack in dev environment, added properties for chrome inspector debugging
    if (!IS_PROD) {
      // generate printedNode for debugging
      const listenerProp = {};
      if (eventNode && Array.isArray(eventNode.eventList)) {
        eventNode.eventList.forEach((eventListItem) => {
          const { name, listener, type } = eventListItem;
          type === EventHandlerType.ADD && Object.assign(listenerProp, { [name]: listener });
        });
      }
      Object.assign(printedNode = {}, nativeNode, refInfo);
      printedNode.listeners = listenerProp;
    }
    // convert to translatedNode
    const translatedNode: HippyTypes.TranslatedNodes = [nativeNode, refInfo];
    return [
      [translatedNode],
      [eventNode],
      [printedNode],
    ];
  }
}
