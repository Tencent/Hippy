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
import { HippyStorageAdapter } from './HippyStorageAdapter'
import dataPreferences from '@ohos.data.preferences';
import { Context } from '@ohos.abilityAccessCtrl';
import { BusinessError } from '@ohos.base';
import { HippyException } from '../../../support/common/HippyException';
import { LogUtils } from '../../../support/utils/LogUtils';

const PREFERENCES_TAG = 'DefaultStorageAdapter'
const PREFERENCES_NAME = 'HippyStorage'

export class PreferencesStorageAdapter implements HippyStorageAdapter {
  private context: Context

  constructor(context: Context) {
    this.context = context
  }

  multiGet(keys: string[]): Promise<[key: string, value: string][]> {
    return new Promise((resolve, reject) => {
      this.getHippyPreferences()
        .then((preferences) => {
          const result = new Array<[key: string, value: string]>(keys.length);
          keys.forEach((key, index) => {
            result[index] = [key, preferences.getSync(key, '') as string];
          });
          return resolve(result);
        })
        .catch((err: BusinessError) => reject(err))
    });
  }

  multiSet(pairs: [key: string, value: string][]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getHippyPreferences()
        .then((preferences) => {
          pairs.forEach((kv) => preferences.putSync(kv[0], kv[0]));
          return preferences.flush()
        })
        .then(() => resolve())
        .catch((err: BusinessError) => reject(err))
    });
  }

  multiRemove(keys: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getHippyPreferences()
        .then((preferences) => {
          keys.forEach((key, _) => {
            preferences.deleteSync(key);
          });
          preferences.flush()
        })
        .then(() => resolve())
        .catch((err: BusinessError) => reject(err))
    });
  }

  getAllKeys(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.getHippyPreferences()
        .then((preferences) => preferences.getAll())
        .then((value: Object) => {
          let allKeys = this.getObjKeys(value);
          return resolve(allKeys);
        })
        .catch((err: BusinessError) => reject(err))
    });
  }

  getHippyPreferences(): Promise<dataPreferences.Preferences> {
    return dataPreferences.getPreferences(this.context, PREFERENCES_NAME);
  }

  getObjKeys(obj: Object): string[] {
    let keys = Object.keys(obj);
    return keys;
  }

  destroyIfNeed(): void {
    if (this.getHippyPreferences() !== null) {
      try { //从内存移除指定的Preferences实例。调用该接口后，应用不允许再使用该Preferences实例
        // 进行数据操作，否则会出现数据一致性问题。
        dataPreferences.removePreferencesFromCache(this.context, PREFERENCES_NAME)
          .then(() => {
            LogUtils.i(PREFERENCES_TAG, "Succeeded in removing preferences.");
          }).catch((err: BusinessError) => {
          LogUtils.e(PREFERENCES_TAG, "Failed to remove preferences. code =" + err.code + ", message =" + err.message);
        })
      } catch (err) {
        LogUtils.e(PREFERENCES_TAG, "Failed to remove preferences. code =" + err.code + ", message =" + err.message);
      }
    }
  }
}
