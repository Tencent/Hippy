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
 * Hippy event dispatcher, which distributes events triggered by users or generated by Native
 */
import type { NeedToTyped } from '../../types';
import { trace } from '../../util';
import { getNodeById } from '../../util/node-cache';
import type { HippyNode } from '../node/hippy-node';

import { EventBus } from './event-bus';
import {
  type EventsUnionType,
  HippyEvent,
  HippyLayoutEvent,
} from './hippy-event';

// Extend the global object and introduce third-party injected objects
declare global {
  // eslint-disable-next-line  no-var, @typescript-eslint/naming-convention, vars-on-top
  var __GLOBAL__: NeedToTyped;
}

// Native event type
export type NativeEvent = NeedToTyped[];

// Native gesture event
export interface NativeGestureEvent {
  // Native node id that triggered the event
  id: number;
  // event name
  name: string;
}

const componentName = ['%c[event]%c', 'color: green', 'color: auto'];

/**
 * get event name in vue
 *
 * @param eventName - event name
 * @param targetNode - target node
 */
function getVueEventName(eventName: string, targetNode: HippyNode): string {
  const { eventNamesMap } = targetNode.component;
  // if the event name is a component custom event, return the event name directly
  if (eventNamesMap?.has(eventName)) {
    return eventNamesMap.get(eventName) as string;
  }
  // events that do not start with on maybe custom events, and return the event name directly
  if (eventName.indexOf('on') !== 0) {
    return eventName;
  }
  // remove the on in the event name and convert the first letter to lowercase, eg. onClick => click
  const str = eventName.slice(2, eventName.length);
  return `${str.charAt(0).toLowerCase()}${str.slice(1)}`;
}

/**
 * determine whether the native event is legal
 *
 * @param nativeEvent - native event
 */
function isInvalidNativeEvent(nativeEvent: NativeEvent): boolean {
  return !nativeEvent || !Array.isArray(nativeEvent) || nativeEvent.length < 2;
}

/**
 * Hippy event dispatcher
 * Native will trigger three types of events
 */
const HippyEventDispatcher = {
  /**
   * Receive native events forwarded to Vue, such as page visible, etc.
   *
   * @param nativeEvent - native event
   */
  receiveNativeEvent(nativeEvent: NativeEvent): void {
    trace(...componentName, 'receiverNativeEvent', nativeEvent);

    if (isInvalidNativeEvent(nativeEvent)) {
      return;
    }

    const [eventName, eventParams] = nativeEvent;

    // forward native events directly to the event bus for distribution by the bus
    EventBus.$emit(eventName, eventParams);
  },

  /**
   * Receive notifications of native interaction events, such as clicks, slides, etc.
   *
   * @param nativeEvent - native event
   */
  receiveNativeGesture(nativeEvent: NativeGestureEvent): void {
    trace(...componentName, 'receiveNativeGesture', nativeEvent);

    if (!nativeEvent) {
      return;
    }

    const { id: targetNodeId, name: eventName } = nativeEvent;
    const targetNode = getNodeById(targetNodeId);

    if (!targetNode) {
      return;
    }

    const targetEventName = getVueEventName(eventName, targetNode);
    const targetEvent = new HippyEvent(targetEventName);
    const { processEventData } = targetNode.component;
    if (processEventData) {
      processEventData(
        {
          __evt: eventName,
          handler: targetEvent,
        } as EventsUnionType,
        nativeEvent,
      );
    }
    targetNode.dispatchEvent(targetEvent);
  },

  /**
   * Receive event notifications from UI classes, such as keyboard input, etc.
   */
  receiveUIComponentEvent(nativeEvent: NativeEvent): void {
    trace(...componentName, 'receiveUIComponentEvent', nativeEvent);

    if (isInvalidNativeEvent(nativeEvent)) {
      return;
    }

    const [targetNodeId, eventName, params] = nativeEvent;
    if (typeof targetNodeId !== 'number' || typeof eventName !== 'string') {
      return;
    }

    const targetNode = getNodeById(targetNodeId);
    if (!targetNode) {
      return;
    }

    const targetEventName = getVueEventName(eventName, targetNode);

    // process layout event
    if (eventName === 'onLayout') {
      const { layout } = params;
      const targetLayoutEvent = new HippyLayoutEvent(targetEventName);
      targetLayoutEvent.top = layout.y;
      targetLayoutEvent.left = layout.x;
      targetLayoutEvent.bottom = layout.y + layout.height;
      targetLayoutEvent.right = layout.x + layout.width;
      targetLayoutEvent.width = layout.width;
      targetLayoutEvent.height = layout.height;
      // dispatch event
      targetNode.dispatchEvent(targetLayoutEvent);
    } else {
      const targetEvent = new HippyEvent(targetEventName);

      // other event processing, if the node itself has additional event processing logic, it also needs to be processed
      const { processEventData } = targetNode.component;

      if (processEventData) {
        processEventData(
          {
            __evt: eventName,
            handler: targetEvent,
          } as EventsUnionType,
          params,
        );
      }
      // dispatch event
      targetNode.dispatchEvent(targetEvent);
    }
  },
};

// Register the event dispatcher to the global interface, and the Native event trigger will call
if (global.__GLOBAL__) {
  global.__GLOBAL__.jsModuleList.EventDispatcher = HippyEventDispatcher;
}
