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

import { getGlobal } from '../get-global';
import { Dimensions } from './dimensions';
import { dealloc } from './event';
import { nativeGlobal } from './native-global';
import { Headers, Response, fetch } from './network';
import { emitter, hippyRegister } from './others';
import { asyncStorage } from './storage';
import { document } from './ui-manager-module';
import { platform } from './platform';
import { bridge } from './js2native';
import { nativeBridge } from './native2js';
import { device } from './device';
import { getTurboModule, turboPromise } from './turbo';
import { dynamicLoad } from './dynamic-load';

const global = getGlobal();

// global
global.Hippy = {} as any;
global.__GLOBAL__ = {} as any;
global.hippyBridge = nativeBridge;
global.__ISHIPPY__ = true;
global.__GLOBAL__.globalEventHandle = {};
global.__GLOBAL__.jsModuleList = {
  Dimensions,
};
global.__HIPPYNATIVEGLOBAL__ = nativeGlobal;
global.HippyDealloc = dealloc;
global.__Headers = global.Headers;
global.Headers = Headers as any;
global.__Response = global.Response;
global.Response = Response as any;
global.__fetch = global.fetch;
global.fetch = fetch as any;
global.__WebSocket = global.WebSocket;
global.getTurboModule = getTurboModule;
global.dynamicLoad = dynamicLoad;

// TODO:
// global.dynamicLoad


// __GLOBAL__

__GLOBAL__.appRegister = {};
__GLOBAL__.nodeIdCache = {};
__GLOBAL__.nodeTreeCache = {};
__GLOBAL__.nodeParamCache = {}; // Not necessary for Android, but need for clean.
__GLOBAL__.moduleCallId = 0;
__GLOBAL__.moduleCallList = {};
__GLOBAL__.canRequestAnimationFrame = true;
__GLOBAL__.requestAnimationFrameId = 0;
__GLOBAL__.requestAnimationFrameQueue = {};
__GLOBAL__.destroyInstanceList = {};

// hippy
Hippy.bridge = bridge;
Hippy.device = device as any;
Hippy.register = {
  regist: hippyRegister,
};
Hippy.on = emitter.on;
Hippy.off = emitter.off;
Hippy.emit = emitter.emit;

Hippy.asyncStorage = asyncStorage;
Hippy.turboPromise = turboPromise;
Hippy.document = document;
Hippy.device.platform = platform();


global.__localStorage = global.localStorage;
Object.defineProperty(global, 'localStorage', {
  value: Hippy.asyncStorage as any,
});
global.turboPromise = Hippy.turboPromise;

Object.defineProperty(global.console, 'reportUncaughtException', {
  value: (error) => {
    if (error && error instanceof Error) {
      throw error;
    }
  },
});

global.addEventListener('unhandledrejection', (event) => {
  global.Hippy.emit('unhandledRejection', event?.reason, event?.promise);
});


// init

Dimensions.init();


export function checkUpdateDimension() {
  const initData = {
    width: 0,
    height: 0,
    scale: 1,
    fontScale: 1,
    statusBarHeight: 0,
    navigationBarHeight: 0,
  };
  const windowPhysicalPixels = initData;
  windowPhysicalPixels.width = window.innerWidth;
  windowPhysicalPixels.height = window.innerHeight;
  windowPhysicalPixels.scale = window.devicePixelRatio;
  windowPhysicalPixels.fontScale = window.devicePixelRatio;
  windowPhysicalPixels.statusBarHeight = 0;
  windowPhysicalPixels.navigationBarHeight = 0;

  const screenPhysicalPixels = initData;
  screenPhysicalPixels.width = window.screen.width;
  screenPhysicalPixels.height = window.screen.height;
  screenPhysicalPixels.scale = window.devicePixelRatio;
  screenPhysicalPixels.fontScale = window.devicePixelRatio;
  screenPhysicalPixels.statusBarHeight = 0;
  screenPhysicalPixels.navigationBarHeight = 0;
  return { windowPhysicalPixels, screenPhysicalPixels };
}

export function checkLocalization() {
  return {
    language: navigator.language,
    country: '',
    direction: '',
  };
}

export function getGlobalConfigs() {
  return {
    Platform: {
      OS: 'android',
      PackageName: '',
      APILevel: 0,
    },
    Dimensions: checkUpdateDimension(),
    Localization: checkLocalization(),
    tkd: {
      appVersion: '',
      url: '',
    },
  };
}
