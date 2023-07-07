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

interface NativeEvent {
  id: number;
  currentId: number;
  nativeName: string;
  originalName: string;
  eventPhase: HippyTypes.EventPhase,
  params?: any
}

const EventPhase = {
  NONE: 0,
  CAPTURING_PHASE: 1,
  AT_TARGET: 2,
  BUBBLING_PHASE: 3,
};

/**
 * get client original event name
 */
function getOriginalEventName(nativeEventName: string) {
  // events that do not start with on maybe custom events, and return the event name directly
  if (nativeEventName.indexOf('on') !== 0) {
    return nativeEventName;
  }
  // remove the on in the event name and convert the first letter to lowercase, eg. onClick => click
  const str = nativeEventName.slice(2, nativeEventName.length);
  return `${str.charAt(0).toLowerCase()}${str.slice(1)}`;
}

/**
 * get dom event
 *
 * @param id
 * @param originalEventName
 * @param params
 */
function getDomEvent(id, originalEventName, params?: { [key: string]: any }): HippyTypes.DOMEvent {
  if (params) {
    const { srcEvent } = params;
    if (srcEvent) {
      srcEvent.id = id;
      // srcEvent is the real dom event
      return srcEvent;
    }
  }

  // if there is no real dom event. then return mock event
  return {
    id,
    currentId: id,
    type: originalEventName,
    eventPhase: EventPhase.AT_TARGET,
    stopPropagation: () => {},
  };
}

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
    const originalEventName = getOriginalEventName(type);
    const domEvent: HippyTypes.DOMEvent = getDomEvent(nodeId, originalEventName, params);

    this.sendComponentEvent({
      id: nodeId,
      currentId: nodeId,
      nativeName: type,
      originalName: getOriginalEventName(type),
      eventPhase: domEvent.eventPhase,
      params,
    }, domEvent);
  }

  /**
   * send gesture event to js side
   */
  sendGestureEvent(e: HippyTransferData.NativeGestureEvent) {
    console.log('gesture event', e);
    hippyBridge('callJsModule', {
      moduleName: 'EventDispatcher',
      methodName: 'receiveNativeGesture',
      params: e,
    });
  }

  /**
   * send component event to js, include ui & gesture event
   *
   * @param nativeEvent hippy native event
   * @param domEvent real dom event
   *
   */
  sendComponentEvent(nativeEvent: NativeEvent, domEvent: HippyTypes.DOMEvent) {
    hippyBridge('callJsModule', {
      moduleName: 'EventDispatcher',
      methodName: 'receiveComponentEvent',
      params: nativeEvent,
      secondParams: domEvent,
    });
  }

  subscribe(evt: string, callback: Function) {
    this.engine.eventBus.subscribe(evt, callback);
  }

  getModuleByName(moduleName: string) {
    return this.engine.modules[moduleName];
  }
}
