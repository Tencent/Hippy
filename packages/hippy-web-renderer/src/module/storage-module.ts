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

import { HippyWebModule } from '../base';
import { callbackToHippy } from '../common';

export class StorageModule extends HippyWebModule {
  public static moduleName = 'StorageModule';
  public static preCheck() {
    if (!window.localStorage) {
      console.warn('not support localStorage');
      return false;
    }
    return true;
  }

  private readonly STORE_PRX_KEY = 'hippy-storage-';

  public getAllKeys(callBackId: number) {
    if (!StorageModule.preCheck()) {
      callbackToHippy(callBackId, 'not support', false, 'getAllKeys', StorageModule.moduleName);
      return;
    }
    let data = window.localStorage.getItem(`${this.STORE_PRX_KEY}ALL-KEY`);
    try {
      data = JSON.stringify(data);
    } catch (e) {
      throw 'deserialize failed , getAllKeys()';
    }
    callbackToHippy(callBackId, data, true, 'getAllKeys', StorageModule.moduleName);
  }

  public multiGet(callBackId: number, keys: Array<string>) {
    if (!StorageModule.preCheck()) {
      callbackToHippy(callBackId, 'not support', false, 'multiGet', StorageModule.moduleName);
      return;
    }
    if (!keys || keys.length <= 0) {
      callbackToHippy(callBackId, 'Invalid Key', false, 'multiGet', StorageModule.moduleName);
      return;
    }
    const data: Array<Array<any>> = [];
    keys.forEach((key) => {
      let dataItem = window.localStorage.getItem(key);
      if (dataItem) {
        try {
          dataItem = JSON.stringify(dataItem);
        } catch (e) {
          throw 'deserialize failed , getAllKeys()';
        }
        data.push([key, dataItem]);
      }
    });
    callbackToHippy(callBackId, data, true, 'multiGet', StorageModule.moduleName);
  }

  public multiSet(callBackId: number, keyValues: Array<[string, any]>) {
    if (!StorageModule.preCheck()) {
      callbackToHippy(callBackId, 'not support', false, 'multiGet', StorageModule.moduleName);
      return;
    }
    if (!keyValues || keyValues.length <= 0) {
      callbackToHippy(callBackId, 'Invalid Key', false, 'multiGet', StorageModule.moduleName);
      return;
    }
    for (let i = 0;i < keyValues.length;i++) {
      const dataItem = keyValues[i];
      if (!dataItem || dataItem.length !== 2 || !dataItem[0] || !dataItem[1]) {
        callbackToHippy(callBackId, 'Invalid key or value', false, 'multiSet', StorageModule.moduleName);
        return;
      }
      try {
        localStorage.setItem(dataItem[0], JSON.stringify(dataItem[1]));
      } catch (e) {
        callbackToHippy(callBackId, `cant storage for key ${dataItem[0]} `, false, 'multiSet', StorageModule.moduleName);
        return;
      }
    }
    callbackToHippy(callBackId, 'success', true, 'multiSet', StorageModule.moduleName);
  }

  public multiRemove(callBackId: number, keys: Array<string>) {
    if (!StorageModule.preCheck()) {
      callbackToHippy(callBackId, 'not support', false, 'multiRemove', StorageModule.moduleName);
      return;
    }
    if (!keys || keys.length <= 0) {
      callbackToHippy(callBackId, 'Invalid Key', false, 'multiRemove', StorageModule.moduleName);
      return;
    }
    for (let i = 0;i < keys.length;i++) {
      window.localStorage.removeItem(keys[i]);
    }
    callbackToHippy(callBackId, 'success', true, 'multiRemove', StorageModule.moduleName);
  }

  public initialize() {

  }

  public destroy() {

  }
}
