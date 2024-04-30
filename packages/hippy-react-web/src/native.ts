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

import { canUseDOM } from './utils';
import { getDirection } from './modules/i18n';

/* eslint-disable import/prefer-default-export */

const globalThis = typeof window === 'object'
  ? window
  : { innerHeight: 0, innerWidth: 0, screen: { height: 0, width: 0 } };

interface DeviceInfo {
  platform: {
    OS: string;
    Localization: {
      language: string | undefined;
      direction: 0 | 1 | undefined;
    }
  },
  window: {
    height: number;
    width: number;
    scale: number;
    statusBarHeight: number;
  },
  screen: {
    height: number;
    width: number;
    scale: number;
    statusBarHeight: number;
  }
}

const Device: DeviceInfo = {
  platform: {
    OS: 'web',
    Localization: {
      language: canUseDOM ? navigator.language : '',
      direction: canUseDOM ? getDirection() : undefined,
    },
  },
  window: {
    height: globalThis.innerHeight,
    width: globalThis.innerWidth,
    scale: 1,
    statusBarHeight: 0,
  },
  screen: {
    height: globalThis.innerHeight,
    width: globalThis.innerWidth,
    scale: 1,
    statusBarHeight: 0,
  },
};

const Dimensions = {
  get(name: 'window' | 'screen') {
    return Device[name];
  },
  set(dimensions: { window?: typeof Device['window']; screen?: typeof Device['screen'] }) {
    if (typeof window === 'object') {
      /* eslint-disable-next-line no-console */
      console.error('Dimensions cannot be set in the browser');
      return;
    }
    if (dimensions.window) {
      Device.window = dimensions.window;
    }
    if (dimensions.screen) {
      Device.screen = dimensions.screen;
    }
  },
};

const Platform = Device.platform;

const PixelRatio = {
  get() {
    return window.devicePixelRatio;
  },
};

const ConsoleModule = console;


export {
  Device,
  Dimensions,
  Platform,
  PixelRatio,
  ConsoleModule,
};
