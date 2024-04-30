/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2022 THL A29 Limited, a Tencent company.
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

// mock global Hippy
global.Hippy = {
  bridge: {
    callNative: () => {},
    callNativeWithPromise: () => {},
    callNativeWithCallbackId: () => {},
  },
  device: {
    platform: { OS: 'android' },
    screen: {
      width: 375,
      height: 667,
      scale: 1,
      fontScale: 1,
      statusBarHeight: 20,
      navigatorBarHeight: 20,
    },
    window: {
      width: 375,
      height: 667,
      scale: 1,
      fontScale: 1,
      statusBarHeight: 20,
      navigatorBarHeight: 20,
    },
  },
  document: {
    //  simulate app injection
    createNode: () => {},
    updateNode: () => {},
    deleteNode: () => {},
    flushBatch: () => {},
    setNodeTree: () => {},
    setNodeId: () => {},
    getNodeById: () => {},
    getNodeIdByRef: () => {},
    callUIFunction: () => {},
    measureInWindow: () => {},
    startBatch: () => {},
    endBatch: () => {},
    sendRenderError: () => {},
  },
  register: {},
};

// mock global variable
global.__GLOBAL__ = {
  jsModuleList: {},
};

global.__HIPPYNATIVEGLOBAL__ = {
  OSVersion: '1.0.0.0',
  SDKVersion: '1.0.0.0',
  Platform: {
    APILevel: '1.0.0.0',
  },
  Device: 'iPhone 12',
};

process.env.PORT = '38989';
