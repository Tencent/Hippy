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

/**
 * Capitalize a word
 *
 * @param {string} str The word input
 * @returns string
 */
function capitalize(str) {
  if (typeof str !== 'string') {
    return '';
  }
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
}

/**
 * Get binding events redirector
 *
 * The function should be called with `getEventRedirector.call(this, [])`
 * for binding this.
 *
 * @param {string[] | string[][]} events events will be redirect
 * @returns Object
 */
function getEventRedirector(events) {
  const on = {};
  events.forEach((event) => {
    if (Array.isArray(event)) {
      // exposedEventName is used in vue declared, nativeEventName is used in native
      const [exposedEventName, nativeEventName] = event;
      if (Object.prototype.hasOwnProperty.call(this.$listeners, exposedEventName)) {
        // Use event handler first if declared
        if (this[`on${capitalize(nativeEventName)}`]) {
          // event will be converted like "dropped,pageSelected" which assigned to "on" object
          on[event] = this[`on${capitalize(nativeEventName)}`];
        } else {
          // if no event handler found, emit default exposedEventName.
          on[event] = evt => this.$emit(exposedEventName, evt);
        }
      }
    } else if (Object.prototype.hasOwnProperty.call(this.$listeners, event)) {
      if (this[`on${capitalize(event)}`]) {
        on[event] = this[`on${capitalize(event)}`];
      } else {
        on[event] = evt => this.$emit(event, evt);
      }
    }
  });
  return on;
}

export {
  capitalize,
  getEventRedirector,
};
