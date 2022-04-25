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

import { ProtocolErrorCode } from '@debug-server-next/@types/enum';
import { MiddleWare } from './middleware-context';

/**
 * send to devtools
 */
export const defaultDownwardMiddleware: MiddleWare = async ({ msg, sendToDevtools }, next) => {
  await next();
  return sendToDevtools(msg as Adapter.CDP.Res);
};

/**
 * send to app
 */
export const defaultUpwardMiddleware: MiddleWare = async ({ msg, sendToApp }, next) => {
  await next();
  return sendToApp(msg as Adapter.CDP.Req);
};

export const sendEmptyResultToDevtools: MiddleWare = async ({ msg, sendToDevtools }) => {
  const req = msg as Adapter.CDP.Req;
  return sendToDevtools({
    id: req.id,
    method: req.method,
    result: {},
  });
};

export const sendFailResultToDevtools: MiddleWare = async ({ msg, sendToDevtools }) => {
  const req = msg as Adapter.CDP.Req;
  return sendToDevtools({
    id: req.id,
    method: req.method,
    error: {
      code: ProtocolErrorCode.ProtocolNotFound,
      message: `'${req.method}' wasn't found`,
    },
  });
};
