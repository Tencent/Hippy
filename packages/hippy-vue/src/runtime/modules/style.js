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

/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

import { extend, cached, camelize } from 'shared/util';
import { isNullOrUndefined } from '../../util';

const normalize = cached(camelize);

function toObject(arr) {
  const res = {};
  for (let i = 0; i < arr.length; i += 1) {
    if (arr[i]) {
      extend(res, arr[i]);
    }
  }
  return res;
}

function patchStyle(vNode) {
  if (!vNode.data.style) return;
  let { style } = vNode.data;
  const needClone = style.__ob__;
  // handle array syntax
  if (Array.isArray(style)) {
    style = toObject(style);
    vNode.data.style = style;
  }
  // clone the style for future updates,
  // in case the user mutates the style object in-place.
  if (needClone) {
    style = extend({}, style);
    vNode.data.style = style;
  }
  const batchedStyles = {};
  // Then set the new styles.
  Object.keys(style).forEach((name) => {
    const styleValue = style[name];
    if (!isNullOrUndefined(styleValue)) {
      batchedStyles[normalize(name)] = styleValue;
    }
  });
  return batchedStyles;
}

function updateStyle(oldVNode, vNode) {
  if (!oldVNode.data.style && !vNode.data.style) {
    return;
  }
  const { elm } = vNode;
  if (oldVNode.data.style && !vNode.data.style) {
    return elm.removeStyle();
  }
  const styles = patchStyle(vNode);
  elm.removeStyle(true);
  elm.setStyles(styles);
}

function createStyle(oldVNode, vNode) {
  if (!vNode.data.staticStyle) {
    updateStyle(oldVNode, vNode);
    return;
  }
  const { elm } = vNode;
  const { staticStyle } = vNode.data;
  const batchStyles = {};
  Object.keys(staticStyle).forEach((name) => {
    const styleValue = staticStyle[name];
    if (!isNullOrUndefined(styleValue)) {
      batchStyles[normalize(name)] = styleValue;
    }
  });
  const styles = patchStyle(vNode);
  if (styles) {
    Object.assign(batchStyles, styles);
  }
  elm.removeStyle(true);
  elm.setStyles(batchStyles);
}

export function setStyle(vNode, customElem, options = {}) {
  if (!vNode || !vNode.data) {
    return;
  }
  let { elm } = vNode;
  if (customElem) {
    elm = customElem;
  }
  if (!elm) return;
  const { staticStyle } = vNode.data;
  if (staticStyle) {
    Object.keys(staticStyle).forEach((name) => {
      const value = staticStyle[name];
      if (value) {
        elm.setStyle(normalize(name), value, !!options.notToNative);
      }
    });
  }
  let { style } = vNode.data;
  if (style) {
    const needClone = style.__ob__;
    // handle array syntax
    if (Array.isArray(style)) {
      style = toObject(style);
      vNode.data.style = style;
    }
    // clone the style for future updates,
    // in case the user mutates the style object in-place.
    if (needClone) {
      style = extend({}, style);
      vNode.data.style = style;
    }
    // Then set the new styles.
    Object.keys(style).forEach((name) => {
      elm.setStyle(normalize(name), style[name], !!options.notToNative);
    });
  }
}

export default {
  create: createStyle,
  update: updateStyle,
};
