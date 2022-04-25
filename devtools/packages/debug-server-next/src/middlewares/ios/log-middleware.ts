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

import { ChromeCommand, ChromeEvent, IOS100Event, IOS90Command } from '@hippy/devtools-protocol/dist/types';
import { ChromeLogLevel } from '@debug-server-next/@types/enum';
import { MiddleWareManager } from '../middleware-context';

export const logMiddleWareManager: MiddleWareManager = {
  downwardMiddleWareListMap: {
    [IOS100Event.ConsoleMessageAdded]: ({ msg, sendToDevtools }) => {
      const eventRes = msg as Adapter.CDP.EventRes<ProtocolIOS100.Console.MessageAddedEvent>;
      const { message } = eventRes.params;

      let type;
      if (message.type === 'log') {
        type = {
          log: ChromeLogLevel.Info,
          [ChromeLogLevel.Info]: ChromeLogLevel.Info,
          [ChromeLogLevel.Error]: ChromeLogLevel.Error,
          [ChromeLogLevel.Warning]: ChromeLogLevel.Warning,
        }[message.level];
        if (!type) type = ChromeLogLevel.Info;
      } else {
        type = message.type;
      }

      // if (message.source === 'console-api') {
      //   const logEntry: ProtocolChrome.Runtime.ConsoleAPICalledEvent = {
      //     type: type as any,
      //     stackTrace: transformStacktrace(message.stackTrace),
      //     timestamp: Math.floor(new Date().getTime()),
      //     executionContextId: 1,
      //     args: (message.parameters || []) as any,
      //   };
      //   setContext('lastConsoleMessage', logEntry);
      //   return sendToDevtools({
      //     method: ChromeEvent.RuntimeConsoleAPICalled,
      //     params: logEntry,
      //   });
      // }

      const consoleMessage: ProtocolChrome.Log.LogEntry = {
        source: message.source as any,
        level: type,
        text: '',
        lineNumber: message.line,
        timestamp: new Date().getTime(),
        url: message.url,
        args: message.parameters as unknown as ProtocolChrome.Runtime.RemoteObject[],
        stackTrace: message.stackTrace
          ? {
              callFrames: message.stackTrace,
            }
          : undefined,
        networkRequestId: message.networkRequestId,
      };

      return sendToDevtools({
        method: ChromeEvent.LogEntryAdded,
        params: {
          entry: consoleMessage,
        },
      });
    },
    [IOS90Command.ConsoleEnable]: ({ msg, sendToDevtools }) =>
      sendToDevtools({
        id: (msg as Adapter.CDP.Req).id,
        method: ChromeCommand.LogEnable,
        result: {},
      }),
  },
  upwardMiddleWareListMap: {
    [ChromeCommand.LogClear]: ({ msg, sendToApp }) =>
      sendToApp({
        id: (msg as Adapter.CDP.Req).id,
        method: ChromeCommand.ConsoleClearMessages,
        params: {},
      }),
    [ChromeCommand.LogDisable]: ({ msg, sendToApp }) =>
      sendToApp({
        id: (msg as Adapter.CDP.Req).id,
        method: IOS90Command.ConsoleDisable,
        params: {},
      }),
    [ChromeCommand.LogEnable]: ({ msg, sendToApp }) =>
      sendToApp({
        id: (msg as Adapter.CDP.Req).id,
        method: IOS90Command.ConsoleEnable,
        params: {},
      }),
  },
};
