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
 * Hippy event bus, methods such as on off emit in Vue3 have been removed, and the event bus is implemented here
 */
import type { CallbackType, NeedToTyped } from '../../config';

// all global event listeners
let globalEventListeners = Object.create(null);

/**
 * EventBus for global event handle
 */
export const EventBus = {
  /**
   * add event listener
   *
   * @param event
   * @param callback
   * @param ctx
   */
  $on(event: string | Array<string>, callback: CallbackType, ctx?: NeedToTyped) {
    if (Array.isArray(event)) {
      event.forEach((eventName) => {
        EventBus.$on(eventName, callback, ctx);
      });
    } else {
      // init event listeners
      if (!globalEventListeners[event]) {
        globalEventListeners[event] = [];
      }

      // add listener
      globalEventListeners[event].push({
        fn: callback,
        ctx,
      });
    }

    return EventBus;
  },

  /**
   * add event listener, only execute once
   *
   * @param event
   * @param callback
   * @param ctx
   */
  $once(event: string, callback: CallbackType, ctx?: NeedToTyped) {
    function listener() {
      EventBus.$off(event, listener);
      callback.apply(ctx, arguments);
    }

    listener._ = callback;
    EventBus.$on(event, listener);

    return EventBus;
  },

  /**
   * emit event
   *
   * @param event
   */
  $emit(event: string) {
    const data = [].slice.call(arguments, 1);
    const callbackList = (globalEventListeners[event] || []).slice();
    const len = callbackList.length;

    for (let i = 0; i < len; i += 1) {
      callbackList[i].fn.apply(callbackList[i].ctx, data);
    }

    return EventBus;
  },

  /**
   * remove global event listener. remove all if no params
   *
   * @param event
   * @param callback
   */
  $off(event?: string | Array<string>, callback?: CallbackType) {
    if (!event && !callback) {
      // remove all event listener
      globalEventListeners = Object.create(null);

      return EventBus;
    }

    // handle array of events
    if (Array.isArray(event)) {
      event.forEach((eventName) => {
        EventBus.$off(eventName, callback);
      });

      return EventBus;
    }

    // specific event
    const callbackList = globalEventListeners[event!];
    if (!callbackList) {
      return EventBus;
    }
    if (!callback) {
      globalEventListeners[event!] = null;
      return EventBus;
    }

    // specific handler
    let existCallback;
    const len = callbackList.length;
    for (let i = 0; i < len; i++) {
      existCallback = callbackList[i];
      if (existCallback.fn === callback || existCallback.fn._ === callback) {
        // remove specific listener
        callbackList.splice(i, 1);
        break;
      }
    }

    return EventBus;
  },
};
