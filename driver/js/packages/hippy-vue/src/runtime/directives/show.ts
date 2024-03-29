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

import { NeedToTyped } from '../../types/native';

/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

function toggle(el: NeedToTyped, value: NeedToTyped, vNode: NeedToTyped, originalDisplay: NeedToTyped) {
  if (value) {
    vNode.data.show = true;
    el.setStyle('display', originalDisplay);
  } else {
    el.setStyle('display', 'none');
  }
}

const show = {
  bind(el: NeedToTyped, {
    value,
  }: NeedToTyped, vNode: NeedToTyped) {
    // Set the display to 'block' when undefined
    if (el.style.display === undefined) {
      el.style.display = 'block';
    }
    const originalDisplay = el.style.display === 'none' ? '' : el.style.display;
    el.__vOriginalDisplay = originalDisplay;
    toggle(el, value, vNode, originalDisplay);
  },
  update(el: NeedToTyped, {
    value,
    oldValue,
  }: NeedToTyped, vNode: NeedToTyped) {
    if (!value === !oldValue) {
      return;
    }
    toggle(el, value, vNode, el.__vOriginalDisplay);
  },
  unbind(el: NeedToTyped, binding: NeedToTyped, vNode: NeedToTyped, oldVNode: NeedToTyped, isDestroy: NeedToTyped) {
    if (!isDestroy) {
      el.style.display = el.__vOriginalDisplay;
    }
  },
};

export {
  show,
};
