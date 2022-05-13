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

/* eslint-disable import/first -- should add module alias before use */
import moduleAlias from 'module-alias';
moduleAlias.addAliases({
  '@debug-server-next': __dirname,
});
import { DevtoolsEnv, LogLevel } from '@debug-server-next/@types/enum';
import { DebugAppArgv } from '@debug-server-next/@types/app';
import { startDebugServer as oldStartDebugServer } from '@debug-server-next/app-debug';
import './process-handler';

export { webpack } from '@debug-server-next/app-dev';

export const startDebugServer = (options?: DebugAppArgv) => {
  global.debugAppArgv = {
    host: '0.0.0.0',
    port: 38989,
    static: '',
    entry: 'dist/dev/index.bundle',
    open: true,
    log: LogLevel.Info,
    env: DevtoolsEnv.Hippy,
    iWDPPort: 9000,
    iWDPStartPort: 9200,
    enableIOS: true,
    iWDPEndPort: 9300,
    ...(options || {}),
  };
  oldStartDebugServer();
};
