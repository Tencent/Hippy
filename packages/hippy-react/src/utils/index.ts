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

const IS_NUMBER_REG = new RegExp(/^\d+$/);
let silent = false;
let defaultBubbles = false;

/**
 * Trace running information
 */
function trace(...context: any[]) {
  // In production build or silent
  if (process.env.NODE_ENV === 'production' || silent) {
    return;
  }
  console.log(...context);
}

/**
 * Warning information output
 */
function warn(...context: any[]) {
  // In production build
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  console.warn(...context);
}

/**
 * Convert unicode string to normal string
 * @param {string} text - The unicode string input
 */
function unicodeToChar(text: string): string {
  return text.replace(/\\u[\dA-F]{4}|\\x[\dA-F]{2}/gi, match => String.fromCharCode(parseInt(match.replace(/\\u|\\x/g, ''), 16)));
}

const captureEventReg = new RegExp('^on.+Capture$');
/**
 * ensure capture event name
 * @param {any} eventName
 */
function isCaptureEvent(eventName: any) {
  return captureEventReg.test(eventName);
}

/**
 * Convert to string as possible
 */
const numberRegEx = new RegExp('^(?=.+)[+-]?\\d*\\.?\\d*([Ee][+-]?\\d+)?$');
/**
 * Try to convert something to number
 *
 * @param {any} input - The input try to convert number
 */
function tryConvertNumber(input: any) {
  if (typeof input === 'number') {
    return input;
  }
  if (typeof input === 'string' && numberRegEx.test(input)) {
    try {
      return parseFloat(input);
    } catch (err) {
      return input;
    }
  }
  return input;
}

/**
 * Determine input is function.
 *
 * @param {any} input - The input will determine is function.
 * @returns {boolean}
 */
function isFunction(input: any): boolean {
  return Object.prototype.toString.call(input) === '[object Function]';
}

/**
 * Determine a string is number.
 * @param {string} input - the input will determine is number.
 * @returns {boolean}
 */
function isNumber(input: string): boolean {
  return IS_NUMBER_REG.test(input);
}

/**
 * Make trace be silent.
 * @param {boolean} silentArg - The silent flag for log
 */
function setSilent(silentArg: boolean): void {
  silent = silentArg;
}

/**
 * set bubbles config, default is false
 * @param bubbles
 */
function setBubbles(bubbles: boolean = false): void {
  defaultBubbles = bubbles;
}

/**
 * get bubbles config
 * @returns boolean
 */
function isGlobalBubble(): boolean {
  return defaultBubbles;
}

/**
 * Convert Image url to specific type
 * @param url - image path
 */
function convertImgUrl(url: string): string {
  if (url && !/^(http|https):\/\//.test(url) && url.indexOf('assets') > -1) {
    if (process.env.NODE_ENV !== 'production') {
      const addStr1 = 'http://';
      return `${addStr1}127.0.0.1:${process.env.PORT}/${url}`;
    }
    const addStr2 = 'hpfile://';
    return `${addStr2}./${url}`;
  }
  return url;
}

/**
 * isHostComponent - judge current tag is hostComponent type
 * @param {number} tag
 */
function isHostComponent(tag: number) {
  return tag === 5;
}

export {
  trace,
  warn,
  unicodeToChar,
  tryConvertNumber,
  isCaptureEvent,
  isFunction,
  isNumber,
  setSilent,
  setBubbles,
  isGlobalBubble,
  convertImgUrl,
  isHostComponent,
};
