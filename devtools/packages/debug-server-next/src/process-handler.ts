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

import { Logger } from '@debug-server-next/utils/log';
import { killChildProcess } from '@debug-server-next/child-process';
import { stopServer } from './app-debug';

const log = new Logger('process-handler');
const onExit = (...arg) => {
  killChildProcess();
  log.info('on exit: %j', arg);
  stopServer(true, ...arg);
};
const onError = (e: Error) => log.error('unhandledRejection %s', e?.stack);

// handle promise reject
process.on('unhandledRejection', onError);
// handle uncaught exception
process.on('uncaughtException', onError);
// handle process exit
process.on('exit', () => onExit('exit'));
// handle ctrl c
process.on('SIGINT', () => onExit('SIGINT'));
// handle kill
process.on('SIGTERM', () => onExit('SIGTERM'));
