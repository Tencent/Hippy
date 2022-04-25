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

import Aegis from '@debug-server-next/patch/aegis';
import { config } from '@debug-server-next/config';
import { version } from '../../package.json';

export const aegis: any = new Aegis({
  id: config.aegisId,
  selector: {
    type: 'host',
  },
  version,
  // protocol: 'http',
});

export const timeStart = (name: string) => {
  const start = Date.now();
  return (ext: ExtOption = {}) => {
    const end = Date.now();
    const duration = end - start;
    aegis.reportTime({
      name,
      duration,
      ...ext,
      ext3: config.isCluster ? 'remote' : 'local',
    });
  };
};

type ExtOption = {
  ext1?: string;
  ext2?: string;
  ext3?: string;
};

export const createCDPPerformance = (perf?: Partial<Adapter.Performance>): Adapter.Performance => ({
  devtoolsToDebugServer: 0,
  debugServerReceiveFromDevtools: 0,
  debugServerToDevtools: 0,
  devtoolsReceive: 0,
  ...(perf || {}),
});
