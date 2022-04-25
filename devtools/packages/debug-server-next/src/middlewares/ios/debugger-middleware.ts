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

import { ChromeCommand, ChromeEvent, IOS90Command, ScriptLanguage } from '@hippy/devtools-protocol/dist/types';
import { requestId } from '@debug-server-next/utils/global-id';
import { MiddleWareManager } from '../middleware-context';
import { sendEmptyResultToDevtools } from '../default-middleware';

let lastScriptEval;

export const getLastScriptEval = () => lastScriptEval;

export const debuggerMiddleWareManager: MiddleWareManager = {
  downwardMiddleWareListMap: {
    [ChromeEvent.DebuggerScriptParsed]: ({ msg, sendToDevtools }) => {
      const eventRes = msg as Adapter.CDP.EventRes;
      delete eventRes.params.module;
      eventRes.params = {
        ...eventRes.params,
        hasSourceURL: !!eventRes.params.sourceURL,
        isModule: eventRes.params.module,
        scriptLanguage: ScriptLanguage.JavaScript,
        url: eventRes.params.url || eventRes.params.sourceURL,
      };
      lastScriptEval = eventRes.params.scriptId;
      return sendToDevtools(eventRes);
    },
    [IOS90Command.DebuggerEnable]: sendEmptyResultToDevtools,
    [ChromeCommand.DebuggerSetBlackboxPatterns]: sendEmptyResultToDevtools,
    [IOS90Command.DebuggerSetPauseOnExceptions]: sendEmptyResultToDevtools,
  },
  upwardMiddleWareListMap: {
    [ChromeCommand.DebuggerEnable]: async ({ sendToApp, msg }) => {
      sendToApp({
        id: requestId.create(),
        method: ChromeCommand.DebuggerSetBreakpointsActive,
        params: { active: true },
      });
      return sendToApp(msg as Adapter.CDP.Req);
    },
    [ChromeCommand.DebuggerSetBlackboxPatterns]: async ({ msg, sendToDevtools }) => {
      const res = {
        id: (msg as Adapter.CDP.Req).id,
        method: msg.method,
        result: {},
      };
      sendToDevtools(res);
      return res;
    },
    [ChromeCommand.RuntimeSetAsyncCallStackDepth]: async ({ msg, sendToDevtools }) => {
      const res = {
        id: (msg as Adapter.CDP.Req).id,
        method: msg.method,
        result: true,
      };
      sendToDevtools(res);
      return res;
    },
    [ChromeCommand.DebuggerSetAsyncCallStackDepth]: sendEmptyResultToDevtools,
  },
};
