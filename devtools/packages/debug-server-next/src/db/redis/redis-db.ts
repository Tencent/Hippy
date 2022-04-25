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

import { createClient } from 'redis';
import { config } from '@debug-server-next/config';
import { Logger } from '@debug-server-next/utils/log';
import { WinstonColor, ReportEvent } from '@debug-server-next/@types/enum';
import { timeStart } from '@debug-server-next/utils/aegis';
import { BaseDB } from '../base-db';

const log = new Logger('redis-model', WinstonColor.BrightCyan);
export type RedisClient = ReturnType<typeof createClient>;

/**
 * all data is store as redis hashmap
 */
export class RedisDB<T> extends BaseDB<T> {
  /**
   * Since Node.js and Redis are both effectively single threaded there is no need
   * to use multiple client instances or any pooling mechanism save for a few exceptions;
   * the most common exception is if you’re subscribing with Pub/Sub or blocking
   * with streams or lists, then you’ll need to have dedicated clients to receive
   * these long-running commands.
   */
  public static client;
  private static isInited = false;
  private static opQueue: Array<Function> = [];

  /**
   * init redis connection
   */
  private static async init() {
    try {
      RedisDB.client = createMyClient();
      const timeEnd = timeStart(ReportEvent.RedisConnection);
      await RedisDB.client.connect();
      timeEnd();
      RedisDB.isInited = true;
      await Promise.all(RedisDB.opQueue.map(async (op) => await op()));
      RedisDB.opQueue = [];
    } catch (e) {
      log.error('connect redis failed: %s', (e as Error).stack || e);
    }
  }

  public constructor(key: string) {
    super(key);
    if (!RedisDB.client) {
      RedisDB.init();
    }
  }

  public async get(field: string): Promise<T> {
    return new Promise((resolve) => {
      const op = async () => {
        const hashmap: Record<string, string> = await RedisDB.client.hGetAll(this.key);
        const item = hashmap[field];
        try {
          const itemObj: T = JSON.parse(item);
          return resolve(itemObj);
        } catch (e) {
          log.error('parse redis hashmap error, key: %s, field: %s, value: %s', this.key, field, item);
          return resolve(null);
        }
      };
      if (RedisDB.isInited) return op();
      RedisDB.opQueue.push(op);
    });
  }

  public async getAll(): Promise<T[]> {
    return new Promise((resolve) => {
      const op = async () => {
        const hashmap: Record<string, string> = await RedisDB.client.hGetAll(this.key);
        const result = Object.values(hashmap)
          .map((item) => {
            let itemObj: T;
            try {
              itemObj = JSON.parse(item);
            } catch (e) {
              log.error('parse redis hashmap fail, key: %s', item);
            }
            return itemObj;
          })
          .filter((v) => v);
        resolve(result);
      };
      if (RedisDB.isInited) return op();
      RedisDB.opQueue.push(op);
    });
  }

  public async upsert(field: string, value: string | Object) {
    return new Promise((resolve, reject) => {
      const op = async () => {
        let strValue = value;
        if (typeof value !== 'string') strValue = JSON.stringify(value);
        try {
          await RedisDB.client.hSet(this.key, field, strValue);
          resolve(null);
        } catch (e) {
          reject(e);
        }
      };
      if (RedisDB.isInited) return op();
      RedisDB.opQueue.push(op);
    });
  }

  public async delete(field: string) {
    return new Promise((resolve, reject) => {
      const op = async () => {
        try {
          await RedisDB.client.hDel(this.key, field);
          resolve(null);
        } catch (e) {
          reject(e);
        }
      };
      if (RedisDB.isInited) return op();
      RedisDB.opQueue.push(op);
    });
  }
}

const createMyClient = (): RedisClient => {
  const client = createClient({ url: config.redis.url }) as RedisClient;
  listenRedisEvent(client);
  return client;
};

export const listenRedisEvent = (client) => {
  client.on(RedisClientEvent.Error, (e) => {
    log.error('redis client error: %s', e?.stack || e);
  });
  client.on(RedisClientEvent.Connect, () => log.info('redis connected'));
  client.on(RedisClientEvent.Ready, () => log.info('redis ready'));
  client.on(RedisClientEvent.End, () => log.warn('redis disconnect by quit() or disconnect()'));
  client.on(RedisClientEvent.Reconnecting, () => {
    log.warn('redis reconnecting');
  });
};

const enum RedisClientEvent {
  Error = 'error',
  Connect = 'connect',
  Ready = 'ready',
  End = 'end',
  Reconnecting = 'reconnecting',
}
