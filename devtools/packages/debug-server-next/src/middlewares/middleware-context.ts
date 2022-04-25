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

import { DevicePlatform } from '@debug-server-next/@types/enum';
import { DebugTarget } from '@debug-server-next/@types/debug-target';

export interface ContextBase {
  url?: string;
}

export interface UrlParsedContext extends ContextBase {
  clientId: string;
  debugTarget: DebugTarget;
  platform: DevicePlatform;
}

export interface MiddleWareContext extends UrlParsedContext {
  msg: Adapter.CDP.Req | Adapter.CDP.Res;
  sendToApp: (msg: Adapter.CDP.Req) => Promise<Adapter.CDP.Res>;
  sendToDevtools: (msg: Adapter.CDP.Res) => Promise<Adapter.CDP.Res>;
  // update context field, used to store debug instance info,
  // such as last lastConsoleMessage
  setContext: (key: string, value: unknown) => void;
}

export type MiddleWare = (ctx: MiddleWareContext, next?: () => Promise<Adapter.CDP.Res>) => Promise<Adapter.CDP.Res>;

export interface MiddleWareManager {
  upwardMiddleWareListMap?: { [k: string]: Array<MiddleWare> | MiddleWare };
  downwardMiddleWareListMap?: { [k: string]: Array<MiddleWare> | MiddleWare };
}

export const debugTargetToUrlParsedContext = (debugTarget: DebugTarget): UrlParsedContext => ({
  clientId: debugTarget.clientId,
  debugTarget,
  platform: debugTarget.platform,
});
