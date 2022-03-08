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

import { ElementProps, NodeTag } from '../module/node-def';
import { ComponentMap } from '../module/dom-process';
import { rnStyleSupport } from './rn-style-support';
export interface ProcessType {
  [key: string]: (
    el: HTMLElement,
    value: number | string | boolean,
    nodeId: number,
    fromUpdate?: boolean,
  ) => void;
}
export function setElementProps(
  el: HTMLElement,
  props: ElementProps,
  type: NodeTag,
  nodeId: number,
  fromUpdate = false,
) {
  if (!props) {
    return;
  }
  const keys = Object.keys(props);
  if (props.style) {
    setElementStyle(el, props.style);
  }
  for (const key of keys) {
    if (key === 'style') {
      continue;
    }
    ComponentMap[type]?.processProps?.(el, key, props[key], nodeId, fromUpdate);
  }
}
function hasOwnProperty(obj: Object, name: string | number | symbol) {
  return Object.prototype.hasOwnProperty.call(obj, name);
}
export function setElementStyle(element: HTMLElement, object: any, animationProcess?:
(key: string, value: any, element: HTMLElement) => void) {
  if (object === null) return;
  for (const key of Object.keys(object)) {
    if (! hasOwnProperty(object, key)) {
      return;
    }
    if (isColor(key)) {
      const newValue = transformForColor(object[key]);
      styleUpdateWithCheck(element, key, newValue);
      continue;
    }
    if (isAnimationProps(key, object[key]) && animationProcess) {
      animationProcess(key, object[key], element);
      continue;
    }
    if (isLayout(key, object[key])) {
      const newValue = transformForSize(object[key]);
      styleUpdateWithCheck(element, key, newValue);
      continue;
    }
    styleUpdateWithCheck(element, key, object[key]);
  }
}
function isAnimationProps(key: string, value: any) {
  if (hasOwnProperty(value, 'animationId')) {
    return true;
  }
  if (key === 'transform' && Array.isArray(value)) {
    return true;
  }
}
export function refreshElementProps(
  el: HTMLElement,
  props: ElementProps,
  type: NodeTag,
  nodeId: number,
  fromUpdate = false,
) {
  setElementProps(el, props, type, nodeId, fromUpdate);
  pollyFillStyle(el, props, type);
}
function styleUpdateWithCheck(element: HTMLElement, key: string, newValue: any) {
  if (
    element.style[key] === null
    || element.style[key] === undefined
    || element.style[key] === ''
    || element.style[key] !== newValue
  ) {
    element.style[key] = newValue;
  }
}
export function dispatchEventToHippy(nodeId: number, type: string, params: any) {
  hippyBridge('callJsModule', {
    moduleName: 'EventDispatcher',
    methodName: 'receiveUIComponentEvent',
    params: [nodeId, type, params],
  });
}
export function dispatchModuleEventToHippy(params: any) {
  hippyBridge('callJsModule', {
    moduleName: 'EventDispatcher',
    methodName: 'receiveNativeEvent',
    params,
  });
}

export function callBackUIFunctionToHippy(callBackId: number, params: any, success: boolean) {
  callbackToHippy(callBackId, params, success, 'callUIFunction', 'UIManagerModule');
}

export function callBackMeasureInWindowToHippy(callBackId: number, params: any, success: boolean) {
  callbackToHippy(callBackId, params, success, 'measureInWindow', 'UIManagerModule');
}

export function callbackToHippy(
  callBackId: number,
  params: any,
  success: boolean,
  moduleFunc: string,
  moduleName: string,
) {
  hippyBridge('callBack', {
    callId: callBackId,
    moduleFunc,
    moduleName,
    params,
    result: success ? 0 : -1,
  });
}
function pollyFillStyle(el: HTMLElement, props: ElementProps, tagName: NodeTag) {
  borderStyleProcess(el, props.style!);
  if (tagName === NodeTag.VIEW_PAGER_ITEM) {
    setElementStyle(el, { position: 'static' });
  }
  if (tagName === NodeTag.REFRESH) {
    setElementStyle(el, { position: 'relative' });
  }
  if (tagName === NodeTag.TEXT_INPUT) {
    const borderStyle = borderStyleFind(props.style!);
    setElementStyle(el, { outline: 'none' });
    if (
      borderStyle.border.width
      || borderStyle.border.style
      || borderStyle.borderTop.width
      || borderStyle.borderBottom.width
      || borderStyle.borderLeft.width
      || borderStyle.borderRight.width
    ) {
      return;
    }
    const clearBorderStyle = {
      backgroundColor: '#ffffff00',
      border: '0px solid #000000',
      padding: '0px',
    };
    setElementStyle(el, clearBorderStyle);
  }
  if (!props.style!.zIndex || !el.style.zIndex) {
    setElementStyle(el, { zIndex: 0 });
  }
  setElementStyle(el, { boxSizing: 'border-box' });
}
function convertArgbToRgb(number) {
  const alpha = (number >> 24) & 0xff;
  const red = (number >> 16) & 0xff;
  const green = (number >> 8) & 0xff;
  const blue = number & 0xff;
  return `rgba(${red}, ${green}, ${blue}, ${(alpha / 256).toFixed(3)})`;
}
function isColor(key: string) {
  return key.endsWith('Color') || key.endsWith('color');
}
function isLayout(key: string, value: number) {
  return !(
    isNaN(value)
    || key.startsWith('flex')
    || key.startsWith('zIndex')
    || key.startsWith('z-index')
  );
}
export function transformForColor(value) {
  return convertArgbToRgb(value);
}
function transformForSize(value) {
  return !isNaN(value) ? `${value}px` : value;
}
function borderStyleProcess(el: HTMLElement, style: { [key: string]: any }) {
  const borderRecord = {
    borderTop: { width: false, style: false },
    borderLeft: { width: false, style: false },
    borderRight: { width: false, style: false },
    borderBottom: { width: false, style: false },
    border: { width: false, style: false },
  };
  // TODO optimization border process
  for (const key of Object.keys(style)) {
    if (key.startsWith('borderTopWidth')) {
      borderRecord.borderTop.width = true;
      setElementStyle(el, { borderTopStyle: 'solid' });
    }
    if (key.startsWith('borderLeftWidth')) {
      borderRecord.borderLeft.width = true;
      setElementStyle(el, { borderLeftStyle: 'solid' });
    }
    if (key.startsWith('borderRightWidth')) {
      borderRecord.borderRight.width = true;
      setElementStyle(el, { borderRightStyle: 'solid' });
    }
    if (key.startsWith('borderBottomWidth')) {
      borderRecord.borderBottom.width = true;
      setElementStyle(el, { borderBottomStyle: 'solid' });
    }
    if (key.startsWith('borderWidth')) {
      borderRecord.border.width = true;
    }
    rnStyleSupport(el, key);
  }
  if (!borderRecord.border.width && borderRecord.border.style) {
    setElementStyle(el, { borderStyle: 'none' });
  } else if (!borderRecord.border.style && borderRecord.border.width) {
    setElementStyle(el, { borderStyle: 'solid' });
  }
}
function borderStyleFind(style: { [key: string]: any }) {
  const borderRecord = {
    borderTop: { width: false },
    borderLeft: { width: false },
    borderRight: { width: false },
    borderBottom: { width: false },
    border: { width: false, style: false },
  };
  // TODO optimization border process
  for (const key of  Object.keys(style)) {
    if (key.startsWith('borderTopWidth')) {
      borderRecord.borderTop.width = true;
    }
    if (key.startsWith('borderLeftWidth')) {
      borderRecord.borderLeft.width = true;
    }
    if (key.startsWith('borderRightWidth')) {
      borderRecord.borderRight.width = true;
    }
    if (key.startsWith('borderBottomWidth')) {
      borderRecord.borderBottom.width = true;
    }
    if (key.startsWith('borderWidth')) {
      borderRecord.border.width = true;
    }
    if (key.startsWith('borderStyle')) {
      borderRecord.border.style = true;
    }
  }
  return borderRecord;
}

