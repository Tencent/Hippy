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

import request from 'request-promise';
import { findLast } from 'lodash';
import { AppClientType, ClientRole, DevicePlatform } from '@debug-server-next/@types/enum';
import { config } from '@debug-server-next/config';
import { makeUrl } from '@debug-server-next/utils/url';
import { Logger } from '@debug-server-next/utils/log';
import { sleep } from '@debug-server-next/utils/timer';
import { DebugTarget } from '@debug-server-next/@types/debug-target';
import { wsUrlWithoutProtocol } from '@debug-server-next/utils/debug-target';

const log = new Logger('IWDP-util');

/**
 * get all IWDP pages of connected iOS device
 */
export const getIWDPPages = async (iWDPPort): Promise<IWDPPage[]> => {
  if (config.isCluster) return [];
  try {
    // IWDP detect page maybe slow, do some sleep
    await sleep(800);
    const deviceList = await request({
      url: '/json',
      baseUrl: `http://127.0.0.1:${iWDPPort}`,
      json: true,
    });
    const debugTargets: IWDPPage[] = (await Promise.all(deviceList.map(getDeviceIWDPPages))) || [];
    return debugTargets.flat().filter(iWDPPagesFilter);
  } catch (e) {
    return [];
  }
};

/**
 * use IWDP info extend debugTarget
 */
export const patchIOSTarget = (debugTarget: DebugTarget, iOSPages: Array<IWDPPage>): DebugTarget => {
  if (debugTarget.platform !== DevicePlatform.IOS) return debugTarget;

  const iOSPage = findIOSPage(debugTarget, iOSPages);
  if (!iOSPage) {
    const i = debugTarget.appClientTypeList.indexOf(AppClientType.IWDP);
    if (i !== -1) debugTarget.appClientTypeList.splice(i, 1);
    delete debugTarget.deviceOSVersion;
    delete debugTarget.deviceId;
    delete debugTarget.deviceOSVersion;
    return debugTarget;
  }

  iOSPage.shouldRemove = true;
  const iWDPWsUrl = iOSPage.webSocketDebuggerUrl;
  const wsUrl = makeUrl(`${config.wsDomain}${config.wsPath}`, {
    clientId: debugTarget.clientId,
    role: ClientRole.Devtools,
  });
  const devtoolsFrontendUrl = makeUrl(`${config.domain}/front_end/inspector.html`, {
    remoteFrontend: true,
    experiments: true,
    ws: wsUrlWithoutProtocol(wsUrl),
    env: global.debugAppArgv.env,
  });
  const { appClientTypeList } = debugTarget;
  if (appClientTypeList.indexOf(AppClientType.IWDP) === -1) appClientTypeList.push(AppClientType.IWDP);
  return {
    ...debugTarget,
    iWDPWsUrl,
    appClientTypeList,
    deviceName: iOSPage.device.deviceName,
    deviceId: iOSPage.device.deviceId,
    deviceOSVersion: iOSPage.device.deviceOSVersion,
    title: iOSPage.title,
    devtoolsFrontendUrl,
    webSocketDebuggerUrl: wsUrl,
  };
};

/**
 * get IWDP pages of one device
 */
const getDeviceIWDPPages = async (device: IWDPDevice): Promise<IWDPPage[]> => {
  const port = device.url.match(/:(\d+)/)[1];
  try {
    const targets: IWDPPage[] = await request({
      url: '/json',
      baseUrl: `http://127.0.0.1:${port}`,
      json: true,
    });
    targets.forEach((target) => (target.device = device));
    return targets;
  } catch (e) {
    log.error('getDeviceIWDPPages error, %s', (e as Error)?.stack);
    return [];
  }
};

const iWDPPagesFilter = (iWDPPage: IWDPPage) =>
  /^HippyContext/.test(iWDPPage.title) && !/\(delete\)/.test(iWDPPage.title);
//  && Boolean(iWDPPage.devtoolsFrontendUrl);

const findIOSPage = (debugTarget: DebugTarget, iOSPages: Array<IWDPPage>) => {
  const iOSPagesWithFlag = iOSPages as Array<IWDPPage & { shouldRemove?: boolean }>;
  // should use last created JSContext
  return findLast(
    iOSPagesWithFlag,
    (iOSPage) =>
      /**
       * TODO doesn't support multiple device with same title
       * this will cause updating debugTargets deviceInfo confused in list page
       */
      (debugTarget.appClientTypeList.includes(AppClientType.WS) && debugTarget.title === iOSPage.title) ||
      // && debugTarget.deviceName === iOSPage.device.deviceName
      (debugTarget.appClientTypeList.includes(AppClientType.Tunnel) &&
        debugTarget.deviceName === iOSPage.device.deviceName),
  );
};
