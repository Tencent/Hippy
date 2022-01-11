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

function updateAttrs(oldVNode, vNode) {
  if (!oldVNode.data.attrs && !vNode.data.attrs) {
    return;
  }
  let cur;
  let old;
  const { elm } = vNode;
  const oldAttrs = oldVNode.data.attrs || {};
  let attrs = vNode.data.attrs || {};
  // clone observed objects, as the user probably wants to mutate it
  if (attrs.__ob__) {
    attrs = extend({}, attrs);
    vNode.data.attrs = attrs;
  }
  Object.keys(attrs).forEach((key) => {
    cur = attrs[key];
    old = oldAttrs[key];
    if (old !== cur) {
      elm.setAttribute(key, cur);
    }
  });
  Object.keys(oldAttrs).forEach((key) => {
    // eslint-disable-next-line eqeqeq
    if (attrs[key] == null) {
      elm.setAttribute(key);
    }
  });
}

export default {
  create: updateAttrs,
  update: updateAttrs,
};
