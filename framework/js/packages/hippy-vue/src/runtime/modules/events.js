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

/* eslint-disable prefer-rest-params */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

import { updateListeners } from 'framework/js/core/vdom/helpers/update-listeners';

let target;

function remove(event, handler, capture, _target) {
  (_target || target).removeEventListener(event);
}

function add(event, handler, once, capture) {
  if (capture) {
    return;
  }
  if (once) {
    const oldHandler = handler;
    const _target = target; // save current target element in closure
    handler = (ev) => {
      const res = arguments.length === 1
        ? oldHandler(ev)
        : oldHandler(...arguments);
      if (res !== null) {
        remove(event, null, null, _target);
      }
    };
  }
  target.addEventListener(event, handler);
}

function updateDOMListeners(oldVNode, vNode) {
  if (!oldVNode.data.on && !vNode.data.on) {
    return;
  }
  const on = vNode.data.on || {};
  const oldOn = oldVNode.data.on || {};
  target = vNode.elm;
  updateListeners(on, oldOn, add, remove, vNode.context);
}

export default {
  create: updateDOMListeners,
  update: updateDOMListeners,
};
