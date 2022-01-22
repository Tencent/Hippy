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

import { looseEqual } from 'shared/util';
import { isFunction, warn } from '../../../util';

class EventEmitter {
  constructor(element) {
    this.element = element;
    this._observers = {};
  }

  getEventListeners() {
    return this._observers;
  }

  addEventListener(eventNames, callback, options) {
    if (typeof eventNames !== 'string') {
      throw new TypeError('Events name(s) must be string.');
    }

    if (callback && !isFunction(callback)) {
      throw new TypeError('callback must be function.');
    }

    const events = eventNames.split(',');
    for (let i = 0, l = events.length; i < l; i += 1) {
      const eventName = events[i].trim();
      if (process.env.NODE_ENV !== 'production') {
        if (['touchStart', 'touchMove', 'touchEnd', 'touchCancel'].indexOf(eventName) !== -1) {
          warn(`@${eventName} is deprecated because it's not compatible with browser standard, please use @${eventName.toLowerCase()} to instead as so on.`);
        }
      }
      const list = this._getEventList(eventName, true);
      list.push({
        callback,
        options,
      });
    }
    return this._observers;
  }

  removeEventListener(eventNames, callback, options) {
    if (typeof eventNames !== 'string') {
      throw new TypeError('Events name(s) must be string.');
    }

    if (callback && !isFunction(callback)) {
      throw new TypeError('callback must be function.');
    }

    const events = eventNames.split(',');
    for (let i = 0, l = events.length; i < l; i += 1) {
      const eventName = events[i].trim();
      if (callback) {
        const list = this._getEventList(eventName, false);
        if (list) {
          const index = this._indexOfListener(list, callback, options);
          if (index >= 0) {
            list.splice(index, 1);
          }
          if (list.length === 0) {
            this._observers[eventName] = undefined;
          }
        }
      } else {
        this._observers[eventName] = undefined;
      }
    }
    return this._observers;
  }

  emit(eventInstance) {
    const { type: eventName } = eventInstance;
    const observers = this._observers[eventName];
    if (!observers) {
      return;
    }
    for (let i = observers.length - 1; i >= 0; i -= 1) {
      const entry = observers[i];
      if (entry.options && entry.options.once) {
        observers.splice(i, 1);
      }
      if (entry.options && entry.options.thisArg) {
        entry.callback.apply(entry.options.thisArg, [eventInstance]);
      } else {
        entry.callback(eventInstance);
      }
    }
  }

  _getEventList(eventName, createIfNeeded) {
    let list = this._observers[eventName];
    if (!list && createIfNeeded) {
      list = [];
      this._observers[eventName] = list;
    }

    return list;
  }

  _indexOfListener(list, callback, options) {
    return list.findIndex((entry) => {
      if (options) {
        return entry.callback === callback && looseEqual(entry.options, options);
      }
      return entry.callback === callback;
    });
  }
}

export {
  EventEmitter,
};
