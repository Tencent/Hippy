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

import os from 'os';
import { OSType } from '@debug-server-next/@types/enum';
import { Logger } from '@debug-server-next/utils/log';

const log = new Logger('import-tunnel');

export const importTunnel = async () => {
  const osType = os.type();
  if (osType === OSType.Darwin) {
    return import('./import-addon-mac');
  }
  if (osType === OSType.Windows) {
    return import('./import-addon-win');
  }
  if (osType === OSType.Linux) {
    log.error('tunnel does not support linux.');
  }
};
