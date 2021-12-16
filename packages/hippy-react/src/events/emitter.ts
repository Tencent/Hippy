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

interface EventListeners {
  [eventName: string]: HippyEventListener;
}

function getNameForEvent(event: string | undefined) {
  if (typeof event !== 'string') {
    throw new TypeError('Invalid arguments');
  }
  return `eventEmitter_${event}`;
}

class HippyEventEmitter {
  hippyEventListeners: EventListeners;

  constructor(sharedListeners?: EventListeners) {
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
      throw new TypeError('Invalid arguments');
    }

    let registedListener = this.hippyEventListeners[getNameForEvent(event)];
    if (!registedListener) {
      registedListener = new HippyEventListener(event);
      this.hippyEventListeners[getNameForEvent(event)] = registedListener;
    }

    const listenerId = registedListener.addCallback(callback, context);
    if (typeof listenerId !== 'number') {
      throw new Error('Fail to addCallback');
    }

    return new EventEmitterRevoker(listenerId, registedListener);
  }

  removeAllListeners(event: string | undefined) {
    if (typeof event !== 'string') {
      throw new TypeError('Invalid arguments');
    }

    const registedListener = this.hippyEventListeners[getNameForEvent(event)];
    if (registedListener) {
      registedListener.unregister();
      delete this.hippyEventListeners[getNameForEvent(event)];
    }
  }

  /* eslint-disable-next-line class-methods-use-this */
  emit(event: string | undefined, param: any) {
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

  listenerSize(event: string | undefined) {
    if (typeof event !== 'string') {
      throw new TypeError('Invalid arguments');
    }

    const registedListener = this.hippyEventListeners[getNameForEvent(event)];
    if (registedListener) {
      return registedListener.getSize();
    }
    return 0;
  }
}

(HippyEventEmitter as any).emit = HippyEventEmitter.prototype.emit;

export default HippyEventEmitter;
