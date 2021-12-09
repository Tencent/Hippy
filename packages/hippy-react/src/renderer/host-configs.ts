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

import isEqual from 'fast-deep-equal';
import Document from '../dom/document-node';
import Element from '../dom/element-node';
import { unicodeToChar } from '../utils';
import { preCacheFiberNode, unCacheFiberNodeOnIdle } from '../utils/node';
import '@localTypes/global';
import {
  Type,
  Props,
  UpdatePayload,
  Context,
} from '../types';

function appendChild(parent: Element, child: Element): void {
  if (parent.childNodes.indexOf(child) >= 0) {
    parent.removeChild(child);
  }
  parent.appendChild(child);
}

function appendChildToContainer(container: any, child: Element): void {
  container.appendChild(child);
}

function appendInitialChild(parent: Element, child: Element) {
  parent.appendChild(child);
}

function commitMount() {}

function commitTextUpdate() {}

function commitUpdate(
  instance: any,
  updatePayload: any,
  type: string,
  oldProps: Props,
  newProps: Props,
  workInProgress: any,
): void {
  preCacheFiberNode(workInProgress, instance.nodeId);
  const updatePayloadPropList: string[] = Object.keys(updatePayload);
  if (updatePayloadPropList.length === 0) return;
  updatePayloadPropList.forEach(propKey => instance.setAttribute(propKey, updatePayload[propKey]));
}

function prepareUpdate(
  instance: Element,
  type: Type,
  oldProps: Props,
  newProps: Props,
): UpdatePayload {
  const updatePayload: {
    [key: string]: any;
  } = {};
  let hasFunctionProp = false;
  Object.keys(newProps).forEach((key: string) => {
    const oldPropValue = oldProps[key];
    const newPropValue = newProps[key];
    switch (key) {
      case 'children': {
        if (oldPropValue !== newPropValue
            && (typeof newPropValue === 'number'
                || typeof newPropValue === 'string'
            )) {
          updatePayload[key] = newPropValue;
        }
        break;
      }
      default: {
        if (typeof oldPropValue === 'function'
            && typeof newPropValue === 'function'
            && !isEqual(oldPropValue, newPropValue)
        ) {
          hasFunctionProp = true;
        } else if (!isEqual(oldPropValue, newPropValue)) {
          updatePayload[key] = newPropValue;
        }
      }
    }
  });
  const isUpdatePayloadEmpty = Object.keys(updatePayload).length === 0;
  if (isUpdatePayloadEmpty && hasFunctionProp) {
    /**
     * if updatePayload only has function property,
     * return empty object to trigger commitUpdate for updating fiberNode Cache
     */
    return {};
  }
  if (isUpdatePayloadEmpty) {
    /**
     * prepareUpdate returning null would not trigger commitUpdate
     */
    return null;
  }
  return updatePayload;
}

function createContainerChildSet() {}

function createInstance(
  type: Type,
  newProps: Props,
  rootContainerInstance: Document,
  currentHostContext: object,
  workInProgress: any,
): Element {
  const element = rootContainerInstance.createElement(type);
  Object.keys(newProps).forEach((attr) => {
    switch (attr) {
      case 'children':
        // Ignore children attribute
        break;
      case 'nativeName':
        element.meta.component.name = newProps.nativeName;
        break;
      default: {
        element.setAttribute(attr, newProps[attr]);
      }
    }
  });
  // only HostComponent (5) or Fragment (7) rendered to native
  if ([5, 7].indexOf(workInProgress.tag) < 0) {
    element.meta.skipAddToDom = true;
  }
  preCacheFiberNode(workInProgress, element.nodeId);
  return element;
}

function createTextInstance(
  newText: string,
  rootContainerInstance: Document,
  hostContext: object,
  workInProgress: any,
): Element {
  const element = rootContainerInstance.createElement('p');
  element.setAttribute('text', unicodeToChar(newText));
  element.meta = {
    component: {
      name: 'Text',
    },
  };
  preCacheFiberNode(workInProgress, element.nodeId);
  return element;
}

function finalizeInitialChildren(): boolean {
  return true;
}

function finalizeContainerChildren() {}

function getPublicInstance(instance: Element): Element {
  return instance;
}

function insertBefore(
  parent: Element,
  child: Element,
  beforeChild: Element,
): void {
  if (parent.childNodes.indexOf(child) >= 0) {
    // move it if the node has existed
    parent.moveChild(child, beforeChild);
  } else {
    parent.insertBefore(child, beforeChild);
  }
}

function prepareForCommit() {
  return null;
}

function replaceContainerChildren() {}

function removeChild(parent: Element, child: Element): void {
  parent.removeChild(child);
  unCacheFiberNodeOnIdle(child);
}

function removeChildFromContainer(parent: Element, child: Element): void {
  parent.removeChild(child);
  unCacheFiberNodeOnIdle(child);
}

function resetAfterCommit() {}

function resetTextContent() {
}

function getRootHostContext(): Context {
  return {};
}

function getChildHostContext(): Context {
  return {};
}

function shouldDeprioritizeSubtree(): boolean {
  return true;
}

function shouldSetTextContent(type: Type, nextProps: Props): boolean {
  if ((nextProps && nextProps.nativeName === 'Text') || ['p', 'span'].indexOf(type) !== -1) {
    const { children } = nextProps;
    return typeof children === 'string' || typeof children === 'number';
  }
  return false;
}

function hideInstance(instance: Element): void {
  const updatePayload = { style: { display: 'none' } } as any;
  Object.keys(updatePayload).forEach(attr => instance.setAttribute(attr, updatePayload[attr]));
}

function hideTextInstance(): void {
  throw new Error('Not yet implemented.');
}

function unhideInstance(instance: Element, props: Props): void {
  const updatePayload = { ...props, style: { ...props.style, display: 'flex' } };
  Object.keys(updatePayload).forEach(attr => instance.setAttribute(attr, updatePayload[attr]));
}

function clearContainer(): void {
  // TODO Implement this in future
  // UIManager does not expose a "remove all" type method.
}

function unhideTextInstance(): void {
  throw new Error('Not yet implemented.');
}

function getFundamentalComponentInstance() {
  throw new Error('Not yet implemented.');
}

function mountFundamentalComponent() {
  throw new Error('Not yet implemented.');
}

function shouldUpdateFundamentalComponent() {
  throw new Error('Not yet implemented.');
}

function updateFundamentalComponent() {
  throw new Error('Not yet implemented.');
}

function unmountFundamentalComponent() {
  throw new Error('Not yet implemented.');
}

function getInstanceFromNode() {
  throw new Error('Not yet implemented.');
}

function isOpaqueHydratingObject(): boolean {
  throw new Error('Not yet implemented');
}

function makeOpaqueHydratingObject(): String {
  throw new Error('Not yet implemented.');
}

function makeClientId(): String {
  throw new Error('Not yet implemented');
}

function makeClientIdInDEV(): String {
  throw new Error('Not yet implemented');
}

function beforeActiveInstanceBlur() {
  // noop
}

function afterActiveInstanceBlur() {
  // noop
}

function preparePortalMount(): void {
  // noop
}

export const scheduleTimeout = setTimeout;
export const cancelTimeout = clearTimeout;

export {
  afterActiveInstanceBlur,
  appendChild,
  appendChildToContainer,
  appendInitialChild,
  beforeActiveInstanceBlur,
  commitMount,
  commitTextUpdate,
  commitUpdate,
  clearContainer,
  createContainerChildSet,
  createInstance,
  createTextInstance,
  finalizeContainerChildren,
  finalizeInitialChildren,
  getChildHostContext,
  getPublicInstance,
  getInstanceFromNode,
  getFundamentalComponentInstance,
  getRootHostContext,
  hideInstance,
  hideTextInstance,
  insertBefore,
  isOpaqueHydratingObject,
  makeClientId,
  makeClientIdInDEV,
  makeOpaqueHydratingObject,
  mountFundamentalComponent,
  prepareForCommit,
  preparePortalMount,
  prepareUpdate,
  replaceContainerChildren,
  removeChild,
  removeChildFromContainer,
  resetAfterCommit,
  resetTextContent,
  unmountFundamentalComponent,
  updateFundamentalComponent,
  unhideTextInstance,
  unhideInstance,
  shouldDeprioritizeSubtree,
  shouldUpdateFundamentalComponent,
  shouldSetTextContent,
};
