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

import { looseEqual } from '@vue/shared';

import type { CallbackType } from '../../types';
import type { HippyEvent } from './hippy-event';

export interface EventListenerOptions {
  [key: string]: string | boolean;
}

interface EventListener {
  // event callback
  callback: CallbackType;
  // options
  options?: EventListenerOptions;
}

// callback event list
interface EventListeners {
  [eventName: string]: EventListener[] | undefined;
}

/**
 * Hippy Event Target
 */
export abstract class HippyEventTarget {
  /**
   * Find the index position of the matching callback in the event callback list
   *
   * @param list - list of event listeners
   * @param callback - call back
   * @param options - options
   *
   */
  private static indexOfListener(
    list: EventListener[],
    callback: CallbackType,
    options: EventListenerOptions,
  ): number {
    return list.findIndex((entry) => {
      if (options) {
        return (
          entry.callback === callback && looseEqual(entry.options, options)
        );
      }

      return entry.callback === callback;
    });
  }

  // event listeners list
  protected listeners: EventListeners = {};

  /**
   * add event listener
   *
   * @param type - event name
   * @param callback - callback
   * @param options - options
   */
  public addEventListener(
    type: string,
    callback: CallbackType,
    options?: EventListenerOptions,
  ): void {
    // there can be multiple event names, separated by commas
    const events = type.split(',');
    const len = events.length;
    for (let i = 0; i < len; i += 1) {
      const eventName = events[i].trim();

      // get currently registered events
      const existEventList = this.listeners[eventName];
      // event list
      const eventList = existEventList ?? [];

      eventList.push({
        callback,
        options,
      });

      this.listeners[eventName] = eventList;
    }
  }

  /**
   * remove event listener
   *
   * @param type - event name
   * @param callback - callback
   * @param options - options
   */
  public removeEventListener(
    type: string,
    callback: CallbackType,
    options?: EventListenerOptions,
  ): void {
    // there can be multiple event names, separated by commas
    const events = type.split(',');
    const len = events.length;
    for (let i = 0; i < len; i += 1) {
      const eventName = events[i].trim();

      if (callback) {
        // callback is specified
        if (this.listeners[eventName]) {
          const list = this.listeners[eventName];

          if (list?.length) {
            // find the specified callback
            const index = HippyEventTarget.indexOfListener(
              list,
              callback,
              options as EventListenerOptions,
            );

            if (index >= 0) {
              // there is a matching option, remove it
              list.splice(index, 1);
            }

            // if the callback list is empty after removing the callback, clear the callback
            if (!list.length) {
              this.listeners[eventName] = undefined;
            }
          }
        }
      } else {
        // if no callback is specified, the callback for the entire event is removed
        this.listeners[eventName] = undefined;
      }
    }
  }

  /**
   * emit event
   *
   * @param event - event object
   */
  public emitEvent(event: HippyEvent): void {
    const { type: eventName } = event;
    const listeners = this.listeners[eventName];

    if (!listeners) {
      return;
    }

    // take out the list of callback functions of the specified event type and execute them one by one
    for (let i = listeners.length - 1; i >= 0; i -= 1) {
      const listener = listeners[i];

      // if the event is once, execute only once
      if (listener.options?.once) {
        listeners.splice(i, 1);
      }

      if (listener.options?.thisArg) {
        // this variable is specified, use apply
        listener.callback.apply(listener.options.thisArg, [event]);
      } else {
        listener.callback(event);
      }
    }
  }

  /**
   * Get the list of events bound to the current node
   */
  public getEventListenerList(): EventListeners {
    return this.listeners;
  }
}
