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

import { ChromeCommand, ChromeEvent } from '@hippy/devtools-protocol/dist/types/enum-chrome-mapping';
import { IOS90Command } from '@hippy/devtools-protocol/dist/types/enum-ios-9.0-mapping';
import { contextId, requestId } from '@debug-server-next/utils/global-id';
import { MiddleWareManager } from '../middleware-context';
import { getLastScriptEval } from './debugger-middleware';

export const runtimeMiddleWareManager: MiddleWareManager = {
  downwardMiddleWareListMap: {
    [ChromeEvent.RuntimeExecutionContextCreated]: ({ msg, sendToDevtools }) => {
      const eventRes = msg as Adapter.CDP.EventRes<
        ProtocolIOS90.Runtime.ExecutionContextCreatedEvent & ProtocolChrome.Runtime.ExecutionContextCreatedEvent
      >;
      if (eventRes.params?.context) {
        if (!eventRes.params.context.origin) {
          eventRes.params.context.origin = eventRes.params.context.name;
        }

        if (eventRes.params.context.frameId) {
          eventRes.params.context.auxData = {
            frameId: eventRes.params.context.frameId,
            isDefault: true,
          };
          delete eventRes.params.context.frameId;
        }
      }

      return sendToDevtools(eventRes);
    },
    [ChromeCommand.RuntimeEvaluate]: ({ msg, sendToDevtools }) => {
      const lastScriptEval = getLastScriptEval();
      const commandRes = msg as Adapter.CDP.CommandRes<
        ProtocolIOS90.Runtime.EvaluateResponse & ProtocolChrome.Runtime.EvaluateResponse
      >;
      if (commandRes.result?.wasThrown) {
        commandRes.result.result.subtype = 'error';
        commandRes.result.exceptionDetails = {
          exceptionId: 1,
          text: commandRes.result.result.description,
          url: '',
          scriptId: lastScriptEval,
          lineNumber: 1,
          columnNumber: 0,
          stackTrace: {
            callFrames: [
              {
                functionName: '',
                scriptId: lastScriptEval,
                url: '',
                lineNumber: 1,
                columnNumber: 1,
              },
            ],
          },
        };
      } else if (commandRes.result?.result?.preview) {
        commandRes.result.result.preview.description = commandRes.result.result.description;
        commandRes.result.result.preview.type = 'object';
      }
      return sendToDevtools(commandRes);
    },
    [ChromeCommand.RuntimeGetProperties]: ({ msg, sendToDevtools }) => {
      const commandRes = msg as Adapter.CDP.CommandRes;
      const newPropertyDescriptors = [];
      const properties = commandRes.result?.properties || [];
      for (let i = 0; i < properties?.length; i += 1) {
        if (properties[i].isOwn || properties[i].nativeGetter) {
          properties[i].isOwn = true;
          newPropertyDescriptors.push(properties[i]);
        }
      }
      commandRes.result.result = null;
      commandRes.result.result = newPropertyDescriptors;
      return sendToDevtools(commandRes);
    },
    [ChromeCommand.RuntimeEnable]: ({ msg, sendToDevtools }) => {
      sendToDevtools({
        method: ChromeEvent.RuntimeExecutionContextCreated,
        params: {
          context: {
            id: contextId.create(),
            name: 'tdf',
            origin: '',
          },
        },
      });
      return sendToDevtools(msg);
    },
  },
  upwardMiddleWareListMap: {
    [ChromeCommand.RuntimeCompileScript]: async ({ msg, sendToApp, sendToDevtools }) => {
      const eventRes = msg as Adapter.CDP.EventRes;
      await sendToApp({
        id: requestId.create(),
        method: IOS90Command.RuntimeEvaluate,
        params: {
          expression: eventRes.params.expression,
          contextId: eventRes.params.executionContextId,
        },
      });
      const convertedRes = {
        id: (msg as Adapter.CDP.Req).id,
        method: msg.method,
        result: {
          scriptId: null,
          exceptionDetails: null,
        },
      };
      sendToDevtools(convertedRes);
      return convertedRes;
    },
  },
};
