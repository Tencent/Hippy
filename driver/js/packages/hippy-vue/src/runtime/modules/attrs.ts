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

// @ts-expect-error TS(2307): Cannot find module 'shared/util' or its correspond... Remove this comment to see the full error message
import { extend } from 'shared/util';

function updateAttrs(oldVNode: any, vNode: any) {
  if (!oldVNode.data.attrs && !vNode.data.attrs) {
    return;
  }
  const updatePayload = {};
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
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      updatePayload[key] = undefined;
    }
  });
  Object.keys(attrs).forEach((key) => {
    const oldPropValue = oldAttrs[key];
    const newPropValue = attrs[key];
    if (oldPropValue !== newPropValue) {
      // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      updatePayload[key] = newPropValue;
    }
  });
  Object.keys(updatePayload).forEach((key) => {
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    elm.setAttribute(key, updatePayload[key]);
  });
}

export function setAttrs(vNode: any, customElem: any, options = {}) {
  if (!vNode || !vNode.data) {
    return;
  }
  let { elm } = vNode;
  if (customElem) {
    elm = customElem;
  }
  if (!elm) return;
  let attrs = (vNode.data && vNode.data.attrs) || {};
  // clone observed objects, as the user probably wants to mutate it
  if (attrs.__ob__) {
    attrs = extend({}, attrs);
    vNode.data.attrs = attrs;
  }
  Object.keys(attrs).forEach((key) => {
    elm.setAttribute(key, attrs[key], { notToNative: !!(options as any).notToNative });
  });
}

export default {
  create: updateAttrs,
  update: updateAttrs,
};
