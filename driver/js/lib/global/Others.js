"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
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
  globalEventHandle: {}
};
var ErrorEvent = /*#__PURE__*/_createClass(function ErrorEvent(message, filename, lineno, colno, error) {
  _classCallCheck(this, ErrorEvent);
  this.message = message;
  this.filename = filename;
  this.lineno = lineno;
  this.colno = colno;
  this.error = error;
});
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
    run: entryFunc
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
  var eventListeners = __GLOBAL__.globalEventHandle[eventName];
  if (!_instanceof(eventListeners, Set)) {
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
  var eventListeners = __GLOBAL__.globalEventHandle[eventName];
  if (!_instanceof(eventListeners, Set)) {
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
function emit(eventName) {
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }
  if (typeof eventName !== 'string') {
    throw new TypeError('Hippy.emit() only accept a string as event name');
  }
  var isErr = eventName === 'error';
  var errObj = new Error();
  if (isErr) {
    var arr = args[0];
    if (!_instanceof(arr, Array)) {
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
  var eventListeners = __GLOBAL__.globalEventHandle[eventName];
  if (!eventListeners) {
    if (args[0]) {
      console.error(args[0].toString());
    }
    return;
  }
  try {
    if (isErr) {
      var _arr = args[0];
      var event = new ErrorEvent(_arr[0], _arr[1], _arr[2], _arr[3], errObj);
      eventListeners.forEach(function (listener) {
        return listener(event);
      });
    } else {
      eventListeners.forEach(function (listener) {
        return listener.apply(void 0, args);
      });
    }
  } catch (err) {
    /* eslint-disable-next-line no-console */
    console.error(err);
  }
}
Hippy.device = {};
Hippy.bridge = {};
Hippy.register = {
  regist: hippyRegister
};
Hippy.on = on;
Hippy.off = off;
Hippy.emit = emit;
Hippy.addEventListener = on;
Hippy.removeEventListener = off;
Hippy.onerror = undefined;