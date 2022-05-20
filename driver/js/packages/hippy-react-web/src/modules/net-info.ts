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
import { NetInfoModule } from '../types';
import { canUseDOM } from '../utils';

type NetInfoType = 'NONE' | 'WIFI' | 'CELL' | 'UNKNOWN';
type ConnectionType =
  | 'bluetooth'
  | 'cellular'
  | 'ethernet'
  | 'mixed'
  | 'none'
  | 'other'
  | 'unknown'
  | 'wifi'
  | 'wimax';

const connection = window.navigator?.connection;

let didWarn = !canUseDOM;
const unsupportedWarn = () => {
  if (!didWarn) {
    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
      console.warn('NetInfo is an experimental technology which is not supported by your browser. '
        + 'NetworkInformation document: https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation');
      didWarn = true;
    }
  }
};

const getCurrentState = () => {
  const isConnected = navigator.onLine;
  let networkState: NetInfoType = 'UNKNOWN';
  if (!connection && !isConnected) {
    networkState = 'NONE';
  }
  if (connection) {
    const networkWifi: ConnectionType = 'wifi';
    const networkCell: ConnectionType = 'cellular';
    if (connection.type === networkWifi) {
      networkState = 'WIFI';
    }
    if (connection.type === networkCell) {
      networkState = 'CELL';
    }
  }
  return networkState;
};
const eventListenerList: Function[] = [];
const NetInfo: NetInfoModule = {
  addEventListener(eventName, listener) {
    if (!connection) {
      unsupportedWarn();
    }
    if (typeof listener !== 'function') {
      throw new TypeError('Invalid arguments for addEventListener');
    }
    eventListenerList.push(listener);
    if (eventName === 'change') {
      window.addEventListener('online', () => {
        eventListenerList.forEach((handler) => {
          handler({ network_info: getCurrentState() });
        });
      });
      window.addEventListener('offline', () => {
        eventListenerList.forEach((handler) => {
          handler({ network_info: getCurrentState() });
        });
      });
    }
    return {
      remove: () => {
        this.removeEventListener('change', listener);
      },
    };
  },
  removeEventListener(eventName: string, listener) {
    if (eventName === 'change') {
      eventListenerList.splice(eventListenerList.findIndex(handler => handler === listener), 1);
    }
  },
  fetch() {
    if (!connection) {
      unsupportedWarn();
    }
    return Promise.resolve(getCurrentState());
  },
};

export default NetInfo;
