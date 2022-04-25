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

import { ChromeCommand, ChromeEvent, IOS100Command } from '@hippy/devtools-protocol/dist/types';
import { Logger } from '@debug-server-next/utils/log';
import { requestId } from '@debug-server-next/utils/global-id';
import { MiddleWareManager } from '../middleware-context';
import HeapAdapter from './adapter/heap-adapter';

const log = new Logger('heap-middleware');

export const heapMiddleWareManager: MiddleWareManager = {
  downwardMiddleWareListMap: {},
  upwardMiddleWareListMap: {
    [ChromeCommand.HeapProfilerEnable]: async ({ msg, sendToApp, sendToDevtools }) => {
      const res = await sendToApp({
        id: requestId.create(),
        method: IOS100Command.HeapEnable,
        params: {},
      });
      log.verbose(`${IOS100Command.HeapEnable} res: `, msg);
      const convertedRes = {
        id: (msg as Adapter.CDP.Req).id,
        method: msg.method,
        result: res,
      };
      sendToDevtools(convertedRes);
      return convertedRes;
    },
    [ChromeCommand.HeapProfilerDisable]: ({ sendToApp }) =>
      sendToApp({
        id: requestId.create(),
        method: IOS100Command.HeapDisable,
        params: {},
      }),
    [ChromeCommand.HeapProfilerTakeHeapSnapshot]: async ({ msg, sendToApp, sendToDevtools }) => {
      const req = msg as Adapter.CDP.Req<ProtocolChrome.HeapProfiler.TakeHeapSnapshotRequest>;
      const { reportProgress } = req.params;
      const commandRes = (await sendToApp({
        id: requestId.create(),
        method: IOS100Command.HeapSnapshot,
        params: {},
      })) as Adapter.CDP.CommandRes<ProtocolIOS100.Heap.SnapshotResponse>;
      const snapshot = JSON.parse(commandRes.result.snapshotData);
      const wholeChunk = JSON.stringify(HeapAdapter.jsc2v8(snapshot));
      if (reportProgress)
        sendToDevtools({
          method: ChromeEvent.HeapProfilerReportHeapSnapshotProgress,
          params: {
            finished: true,
            done: wholeChunk.length,
            total: wholeChunk.length,
          },
        });
      sendToDevtools({
        method: ChromeEvent.HeapProfilerAddHeapSnapshotChunk,
        params: {
          chunk: wholeChunk,
        },
      });
      const convertedRes = {
        id: (msg as Adapter.CDP.Req).id,
        method: msg.method,
        result: {},
      };
      sendToDevtools(convertedRes);
      return convertedRes;
    },
    [ChromeCommand.HeapProfilerCollectGarbage]: ({ sendToApp }) =>
      sendToApp({
        id: requestId.create(),
        method: IOS100Command.HeapGc,
        params: {},
      }),
  },
};
