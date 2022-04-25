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

/**
 * ⚠️ publish and subscribe must behind connection, otherwise redis client will change to PubSub mode, could not send AUTH command
 */
import { Logger } from '@debug-server-next/utils/log';
import { IPublisher, ISubscriber } from '@debug-server-next/db/pub-sub';
import { RedisClient, RedisDB, listenRedisEvent } from './redis-db';

const log = new Logger('redis-pub-sub');

export class RedisPublisher implements IPublisher {
  private client: RedisClient;
  private queue: Array<string | Adapter.CDP.Req> = [];
  private isConnected = false;
  private channel: string;

  public constructor(channel: string) {
    if (!channel) {
      const e = new Error('channelId should not be empty');
      log.error('%s', e?.stack);
      throw e;
    }
    this.channel = channel;
    this.client = RedisDB.client.duplicate();
    listenRedisEvent(this.client);
    this.init();
  }

  public publish(message: string | Adapter.CDP.Req) {
    if (this.isConnected) this.realPublish(message);
    else this.queue.push(message);
  }

  /**
   * nullish, redis could send other command in PubSub mode
   */
  public disconnect() {}

  private realPublish(message: string | Adapter.CDP.Req) {
    const msgStr = typeof message !== 'string' ? JSON.stringify(message) : message;
    try {
      this.client.publish(this.channel, msgStr);
    } catch (e) {
      log.error('publish %s to channel %s error: %s', msgStr, this.channel, (e as Error).stack);
    }
  }

  /**
   * init redis connection, will clear publish queue if connected
   */
  private async init() {
    await this.client.connect();
    log.info('redis publisher client created, %s', this.channel);
    this.isConnected = true;
    this.queue.forEach(this.realPublish.bind(this));
  }
}

export class RedisSubscriber implements ISubscriber {
  private client: RedisClient;
  private channel: string;
  private isConnected = false;
  private operateQueue: Array<[Function, Function]> = [];

  public constructor(channel: string) {
    if (!channel) {
      const e = new Error('channelId should not be empty');
      log.error('%s', e?.stack);
      throw e;
    }
    this.channel = channel;
    this.client = RedisDB.client.duplicate();
    listenRedisEvent(this.client);
    this.init();
  }

  public subscribe(cb) {
    if (this.isConnected) this.client.subscribe(this.channel, cb);
    else this.operateQueue.push([this.subscribe, cb]);
  }

  /**
   * subscribe channel with glob character, such as `*`
   */
  public pSubscribe(cb) {
    if (this.isConnected) this.client.pSubscribe(this.channel, cb);
    else this.operateQueue.push([this.pSubscribe, cb]);
  }

  public unsubscribe = () => this.client.unsubscribe(this.channel);

  public pUnsubscribe = () => this.client.pUnsubscribe(this.channel);

  /**
   * nullish, redis could send other command in PubSub mode
   */
  public disconnect = () => {};

  /**
   * init redis connection, will clear subscribe queue if connected
   */
  private async init() {
    if (this.isConnected) return;
    await this.client.connect();
    log.info('redis subscriber client created, %s', this.channel);
    this.isConnected = true;
    if (this.operateQueue) {
      this.operateQueue.forEach(([fn, cb]) => {
        fn.call(this, cb);
      });
    }
  }
}
