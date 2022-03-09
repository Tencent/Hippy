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
  STYLE_MARGIN_H,
  STYLE_MARGIN_V,
  STYLE_PADDING_H,
  STYLE_PADDING_V,
} from '../types';

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
      const newValue = convertHexToRgba(object[key]);
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
  borderStyleProcess(element, object);
}
function isAnimationProps(key: string, value: any) {
  if (hasOwnProperty(value, 'animationId')) {
    return true;
  }
  if (key === 'transform' && Array.isArray(value)) {
    return true;
  }
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
export function convertHexToRgba(number) {
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

function transformForSize(value) {
  return !isNaN(value) ? `${value}px` : value;
}

function borderStyleProcess(el: HTMLElement, style: { [key: string]: any }) {
  if (!style.borderStyle) {
    if (style.borderTopWidth) {
      styleUpdateWithCheck(el, 'borderTopStyle', 'solid');
    }
    if (style.borderLeftWidth) {
      styleUpdateWithCheck(el, 'borderLeftWidth', 'solid');
    }
    if (style.borderRightWidth) {
      styleUpdateWithCheck(el, 'borderRightWidth', 'solid');
    }
    if (style.borderBottomWidth) {
      styleUpdateWithCheck(el, 'borderBottomWidth', 'solid');
    }
  }
  if (style.borderStyle && !style.borderWidth) {
    styleUpdateWithCheck(el, 'borderStyle', 'none');
  } else if (!style.borderStyle && style.borderWidth) {
    styleUpdateWithCheck(el, 'borderStyle', 'solid');
  }
  if (style[STYLE_MARGIN_V] !== undefined) {
    styleUpdateWithCheck(el, 'marginTop', style[STYLE_MARGIN_V]);
    styleUpdateWithCheck(el, 'marginBottom', style[STYLE_MARGIN_V]);
  }
  if (style[STYLE_MARGIN_H] !== undefined) {
    styleUpdateWithCheck(el, 'marginLeft', style[STYLE_MARGIN_H]);
    styleUpdateWithCheck(el, 'marginRight', style[STYLE_MARGIN_H]);
  }
  if (style[STYLE_PADDING_H] !== undefined) {
    styleUpdateWithCheck(el, 'paddingTop', style[STYLE_PADDING_H]);
    styleUpdateWithCheck(el, 'paddingBottom', style[STYLE_PADDING_H]);
  }
  if (style[STYLE_PADDING_V] !== undefined) {
    styleUpdateWithCheck(el, 'paddingLeft', style[STYLE_PADDING_V]);
    styleUpdateWithCheck(el, 'paddingRight', style[STYLE_PADDING_V]);
  }
}

