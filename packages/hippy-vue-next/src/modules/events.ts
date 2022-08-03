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

import type { ComponentInternalInstance } from '@vue/runtime-core';
import { callWithAsyncErrorHandling, ErrorCodes } from '@vue/runtime-core';

import type { CallbackType } from '../../global';
import type { HippyElement } from '../runtime/element/hippy-element';
import { lowerFirstLetter } from '../util';

// event callback type
type EventValue = CallbackType | CallbackType[];

// Vue event callback interface type
interface Invoker extends EventListener {
  value: EventValue;
  attached?: number;
}

// native event option
interface EventOption {
  [key: string]: boolean;
}

// event modifier regular expression
const optionsModifierRE = /(?:Once|Passive|Capture)$/;

/**
 * process the event name, remove on and lowercase the first letter
 *
 * @param eventName - event name
 */
function parseName(eventName: string): (string | EventOption)[] {
  let name = eventName;
  const options: EventOption = {};
  if (optionsModifierRE.test(name)) {
    let match = name.match(optionsModifierRE);
    while (match) {
      name = name.slice(0, name.length - match[0].length);
      options[match[0].toLowerCase()] = true;
      match = name.match(optionsModifierRE);
    }
  }

  // remove on and lowercase the first letter
  return [lowerFirstLetter(name.slice(2)), options];
}

/**
 * create event execution method
 *
 * @param initialValue - the initial value of the event
 * @param instance - vue instance
 */
function createInvoker(
  initialValue: EventValue,
  instance: ComponentInternalInstance | null,
) {
  const invoker = (e: Event) => {
    callWithAsyncErrorHandling(
      invoker.value as Invoker,
      instance,
      ErrorCodes.NATIVE_EVENT_HANDLER,
      [e],
    );
  };
  invoker.value = initialValue;

  return invoker;
}

/**
 * set events on elements
 *
 * @param rawEl - target element
 * @param rawName - event name
 * @param prevValue - old value
 * @param nextValue - new value
 * @param instance - vue instance
 */
export function patchEvent(
  rawEl: HippyElement & { _vei?: Record<string, Invoker | undefined> },
  rawName: string,
  prevValue: EventValue | null,
  nextValue: EventValue | null,
  instance: ComponentInternalInstance | null = null,
): void {
  // vei = vue event invokers
  const el = rawEl;
  const invokers: Record<string, Invoker | undefined> = el._vei ?? (el._vei = {});
  const existingInvoker: Invoker | undefined = invokers[rawName];

  if (nextValue && existingInvoker) {
    // update event
    existingInvoker.value = nextValue;
  } else {
    const [name, options] = parseName(rawName);

    if (nextValue) {
      // first create the event and save it in _vei, then bind the event to el
      invokers[rawName] = createInvoker(nextValue, instance);
      const invoker = invokers[rawName];
      el.addEventListener(
        name as string,
        invoker as Invoker,
        options as EventOption,
      );
    } else {
      // remove the event, first remove the event from el
      el.removeEventListener(
        name as string,
        existingInvoker as Invoker,
        options as EventOption,
      );
      // then remove the event in _vei
      invokers[rawName] = undefined;
    }
  }
}
