/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
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
          warn(`@${eventName} is deprecated because it's not compatible with browser standard, please use @${eventName.toLowerCase()} to instead as soon, supported after hippy-vue 1.3.3`);
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
