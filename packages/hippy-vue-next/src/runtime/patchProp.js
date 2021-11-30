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

import { looseEqual } from '@vue/shared';

export function patchProp(
  el,
  key,
  prevValue,
  nextValue,
  // isSVG: boolean,
  // prevChildren?: VNode[],
  // parentComponent?: ComponentInternalInstance,
  // parentSuspense?: SuspenseBoundary,
  // unmountChildren?: any,
) {
  const updatePayload = {};
  Object.keys(nextValue).forEach((key) => {
    const oldPropValue = prevValue[key];
    const newPropValue = nextValue[key];
    switch (key) {
      case 'children': {
        if (oldPropValue !== newPropValue
            && (typeof newPropValue === 'number'
                || typeof newPropValue === 'string'
            )) {
          updatePayload[key] = newPropValue;
        }
        break;
      }
      default: {
        if (typeof oldPropValue === 'function' && typeof newPropValue === 'function') {
          // just skip it if meets function
        } else if (!looseEqual(oldPropValue, newPropValue)) {
          updatePayload[key] = newPropValue;
        }
      }
    }
  });
  if (!Object.keys(updatePayload).length) {
    return null;
  }
  Object.keys(updatePayload).forEach(attr => el.setAttribute(attr, updatePayload[attr]));
}
