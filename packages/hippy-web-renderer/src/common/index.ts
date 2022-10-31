/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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
  HippyBaseView,
  STYLE_MARGIN_H,
  STYLE_MARGIN_V,
  STYLE_PADDING_H,
  STYLE_PADDING_V,
} from '../types';
import { HippyWebView } from '../component';

export function hasOwnProperty(obj: Object, name: string | number | symbol) {
  return obj && Object.prototype.hasOwnProperty.call(obj, name);
}

export function setElementStyle(element: HTMLElement, object: any, animationProcess?:
(key: string, value: any, element: HTMLElement) => void) {
  if (object === null) return;
  const shadowData: any = {};
  const shadowTextData: any = {};
  const background: any = {};
  for (const key of Object.keys(object)) {
    if (!hasOwnProperty(object, key)) {
      continue;
    }
    if (key.indexOf('shadow') !== -1) {
      shadowData[key] = object[key];
      continue;
    }
    if (key.indexOf('textShadow') !== -1) {
      shadowTextData[key] = object[key];
      continue;
    }
    if (isColor(key) && !isNaN(object[key])) {
      const newValue = convertHexToRgba(object[key]);
      styleUpdateWithCheck(element, key, newValue);
      continue;
    }
    if (isAnimationProps(key, object[key]) && animationProcess) {
      animationProcess(key, object[key], element);
      continue;
    }
    if (isFontSize(key) && element.tagName === 'span') {
      const newValue = transformForSize(object[key]);
      styleUpdateWithCheck(element, key, newValue);
      styleUpdateWithCheck(element, 'line-height', newValue);
      continue;
    }
    if (isLayout(key, object[key])) {
      const newValue = transformForSize(object[key]);
      styleUpdateWithCheck(element, key, newValue);
      continue;
    }
    if (isZIndex(key)) {
      styleUpdateWithCheck(element, key, parseInt(object[key], 10));
      continue;
    }
    if (isBackground(key)) {
      background[key] = object[key];
    }
    styleUpdateWithCheck(element, key, object[key]);
  }
  borderStyleProcess(element, object);
  if (shadowData.shadowRadius) {
    styleUpdateWithCheck(element, 'box-shadow', shadowProcess(shadowData));
  }

  if (shadowTextData.textShadowColor || shadowTextData.textShadowOffset
    || shadowTextData.textShadowOffsetX || shadowTextData.textShadowOffsetY) {
    styleUpdateWithCheck(element, 'text-shadow', textShadowProcess(shadowTextData));
  }
  backgroundProcess(background, element);
}

export function positionAssociate(
  newStyle: {[prop: string]: any},
  component: HippyBaseView, parent: HippyWebView<any>,
) {
  if (newStyle.position === 'absolute' && !parent?.props?.style?.position
    && !parent?.defaultStyle().position) {
    setElementStyle(parent!.dom!, { position: 'relative' });
  }
  if (newStyle.position === 'absolute' && !newStyle.width && !newStyle.height && !newStyle.overflow) {
    setElementStyle(component.dom!, { overflow: 'visible' });
  }
}

export function zIndexAssociate(
  diffStyle: {[prop: string]: any},
  component: HippyBaseView, parent: HippyWebView<any>,
) {
  if ((diffStyle.position === 'absolute' || diffStyle.position === 'relative')) {
    parent?.changeStackContext(true);
    (component as HippyWebView<any>).updateSelfStackContext(true);
  } else if (diffStyle.position === null) {
    parent?.changeStackContext(false);
    (component as HippyWebView<any>).updateSelfStackContext(false);
  } else if (parent?.exitChildrenStackContext && diffStyle.zIndex === null) {
    (component as HippyWebView<any>).updateSelfStackContext(true);
  }
}

function backgroundProcess(backgroundData: any, element: HTMLElement) {
  for (const key of Object.keys(backgroundData)) {
    if (key === 'backgroundImage') {
      styleUpdateWithCheck(element, key, `url(${backgroundData.backgroundImage})`);
      continue;
    }
    if (key === 'backgroundSize' && backgroundData.backgroundSize === 'contain') {
      styleUpdateWithCheck(element, key, '100% 100%');
    } else if (key === 'backgroundSize') {
      styleUpdateWithCheck(element, key, backgroundData.backgroundSize);
    }
    if (key === 'linearGradient') {
      const angle = `${backgroundData.linearGradient.angle ?? '0'}deg`;
      let gradientStyle = `${angle} `;
      backgroundData.linearGradient.colorStopList.forEach((item: {ratio: number, color: number}) => {
        gradientStyle += `,${convertHexToRgba(item.color)}${item.ratio >= 0 ? ` ${item.ratio * 100}%` : ''}`;
      });
      styleUpdateWithCheck(element, 'background', `linear-gradient(${gradientStyle})`);
    }
  }
  if (Object.keys(backgroundData).length > 0) {
    styleUpdateWithCheck(element, 'backgroundRepeat', 'no-repeat');
  }
}
function shadowProcess(shadow: {shadowOpacity?: number, shadowRadius?: number,
  shadowOffsetX?: number, shadowOffsetY?: number, shadowColor?: number}) {
  return `${shadow.shadowOffsetX ?? 0}px ${shadow.shadowOffsetY ?? 0}px ${shadow.shadowRadius ?? 0}px ${convertHexToRgba(shadow.shadowColor)}`;
}
function textShadowProcess(shadow: {textShadowColor?: number, textShadowOffset: {width: number, height: number},
  textShadowRadius: number, textShadowOffsetX: number, textShadowOffsetY: number}) {
  return `${shadow.textShadowOffsetX ?? shadow.textShadowOffset.width ?? 0}px ${shadow.textShadowOffsetY ?? shadow.textShadowOffset.height ?? 0}px
  ${shadow.textShadowRadius ?? 0}px ${convertHexToRgba(shadow.textShadowColor)}`;
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
    || element.style[key] !== newValue?.trim?.()
  ) {
    const { style } = element;
    style[key] = newValue;
  }
}

export function convertHexToRgba(number) {
  const alpha = (number >> 24) & 0xff;
  const red = (number >> 16) & 0xff;
  const green = (number >> 8) & 0xff;
  const blue = number & 0xff;
  return `rgba(${red}, ${green}, ${blue}, ${(alpha / 256).toFixed(3)})`;
}

export function convertHexToRgbaArray(number) {
  const alpha = (number >> 24) & 0xff;
  const red = (number >> 16) & 0xff;
  const green = (number >> 8) & 0xff;
  const blue = number & 0xff;
  return [red, green, blue, alpha];
}

function isColor(key: string) {
  return key.endsWith('Color') || key.endsWith('color');
}

function isLayout(key: string, value: number) {
  return !(
    isNaN(value)
    || key.startsWith('flex')
    || key.startsWith('zIndex')
    || key.startsWith('-webkit')
    || key.startsWith('z-index')
    || key.startsWith('opacity')
  );
}
function isZIndex(key: string) {
  return key.startsWith('zIndex') || key.startsWith('z-index');
}

function isBackground(key) {
  return key.startsWith('background') || key.startsWith('linearGradient');
}

function transformForSize(value) {
  return !isNaN(value) ? `${value}px` : value;
}

function isFontSize(key) {
  return key.startsWith('fontSize');
}

function borderStyleProcess(el: HTMLElement, style: { [key: string]: any }) {
  if (!style.borderStyle) {
    singleUpdateBorderStyle(el, style);
  }
  if (style.borderStyle && !style.borderWidth && !style.borderTopWidth && !style.borderLeftWidth
    && !style.borderRightWidth && !style.borderBottomWidth) {
    styleUpdateWithCheck(el, 'borderStyle', 'none');
  } else if (!style.borderStyle && style.borderWidth) {
    styleUpdateWithCheck(el, 'borderStyle', 'solid');
  } else if (style.borderStyle && !style.borderWidth && (style.borderTopWidth || style.borderLeftWidth
    || style.borderRightWidth || style.borderBottomWidth)) {
    styleUpdateWithCheck(el, 'borderStyle', 'none');
    singleUpdateBorderStyle(el, style);
  }

  if (style[STYLE_MARGIN_V] !== undefined) {
    styleUpdateWithCheck(el, 'marginTop', transformForSize(style[STYLE_MARGIN_V]));
    styleUpdateWithCheck(el, 'marginBottom', transformForSize(style[STYLE_MARGIN_V]));
  }
  if (style[STYLE_MARGIN_H] !== undefined) {
    styleUpdateWithCheck(el, 'marginLeft', transformForSize(style[STYLE_MARGIN_H]));
    styleUpdateWithCheck(el, 'marginRight', transformForSize(style[STYLE_MARGIN_H]));
  }
  if (style[STYLE_PADDING_V] !== undefined) {
    styleUpdateWithCheck(el, 'paddingTop', transformForSize(style[STYLE_PADDING_V]));
    styleUpdateWithCheck(el, 'paddingBottom',  transformForSize(style[STYLE_PADDING_V]));
  }
  if (style[STYLE_PADDING_H] !== undefined) {
    styleUpdateWithCheck(el, 'paddingLeft',  transformForSize(style[STYLE_PADDING_H]));
    styleUpdateWithCheck(el, 'paddingRight', transformForSize(style[STYLE_PADDING_H]));
  }
}
function singleUpdateBorderStyle(el: HTMLElement, style: { [key: string]: any }) {
  if (style.borderTopWidth) {
    styleUpdateWithCheck(el, 'borderTopStyle', 'solid');
  }
  if (style.borderLeftWidth) {
    styleUpdateWithCheck(el, 'borderLeftStyle', 'solid');
  }
  if (style.borderRightWidth) {
    styleUpdateWithCheck(el, 'borderRightStyle', 'solid');
  }
  if (style.borderBottomWidth) {
    styleUpdateWithCheck(el, 'borderBottomStyle', 'solid');
  }
}
const WarnLimit: Array<any> = [];
export function warn(...context: any[]) {
  if (process.env.NODE_ENV === 'production' || WarnLimit.findIndex(item => item === context[0]) !== -1) {
    return;
  }
  console.warn(...context);
  WarnLimit.push(context[0]);
}

export const error = (...context: any[]) => {
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  console.error(...context);
};
