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

import { camelize } from '@vue/runtime-core';
import { isString } from '@vue/shared';

import { type HippyElement } from '../runtime/element/hippy-element';
import type { NeedToTyped } from '../types';
import { isNullOrUndefined } from '../util';

// type of style
type Style = string | Record<string, string | string[]> | null | undefined;

function isStyleExisted(
  el: HippyElement,
  prev: Style,
  next: Style,
) {
  const isElementNull = !el;
  const isPrevAndNextNull = !prev && !next;
  const isPrevEqualToNext = JSON.stringify(prev) === JSON.stringify(next);
  return isElementNull || isPrevAndNextNull || isPrevEqualToNext;
}

/**
 * set the Style property
 *
 * @param rawEl - target element
 * @param prev - old value
 * @param next - new value
 */
export function patchStyle(
  rawEl: HippyElement,
  prev: Style,
  next: Style,
): void {
  const el = rawEl;
  const batchedStyles: NeedToTyped = {};

  if (isStyleExisted(el, prev, next)) {
    // if the previous and next attributes are the same, skip the patch calculation.
    return;
  }
  if (prev && !next) {
    // clear style
    el.removeStyle();
  } else if (isString(next)) {
    // in hippy, the styles are all array or Object types, and if it is a string, thrown an exception
    throw new Error('Style is Not Object');
  } else if (next) {
    // the new style is an array or Object, apply the new style to all
    // style is an array, so we do not update native instantly, we will update at the end
    Object.keys(next).forEach((key) => {
      const value = next[key];
      if (!isNullOrUndefined(value)) {
        batchedStyles[camelize(key)] = value;
      }
    });
    el.removeStyle(true);
    // update native node
    el.setStyles(batchedStyles);
  }
}
