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

const spawn = require('cross-spawn');
const { logger } = require('./logger');

function exec(cmd, argv, options = {}) {
  const { disableOutput } = options;
  return new Promise((resolve, reject) => {
    const command = spawn(cmd, argv);
    if (!disableOutput) {
      command.stdout.on('data', log => logger.info(log.toString()));
      command.stderr.on('data', err => logger.error(err.toString()));
    }
    command.on('error', err => reject(err));
    command.on('close', (code) => {
      if (code) {
        return reject(new Error(`Execting ${cmd} returns: ${code}`));
      }
      return resolve();
    });
  });
}

module.exports = exec;
