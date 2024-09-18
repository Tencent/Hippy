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

global.__ISHIPPY__ = true;
global.__GLOBAL__ = {
  globalEventHandle: {},
};

class ErrorEvent {
  constructor(message, filename, lineno, colno, error) {
    this.message = message;
    this.filename = filename;
    this.lineno = lineno;
    this.colno = colno;
    this.error = error;
  }
}

/**
 * Register the Hippy app entry function, the native will trigger an event to execute the function
 * and start the app.
 *
 * The different platforms the event name is different, for Android it's 'loadInstance',
 * for iOS it's 'runApplication'.
 *
 * For the same app startup multiple times, it needs to use a different Javascript Context
 * for the environment isolation.
 *
 * @param {string} appName - The app name will be register.
 * @param {*} entryFunc - The entry function will be execute after native called.
 */
function hippyRegister(appName, entryFunc) {
  // Call the iOS native for rename the context to appName.
  __GLOBAL__.appRegister[appName] = {
    run: entryFunc,
  };
}

/**
 * Register a listener for a specific event, and the listener will be called
 * when the event is triggered.
 *
 * @param {string} eventName - The event name will be registered.
 * @param {Function} listener - Event callback.
 * @returns {Set} - Set of event listeners
 */
function on(eventName, listener) {
  if (typeof eventName !== 'string' || typeof listener !== 'function') {
    throw new TypeError('Hippy.on() only accept a string as event name and a function as listener');
  }

  let eventListeners = __GLOBAL__.globalEventHandle[eventName];
  if (!(eventListeners instanceof Set)) {
    __GLOBAL__.globalEventHandle[eventName] = new Set();
    eventListeners = __GLOBAL__.globalEventHandle[eventName];
  }
  eventListeners.add(listener);
  return eventListeners;
}

/**
 * Remove specific event listener,
 *
 * @param {string} eventName - The event name will be removed.
 * @param {Function} listener - Specific event callback will be removed,
 *                              the listeners will clean all if not specific.
 * @returns {Set | null} - Set of event listeners, or null of empty.
 */
function off(eventName, listener) {
  if (typeof eventName !== 'string') {
    throw new TypeError('Hippy.off() only accept a string as event name');
  }
  const eventListeners = __GLOBAL__.globalEventHandle[eventName];
  if (!(eventListeners instanceof Set)) {
    return null;
  }
  if (listener) {
    eventListeners.delete(listener);
    return eventListeners;
  }
  eventListeners.clear();
  return null;
}

/**
 * Trigger a event with arguments.
 *
 * @param {string} eventName - The event name will be trigger.
 * @param  {any} args - Event callback arguments.
 */
function emit(eventName, ...args) {
  if (typeof eventName !== 'string') {
    throw new TypeError('Hippy.emit() only accept a string as event name');
  }

  let isErr = eventName === 'error';
  let errObj = new Error();
  if (isErr) {
    let arr = args[0];
    if (!(arr instanceof Array)) {
      throw new TypeError('Hippy.emit() error event, args0 must be array');
    }
    if (arr.length !== 5) {
      throw new TypeError('Hippy.emit() error event, args0 length must be 5');
    }
    errObj.message = JSON.stringify(arr[4]);
    if (Hippy.onerror) {
      Hippy.onerror(arr[0], arr[1], arr[2], arr[3], errObj);
    }
  }

  const eventListeners = __GLOBAL__.globalEventHandle[eventName];
  if (!eventListeners) {
    if (args[0]) {
      console.error(args[0].toString());
    }
    return;
  }
  try {
    if (isErr) {
      let arr = args[0];
      let event = new ErrorEvent(arr[0], arr[1], arr[2], arr[3], errObj);
      eventListeners.forEach(listener => listener(event));
    } else {
      eventListeners.forEach(listener => listener(...args));
    }
  } catch (err) {
    /* eslint-disable-next-line no-console */
    console.error(err);
  }
}

Hippy.device = {};
Hippy.bridge = {};
Hippy.register = {
  regist: hippyRegister,
};
Hippy.on = on;
Hippy.off = off;
Hippy.emit = emit;
Hippy.addEventListener = on;
Hippy.removeEventListener = off;
Hippy.onerror = undefined;
