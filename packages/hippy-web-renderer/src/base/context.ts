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

import { HippyTransferData } from '../types/hippy-internal-types';
import { HippyWebEngine } from './engine';

export class HippyWebEngineContext {
  engine: HippyWebEngine;
  constructor(engine: HippyWebEngine) {
    this.engine = engine;
  }
  /**
   * send normal event to js side
   */
  sendEvent(type: string, params: any) {
    hippyBridge('callJsModule', {
      moduleName: 'EventDispatcher',
      methodName: 'receiveNativeEvent',
      params: [type, params],
    });
  }
  /**
   * send ui event to js side
   */
  sendUiEvent(nodeId: number, type: string, params: any) {
    hippyBridge('callJsModule', {
      moduleName: 'EventDispatcher',
      methodName: 'receiveUIComponentEvent',
      params: [nodeId, type, params],
    });
  }

  /**
   * send gesture event to js side
   */
  sendGestureEvent(e: HippyTransferData.NativeGestureEvent) {
    hippyBridge('callJsModule', {
      moduleName: 'EventDispatcher',
      methodName: 'receiveNativeGesture',
      params: e,
    });
  }

  subscribe(evt: string, callback: Function) {
    this.engine.eventBus.subscribe(evt, callback);
  }

  getModuleByName(moduleName: string) {
    return this.engine.modules[moduleName];
  }
}
