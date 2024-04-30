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

import EventDispatcher from './dispatcher';

export class HippyEventListener {
  public eventName: string;
  public listenerIdList: number[];

  public constructor(event: string) {
    this.eventName = event;
    this.listenerIdList = [];
  }

  public unregister() {
    const eventHub = EventDispatcher.getHippyEventHub(this.eventName);
    if (!eventHub) {
      throw new ReferenceError(`No listeners for ${this.eventName}`);
    }
    const listenerIdSize = this.listenerIdList.length;
    for (let i = 0; i < listenerIdSize; i += 1) {
      eventHub.removeEventHandler(this.listenerIdList[i]);
    }
    this.listenerIdList = [];
    if (eventHub.getHandlerSize() === 0) {
      EventDispatcher.unregisterNativeEventHub(this.eventName);
    }
  }

  public getSize() {
    return this.listenerIdList.length;
  }

  public addCallback(handleFunc: Function, callContext?: any) {
    if (typeof handleFunc !== 'function') {
      throw new TypeError('Invalid addCallback function arguments');
    }
    const targetEventHub = EventDispatcher.registerNativeEventHub(this.eventName);
    if (!targetEventHub) {
      throw new ReferenceError(`No listeners for ${this.eventName}`);
    }
    const listenerId = targetEventHub.addEventHandler(handleFunc, callContext);
    if (typeof listenerId !== 'number') {
      throw new Error('Fail to addEventHandler in addCallback function');
    }
    this.listenerIdList.push(listenerId);
    return listenerId;
  }

  public removeCallback(callbackId: number | undefined) {
    if (typeof callbackId !== 'number') {
      throw new TypeError('Invalid arguments for removeCallback');
    }
    const targetEventHub = EventDispatcher.getHippyEventHub(this.eventName);
    if (!targetEventHub) {
      throw new ReferenceError(`No listeners for ${this.eventName}`);
    }
    targetEventHub.removeEventHandler(callbackId);
    const listenerIdSize = this.listenerIdList.length;
    for (let i = 0; i < listenerIdSize; i += 1) {
      if (callbackId === this.listenerIdList[i]) {
        this.listenerIdList.splice(i, 1);
        break;
      }
    }
  }
}

// Forward compatibilities
export const RNfqbEventListener = HippyEventListener;
export default HippyEventListener;
