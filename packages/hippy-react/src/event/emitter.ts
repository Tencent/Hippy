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

import EventEmitterRevoker from './emitter-revoker';
import HippyEventListener from './listener';
import EventDispatcher from './dispatcher';

export interface EventListeners {
  [eventName: string]: HippyEventListener;
}

export function getNameForEvent(event: string | undefined) {
  if (typeof event !== 'string') {
    throw new TypeError('Invalid arguments for getNameForEvent');
  }
  return `eventEmitter_${event}`;
}

export class HippyEventEmitter {
  public hippyEventListeners: EventListeners;
  public constructor(sharedListeners?: EventListeners) {
    if (sharedListeners && typeof sharedListeners === 'object') {
      this.hippyEventListeners = sharedListeners;
    } else {
      this.hippyEventListeners = {};
    }
  }

  public sharedListeners() {
    return this.hippyEventListeners;
  }

  public addListener(event: string | undefined, callback: (data?: any) => void, context?: any) {
    if (typeof event !== 'string' || typeof callback !== 'function') {
      throw new TypeError('Invalid arguments for addListener');
    }
    let registeredListener = this.hippyEventListeners[getNameForEvent(event)];
    if (!registeredListener) {
      registeredListener = new HippyEventListener(event);
      this.hippyEventListeners[getNameForEvent(event)] = registeredListener;
    }
    const listenerId = registeredListener.addCallback(callback, context);
    if (typeof listenerId !== 'number') {
      throw new Error('Fail to addCallback in addListener');
    }

    return new EventEmitterRevoker(listenerId, registeredListener);
  }

  public removeAllListeners(event: string | undefined) {
    if (typeof event !== 'string') {
      throw new TypeError('Invalid arguments for removeAllListeners');
    }
    const registeredListener = this.hippyEventListeners[getNameForEvent(event)];
    if (registeredListener) {
      registeredListener.unregister();
      delete this.hippyEventListeners[getNameForEvent(event)];
    }
  }

  public emit(event: string | undefined, param: any) {
    if (typeof event !== 'string') {
      return false;
    }
    const eventHub = EventDispatcher.getHippyEventHub(event);
    if (!eventHub) {
      return false;
    }
    eventHub.notifyEvent(param);
    return true;
  }

  public listenerSize(event: string | undefined) {
    if (typeof event !== 'string') {
      throw new TypeError('Invalid arguments for listenerSize');
    }
    const registeredListener = this.hippyEventListeners[getNameForEvent(event)];
    if (registeredListener) {
      return registeredListener.getSize();
    }
    return 0;
  }
}

(HippyEventEmitter as any).emit = HippyEventEmitter.prototype.emit;

// Forward compatibilities
export const RNfqbEventEmitter = HippyEventEmitter;
export default HippyEventEmitter;
