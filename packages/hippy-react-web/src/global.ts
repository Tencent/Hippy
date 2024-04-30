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

import { Device } from './native';
import { warn } from './utils';

global.Hippy = {
  // @ts-ignore
  Device,
  on: (eventName: string, handler: Function) => {
    if (eventName.toUpperCase() === 'UNHANDLEDREJECTION') {
      window.addEventListener('unhandledrejection', (event) => {
        handler(event.reason, event.promise);
      });
    }
    if (eventName.toUpperCase() === 'UNCAUGHTEXCEPTION') {
      window.onerror = (message, source, lineno, colno, error) => {
        handler(error, message, source, lineno, colno);
      };
    }
  },
};
// @ts-ignore
global.getTurboModule = () => {
  warn('getTurboModule is unsupported');
  return {};
};
