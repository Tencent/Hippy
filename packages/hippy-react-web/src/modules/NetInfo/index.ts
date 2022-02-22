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
import { NetInfoModule, NetInfoRevoker } from '../../types';
import { canUseDOM } from '../../utils/execution-environment';

// Check if the browser supports the connection API
const connection = window.navigator?.connection
  // @ts-nocheck
  || window.navigator?.mozConnection
  // @ts-nocheck
  || window.navigator?.webkitConnection;

let didWarn = !canUseDOM;
const unsupportWran = () => {
  if (!didWarn) {
    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
      console.warn('NetInfo is an experimental technology which is not supported by your browser. '
        + 'NetworkInformation document: https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation');
      didWarn = true;
    }
  };
};

const NetInfo: NetInfoModule = {
  addEventListener(eventName, listener) {
    if (!connection) {
      unsupportWran();
    }
    if (eventName === 'change') {

    };
    return new NetInfoRevoker(eventName, listener);
  },
  removeEventListener(eventName: string, listener) {
    console.log('eventName', eventName, listener);
    if (!connection) {
      unsupportWran();
    }
    return '';
  },
  fetch() {
    if (!connection) {
      unsupportWran();
    }
    return Promise.resolve({ data: 'todo' });
  },
};

export default NetInfo;
