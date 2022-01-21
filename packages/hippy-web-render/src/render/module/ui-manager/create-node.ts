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

import {
  EVENT_CHILD_NODE_WILL_INSERT,
  EVENT_NODE_WILL_INSERT,
  NodeData,
  NodeTag,
} from '../node-def';
import { refreshElementProps, setElementStyle } from '../../common';
import { createHippyView, baseInit, beforeMountCheck, onMounted } from '../../component/view';
import { ComponentMap } from '../dom-process';

let rootDom;
let contentDom;
export function UIManagerModuleCreateNode(rootViewId, data) {
  if (!rootDom) {
    rootDom = document.getElementsByTagName('body')[0];
  }
  if (!window.document.getElementById(rootViewId)) {
    contentDom = createRootElement(rootViewId);
    rootDom?.appendChild(contentDom);
  }
  for (let i = 1; i < data.length; i++) {
    for (let c = 0; c < data[i].length; c++) {
      const nodeItemData = data[i][c];
      const id = nodeItemData[NodeData.ID.valueOf()];
      const pId = nodeItemData[NodeData.PID.valueOf()];
      const index = nodeItemData[NodeData.INDEX.valueOf()];
      const tagName = nodeItemData[NodeData.NAME.valueOf()];
      const props = nodeItemData[NodeData.PROPS.valueOf()];
      componentFactory(id, pId, index, tagName, props, contentDom);
    }
  }
}

function componentFactory(
  id: number,
  pId: number,
  index: number,
  tagName: string,
  props: any,
  rootDom,
) {
  let realIndex = index;
  const parentElement = tagName === NodeTag.MODAL ? rootDom : document.getElementById(String(pId));
  const element = buildComponentInstanceByTag(tagName, id);
  preInitHook(element);
  ComponentMap[tagName]?.builder?.propsFilter?.(props);
  refreshElementProps(element, props, tagName as NodeTag, id);
  if (index > parentElement?.childNodes.length) {
    realIndex = parentElement?.childNodes.length;
  }
  willMountHook(element, parentElement, realIndex);
  parentElement.insertBefore(element, parentElement?.childNodes[realIndex] ?? null);
  mountedHook(element);
}
function willMountHook(element: HTMLElement, parentElement: HTMLElement, index: number) {
  element[EVENT_NODE_WILL_INSERT]?.(parentElement, index);
  parentElement[EVENT_CHILD_NODE_WILL_INSERT]?.(element, index);
  beforeMountCheck(element, parentElement);
}
function mountedHook(element: HTMLElement) {
  onMounted(element);
}
function preInitHook(element: HTMLElement) {
  baseInit(element);
}
function buildComponentInstanceByTag(tagName: string, id: number): HTMLElement {
  let element;
  const commonProps = {
    style: { display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 },
  };

  element = ComponentMap[tagName]?.builder?.create(id, commonProps);
  if (!element) {
    element = createHippyView();
  }
  element.id = id;
  return element;
}

function createRootElement(id: string) {
  const root = window.document.createElement('div');
  root.setAttribute('id', id);
  root.id = id;
  setElementStyle(root, {
    height: '100vh',
    overflow: 'hidden',
    display: 'flex',
    width: '100vw',
    flexDirection: 'column',
    position: 'relative',
  });
  return root;
}
