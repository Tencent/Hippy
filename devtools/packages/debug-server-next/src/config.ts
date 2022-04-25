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

import path from 'path';
import { StaticFileStorage } from '@debug-server-next/@types/enum';

export const config: Config = {
  ...getPublicDomain(),
  wsPath: '/debugger-proxy',
  cachePath: path.join(__dirname, 'cache'),
  hmrStaticPath: path.join(process.env.HMRStaticPath || __dirname, 'hmr'),
  logPath: path.join(__dirname, 'log'),
  hmrPortPath: path.join(__dirname, 'cache/hmr-port.txt'),
  iWDPStartPort: global.debugAppArgv?.iWDPStartPort || 9200,
  iWDPEndPort: global.debugAppArgv?.iWDPEndPort || 9300,
  redis: {
    // ⚠️ redis-server < v6, username field must by null
    url: `redis://:${process.env.REDIS_PWD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/0`,
    debugTargetTable: 'tdf:debugtargets',
    bundleTable: 'tdf:bundles',
  },
  isCluster: process.env.IS_CLUSTER === 'true',
  cos: {
    SecretId: process.env.SecretId,
    SecretKey: process.env.SecretKey,
    Bucket: process.env.Bucket,
    Region: process.env.Region,
    StorageClass: process.env.StorageClass,
  },
  staticFileStorage: (process.env.StaticFileStorage as StaticFileStorage) || StaticFileStorage.Local,
  aegisId: 'yxqehauSsvzBZxdRmz',
  showPerformance: false,
};

interface Config {
  domain: string;
  wsDomain: string;
  wsProtocol: string;
  wsPath: string;
  cachePath: string;
  hmrStaticPath: string;
  logPath: string;
  hmrPortPath: string;
  iWDPStartPort: number;
  iWDPEndPort: number;
  redis: {
    url: string;
    debugTargetTable: string;
    bundleTable: string;
  };
  isCluster: boolean;
  cos: {
    SecretId: string;
    SecretKey: string;
    Bucket: string;
    Region: string;
    StorageClass: string;
  };
  staticFileStorage: StaticFileStorage;
  aegisId: string;
  showPerformance: boolean;
}

function getPublicDomain() {
  const hostFromArgv =
    !global.debugAppArgv?.host || global.debugAppArgv?.host === '0.0.0.0' ? 'localhost' : global.debugAppArgv?.host;
  const portFromArgv = global.debugAppArgv?.port || 38989;
  const domain = process.env.DOMAIN || `http://${hostFromArgv}:${portFromArgv}`;
  const wsDomain = domain.replace('https://', 'wss://').replace('http://', 'ws://');
  const wsProtocol = domain.startsWith('https://') ? 'wss' : 'ws';
  return { domain, wsDomain, wsProtocol };
}
