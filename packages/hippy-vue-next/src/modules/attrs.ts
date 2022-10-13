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
import type { NeedToTyped } from '../types';
import type { HippyElement } from '../runtime/element/hippy-element';

/**
 * set element attribute value
 *
 * @param el - element
 * @param key - key
 * @param prevValue - before value
 * @param nextValue - after value
 */
export function patchAttr(
  el: HippyElement,
  key: string,
  prevValue: NeedToTyped,
  nextValue: NeedToTyped,
): void {
  // set attr when next value is not equal before value
  if (nextValue === null) {
    el.removeAttribute(key);
  } else if (prevValue !== nextValue) {
    el.setAttribute(key, nextValue);
  }
}
