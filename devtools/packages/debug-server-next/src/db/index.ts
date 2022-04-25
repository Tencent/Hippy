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

import { IPublisher, ISubscriber } from '@debug-server-next/db/pub-sub';
import { config } from '@debug-server-next/config';
import { MemoryDB } from './memory/memory-db';
import { MemoryPubSub } from './memory/pub-sub';
import { RedisDB } from './redis/redis-db';
import { RedisPublisher, RedisSubscriber } from './redis/pub-sub';
import { BaseDB } from './base-db';

let DB: new <T>(key: string) => BaseDB<T>;
let Publisher: new (channel: string) => IPublisher;
let Subscriber: new (channel: string) => ISubscriber;

export const getDBOperator = () => ({
  DB,
  Publisher,
  Subscriber,
});

export const initDbModel = () => {
  if (config.isCluster) {
    DB = RedisDB;
    Publisher = RedisPublisher;
    Subscriber = RedisSubscriber;
  } else {
    DB = MemoryDB;
    Publisher = MemoryPubSub;
    Subscriber = MemoryPubSub;
  }
};
