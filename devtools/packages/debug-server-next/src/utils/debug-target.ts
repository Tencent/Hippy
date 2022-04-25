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

import { DeviceInfo } from '@debug-server-next/@types/device';
import { ChromePageType, DevicePlatform, ClientRole, AppClientType } from '@debug-server-next/@types/enum';
import { makeUrl, AppWsUrlParams } from '@debug-server-next/utils/url';
import { config } from '@debug-server-next/config';
import { DebugTarget } from '@debug-server-next/@types/debug-target';
import { getIWDPPages, patchIOSTarget } from '@debug-server-next/utils/iwdp';
import { getDBOperator } from '@debug-server-next/db';
import { Logger } from '@debug-server-next/utils/log';

const log = new Logger('debug-target-util');

export const createTargetByDeviceInfo = (device: DeviceInfo): DebugTarget => {
  // TODO tunnel doesn't support multiple device, so we use device name as debug target clientId
  const clientId = device.devicename;
  const wsUrl = makeUrl(`${config.wsDomain}${config.wsPath}`, {
    clientId,
    role: ClientRole.Devtools,
  });
  const devtoolsFrontendUrl = makeUrl(`${config.domain}/front_end/inspector.html`, {
    remoteFrontend: true,
    experiments: true,
    [config.wsProtocol]: wsUrlWithoutProtocol(wsUrl),
    env: global.debugAppArgv.env,
  });
  const title = device.platform === DevicePlatform.IOS ? clientId : 'Hippy debug tools for V8';

  return {
    clientId,
    devtoolsFrontendUrl,
    thumbnailUrl: '',
    title,
    url: '',
    description: '',
    webSocketDebuggerUrl: wsUrl,
    platform: device.platform,
    type: ChromePageType.Page,
    appClientTypeList: [AppClientType.Tunnel],
    deviceId: device.deviceid,
    deviceName: device.devicename,
    deviceOSVersion: device.osVersion,
    ref: 1,
    ts: Date.now(),
  };
};

export const createTargetByWsUrlParams = (wsUrlParams: AppWsUrlParams, host?: string): DebugTarget => {
  const { clientId, clientRole, contextName, deviceName, hash } = wsUrlParams;
  // if node server is in remote cluster
  // domain maybe devtools.qq.com or tdf-devtools.woa.com
  // so get domain from host
  const domain = config.isCluster ? `https://${host}` : config.domain;
  const wsDomain = domain.replace('https://', 'wss://').replace('http://', 'ws://');
  let platform;
  if (clientRole === ClientRole.Android) platform = DevicePlatform.Android;
  if (clientRole === ClientRole.IOS) platform = DevicePlatform.IOS;
  const wsUrl = makeUrl(`${wsDomain}${config.wsPath}`, {
    clientId,
    role: ClientRole.Devtools,
    hash,
  });
  const devtoolsFrontendUrl = makeUrl(`${domain}/front_end/inspector.html`, {
    remoteFrontend: true,
    experiments: true,
    [config.wsProtocol]: wsUrlWithoutProtocol(wsUrl),
    env: global.debugAppArgv.env,
    hash,
  });
  return {
    hash,
    clientId,
    devtoolsFrontendUrl,
    thumbnailUrl: '',
    title: contextName,
    url: '',
    description: '',
    webSocketDebuggerUrl: wsUrl,
    platform,
    type: ChromePageType.Page,
    deviceName,
    appClientTypeList: [AppClientType.WS],
    ref: 1,
    ts: Date.now(),
  };
};

export const createTargetByIWDPPage = (iWDPPage: IWDPPage): DebugTarget => {
  const iWDPWsUrl = iWDPPage.webSocketDebuggerUrl;
  const wsUrl = makeUrl(`${config.wsDomain}${config.wsPath}`, {
    clientId: iWDPWsUrl,
    role: ClientRole.Devtools,
  });
  const devtoolsFrontendUrl = makeUrl(`${config.domain}/front_end/inspector.html`, {
    remoteFrontend: true,
    experiments: true,
    [config.wsProtocol]: wsUrlWithoutProtocol(wsUrl),
    env: global.debugAppArgv.env,
  });
  return {
    clientId: iWDPWsUrl,
    iWDPWsUrl,
    devtoolsFrontendUrl,
    title: iWDPPage.title,
    thumbnailUrl: '',
    url: '',
    description: '',
    webSocketDebuggerUrl: wsUrl,
    platform: DevicePlatform.IOS,
    type: ChromePageType.Page,
    deviceId: iWDPPage.device.deviceId,
    deviceName: iWDPPage.device.deviceName,
    deviceOSVersion: iWDPPage.device.deviceOSVersion,
    appClientTypeList: [AppClientType.IWDP],
    ref: 1,
    ts: Date.now(),
  };
};

/**
 * append IWDP info to debugTarget
 */
export const patchDebugTarget = async (debugTarget: DebugTarget) => {
  if (debugTarget.platform === DevicePlatform.IOS) {
    const iOSPages = await getIWDPPages(global.debugAppArgv.iWDPPort);
    return patchIOSTarget(debugTarget, iOSPages);
  }
  return debugTarget;
};

export function wsUrlWithoutProtocol(wsUrl) {
  return wsUrl.replace('wss://', '').replace('ws://', '');
}

export const patchRefAndSave = async (newDebugTarget: DebugTarget): Promise<DebugTarget> => {
  const { DB } = getDBOperator();
  const { clientId } = newDebugTarget;
  const db = new DB<DebugTarget>(config.redis.debugTargetTable);
  const oldDebugTarget = await db.get(clientId);
  const debugTarget = newDebugTarget;
  if (oldDebugTarget) {
    debugTarget.ref = oldDebugTarget.ref + 1;
    log.info('increase debugTarget ref, clientId: %s, ref: %s', clientId, debugTarget.ref);
  }
  const patched = await patchDebugTarget(debugTarget);
  await db.upsert(clientId, patched);
  return patched;
};

export const decreaseRefAndSave = async (clientId: string): Promise<DebugTarget> => {
  const { DB } = getDBOperator();
  const db = new DB<DebugTarget>(config.redis.debugTargetTable);
  const debugTarget = await db.get(clientId);
  if (!debugTarget) return;
  debugTarget.ref -= 1;
  log.verbose('decrease debugTarget ref, clientId: %s, ref: %s', clientId, debugTarget.ref);
  if (debugTarget.ref <= 0) {
    await db.delete(clientId);
    log.verbose('debugTarget ref is 0, should delete, clientId: %s', clientId);
    return;
  }
  await db.upsert(clientId, debugTarget);
  return debugTarget;
};

export const removeDebugTarget = async (clientId: string) => {
  const { DB } = getDBOperator();
  const db = new DB<DebugTarget>(config.redis.debugTargetTable);
  return db.delete(clientId);
};

export const updateDebugTarget = async (clientId: string, partialDebugTarget: Partial<DebugTarget>) => {
  const { DB } = getDBOperator();
  const db = new DB<DebugTarget>(config.redis.debugTargetTable);
  const oldDebugTarget = await db.get(clientId);
  const updated: DebugTarget = {
    ...oldDebugTarget,
    ...partialDebugTarget,
  };
  await db.upsert(clientId, updated);
  return updated;
};
