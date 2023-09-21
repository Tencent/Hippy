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
import { trace, warn } from '../../util';
import { getNodeById } from '../../util/node';
import { DOMEventPhase } from '../../util/event';
import { type HippyElement } from '../element/hippy-element';
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

// Native gesture event
export interface NativeGestureEvent {
  // Native node id that triggered the event
  id: number;
  // event name
  name: string;
}

type EventParam = string[] | number[];

interface NativeEvent {
  id: number;
  currentId: number;
  nativeName: string;
  originalName: string;
  eventPhase: HippyTypes.EventPhase,
  params?: any
}

const LOG_TYPE = ['%c[event]%c', 'color: green', 'color: auto'];

/**
 * determine whether the native event is legal
 *
 * @param nativeEvent - native event
 */
function isInvalidNativeEvent(nativeEvent: NativeEvent | EventParam): boolean {
  return !nativeEvent || !Array.isArray(nativeEvent) || nativeEvent.length < 2;
}

function isTouchEvent(eventName) {
  return ['onTouchDown', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'].indexOf(eventName) >= 0;
}

/**
 * convert events
 */
function convertEvent(eventName, targetEvent, params) {
  if (isTouchEvent(eventName)) {
    Object.assign(targetEvent, {
      touches: {
        0: {
          clientX: params.page_x,
          clientY: params.page_y,
        },
        length: 1,
      },
    });
  }
  return targetEvent;
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
  receiveNativeEvent(nativeEvent: EventParam): void {
    trace(...LOG_TYPE, 'receiverNativeEvent', nativeEvent);
    if (isInvalidNativeEvent(nativeEvent)) {
      return;
    }
    const [eventName, eventParams] = nativeEvent;
    // forward native events directly to the event bus for distribution by the bus
    EventBus.$emit(eventName as string, eventParams);
  },

  /**
   * Receive event notifications from UI classes, such as keyboard input, etc.
   */
  receiveComponentEvent(nativeEvent: NativeEvent, domEvent: HippyTypes.DOMEvent): void {
    trace(...LOG_TYPE, 'receiveComponentEvent', nativeEvent);

    if (!nativeEvent || !domEvent) {
      warn(...LOG_TYPE, 'receiveComponentEvent', 'nativeEvent or domEvent not exist');
      return;
    }

    const { id, currentId, nativeName, originalName, params = {}, eventPhase } = nativeEvent;
    const currentTargetNode = getNodeById(currentId) as HippyElement;
    const targetNode = getNodeById(id) as HippyElement;

    if (!currentTargetNode || !targetNode) {
      warn(...LOG_TYPE, 'receiveComponentEvent', 'currentTargetNode or targetNode not exist');
      return;
    }

    try {
      if ([DOMEventPhase.AT_TARGET, DOMEventPhase.BUBBLING_PHASE].indexOf(eventPhase) > -1) {
        // process layout event
        let targetEvent;
        if (nativeName === 'onLayout') {
          targetEvent = new HippyLayoutEvent(originalName);
          Object.assign(targetEvent, { eventPhase, nativeParams: params ?? {} });
          const { layout: { x, y, height, width } } = params;
          targetEvent.top = y;
          targetEvent.left = x;
          targetEvent.bottom = y + height;
          targetEvent.right = x + width;
          targetEvent.width = width;
          targetEvent.height = height;
        } else {
          targetEvent = new HippyEvent(originalName);
          Object.assign(targetEvent, { eventPhase, nativeParams: params ?? {} });
          // other event processing, if the node itself has additional event processing logic,
          // it also needs to be processed
          const { processEventData } = targetNode.component;
          if (processEventData) {
            processEventData(
              {
                __evt: nativeName,
                handler: targetEvent,
              } as EventsUnionType,
              params,
            );
          }
        }
        currentTargetNode.dispatchEvent(
          convertEvent(nativeName, targetEvent, params),
          targetNode as HippyElement,
          domEvent,
        );
      }
    } catch (err) {
      console.error('receiveComponentEvent error', err);
    }
  },
};

// Register the event dispatcher to the global interface, and the Native event trigger will call
if (global.__GLOBAL__) {
  global.__GLOBAL__.jsModuleList.EventDispatcher = HippyEventDispatcher;
}

export {
  HippyEventDispatcher,
};