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

import Hippy from './hippy';

declare global {
  namespace NodeJS {
    interface Global {
      __PLATFORM__: string;
      __GLOBAL__: {
        nodeId: number;
        reactRoots?: Map<number, any>;
        nodeTreeCache?: {
          [key: string]: any;
        };
        nodeIdCache?: {
          [key: number]: any;
        };
        nodeDeleteIdCache?: {
          [key: number]: {
            [key: number]: string;
          }
        };
        nodeParamCache: {
          [key: number]: {
            [key: number]: any;
          };
        };
        jsModuleList?: any;
        animationId: number;
        renderCount: number;
      };
      Hippy: Hippy.HippyConstance;
      WebSocket: Object;
      requestIdleCallback?: Function;
      cancelIdleCallback?: Function;
    }
  }
}
export default NodeJS;
