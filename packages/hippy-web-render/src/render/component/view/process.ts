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
  ProcessType,
  dispatchEventToHippy,
  buildCallBackProps,
  setElementStyle,
} from '../../common';
import { HIPPY_COMPONENT_METHOD, NodeProps, NodeTag, ORIGIN_TYPE } from '../../module/node-def';

export const CommonProps: ProcessType = {
  opacity: opacityProcess,
  onClick: onClickProcess,
  onLayout: onLayoutProcess,
  overflow: overflowProcess,
  onAttachedToWindow: onAttachedToWindowProcess,
  onTouchDown: onTouchDownProcess,
  onTouchMove: onTouchMoveProcess,
  onTouchEnd: onTouchEndProcess,
  onTouchCancel: onTouchCancelProcess,
};
export const HippyViewProps = 'viewProps';

export function initProps(el: HTMLElement) {
  el[HippyViewProps] = {};
  el[HIPPY_COMPONENT_METHOD] = {};
  el[ORIGIN_TYPE] = NodeTag.VIEW;
  el[HippyViewProps][NodeProps.ACCESSIBLE] = false;
  el[HippyViewProps][NodeProps.ACCESSIBILITY_LABEL] = null;
  el[HippyViewProps][NodeProps.OPACITY] = 1;
  el[HippyViewProps][NodeProps.OVERFLOW] = 'hidden';
  el[HippyViewProps][NodeProps.ON_ATTACHED_TO_WINDOW] = null;
  el[HippyViewProps][NodeProps.ON_LAYOUT] = null;
  el[HippyViewProps][NodeProps.ON_TOUCH_DOWN] = null;
  el[HippyViewProps][NodeProps.ON_TOUCH_MOVE] = null;
  el[HippyViewProps][NodeProps.ON_TOUCH_END] = null;
  el[HippyViewProps][NodeProps.ON_TOUCH_CANCEL] = null;
}
export const ViewProps = 'ViewProps';
const TouchDownCache = 'touchDownHippy';
const TouchMoveCache = 'touchMoveHippy';
const TouchEndCache = 'touchEndHippy';
const TouchCancelCache = 'touchCancelHippy';

function opacityProcess(el: HTMLElement, value: string | number | boolean) {
  setElementStyle(el, { opacity: value });
}
function onClickProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  if (!value) {
    el.onclick = null;
    return;
  }
  el.onclick = (event) => {
    dispatchEventToHippy(nodeId, NodeProps.ON_CLICK, [event]);
  };
}
function onLayoutProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  buildCallBackProps(el, !!value, ViewProps, NodeProps.ON_LAYOUT, nodeId);
}
function overflowProcess(el: HTMLElement, value: string | number | boolean) {
  if (value === 'visible') {
    setElementStyle(el, { overflow: 'visible' });
  }
  if (value === 'hidden') {
    setElementStyle(el, { overflow: 'hidden' });
  }
}
export function beforeMountCheck(element: HTMLElement, parent: HTMLElement) {
  if (element && element.style.position === 'absolute' && !parent.style.position) {
    setElementStyle(parent, { position: 'relative' });
  }
}
export function onMounted(element: HTMLElement) {
  requestAnimationFrame(() => {
    element[ViewProps][NodeProps.ON_ATTACHED_TO_WINDOW]?.();
    element[ViewProps][NodeProps.ON_LAYOUT]?.(buildHippyLayoutEvent(element.getBoundingClientRect()));
  });
}
export function baseInit(element: HTMLElement) {
  element[ViewProps] = {};
  element[ViewProps][NodeProps.ON_ATTACHED_TO_WINDOW] = null;
  element[ViewProps][NodeProps.ON_LAYOUT] = null;
}
function onAttachedToWindowProcess(
  el: HTMLElement,
  value: string | number | boolean,
  nodeId: number,
) {
  buildCallBackProps(el, !!value, ViewProps, NodeProps.ON_ATTACHED_TO_WINDOW, nodeId);
}
function onTouchDownProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  baseTouchProcess(el, value, nodeId, TouchDownCache, NodeProps.ON_TOUCH_DOWN, 'touchstart');
}
function onTouchMoveProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  baseTouchProcess(el, value, nodeId, TouchMoveCache, NodeProps.ON_TOUCH_MOVE, 'touchmove');
}
function onTouchEndProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  baseTouchProcess(el, value, nodeId, TouchEndCache, NodeProps.ON_TOUCH_END, 'touchend');
}
function onTouchCancelProcess(el: HTMLElement, value: string | number | boolean, nodeId: number) {
  baseTouchProcess(el, value, nodeId, TouchCancelCache, NodeProps.ON_TOUCH_CANCEL, 'touchcancel');
}
function baseTouchProcess(
  el: HTMLElement,
  value: string | number | boolean,
  nodeId: number,
  cacheKey: string,
  hippyEvent: string,
  h5Event: string,
) {
  if (value && !el[cacheKey]) {
    el[cacheKey] = (event) => {
      dispatchEventToHippy(nodeId, hippyEvent, [event]);
    };
    el.addEventListener(h5Event, el[cacheKey]);
  }
  if (!value && el[TouchDownCache]) {
    el.removeEventListener(h5Event, el[cacheKey]);
    el[cacheKey] = null;
  }
}
export function buildHippyLayoutEvent({ width, height, x, y }) {
  return {
    layout: {
      width,
      height,
      x,
      y,
    },
  };
}
