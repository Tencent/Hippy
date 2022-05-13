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

import { BaseDB } from '../base-db';

/**
 * store data in memory, all value use redis hashmap type
 */
export class MemoryDB<T> extends BaseDB<T> {
  private static hashmapStore: Map<string, Map<string, unknown>> = new Map();
  private static listStore: Map<string, Array<unknown>> = new Map();

  public async init() {}

  public async get(field: string): Promise<T> {
    const hashmap = MemoryDB.hashmapStore.get(this.key);
    if (!hashmap) return;
    return hashmap.get(field) as T;
  }

  public async getAll(): Promise<T[]> {
    const hashmap = MemoryDB.hashmapStore.get(this.key) || new Map();
    return Array.from(hashmap.values());
  }

  public async upsert(field: string, value: Object) {
    if (!MemoryDB.hashmapStore.has(this.key)) {
      MemoryDB.hashmapStore.set(this.key, new Map());
    }
    const hashMap = MemoryDB.hashmapStore.get(this.key);
    hashMap.set(field, value);
  }

  public async delete(field: string) {
    const hashMap = MemoryDB.hashmapStore.get(this.key);
    hashMap?.delete(field);
  }

  public async rPush(value: Object) {
    if (!MemoryDB.listStore.has(this.key)) MemoryDB.listStore.set(this.key, []);
    const list = MemoryDB.listStore.get(this.key);
    list.push(value);
  }

  public async getList(): Promise<T[]> {
    const list = MemoryDB.listStore.get(this.key);
    return list as T[];
  }

  public async clearList() {
    MemoryDB.listStore.set(this.key, []);
  }
}
