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

import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { ChromeCommand } from '@hippy/devtools-protocol/dist/types';
import {
  AppClientEvent,
  DevicePlatform,
  ErrorCode,
  MiddlewareType,
  WinstonColor,
} from '@debug-server-next/@types/enum';
import {
  defaultDownwardMiddleware,
  defaultUpwardMiddleware,
  UrlParsedContext,
  requestId,
  MiddleWareContext,
  MiddleWare,
  androidMiddleWareManager,
  iOSMiddleWareManager,
} from '@debug-server-next/middlewares';
import { CDP_DOMAIN_LIST, getDomain } from '@debug-server-next/utils/cdp';
import { Logger } from '@debug-server-next/utils/log';
import { composeMiddlewares } from '@debug-server-next/utils/middleware';
import { createCDPPerformance } from '@debug-server-next/utils/aegis';
import { config } from '@debug-server-next/config';

// ignore log the following method, because of high frequency
const ignoreMethods = [ChromeCommand.PageScreencastFrame, ChromeCommand.PageScreencastFrameAck];
const downwardLog = new Logger('↓↓↓', WinstonColor.BrightRed);
const upwardLog = new Logger('↑↑↑', WinstonColor.BrightGreen);

export interface AppClient {
  on(event: AppClientEvent.Close, listener: () => void): this;
  on(event: AppClientEvent.Message, listener: (message: Adapter.CDP.Res) => void): this;
}

/**
 * app client message tunnel
 **/
export abstract class AppClient extends EventEmitter {
  public id: string;
  protected isClosed = false;
  protected platform: DevicePlatform;
  private urlParsedContext: UrlParsedContext;
  private cacheContext: Record<string, any> = {};
  private acceptDomains: string[] = CDP_DOMAIN_LIST;
  private ignoreDomains: string[] = [];
  private useAllDomain = true;
  private msgIdMap: Map<
    number,
    {
      method: string;
      // upward start ts, used to report adapter performance
      performance: Adapter.Performance;
    }
  > = new Map();

  private get middleWareManager() {
    return {
      [DevicePlatform.Android]: androidMiddleWareManager,
      [DevicePlatform.IOS]: iOSMiddleWareManager,
    }[this.platform];
  }

  public constructor(
    id,
    { useAllDomain = true, acceptDomains, ignoreDomains = [], urlParsedContext, platform }: AppClientOption,
  ) {
    super();
    this.id = id;
    this.useAllDomain = useAllDomain;
    this.acceptDomains = acceptDomains;
    this.ignoreDomains = ignoreDomains;
    this.urlParsedContext = urlParsedContext;
    this.platform = platform;
  }

  /**
   * send debug protocol to app side
   */
  public sendToApp(msg: Adapter.CDP.Req): Promise<Adapter.CDP.Res> {
    if (!this.filter(msg)) return Promise.reject(ErrorCode.DomainFiltered);

    const { id, method } = msg;
    this.msgIdMap.set(id, {
      method,
      performance: createCDPPerformance({
        ...(msg.performance || {}),
        debugServerReceiveFromDevtools: Date.now(),
      }),
    });
    const middlewareList = this.getMiddlewareList(MiddlewareType.Upward, method);
    return this.middlewareMessageHandler(middlewareList, msg);
  }

  public destroy() {}

  /**
   * receive debug protocol from app side
   */
  protected downwardMessageHandler(msg: Adapter.CDP.Res): Promise<Adapter.CDP.Res> {
    try {
      if ('id' in msg) {
        const cache = this.msgIdMap.get(msg.id);
        if (cache?.method) msg.method = cache.method;
      }

      const { method } = msg;
      const middlewareList = this.getMiddlewareList(MiddlewareType.Downward, method);
      return this.middlewareMessageHandler(middlewareList, msg);
    } catch (e) {
      downwardLog.error(`app client on message error: %s`, (e as Error)?.stack);
      return Promise.reject(e);
    }
  }

  /**
   * use middleware process debug protocol
   */
  private middlewareMessageHandler(middlewareList: MiddleWare[], msgBeforeAdapter: Adapter.CDP.Res | Adapter.CDP.Req) {
    const middlewareContext: MiddleWareContext = {
      ...this.urlParsedContext,
      ...this.cacheContext,
      msg: msgBeforeAdapter,
      sendToApp: (msg: Adapter.CDP.Req): Promise<Adapter.CDP.Res> => {
        if (!msg.id) {
          msg.id = requestId.create();
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { performance, ...msgWithoutPerf } = msg;
        if (!ignoreMethods.includes(msg.method))
          upwardLog.verbose('%s sendToApp %j', this.constructor.name, msgWithoutPerf);
        return this.sendHandler(msgWithoutPerf);
      },
      sendToDevtools: (msg: Adapter.CDP.Res) => {
        if (!ignoreMethods.includes(msg.method))
          downwardLog.verbose(
            '%s sendToDevtools %s %s %s',
            this.constructor.name,
            (msg as Adapter.CDP.CommandRes).id || '',
            msg.method,
            'error' in msg ? 'not support' : '',
          );
        let performance;
        if ('id' in msg) {
          const cache = this.msgIdMap.get(msg.id);
          performance = cache?.performance;
          if (performance) performance.debugServerToDevtools = Date.now();
        }
        if (config.showPerformance) msg.performance = performance;
        return this.emitMessageToDevtools(msg);
      },
      setContext: (key: string, value: unknown) => {
        this.cacheContext[key] = value;
      },
    };
    return composeMiddlewares(middlewareList)(middlewareContext);
  }

  /**
   * emit debug protocol to devtools frontend
   */
  private emitMessageToDevtools(msg: Adapter.CDP.Res) {
    if (!msg) return Promise.reject(ErrorCode.EmptyCommand);
    this.emit(AppClientEvent.Message, msg);

    if ('id' in msg) {
      this.msgIdMap.delete(msg.id);
    }

    return Promise.resolve(msg);
  }

  /**
   * filter upward msg by protocol domain
   */
  private filter(msg: Adapter.CDP.Req) {
    if (this.useAllDomain) return true;
    const { method } = msg;
    const domain = getDomain(method);

    if (this.ignoreDomains.length) {
      const isIgnoreDomain = this.ignoreDomains.indexOf(domain) !== -1 || this.ignoreDomains.indexOf(method) !== -1;
      return !isIgnoreDomain;
    }
    const isAcceptDomain = this.acceptDomains.indexOf(domain) !== -1 || this.acceptDomains.indexOf(method) !== -1;
    return isAcceptDomain;
  }

  /**
   * get registered protocol middlewares by protocol method
   */
  private getMiddlewareList(type: MiddlewareType, method: string) {
    let middlewareList = {
      [MiddlewareType.Upward]: this.middleWareManager.upwardMiddleWareListMap,
      [MiddlewareType.Downward]: this.middleWareManager.downwardMiddleWareListMap,
    }[type][method];
    if (!middlewareList) middlewareList = [];
    if (!Array.isArray(middlewareList)) middlewareList = [middlewareList];
    return [...middlewareList, type === MiddlewareType.Upward ? defaultUpwardMiddleware : defaultDownwardMiddleware];
  }

  /**
   * send method implement by child class
   */
  protected abstract sendHandler(msg: Adapter.CDP.Req): Promise<Adapter.CDP.Res>;

  /**
   * on method implement by child class, should invoke downwardMessageHandler
   */
  protected abstract registerMessageListener(): void;
}

export type AppClientOption = {
  useAllDomain: boolean;
  acceptDomains?: string[];
  ignoreDomains?: string[];
  ws?: WebSocket;
  iWDPWsUrl?: string;
  urlParsedContext: UrlParsedContext;
  platform: DevicePlatform;
};
