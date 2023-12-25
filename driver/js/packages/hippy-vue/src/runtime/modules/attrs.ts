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

import { extend } from 'shared/util';
import { NeedToTyped } from '../../types/native';

function updateAttrs(oldVNode: NeedToTyped, vNode: NeedToTyped) {
  if (!oldVNode.data.attrs && !vNode.data.attrs) {
    return;
  }
  const updatePayload: NeedToTyped = {};
  const { elm } = vNode;
  const oldAttrs = oldVNode.data.attrs || {};
  let attrs = vNode.data.attrs || {};
  // clone observed objects, as the user probably wants to mutate it
  if (attrs.__ob__) {
    attrs = extend({}, attrs);
    vNode.data.attrs = attrs;
  }
  Object.keys(oldAttrs).forEach((key) => {
    const oldPropValue = oldAttrs[key];
    const newPropValue = attrs[key];
    if ((oldPropValue !== null && oldPropValue !== undefined)
    && (newPropValue === null || newPropValue === undefined)) {
      updatePayload[key] = undefined;
    }
  });
  Object.keys(attrs).forEach((key) => {
    const oldPropValue = oldAttrs[key];
    const newPropValue = attrs[key];
    if (oldPropValue !== newPropValue) {
      updatePayload[key] = newPropValue;
    }
  });
  Object.keys(updatePayload).forEach((key) => {
    elm.setAttribute(key, updatePayload[key]);
  });
}

export function setAttrs(vNode: NeedToTyped, customElem: NeedToTyped, options: NeedToTyped = {}) {
  if (!vNode || !vNode.data) {
    return;
  }
  let { elm } = vNode;
  if (customElem) {
    elm = customElem;
  }
  if (!elm) return;
  let attrs = (vNode.data?.attrs) || {};
  // clone observed objects, as the user probably wants to mutate it
  if (attrs.__ob__) {
    attrs = extend({}, attrs);
    vNode.data.attrs = attrs;
  }
  Object.keys(attrs).forEach((key) => {
    elm.setAttribute(key, attrs[key], { notToNative: !!options.notToNative });
  });
}

export default {
  create: updateAttrs,
  update: updateAttrs,
};
