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

import type { ComponentPublicInstance } from '@vue/runtime-core';
import { capitalize } from '@vue/shared';
import type { CallbackType, CommonMapParams, NeedToTyped } from '../config';
import { HIPPY_DEBUG_ADDRESS, HIPPY_STATIC_PROTOCOL, IS_PROD } from '../config';
import { type HippyElement } from '../runtime/element/hippy-element';

let uniqueId = 0;

let isSilent = false;

// rootViewId initial value
export const DEFAULT_ROOT_ID = 1;

export function getUniqueId(): number {
  uniqueId += 1;

  // The id does not use numbers that are multiples of 10
  // because id multiples of 10 is used by native
  if (uniqueId % 10 === 0) {
    uniqueId += 1;
  }

  return uniqueId;
}

/**
 * output debugging information to the console
 *
 * @param context - content to output
 */
export function trace(...context: NeedToTyped[]): void {
  // do not print information in production environment or keeps silent
  if (IS_PROD || isSilent) {
    return;
  }

  console.log(...context);
}

/**
 * output warning debug information to console
 *
 * @param context - content to output
 */
export function warn(...context: NeedToTyped[]): void {
  // do not print information in production environment
  if (IS_PROD) {
    return;
  }

  console.warn(...context);
}

/**
 * normalize tag name, use lowercase
 *
 * @param tagName - tag name
 */
export function normalizeTagName(tagName: string): string {
  return tagName.toLowerCase();
}

/**
 * lowercase first letter of string
 *
 * @param str - target string
 */
export function lowerFirstLetter(str: string): string {
  return `${str.charAt(0).toLowerCase()}${str.slice(1)}`;
}

/**
 * uppercase first letter of string
 *
 * @param str - target string
 */
export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// regular expression of number format
const numberRegEx = new RegExp('^(?=.+)[+-]?\\d{0,17}\\.?\\d{0,5}([Ee][+-]?\\d{1,5})?$');

export function tryConvertNumber<T extends string | number>(
  str: T,
): T extends number ? number : string | number;

/**
 * Convert strings to number as much as possible
 */
export function tryConvertNumber(str: string | number): string | number {
  if (typeof str === 'number') {
    return str;
  }

  if (numberRegEx.test(str)) {
    try {
      return parseFloat(str);
    } catch (err) {
      // pass
    }
  }

  return str;
}

// hook of loading style
let beforeLoadStyleHook: CallbackType = (declaration: CallbackType): CallbackType => declaration;

/**
 * set hook method of loading style
 *
 * @param beforeLoadStyle - hook method
 */
export function setBeforeLoadStyle(beforeLoadStyle: CallbackType): void {
  beforeLoadStyleHook = beforeLoadStyle;
}

/**
 * get hook method of loading style
 */
export function getBeforeLoadStyle(): CallbackType {
  return beforeLoadStyleHook;
}

/**
 * Convert unicode format string to char type
 *
 * @param text - target string
 */
export function unicodeToChar(text: string): string {
  return text.replace(/\\u[\dA-F]{4}|\\x[\dA-F]{2}/gi, match => String.fromCharCode(parseInt(match.replace(/\\u|\\x/g, ''), 16)));
}

/**
 * Compares two Sets for equality
 *
 * @param leftSet - one set
 * @param rightSet - the other set
 */
export function setsAreEqual(
  leftSet: Set<unknown>,
  rightSet: Set<unknown>,
): boolean {
  if (leftSet.size !== rightSet.size) {
    return false;
  }

  const values = leftSet.values();
  let leftValue = values.next().value;

  while (leftValue) {
    if (!rightSet.has(leftValue)) {
      return false;
    }
    leftValue = values.next().value;
  }

  return true;
}

/**
 * Set the Hippy event Map, using the vue event name and the native event name as the key respectively
 *
 * @param generalEventParams - general event params
 * @param rawNativeEventName - native event name
 */
export function mapHippyEvent(
  generalEventParams: string | string[][],
  rawNativeEventName?: string,
): Map<string, string> {
  const map = new Map();

  if (Array.isArray(generalEventParams)) {
    // vue EventName means click, change the name of the event monitored by vue
    // The native event name is in onXxx format
    generalEventParams.forEach(([vueEventName, nativeEventName]) => {
      map.set(vueEventName, nativeEventName);
      map.set(nativeEventName, vueEventName);
    });
  } else {
    map.set(generalEventParams, rawNativeEventName);
    map.set(rawNativeEventName, generalEventParams);
  }

  return map;
}

/**
 * Convert the path in local format to a format that Native can recognize
 *
 * @param originalUrl - target path
 */
export function convertImageLocalPath(originalUrl: string): string {
  let url: string = originalUrl;

  if (/^assets/.test(url)) {
    if (IS_PROD) {
      url = `${HIPPY_STATIC_PROTOCOL}./${url}`;
    } else {
      url = `${HIPPY_DEBUG_ADDRESS}${url}`;
    }
  }

  return url;
}

/**
 * Count the number of elements in an array that satisfy a condition
 *
 * @param arr - target array
 * @param iterator - condition
 */
export function arrayCount(arr: NeedToTyped[], iterator: CallbackType): number {
  let count = 0;

  for (const arrayItem of arr) {
    if (iterator(arrayItem)) {
      count += 1;
    }
  }

  return count;
}

/**
 * Get the standard event name, starting with on
 *
 * @param name - original event name
 */
export function getNormalizeEventName(name: string): string {
  return `on${capitalize(name)}`;
}

/**
 * Get the event processed by the event forwarder
 * e.g. swiper, the event provided to the user defined on the vue is different from native event name
 * so it needs to be converted
 *
 * @param events - event list
 */
export function getEventRedirects(
  this: ComponentPublicInstance,
  events: string[] | string[][],
): CommonMapParams {
  const on: CommonMapParams = {};

  events.forEach((event) => {
    /**
     * For the case of array, exposedEventName has been declared in vue, so nativeEvent needs to be handled,
     * because native recognize onXXX event name, do not recognize original event name like "dropped"
     * For the case of non-array, because vue has already processed the attribute into onXXX type,
     * there is no need to deal with it here.
     */
    if (Array.isArray(event)) {
      // The event name defined on the user tag
      const exposedEventName = getNormalizeEventName(event[0]);
      // The event name used by the terminal native
      const nativeEventName = getNormalizeEventName(event[1]);

      // If the vue event has been defined, the event conversion can be done, otherwise it is not processed
      if (Object.prototype.hasOwnProperty.call(this.$attrs, exposedEventName)) {
        // If no native event is defined, use the vue event
        if (!this.$attrs[nativeEventName]) {
          on[nativeEventName] = this.$attrs[exposedEventName];
        }
      }
    }
  });

  return on;
}

/**
 * Detect if the param is falsy or empty
 *
 * @param {any} params - params
 */
export function isEmpty(params: NeedToTyped) {
  if (!params || typeof params !== 'object') {
    return true;
  }
  return Object.keys(params).length === 0;
}

/**
 * disable print trace info
 *
 * @param silent - silent option
 */
export function setSilent(silent: boolean): void {
  isSilent = silent;
}

/**
 * determine if the value is null or undefined
 *
 * @param value - value
 */
export function isNullOrUndefined(value: NeedToTyped): boolean {
  return typeof value === 'undefined' || value === null;
}

/**
 * deep copy object
 *
 * @param data - copy object
 * @param hash - cached hash
 */
export function deepCopy(data: NeedToTyped, hash = new WeakMap()): NeedToTyped {
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
      newData[value] = new Set([...currentDataValue]);
    } else if (currentDataValue instanceof Map) {
      newData[value] = new Map([...currentDataValue]);
    } else {
      hash.set(data, data);
      newData[value] = deepCopy(currentDataValue, hash);
    }
  });
  return newData;
}

/**
 * determine if the element's style scoped id is matched selector
 *
 * @param matchedSelector - matched selector
 * @param element - hippy element
 */
export function isStyleMatched(matchedSelector: NeedToTyped, element: HippyElement): boolean {
  if (!element || !matchedSelector) return false;

  const styleScopedId = element.styleScopeId;
  if (styleScopedId) {
    // set element's attribute for style scoped determine
    element.attributes[styleScopedId] = true;
  }
  // determine if element matched
  const isMatched = matchedSelector.match(element);
  // remove scoped attribute after match determine
  if (styleScopedId) {
    delete element.attributes[styleScopedId];
  }
  return isMatched;
}

