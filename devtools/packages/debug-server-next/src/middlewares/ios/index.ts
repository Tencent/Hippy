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

import { merge } from 'lodash';
import { cssMiddleWareManager } from '../common/css-middleware';
import { tdfHeapMiddleWareManager } from '../common/heap-middleware';
import { MiddleWareManager } from '../middleware-context';
import { tdfLogMiddleWareManager } from '../common/tdf-log-middleware';
import { tdfRuntimeMiddleWareManager } from '../common/tdf-runtime-middleware';
import { debuggerMiddleWareManager } from './debugger-middleware';
import { heapMiddleWareManager } from './heap-middleware';
import { logMiddleWareManager } from './log-middleware';
import { runtimeMiddleWareManager } from './runtime-middleware';
import { traceMiddleWareManager } from './trace-middleware';

export const iOSMiddleWareManager: MiddleWareManager = merge(
  {},
  tdfHeapMiddleWareManager,
  tdfLogMiddleWareManager,
  debuggerMiddleWareManager,
  logMiddleWareManager,
  runtimeMiddleWareManager,
  traceMiddleWareManager,
  heapMiddleWareManager,
  cssMiddleWareManager,
  tdfRuntimeMiddleWareManager,
);
