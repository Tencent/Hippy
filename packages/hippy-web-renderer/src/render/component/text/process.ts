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

import { ProcessType, setElementStyle } from '../../common';
import { HIPPY_COMPONENT_METHOD, NodeTag, ORIGIN_TYPE } from '../../module/node-def';

export const HTextNumberOfLines = 'numberOfLines';
export const HTextEllipsizeMode = 'ellipsizeMode';
export const HTextContent = 'text';
export const TextProps: ProcessType = {
  numberOfLines: numberOfLinesProcess,
  ellipsizeMode: ellipsizeModeProcess,
  text: process,
};
export const HippyTextProps = 'textProps';

export function initProps(el: HTMLElement) {
  el[HippyTextProps] = {};
  el[HIPPY_COMPONENT_METHOD] = {};
  el[ORIGIN_TYPE] = NodeTag.TEXT;
  el[HippyTextProps][HTextNumberOfLines] = 1;
  el[HippyTextProps][HTextEllipsizeMode] = 'tail';
  el[HippyTextProps][HTextContent] = '';
}
const HippyEllipsizeMode = {
  head: { 'text-overflow': 'ellipsis', direction: 'rtl' },
  clip: { 'text-overflow': 'clip' },
  middle: { 'text-overflow': 'ellipsis' },
  tail: { 'text-overflow': 'ellipsis' },
};
function process(
  el: HTMLElement,
  value: string | number | boolean,
  _nodeId: any,
  fromUpdate?: boolean,
) {
  if (typeof value === 'string') {
    if (fromUpdate && el.childNodes.length > 0) {
      let textNode;
      el.childNodes.forEach((item) => {
        if (item instanceof Text) {
          textNode = item;
        }
      });
      if (textNode && textNode.textContent !== value) {
        textNode.textContent = value;
      }
      return;
    }
    const textNode = document.createTextNode(value);
    if (el.childNodes.length > 0) {
      el.removeChild(el.childNodes[0]);
    }
    el.appendChild(textNode);
  }
}
function ellipsizeModeProcess(el: HTMLElement, value: string | number | boolean) {
  if (typeof value === 'string') setElementStyle(el, HippyEllipsizeMode[value]);
}
function numberOfLinesProcess(el: HTMLElement, value: string | number | boolean) {
  setElementStyle(el, { 'line-clamp': value });
}
