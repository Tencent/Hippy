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

/**
 * cache all logs to redis to support for history log for iOS, android V8 support history log natively.
 *
 * if devtools had not attached, cache all history logs to redis,
 * clean cached data when app disconnect,
 * consume by re-Pub all history logs when devtools connect, in this case will broadcast to
 * all connected devtools, so some devtools client maybe receive log twice.
 */

import { ChromeEvent, IOS100Event } from '@hippy/devtools-protocol/dist/types';
import { getDBOperator } from '@debug-server-next/db';
import { config } from '@debug-server-next/config';

const getLogKey = (clientId: string) => `${config.redis.logTablePrefix}${clientId}`;

export const isLogProtocol = (method: string) =>
  [ChromeEvent.RuntimeConsoleAPICalled, ChromeEvent.LogEntryAdded, IOS100Event.ConsoleMessageAdded].includes(method);

export const saveLogProtocol = async (clientId: string, msg: string) => {
  const { DB } = getDBOperator();
  const db = new DB<string>(getLogKey(clientId));
  await db.rPush(msg);
};

export const clearLogProtocol = async (clientId: string) => {
  const { DB } = getDBOperator();
  const db = new DB<string>(getLogKey(clientId));
  await db.clearList();
};

export const getHistoryLogProtocol = async (clientId: string) => {
  const { DB } = getDBOperator();
  const db = new DB<string>(getLogKey(clientId));
  return await db.getList();
};
