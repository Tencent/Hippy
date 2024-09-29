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

/* eslint-disable */
export function throttle(func, wait) {
  let args;
  let result;
  let thisArg;
  let timeoutId;
  let lastCalled = 0;

  function trailingCall() {
    lastCalled = Date.now();
    timeoutId = null;
    result = func.apply(thisArg, args);
  }

  return function () {
    const now = Date.now();
    const remain = wait - (now - lastCalled);

    args = arguments;
    thisArg = this;

    if (remain <= 0) {
      lastCalled = now;
      result = func.apply(thisArg, args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(trailingCall, remain);
    }
    return result;
  };
}

export function debounce(func, wait, immediate) {
  let args;
  let result;
  let thisArg;
  let timeoutId;

  function delayed() {
    timeoutId = null;
    if (!immediate) {
      result = func.apply(thisArg, args);
    }
  }

  return function () {
    const isImmediate = immediate && !timeoutId;
    args = arguments;
    thisArg = this;

    clearTimeout(timeoutId);
    timeoutId = setTimeout(delayed, wait);

    if (isImmediate) {
      result = func.apply(thisArg, args);
    }
    return result;
  };
}

export function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

export function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}
