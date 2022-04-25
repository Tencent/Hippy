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

import { spawn, SpawnOptionsWithoutStdio } from 'child_process';
import { Logger } from './log';

const log = new Logger('child-process');

export const exec = (cmd: string, argv?: string[], options?: SpawnOptionsWithoutStdio) =>
  new Promise((resolve, reject) => {
    const cp = spawn(cmd, argv, options);
    cp.stdout.on('data', (msg) => console.info(msg.toString()));
    cp.stderr.on('data', (err) => console.warn(err.toString()));
    cp.on('error', (err) => {
      log.error('spawn child process error: %s', err.stack);
      reject(err);
    });
    cp.on('close', (code) => {
      if (code) {
        return reject(new Error(`exec ${cmd} returns: ${code}`));
      }
    });
    return resolve(cp);
  });
