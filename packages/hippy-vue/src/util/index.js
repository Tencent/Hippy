/* eslint-disable prefer-destructuring */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */

import { once } from 'shared/util';
import { HIPPY_DEBUG_ADDRESS, HIPPY_STATIC_PROTOCOL } from '../runtime/constants';

const VUE_VERSION = process.env.VUE_VERSION;
const HIPPY_VUE_VERSION = process.env.HIPPY_VUE_VERSION;

let _App;
let _Vue;

/**
 * Style pre-process hook
 *
 * Use for hack the style processing, update the property
 * or value mannuly.
 *
 * @param {Object} decl - Style declaration.
 * @param {string} decl.property - Style property name.
 * @param {string|number} decl.value - Style property value.
 * @returns {Object} decl - Processed declaration, original declaration by default.
 */
let _beforeLoadStyle = decl => decl;

function setVue(Vue) {
  _Vue = Vue;
}

function getVue() {
  return _Vue;
}

function setApp(app) {
  _App = app;
}

function getApp() {
  return _App;
}

function setBeforeLoadStyle(beforeLoadStyle) {
  _beforeLoadStyle = beforeLoadStyle;
}

function getBeforeLoadStyle() {
  return _beforeLoadStyle;
}

const infoTrace = once(() => {
  console.log('Hippy-Vue has "Vue.config.silent" set to true, to see output logs set it to false.');
});

function trace(...context) {
  // In production build
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  // Not in debugger mode or running in NodeJS
  if (process && process.release) {
    return;
  }

  // Print message while keeps silent
  if (_Vue && _Vue.config.silent) {
    infoTrace();
    return;
  }
  console.log(...context);
}

function warn(...context) {
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  return console.warn(...context);
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert string to number as possible
 */
const numberRegEx = new RegExp('^(?=.+)[+-]?\\d*\\.?\\d*([Ee][+-]?\\d+)?$');
function tryConvertNumber(str) {
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

function unicodeToChar(text) {
  return text.replace(/\\u[\dA-F]{4}|\\x[\dA-F]{2}/gi, match => String.fromCharCode(parseInt(match.replace(/\\u|\\x/g, ''), 16)));
}

function arrayCount(arr, iterator) {
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
function isFunction(func) {
  return Object.prototype.toString.call(func) === '[object Function]';
}

/**
 * Compare two sets
 */
function setsAreEqual(as, bs) {
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
 * endsWith polyfill for iOS 8 compatiblity
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith#Polyfill
 *
 * @param {string} str - The characters with specified string.
 * @param {string} search - The characters to be searched for at the end of str.
 * @param {number} length - If provided, it is used as the length of str. Defaults to str.length.
 * @return {boolean}
 */
function endsWith(str, search, length) {
  if (String.prototype.endsWith) {
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
function convertImageLocalPath(originalUrl) {
  let url = originalUrl;
  if (/^assets/.test(url)) {
    if (process.env.NODE_ENV !== 'production') {
      url = `${HIPPY_DEBUG_ADDRESS}${url}`;
    } else {
      url = `${HIPPY_STATIC_PROTOCOL}./${url}`;
    }
  }
  return url;
}

export {
  VUE_VERSION,
  HIPPY_VUE_VERSION,
  setVue,
  getVue,
  setApp,
  getApp,
  setBeforeLoadStyle,
  getBeforeLoadStyle,
  trace,
  warn,
  capitalizeFirstLetter,
  tryConvertNumber,
  unicodeToChar,
  arrayCount,
  isFunction,
  setsAreEqual,
  endsWith,
  convertImageLocalPath,
};
