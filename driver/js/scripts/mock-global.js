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

/* eslint-disable no-underscore-dangle */

global.__PLATFORM__ = null;
global.__HIPPYNATIVEGLOBAL__ = {};
global.__GLOBAL__ = {
  nodeId: 0,
  jsModuleList: {},
};
global.Hippy = {
  on() {
    // do nothing.
  },
  bridge: {
    callNative() {
      // do nothing.
    },
    callNativeWithPromise() {
      return Promise.resolve();
    },
    callNativeWithCallbackId() {
      return 1;
    },
  },
  turbo: {
    turboPromise() {
      // do nothing.
    },
    getTurboModule() {
      // do nothing.
    },
  },
  device: {
    platform: {
      OS: null,
    },
    screen: {
      scale: 2,
    },
    window: {
    },
  },
  document: {
    createNode() {
      // do nothing.
    },
    updateNode() {
      // do nothing.
    },
    deleteNode() {
      // do nothing.
    },
    startBatch() {
      // do nothing.
    },
    endBatch() {
      // do nothing.
    },
  },
  register: {
    regist() {
      // do nothing.
    },
  },
};
