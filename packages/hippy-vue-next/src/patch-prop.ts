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

/**
 * Implement the patch props method required for Vue3 VNode mount
 */
import type { ComponentInternalInstance, VNode } from '@vue/runtime-core';
import { isOn } from '@vue/shared';
import type { NeedToTyped } from './config';

import { patchAttr } from './modules/attrs';
import { patchClass } from './modules/class';
import { patchEvent } from './modules/events';
import { patchStyle } from './modules/style';
import type { HippyElement } from './runtime/element/hippy-element';
import type { HippyNode } from './runtime/node/hippy-node';

export function patchProp(
  el: NeedToTyped,
  key: string,
  prevValue: NeedToTyped,
  nextValue: NeedToTyped,
  isSVG: boolean,
  prevChildren: VNode<HippyNode, HippyElement>[] | undefined,
  parentComponent: ComponentInternalInstance | null,
): void {
  // It should be noted that the values contained in prop here will have strings, numbers, arrays, objects, etc.
  switch (key) {
    case 'class':
      patchClass(el, nextValue);
      break;
    case 'style':
      patchStyle(el, prevValue, nextValue);
      break;
    default:
      if (isOn(key)) {
        // event prop
        patchEvent(el, key, prevValue, nextValue, parentComponent);
      } else {
        // attribute prop
        patchAttr(el, key, prevValue, nextValue);
      }
      break;
  }
}
