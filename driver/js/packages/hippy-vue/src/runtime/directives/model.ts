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

import { Event } from '../../renderer/native/event';
import Native from '../native';

function androidUpdate(el: any, value: any, oldValue: any) {
  if (value !== oldValue) {
    el.setAttribute('defaultValue', value, { textUpdate: true });
  }
}

function iOSUpdate(el: any, value: any) {
  if (value !== el.attributes.defaultValue) {
    el.attributes.defaultValue = value;
    el.setAttribute('text', value, { textUpdate: true });
  }
}

// Set the default update to android.
let update = androidUpdate;

const model = {
  inserted(el: any, binding: any) {
    // Update the specific platform update function.
    if (Native.Platform === 'ios' && update !== iOSUpdate) {
      update = iOSUpdate;
    }
    if (el.meta.component.name === 'TextInput') {
      el._vModifiers = binding.modifiers;
      // Initial value
      el.attributes.defaultValue = binding.value;
      // Binding event when typing
      if (!binding.modifiers.lazy) {
        el.addEventListener('change', ({ value }: any) => {
          const event = new Event('input');
          (event as any).value = value;
          el.dispatchEvent(event);
        });
      }
    }
  },
  update(el: any, {
    value,
    oldValue,
  }: any) {
    el.value = value;
    update(el, value, oldValue);
  },
};

export {
  model,
};
