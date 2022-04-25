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

import fs from 'fs';
import path from 'path';
import HippyHMRPlugin from '@hippy/hippy-hmr-plugin';
import QRCode from 'qrcode';
import { green, yellow, bold } from 'colors/safe';
import { Logger } from '@debug-server-next/utils/log';
import { makeUrl, getWSProtocolByHttpProtocol } from '@debug-server-next/utils/url';
import { config } from '@debug-server-next/config';
import { getAllLocalHostname } from '@debug-server-next/utils/ip';
import { isPortInUse } from '@debug-server-next/utils/port';
import { exec } from '@debug-server-next/utils/process';
export * from './inject-entry';

const log = new Logger('webpack-util');

export async function getWebpackConfig(configPath) {
  let webpackConfig;
  const webpackConfigPath = path.resolve(process.cwd(), configPath);
  if (configPath && fs.existsSync(webpackConfigPath)) {
    webpackConfig = await import(webpackConfigPath);
  }
  return webpackConfig?.default || webpackConfig;
}

export function normalizeWebpackConfig(versionId, config) {
  const enableRemoteDebug = isRemoteDebugEnabled(config);
  if (!enableRemoteDebug) return log.warn('remote debug is disabled!');

  normalizeRemoteDebug(versionId, config);
  appendHMRPlugin(versionId, config);
}

function normalizeRemoteDebug(versionId, config) {
  config.devServer.remote = {
    protocol: 'http',
    host: '127.0.0.1',
    port: 38989,
    qrcode: false,
    proxy: '',
    ...(config.devServer.remote || {}),
  };
  config.devServer.autoLaunchHippyDebug ??= true;
  if (config.devServer.autoLaunchHippyDebug) {
    autoLaunchHippyDebug(config.devServer.remote);
  }

  const { protocol, host, port, qrcode: qrcodeFn } = config.devServer.remote;
  const publicPath = getPublicPath(versionId, config.devServer);
  config.output.publicPath = publicPath;
  log.warn(bold(yellow(`webpack publicPath is set as: ${config.output.publicPath}`)));

  const ignorePort = couldIgnorePort(protocol, port);
  const bundleUrl = makeUrl(`${config.output.publicPath}index.bundle`, {
    debugUrl: makeUrl(
      `${getWSProtocolByHttpProtocol(protocol)}://${host}${ignorePort ? '' : `:${port}`}/debugger-proxy`,
    ),
  });
  const homeUrl = `${protocol}://${host}${ignorePort ? '' : `:${port}`}/extensions/home.html?hash=${versionId}`;

  config.devServer.cb = () => {
    process.nextTick(() => {
      // only print qrcode when use remote debug server
      const needVersionId = needPublicPathWithVersionId(host, config.multiple);
      if (needVersionId) log.info('paste the following bundleUrl in app to open hippy page');
      log.info('bundleUrl: %s', bold(green(bundleUrl)));
      log.info('find debug page on: %s', bold(green(homeUrl)));

      if (needVersionId && qrcodeFn && typeof qrcodeFn === 'function') {
        const qrcodeStr = qrcodeFn(bundleUrl);
        log.info('bundleUrl QRCode scheme: %s', bold(green(qrcodeStr)));
        QRCode.toString(
          qrcodeStr,
          {
            small: true,
            type: 'terminal',
          },
          (e, qrcodeStr) => {
            if (e) log.error('draw QRCode of bundleUrl failed: %j', e?.stack || e);
            log.info('scheme qrcode:\n%s', qrcodeStr);
          },
        );
      }
    });
  };
}

function appendHMRPlugin(versionId: string, config) {
  const hotManifestPublicPath = getPublicPath(versionId, config.devServer);
  const i = config.plugins.findIndex((plugin) => plugin.constructor.name === HippyHMRPlugin.name);
  if (i !== -1) {
    config.plugins.splice(i, 1);
  }
  if (!config.devServer.hot && !config.devServer.liveReload) return;
  config.plugins.push(new HippyHMRPlugin({ hotManifestPublicPath }));
}

/**
 * remote debug is enabled by default if enable webpack-dev-server
 */
function isRemoteDebugEnabled(webpackConfig) {
  return webpackConfig.devServer;
}

/**
 * when use debug-server-next in local, publicPath will append versionId if set devServer.multiple === true
 * and will always append versionId for remote
 */
function needPublicPathWithVersionId(host, multiple: boolean) {
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  if (isLocal) return Boolean(multiple);
  return true;
}

function getPublicPath(versionId, { remote: { host, port, protocol }, multiple }) {
  const ignorePort = couldIgnorePort(protocol, port);
  if (!needPublicPathWithVersionId(host, multiple)) return `${protocol}://${host}${ignorePort ? '' : `:${port}`}/`;
  return `${protocol}://${host}${ignorePort ? '' : `:${port}`}/${versionId}/`;
}

function couldIgnorePort(protocol, port) {
  const couldIgnore = (protocol === 'https' && Number(port) === 443) || (protocol === 'http' && Number(port) === 80);
  log.silly(couldIgnore);
  // TODO iOS doesn't support ignore port
  return false;
}

/**
 * hippy-dev process will save hmrPort to file,
 * hippy-debug process will auto reverse hmrPort when device reconnect.
 */
export async function saveDevPort(hmrPort) {
  const { cachePath } = config;
  fs.mkdirSync(cachePath, { recursive: true });
  return fs.writeFileSync(config.hmrPortPath, String(hmrPort));
}

/**
 * auto launch hippy:debug if remote.host is local hostname
 */
async function autoLaunchHippyDebug({ protocol, host, port }) {
  if (protocol !== 'http') return;
  const hostList = await getAllLocalHostname();
  if (!hostList.includes(host)) return;
  const inUse = await isPortInUse(port);
  if (inUse) return;
  exec('node', [path.join(__dirname, '../../../dist/index-debug.js'), '--port', port]);
}
