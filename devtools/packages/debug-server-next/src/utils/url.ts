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

import { trim } from 'lodash';
import { ClientRole } from '@debug-server-next/@types/enum';
import { config } from '@debug-server-next/config';

export type AppWsUrlParams = {
  clientId: string;
  clientRole: ClientRole;
  pathname: string;
  contextName?: string;
  deviceName?: string;
  // when use remote debug, we use this field for auth, you can only find and debug
  // pages with this version id
  hash?: string;
};

export type DevtoolsWsUrlParams = {
  clientId: string;
  pathname: string;
  clientRole: ClientRole;
  extensionName: string;
  contextName?: string;
  hash?: string;
};

export type HMRWsParams = {
  hash: string;
  pathname: string;
  clientRole: ClientRole;
};

export type JSRuntimeWsUrlParams = {
  // in hippy runtime, frontend get clientId by gtk in $start callback
  clientId: string;
  pathname: string;
  clientRole: ClientRole;
  contextName: string;
};

export type WsUrlParams = AppWsUrlParams | DevtoolsWsUrlParams | HMRWsParams;

/**
 * parse debug WebSocket url params
 */
export const parseWsUrl = (reqUrl: string): WsUrlParams => {
  const url = new URL(reqUrl, 'http://0.0.0.0');
  const clientId = url.searchParams.get('clientId');
  const contextName = url.searchParams.get('contextName');
  const clientRole = url.searchParams.get('role') as ClientRole;
  const deviceName = url.searchParams.get('deviceName');
  const extensionName = url.searchParams.get('extensionName') || '';
  const hash = url.searchParams.get('hash') || '';
  return {
    clientId,
    clientRole,
    pathname: url.pathname,
    contextName,
    deviceName,
    extensionName,
    hash,
  };
};

/**
 * check WS url params
 *  - in devtools case, must exist debugTarget
 *  - in HMR case, must has hash field
 */
export const getWsInvalidReason = (wsUrlParams: WsUrlParams): string => {
  const { clientRole, pathname } = wsUrlParams;

  if (pathname !== config.wsPath) return 'invalid ws connection path!';
  if (!Object.values(ClientRole).includes(clientRole)) return 'invalid client role!';

  if (clientRole === ClientRole.HMRClient || clientRole === ClientRole.HMRServer) {
    if ('hash' in wsUrlParams) return '';
    return 'invalid HMR ws params, must connect with hash field!';
  }

  const { clientId } = wsUrlParams as AppWsUrlParams | DevtoolsWsUrlParams;
  // if (clientRole === ClientRole.Devtools && !('hash' in wsUrlParams) && config.isCluster)
  //   return 'invalid ws connection, you ws url should carry `hash` query params!';

  /**
   * no need to validate contextName, because iOS hippy v3.0 couldn't get contextName when debug connection
   * contextName will update by TDFRuntime.updateContextInfo event
   */
  // if (clientRole === ClientRole.IOS && !contextName) return 'invalid iOS connection, should request with contextName!';
  if (clientRole !== ClientRole.JSRuntime && !clientId) return 'invalid ws connection!';
  return '';
};

/**
 * make full URL with query params
 */
export const makeUrl = (baseUrl: string, query: unknown = {}) => {
  let fullUrl = baseUrl;

  const keys = Object.keys(query);
  for (const [i, key] of keys.entries()) {
    if (i === 0) {
      if (fullUrl.indexOf('?') === -1) {
        fullUrl += '?';
      }
    } else {
      fullUrl += '&';
    }
    fullUrl += `${key}=${encodeURIComponent(query[key])}`;
  }
  return fullUrl;
};

export const getWSProtocolByHttpProtocol = (httpProtocol: string) =>
  ({
    https: 'wss',
    http: 'ws',
  }[httpProtocol] || 'ws');

export const getBaseFolderOfPublicPath = (publicPath: string) => {
  const url = new URL(publicPath, 'http://0.0.0.0');
  return trim(url.pathname, '/');
};

export const getHomeUrl = () => {
  const { env } = global.debugAppArgv;
  return `${config.domain}/extensions/home.html?env=${env}`;
};
