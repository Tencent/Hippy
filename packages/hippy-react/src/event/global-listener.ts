/* !
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2023 THL A29 Limited, a Tencent company.
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

import { warn } from '../utils';
import EventDispatcher from './dispatcher';
import HippyEventListener from './listener';

export interface GlobalEventListeners {
  [eventName: string]: {
    eventListener: HippyEventListener,
    eventMap: any,
  }
}

const globalEventListeners: GlobalEventListeners | object = {};

function addListener(event, callback, context) {
  if (!globalEventListeners[event]) {
    globalEventListeners[event] = {
      eventListener: new HippyEventListener(event),
      eventMap: new Map<() => void, number>(),
    };
  }
  const { eventListener, eventMap } = globalEventListeners[event];
  const listenerId = eventListener.addCallback(callback, context);
  if (typeof listenerId !== 'number') {
    throw new Error('Fail to addCallback in addListener');
  }
  eventMap.set(callback, listenerId);
}

function removeListener(event, callback) {
  // remove specific listener for this event
  const eventInfo = globalEventListeners[event];
  if (!eventInfo) {
    return warn(`Event [${event}] has not been registered yet in EventBus`);
  }
  const { eventListener, eventMap } = eventInfo;
  // remove all listeners for this event
  if (!callback) {
    eventListener.unregister();
    eventMap.clear();
    delete globalEventListeners[event];
  } else {
    // remove specific listener for this event
    const listenerId = eventMap.get(callback);
    if (typeof listenerId !== 'number') {
      return warn(`The listener for event [${event}] cannot be found to remove`);
    }
    eventListener.removeCallback(listenerId);
    eventMap.delete(callback);
    // if listeners size is 0, means this event info needs to be deleted
    if (eventMap.size === 0) {
      delete globalEventListeners[event];
    }
  }
}

const EventBus = {
  on: (events: string | string[] | undefined, callback: (data?: any) => void, context?: any) => {
    if ((typeof events !== 'string' && !Array.isArray(events)) || typeof callback !== 'function') {
      throw new TypeError('Invalid arguments for EventBus.on()');
    }
    if (Array.isArray(events)) {
      events.forEach((event) => {
        addListener(event, callback, context);
      });
    } else {
      addListener(events, callback, context);
    }
    return EventBus;
  },
  off: (events: string | string[] | undefined, callback?: (data?: any) => void) => {
    if (typeof events !== 'string' && !Array.isArray(events)) {
      throw new TypeError('The event argument is not string or array for EventBus.off()');
    }
    if (Array.isArray(events)) {
      events.forEach((event) => {
        removeListener(event, callback);
      });
    } else {
      removeListener(events, callback);
    }
    return EventBus;
  },
  sizeOf(event: string | undefined) {
    if (typeof event !== 'string') {
      throw new TypeError('The event argument is not string for EventBus.sizeOf()');
    }
    const eventInfo = globalEventListeners[event];
    if (eventInfo?.eventMap) {
      return eventInfo.eventMap.size;
    }
    return 0;
  },
  emit(event: string | undefined, ...param: any) {
    if (typeof event !== 'string') {
      throw new TypeError('The event argument is not string for EventBus.emit()');
    }
    const eventHub = EventDispatcher.getHippyEventHub(event);
    if (!eventHub) {
      warn(`Event [${event}] has not been registered yet in EventBus`);
      return EventBus;
    }
    eventHub.notifyEvent(...param);
    return EventBus;
  },
};

export default EventBus;
