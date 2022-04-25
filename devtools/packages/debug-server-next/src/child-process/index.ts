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

import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import path from 'path';
import os from 'os';
import open from 'open';
import colors from 'colors/safe';
import { TunnelEvent, WinstonColor, OSType, LogLevel } from '@debug-server-next/@types/enum';
import { deviceManager } from '@debug-server-next/device-manager';
import { Logger, TunnelLogger } from '@debug-server-next/utils/log';
import { config } from '@debug-server-next/config';
import { getHomeUrl } from '@debug-server-next/utils/url';
import { StartTunnelOption } from '@debug-server-next/@types/addon';
import { startAdbProxy } from './adb';

const childProcessLog = new Logger('child-process', WinstonColor.Magenta);
const tunnelLog = new TunnelLogger('tunnel', WinstonColor.BrightRed);
let proxyProcess;

export const TUNNEL_EVENT = 'message';
export const tunnelEmitter = new EventEmitter();

export const startTunnel = async (cb?: StartTunnelCallback) => {
  global.addon.addEventListener((event: TunnelEvent, data: unknown) => {
    try {
      if (event !== TunnelEvent.TunnelLog) {
        tunnelLog.info('tunnel event: %s', event);
      }
      if (event === TunnelEvent.ReceiveData) {
        tunnelEmitter.emit(TUNNEL_EVENT, data);
      } else {
        if ([TunnelEvent.RemoveDevice, TunnelEvent.AddDevice].indexOf(event) !== -1) {
          if (event === TunnelEvent.RemoveDevice) {
            childProcessLog.warn(colors.bold[WinstonColor.Red]('device disconnected'));
          }
          if (event === TunnelEvent.AddDevice) {
            childProcessLog.info(colors.bold[WinstonColor.Green]('device connected'));
          }
          deviceManager.getDeviceList();
          if (event === TunnelEvent.AddDevice) {
            // every time device connect, auto run adb reverse
            startAdbProxy();
          }
        } else if (event === TunnelEvent.AppConnect) {
          deviceManager.onAppConnect();
        } else if (event === TunnelEvent.AppDisconnect) {
          deviceManager.onAppDisconnect();
        } else if (event === TunnelEvent.TunnelLog && data) {
          tunnelLog.verbose(data);
        }

        if (cb) cb(event, data);
      }
    } catch (e) {
      tunnelLog.error('handle tunnel event error: %s', (e as Error)?.stack);
    }
  });
  global.addon.tunnelStart(getTunnelOption());
};

export const startIWDP = () => {
  const { iWDPPort } = global.debugAppArgv;
  const { iWDPStartPort, iWDPEndPort } = config;
  proxyProcess = spawn(
    'ios_webkit_debug_proxy',
    ['--no-frontend', `--config=null:${iWDPPort},:${iWDPStartPort}-${iWDPEndPort}`],
    { detached: false },
  );
  proxyProcess.unref();

  childProcessLog.info(`start IWDP on port ${iWDPPort}`);
  proxyProcess.stdout.on('data', (msg) => childProcessLog.info(msg.toString()));
  proxyProcess.stderr.on('data', (msg) => childProcessLog.error(msg.toString()));
  proxyProcess.on('error', (e) => {
    childProcessLog.error('IWDP error: %s', e?.stack);
  });
  proxyProcess.on('message', (msg) => {
    childProcessLog.info('IWDP message: %j', msg);
  });
  proxyProcess.on('close', (code) => {
    childProcessLog.warn(`IWDP close with code: ${code}`);
  });
};

export const startChrome = async () => {
  const { open: openChrome } = global.debugAppArgv;
  if (openChrome) {
    const url = getHomeUrl();
    try {
      open(url, { app: { name: open.apps.chrome } });
    } catch (e) {
      childProcessLog.error('open %s by chrome failed, please open manually, %s', url, (e as Error)?.stack);
    }
  }
};

export const killChildProcess = () => {
  if (!proxyProcess) return;
  childProcessLog.warn('on log.info server exit, do some clean...');
  proxyProcess?.kill('SIGKILL');
  proxyProcess = null;
};

type StartTunnelCallback = (event: TunnelEvent, data: unknown) => void;

function getTunnelOption(): StartTunnelOption {
  const { iWDPPort, log } = global.debugAppArgv;
  const { iWDPStartPort, iWDPEndPort } = config;
  const iWDPParams = [
    '--no-frontend',
    log === LogLevel.Silly ? '--debug' : '',
    `--config=null:${iWDPPort},:${iWDPStartPort}-${iWDPEndPort}`,
  ].filter(Boolean);
  let tunnelOption;
  if (os.type() === OSType.Darwin) {
    tunnelOption = {
      adb_path: path.join(__dirname, '../build/mac/adb'),
      iwdp: {
        iwdp_params: iWDPParams,
        iwdp_listen_port: iWDPPort,
      },
      only_use_iwdp: 0,
    };
  }
  if (os.type() === OSType.Windows) {
    tunnelOption = {
      adb_path: path.join(__dirname, '../build/win/adb.exe'),
      iwdp: {
        iwdp_params: iWDPParams,
        iwdp_listen_port: iWDPPort,
        iwdp_path: path.join(__dirname, '../build/win/iwdp1.8.8/ios_webkit_debug_proxy.exe'),
      },
      only_use_iwdp: 0,
      iproxy_path: path.join(__dirname, '../build/win/idevice/iproxy.exe'),
      idevice_info_path: path.join(__dirname, '../build/win/idevice/ideviceinfo.exe'),
    };
  }
  childProcessLog.info('tunnel option: %j', tunnelOption);
  return tunnelOption;
}
