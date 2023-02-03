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

import { HippyWebModule } from '../base';
import { HippyCallBack } from '../types';
import { warn } from '../common';

export class StorageModule extends HippyWebModule {
  public static preCheck() {
    if (!window.__localStorage) {
      warn('not support localStorage');
      return false;
    }
    return true;
  }

  public moduleName = 'StorageModule';

  private readonly STORE_PRX_KEY = 'hippy-storage-';

  public getAllKeys(callBack: HippyCallBack) {
    if (!StorageModule.preCheck()) {
      callBack.resolve('not support');
      return;
    }
    let data = window.__localStorage.getItem(`${this.STORE_PRX_KEY}ALL-KEY`);
    try {
      data = JSON.stringify(data);
    } catch (e) {
      throw 'deserialize failed , getAllKeys()';
    }
    callBack.resolve(data);
  }

  public multiGet(keys: Array<string>, callBack: HippyCallBack) {
    if (!StorageModule.preCheck()) {
      callBack.reject('not support');
      return;
    }
    if (!keys || keys.length <= 0) {
      callBack.reject('Invalid Key');
      return;
    }
    const data: Array<Array<any>> = [];
    keys.forEach((key) => {
      let dataItem = window.__localStorage.getItem(key);
      if (dataItem) {
        try {
          dataItem = JSON.stringify(dataItem);
        } catch (e) {
          throw 'deserialize failed , getAllKeys()';
        }
        data.push([key, dataItem]);
      }
    });
    callBack.resolve(data);
  }

  public multiSet(keyValues: Array<[string, any]>, callBack: HippyCallBack) {
    if (!StorageModule.preCheck()) {
      callBack.reject('not support');
      return;
    }
    if (!keyValues || keyValues.length <= 0) {
      callBack.reject('Invalid Key');
      return;
    }
    for (let i = 0;i < keyValues.length;i++) {
      const dataItem = keyValues[i];
      if (!dataItem || dataItem.length !== 2 || !dataItem[0] || !dataItem[1]) {
        callBack.reject('Invalid key or value');
        return;
      }
      try {
        __localStorage.setItem(dataItem[0], JSON.stringify(dataItem[1]));
      } catch (e) {
        callBack.reject('cant storage for key ${dataItem[0]} ');
        return;
      }
    }
    callBack.resolve('success');
  }

  public multiRemove(keys: Array<string>, callBack: HippyCallBack) {
    if (!StorageModule.preCheck()) {
      callBack.reject('not support');
      return;
    }
    if (!keys || keys.length <= 0) {
      callBack.reject('Invalid Key');
      return;
    }
    for (let i = 0;i < keys.length;i++) {
      window.__localStorage.removeItem(keys[i]);
    }
    callBack.resolve('success');
  }

  public initialize() {

  }

  public destroy() {

  }
}
