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

/* eslint-disable prefer-destructuring */
/* eslint-disable no-underscore-dangle */

import { once } from 'shared/util';
import { HIPPY_DEBUG_ADDRESS, HIPPY_STATIC_PROTOCOL } from '../runtime/constants';
import { CallbackType, NeedToTyped } from '../types/native';

const VUE_VERSION = process.env.VUE_VERSION;
const HIPPY_VUE_VERSION = process.env.HIPPY_VUE_VERSION;

let _App: NeedToTyped;
let _Vue: NeedToTyped;

/**
 * Style pre-process hook
 *
 * Use for hack the style processing, update the property
 * or value manually.
 *
 * @param {Object} decl - Style declaration.
 * @param {string} decl.property - Style property name.
 * @param {string|number} decl.value - Style property value.
 * @returns {Object} decl - Processed declaration, original declaration by default.
 */
let _beforeLoadStyle = (decl: NeedToTyped) => decl;
let _beforeRenderToNative = () => {};

function setVue(Vue: NeedToTyped) {
  _Vue = Vue;
}

function getVue() {
  return _Vue;
}

function setApp(app: NeedToTyped) {
  _App = app;
}

function getApp() {
  return _App;
}

function setBeforeLoadStyle(beforeLoadStyle: NeedToTyped) {
  _beforeLoadStyle = beforeLoadStyle;
}

function getBeforeLoadStyle() {
  return _beforeLoadStyle;
}

function setBeforeRenderToNative(beforeRenderToNative: NeedToTyped) {
  _beforeRenderToNative = beforeRenderToNative;
}

function getBeforeRenderToNative() {
  return _beforeRenderToNative;
}

const infoTrace = once(() => {
  console.log('Hippy-Vue has "Vue.config.silent" to control trace log output, to see output logs if set it to false.');
});

function isDev() {
  return process.env.NODE_ENV !== 'production';
}

function isTraceEnabled() {
  return !(!isDev()
    || (process?.release)
    || (_Vue?.config.silent));
}

function trace(...context: NeedToTyped[]) {
  if (isTraceEnabled()) {
    console.log(...context);
  } else if (_Vue?.config.silent) {
    infoTrace();
  }
}

function warn(...context: NeedToTyped[]) {
  if (!isDev()) {
    return null;
  }
  return console.warn(...context);
}

function capitalizeFirstLetter(str: NeedToTyped) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert string to number as possible
 */
const numberRegEx = new RegExp('^(?=.+)[+-]?\\d*\\.?\\d*([Ee][+-]?\\d+)?$');
function tryConvertNumber(str: string) {
  if (typeof str === 'number') {
    return str;
  }
  if (typeof str === 'string' && numberRegEx.test(str)) {
    try {
      return parseFloat(str);
    } catch (err) {
      // pass
    }
  }
  return str;
}

function unicodeToChar(text: string) {
  return text.replace(/\\u[\dA-F]{4}|\\x[\dA-F]{2}/gi, (match: NeedToTyped) => String.fromCharCode(parseInt(match.replace(/\\u|\\x/g, ''), 16)));
}

function arrayCount(arr: NeedToTyped, iterator: NeedToTyped) {
  let count = 0;
  for (let i = 0; i < arr.length; i += 1) {
    if (iterator(arr[i])) {
      count += 1;
    }
  }
  return count;
}

/**
 * Better function checking
 */
function isFunction(func: CallbackType) {
  return Object.prototype.toString.call(func) === '[object Function]';
}

/**
 * Compare two sets
 */
function setsAreEqual(as: NeedToTyped, bs: NeedToTyped) {
  if (as.size !== bs.size) return false;
  const values = as.values();
  let a = values.next().value;
  while (a) {
    if (!bs.has(a)) {
      return false;
    }
    a = values.next().value;
  }
  return true;
}

/**
 * endsWith polyfill for iOS 8 compatibility
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith#Polyfill
 *
 * @param {string} str - The characters with specified string.
 * @param {string} search - The characters to be searched for at the end of str.
 * @param {number} length - If provided, it is used as the length of str. Defaults to str.length.
 * @return {boolean}
 */
function endsWith(str: string, search: string, length?: number) {
  if (str.endsWith) {
    return str.endsWith(search, length);
  }
  let strLen = length;
  if (strLen === undefined || strLen > str.length) {
    strLen = str.length;
  }
  return str.slice(strLen - search.length, strLen) === search;
}

/**
 * convert local image path to native specific schema
 * @param {string} originalUrl
 * @returns {string}
 */
function convertImageLocalPath(originalUrl: string) {
  let url = originalUrl;
  if (/^assets/.test(url)) {
    if (isDev()) {
      url = `${HIPPY_DEBUG_ADDRESS}${url}`;
    } else {
      url = `${HIPPY_STATIC_PROTOCOL}./${url}`;
    }
  }
  return url;
}

function deepCopy(data: NeedToTyped, hash = new WeakMap()) {
  if (typeof data !== 'object' || data === null) {
    throw new TypeError('deepCopy data is object');
  }
  // is it data existed in WeakMap
  if (hash.has(data)) {
    return hash.get(data);
  }
  const newData = {};
  const dataKeys = Object.keys(data);
  dataKeys.forEach((value) => {
    const currentDataValue = data[value];
    if (typeof currentDataValue !== 'object' || currentDataValue === null) {
      newData[value] = currentDataValue;
    } else if (Array.isArray(currentDataValue)) {
      newData[value] = [...currentDataValue];
    } else if (currentDataValue instanceof Set) {
      // @ts-ignore
      newData[value] = new Set([...currentDataValue]);
    } else if (currentDataValue instanceof Map) {
      // @ts-ignore
      newData[value] = new Map([...currentDataValue]);
    } else {
      hash.set(data, data);
      newData[value] = deepCopy(currentDataValue, hash);
    }
  });
  return newData;
}

function isNullOrUndefined(value: NeedToTyped) {
  return typeof value === 'undefined' || value === null;
}

function isStyleNotEmpty(style: string | number | null | undefined) {
  if (typeof style === 'string') {
    return style.trim() !== '';
  }
  return style !== null && style !== undefined;
}

function whitespaceFilter(str: string) {
  if (typeof str !== 'string') return str;
  // Adjusts template whitespace handling behavior.
  // "trimWhitespace": default behavior is true.
  // It will trim leading / ending whitespace including all special unicode such as \xA0(&nbsp;).
  if (!_Vue || typeof _Vue.config.trimWhitespace === 'undefined' || _Vue.config.trimWhitespace) {
    return str.trim().replace(/(&nbsp;|Â)/g, ' ');
  }
  return str.replace(/(&nbsp;|Â)/g, ' ');
}

export {
  VUE_VERSION,
  HIPPY_VUE_VERSION,
  isDev,
  setVue,
  getVue,
  setApp,
  getApp,
  setBeforeLoadStyle,
  getBeforeLoadStyle,
  setBeforeRenderToNative,
  getBeforeRenderToNative,
  trace,
  warn,
  isTraceEnabled,
  isNullOrUndefined,
  capitalizeFirstLetter,
  tryConvertNumber,
  unicodeToChar,
  arrayCount,
  isFunction,
  setsAreEqual,
  endsWith,
  convertImageLocalPath,
  deepCopy,
  whitespaceFilter,
  isStyleNotEmpty,
};
