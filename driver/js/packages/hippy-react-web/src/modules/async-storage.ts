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

type KeyValuePair = { key: string, value: string | null };

interface AsyncStorage {
  getAllKeys: () => Promise<string[]>;
  getItem: (key: string) => Promise<string>;
  setItem: (key: string, value: number | string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  multiGet: (keyList: string[]) => Promise<KeyValuePair[]>;
  multiRemove: (keyList: string[]) => Promise<void>;
  multiSet: (keyValuePairList: KeyValuePair[]) => Promise<void>;
}

const asyncStorage: AsyncStorage = {
  getAllKeys() {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== null) {
        keys.push(key);
      }
    };
    return Promise.resolve(keys);
  },
  getItem(key: string) {
    const value = localStorage.getItem(key);
    if (value) {
      return Promise.resolve(value);
    }
    return Promise.resolve('');
  },
  setItem(key: string, value: number | string) {
    localStorage.setItem(key, `${value}`);
    return new Promise(resolve => resolve());
  },
  removeItem(key: string) {
    localStorage.removeItem(key);
    return new Promise(resolve => resolve());
  },
  multiGet(keyList: string[]) {
    const valueList: { key: string, value: string | null }[] = [];
    keyList.forEach((key) => {
      const value = localStorage.getItem(key);
      valueList.push({ key, value });
    });
    return Promise.resolve(valueList);
  },
  multiRemove(keyList: string[]) {
    keyList.forEach((key) => {
      localStorage.removeItem(key);
    });
    return new Promise(resolve => resolve());
  },
  multiSet(KeyValuePair: KeyValuePair[]) {
    KeyValuePair.forEach(({ key, value }) => {
      if (value) {
        localStorage.setItem(key, value);
      }
    });
    return new Promise(resolve => resolve());
  },
};

export default asyncStorage;
