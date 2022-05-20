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


function updateStyle(oldVNode, vNode) {
  if (!oldVNode.data.style && !vNode.data.style) {
    return;
  }
  let cur;
  const { elm } = vNode;
  const oldStyle = oldVNode.data.style || {};
  let style = vNode.data.style || {};
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
  // Remove the removed styles at first
  Object.keys(oldStyle).forEach((name) => {
    if (style[name] === undefined) {
      elm.setStyle(normalize(name), undefined);
    }
  });
  // Then set the new styles.
  Object.keys(style).forEach((name) => {
    cur = style[name];
    elm.setStyle(normalize(name), cur);
  });
}


function createStyle(oldVNode, vNode) {
  // console.log(`\t\t ===> createStyle(${oldVNode}, ${vNode})`)
  if (!vNode.data.staticStyle) {
    updateStyle(oldVNode, vNode);
    return;
  }
  const { elm } = vNode;
  const { staticStyle } = vNode.data;
  Object.keys(staticStyle).forEach((name) => {
    if (staticStyle[name]) {
      elm.setStyle(normalize(name), staticStyle[name]);
    }
  });
  updateStyle(oldVNode, vNode);
}

export default {
  create: createStyle,
  update: updateStyle,
};
