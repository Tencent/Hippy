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

import { TdfEvent } from '@hippy/devtools-protocol/dist/types/enum-tdf-mapping';
import { blue, black } from 'colors/safe';
import { ChromeEvent } from '@hippy/devtools-protocol/dist/types/enum-chrome-mapping';
import { Logger } from '@debug-server-next/utils/log';
import { MiddleWareManager } from '../middleware-context';

const log = new Logger('tdf-log-middleware');

export const tdfLogMiddleWareManager: MiddleWareManager = {
  downwardMiddleWareListMap: {
    [TdfEvent.TDFLogGetLog]: async ({ msg, sendToDevtools }) => {
      const eventRes = msg as Adapter.CDP.EventRes<ProtocolTdf.TDFLog.GetLogEvent>;
      const { params } = eventRes;
      try {
        let firstLog;
        await Promise.all(
          params.log.map((log) => {
            const event = {
              method: ChromeEvent.LogEntryAdded,
              params: {
                entry: convertTDFLogToChromeLog(log),
              },
            };

            firstLog ??= event;
            return sendToDevtools(event);
          }),
        );
        return firstLog;
      } catch (e) {
        log.error(`${ChromeEvent.LogEntryAdded} failed! %s`, (e as Error)?.stack);
        return Promise.reject(e);
      }
    },
  },
  upwardMiddleWareListMap: {},
};

const convertTDFLogToChromeLog = (log: ProtocolTdf.TDFLog.LogInfo): ProtocolChrome.Log.LogEntry => {
  // 1ms = 1000000ns
  const timestamp = `${new Date(Math.floor(log.timestamp / 1000000)).toLocaleString()}(${log.timestamp})`;
  const logPrefixTemp = `[${timestamp}] [${log.level}] [${log.source}] `;
  const logPrefix = log.module ? `${logPrefixTemp}[${log.module}] ` : `${logPrefixTemp}`;
  const consoleMessage = {
    source: 'other' as any,
    level: 'info' as any,
    text: `${blue(logPrefix)}${black(log.message)}`,
    lineNumber: log.line_number,
    timestamp: Date.now(),
    url: log.file_name,
  };
  return consoleMessage;
};
