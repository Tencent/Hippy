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
import { HippyStorageAdapter } from './HippyStorageAdapter';
import relationalStore from '@ohos.data.relationalStore';
import { Context } from '@ohos.abilityAccessCtrl';
import { ValuesBucket } from '@ohos.data.ValuesBucket';
import { LogUtils } from '../../../support/utils/LogUtils';
import { HippyJsException } from '../../common/HippyJsException';

const DEFAULT_STORAGE_ADAPTER_TAG = 'DefaultStorageAdapter'

const STORE_DB_NAME = 'HippyStorage.db'
const TABLE_STORAGE = 'hippy_engine_storage'
const COLUMN_KEY = 'storage_key'
const COLUMN_VALUE = 'storage_value'

export class DefaultStorageAdapter implements HippyStorageAdapter {
  private hippyStoreDb: relationalStore.RdbStore | undefined
  private ctx: Context;

  constructor(context: Context) {
    this.ctx = context;
    this.getStoreDb();
  }

  async getStoreDb() {
    if (this.hippyStoreDb === undefined) {
      const STORE_CONFIG: relationalStore.StoreConfig = {
        name: STORE_DB_NAME,
        securityLevel: relationalStore.SecurityLevel.S1
      };

      try {
        this.hippyStoreDb = await relationalStore.getRdbStore(this.ctx == null ? getContext() : this.ctx, STORE_CONFIG)
        LogUtils.i(DEFAULT_STORAGE_ADAPTER_TAG, 'Get RdbStore successfully.')
        await this.hippyStoreDb.executeSql(`CREATE TABLE IF NOT EXISTS ${TABLE_STORAGE} (${COLUMN_KEY} TEXT PRIMARY KEY, ${COLUMN_VALUE} TEXT);`)
        LogUtils.i(DEFAULT_STORAGE_ADAPTER_TAG, `CREATE TABLE SUCC`)
      } catch (e) {
        LogUtils.e(DEFAULT_STORAGE_ADAPTER_TAG, `CREATE TABLE FAIL` + e);
      }
    }
    return this.hippyStoreDb
  }

  async multiGet(keys: string[]): Promise<[key: string, value: string][]> {
    await this.getStoreDb();
    let predicates = new relationalStore.RdbPredicates(TABLE_STORAGE);
    predicates.in(COLUMN_KEY, keys);
    
    let resultSet: relationalStore.ResultSet = await (this.hippyStoreDb as relationalStore.RdbStore)
      .query(predicates, [COLUMN_KEY, COLUMN_VALUE]);

    LogUtils.i(DEFAULT_STORAGE_ADAPTER_TAG, `ResultSet column names: ${resultSet.columnNames}`);
    let results = new Array<[key: string, value: string]>(resultSet.rowCount);
    // resultSet是一个数据集合的游标，默认指向第-1个记录，有效的数据从0开始。
    while (resultSet.goToNextRow()) {
      const key = resultSet.getString(resultSet.getColumnIndex(COLUMN_KEY));
      const value = resultSet.getString(resultSet.getColumnIndex(COLUMN_VALUE));
      LogUtils.d(DEFAULT_STORAGE_ADAPTER_TAG, "ResultSet: " + key + ',' + value)
      results.push([key, value])
    }
    // 释放数据集的内存
    resultSet.close();
    return results
  }


  async multiSet(pairs: [key: string, value: string][]): Promise<void> {
    if (pairs === null || pairs === undefined || pairs.length === 0) {
      return
    }
    await this.getStoreDb();

    const valueBuckets = pairs.map<ValuesBucket>((pair) => {
      LogUtils.i(DEFAULT_STORAGE_ADAPTER_TAG, 'storage_key:' + pair[0] + ',storage_value:' + pair[1]);
      return { 'storage_key': pair[0], 'storage_value': pair[1] }
    });

    (this.hippyStoreDb as relationalStore.RdbStore).batchInsert(TABLE_STORAGE, valueBuckets)
      .then((insertNum: number) => {
        LogUtils.i(DEFAULT_STORAGE_ADAPTER_TAG, `Insert is successful, insertNum = ${insertNum}`);
      })
      .catch((err: HippyJsException) => {
        LogUtils.e(DEFAULT_STORAGE_ADAPTER_TAG, `Insert is failed, message is ${err.message}`);
      })
  }

  async multiRemove(keys: string[]): Promise<void> {
    if (keys === null || keys === undefined || keys.length === 0) {
      return
    }
    await this.getStoreDb();

    let predicates = new relationalStore.RdbPredicates(TABLE_STORAGE);
    predicates.in(COLUMN_KEY, keys);
    (this.hippyStoreDb as relationalStore.RdbStore).delete(predicates, (err, rows) => {
      if (err) {
        LogUtils.e(DEFAULT_STORAGE_ADAPTER_TAG, `Delete failed, code is ${err.code}, message is ${err.message}`);
        return
      }
      LogUtils.i(DEFAULT_STORAGE_ADAPTER_TAG, `Delete rows: ${rows}`);
      return
    })
  }

  async getAllKeys(): Promise<string[]> {
    await this.getStoreDb();
    let predicates = new relationalStore.RdbPredicates(TABLE_STORAGE);
    let resultSet: relationalStore.ResultSet = await (this.hippyStoreDb as relationalStore.RdbStore).query(
      predicates, [COLUMN_KEY])
    LogUtils.i(DEFAULT_STORAGE_ADAPTER_TAG, `ResultSet column names: ${resultSet.columnNames}, column count: ${resultSet.columnCount}`);
    let results = new Array<string>(resultSet.rowCount);
    let i = 0;
    while (resultSet.goToNextRow()) {
      results[i] = resultSet.getString(resultSet.getColumnIndex(COLUMN_KEY));
      i++;
    }
    resultSet.close();
    return results
  }

  destroyIfNeed(): void {
    if (this.hippyStoreDb !== undefined) {
      this.hippyStoreDb == null
    }
  }
}
