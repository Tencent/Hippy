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

class HippyEventListener {
  eventName: string;
  listenerIds: number[];

  constructor(event: string) {
    this.eventName = event;
    this.listenerIds = [];
  }

  public addCallback(handleFunc: Function, callContext?: any) {
    if (typeof handleFunc !== 'function') {
      throw new TypeError('Invalid arguments');
    }
    const eventHub = EventDispatcher.registerNativeEventHub(this.eventName);
    if (!eventHub) {
      throw new ReferenceError(`No listeners for ${this.eventName}`);
    }
    const id = eventHub.addEventHandler(handleFunc, callContext);
    if (typeof id !== 'number') {
      throw new Error('Fail to addEventHandler');
    }
    this.listenerIds.push(id);
    return id;
  }

  public removeCallback(callbackId: number) {
    if (typeof callbackId !== 'number') {
      throw new TypeError('Invalid arguments');
    }
    const eventHub = EventDispatcher.getHippyEventHub(this.eventName);
    if (!eventHub) {
      throw new ReferenceError(`No listeners for ${this.eventName}`);
    }
    eventHub.removeEventHandler(callbackId);
    const size = this.listenerIds.length;
    for (let i = 0; i < size; i += 1) {
      if (callbackId === this.listenerIds[i]) {
        this.listenerIds.splice(i, 1);
        break;
      }
    }
  }

  public unregister() {
    const size = this.listenerIds.length;
    const eventHub = EventDispatcher.getHippyEventHub(this.eventName);
    if (!eventHub) {
      throw new ReferenceError(`No listeners for ${this.eventName}`);
    }
    for (let i = 0; i < size; i += 1) {
      eventHub.removeEventHandler(this.listenerIds[i]);
    }
    this.listenerIds = [];
    if (eventHub.getHandlerSize() === 0) {
      EventDispatcher.unregisterNativeEventHub(this.eventName);
    }
  }

  public getSize() {
    return this.listenerIds.length;
  }
}

export default HippyEventListener;
