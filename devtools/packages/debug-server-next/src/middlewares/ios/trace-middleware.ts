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

import { ChromeCommand, ChromeEvent, IOS100Command, IOS100Event } from '@hippy/devtools-protocol/dist/types';
import { Logger } from '@debug-server-next/utils/log';
import { requestId } from '@debug-server-next/utils/global-id';
import { MiddleWareManager } from '../middleware-context';
import TraceAdapter from './adapter/trace-adapter';

const log = new Logger('trace-middleware');

export const traceMiddleWareManager: MiddleWareManager = {
  downwardMiddleWareListMap: {
    [IOS100Event.ScriptProfilerTrackingComplete]: ({ msg, sendToDevtools }) => {
      const eventRes = msg as Adapter.CDP.EventRes;
      log.info(`onPerformanceProfileCompleteEvent, msg = ${eventRes}`);
      const traceAdapter = new TraceAdapter();
      const v8json = traceAdapter.jsc2v8(eventRes.params);
      return sendToDevtools({
        method: ChromeEvent.TracingDataCollected,
        params: {
          value: v8json,
        },
      });
    },
  },
  upwardMiddleWareListMap: {
    [ChromeCommand.TracingStart]: ({ sendToApp }) =>
      sendToApp({
        id: requestId.create(),
        method: IOS100Command.ScriptProfilerStartTracking,
        params: { includeSamples: true },
      }),
    [ChromeCommand.TracingEnd]: ({ sendToApp }) =>
      sendToApp({
        id: requestId.create(),
        method: IOS100Command.ScriptProfilerStopTracking,
        params: {},
      }),
  },
};
