/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

import { HippyWebModule } from '../base';
import { dealloc } from './event';
import { nativeGlobal } from './native-global';
import { emitter, hippyRegister } from './others';
import { asyncStorage } from './storage';
import { document } from './ui-manager-module';
import { HippyJsBridge } from './js2native';

declare global {
  interface HippyGlobalObject {
    bridge: HippyJsBridge,
    on: typeof emitter.on,
    off: typeof emitter.off,
    emit: typeof emitter.emit,
    asyncStorage: typeof asyncStorage,
    turboPromise: typeof turboPromise,
    register: {
      regist: typeof hippyRegister,
    }
    device: HippyDeviceInfo,
    document: typeof document,
  }

  interface HippyDeviceInfo {
    platform: any,
    window: any,
    screen: any,
    pixelRatio: any,
  }

  interface HippyJsGlobal {
    moduleCallId: number;
    moduleCallList: any;
    jsModuleList: any;
    appRegister: any;
    canRequestAnimationFrame: boolean;
    requestAnimationFrameQueue: any;
    nodeIdCache: any;
    nodeTreeCache: any;
    destroyInstanceList: any;
    globalEventHandle: any;
    requestAnimationFrameId: number;
    nodeParamCache: any;
  }
  /* eslint no-var: off */
  var __fetch: (url: string, option: any) => Promise<any>;

  var __WebSocket: typeof WebSocket;

  // @ts-ignore
  var Hippy: HippyGlobalObject;

  var __ISHIPPY__: boolean;

  // @ts-ignore
  var __GLOBAL__: HippyJsGlobal;

  // @ts-ignore
  var __HIPPYNATIVEGLOBAL__: typeof nativeGlobal;

  var flushQueueImmediate: any;

  var HippyDealloc: typeof dealloc;

  var hippyBridge: (action: string, payload?: any) => void;

  var hippyCallNatives: (moduleName: string, methodName: string, callId: string, params?: any[]) => void;

  var __Headers: typeof global.Headers;

  var __Response: typeof global.Response;

  var __localStorage: typeof global.localStorage;

  var turboPromise: (func: Function) => (...args: any[]) => Promise<any>;

  var getTurboModule: <T extends HippyWebModule>(moduleName: string) => T | undefined;

  var dynamicLoad: (path: string, encode: string, cb: any) => void;
}
