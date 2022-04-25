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
import os from 'os';
import fs from 'fs';
import { exec } from '@debug-server-next/utils/process';
import { WinstonColor, OSType } from '@debug-server-next/@types/enum';
import { Logger } from '@debug-server-next/utils/log';
import { config } from '@debug-server-next/config';

let hmrPort;
const log = new Logger('adb', WinstonColor.Magenta);

export const startAdbProxy = async () => {
  if (!hmrPort) {
    try {
      const data = fs.readFileSync(config.hmrPortPath);
      hmrPort = data.toString();
    } catch (e) {
      log.verbose('hmrPort file does not exist.');
    }
  }
  const { port } = global.debugAppArgv || {};
  const adbRelatePath = {
    [OSType.Darwin]: '../build/mac/adb',
    [OSType.Windows]: '../build/win/adb.exe',
  }[os.type()];
  const adbPath = path.join(__dirname, adbRelatePath);
  try {
    if (port) await exec(adbPath, ['reverse', `tcp:${port}`, `tcp:${port}`]);
    if (hmrPort) await exec(adbPath, ['reverse', `tcp:${hmrPort}`, `tcp:${hmrPort}`]);
  } catch (e) {
    log.warn('Port reverse failed, For iOS app log.info only just ignore the message.');
    log.warn(`Otherwise please check 'adb devices' command working correctly`);
    if (port) log.warn(`type 'adb reverse tcp:${port} tcp:${port}' retry!`);
    if (hmrPort) log.warn(`type 'adb reverse tcp:${hmrPort} tcp:${hmrPort}' retry!`);
    log.warn('start adb reverse error: %s', (e as Error)?.stack);
  }
};
