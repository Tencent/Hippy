/* eslint-disable prefer-destructuring */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */

import { once } from 'shared/util';

const VUE_VERSION = process.env.VUE_VERSION;
const HIPPY_VUE_VERSION = process.env.HIPPY_VUE_VERSION;

let _App;
let _Vue;

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

const infoTrace = once(() => {
  console.log(
    'Hippy-Vue has "Vue.config.silent" set to true, to see output logs set it to false.',
  );
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
const numberRegEx = new RegExp('^[+-]?\\d+(\\.\\d+)?$');
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

export {
  VUE_VERSION,
  HIPPY_VUE_VERSION,
  setVue,
  getVue,
  setApp,
  getApp,
  trace,
  warn,
  capitalizeFirstLetter,
  tryConvertNumber,
  unicodeToChar,
  arrayCount,
  isFunction,
  setsAreEqual,
};
