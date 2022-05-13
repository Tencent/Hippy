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

export abstract class BaseDB<T = unknown> {
  constructor(protected key: string) {}
  public async find(field: string, value: string): Promise<T[]> {
    const all = await this.getAll();
    return all.filter((item) => item[field] === value);
  }

  public abstract getAll(): Promise<T[]>;
  public abstract get(field: string): Promise<T>;

  /**
   * update if field exist, insert if field doesn't exist
   */
  public abstract upsert(field: string, value: string | Object);
  public abstract delete(field: string);

  /**
   * redis list operate
   */
  public abstract rPush(value: string | Object);
  public abstract getList(): Promise<T[]>;
  public abstract clearList();
}
