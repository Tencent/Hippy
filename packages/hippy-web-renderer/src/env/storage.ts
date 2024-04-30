/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29  Limited, a Tencent company.
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

const convertError = (error) => {
  if (!error) {
    return null;
  }

  const out: any = new Error(error.message);
  out.key = error.key;

  return out;
};

const convertErrors = (errs) => {
  if (!errs) {
    return null;
  }

  let targetError;

  if (Array.isArray(errs)) {
    targetError = errs;
  } else {
    targetError = [errs];
  }

  if (targetError) {
    targetError.map(e => convertError(e));
  }

  return targetError;
};

export const asyncStorage = {
  getAllKeys() {
    return Hippy.bridge.callNativeWithPromise('StorageModule', 'getAllKeys');
  },
  setItem(key, valueArg) {
    let value = valueArg;
    if (typeof value !== 'string') {
      try {
        value = value.toString();
      } catch (err) {
        throw err;
      }
    }
    return Hippy.bridge.callNativeWithPromise('StorageModule', 'multiSet', [[key, value]]);
  },
  getItem(key) {
    return Hippy.bridge.callNativeWithPromise('StorageModule', 'multiGet', [key])
      .then((r: any) => {
        if (!r || !r[0] || !r[0][1]) {
          return null;
        }
        return r[0][1];
      })
      .catch(err => convertErrors(err));
  },
  removeItem(key) {
    return Hippy.bridge.callNativeWithPromise('StorageModule', 'multiRemove', [key]);
  },
  multiGet(keys) {
    return Hippy.bridge.callNativeWithPromise('StorageModule', 'multiGet', keys);
  },
  multiSet(keyValuePairs) {
    return Hippy.bridge.callNativeWithPromise('StorageModule', 'multiSet', keyValuePairs);
  },
  multiRemove(keys) {
    return Hippy.bridge.callNativeWithPromise('StorageModule', 'multiRemove', keys);
  },
};
