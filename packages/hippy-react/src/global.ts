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

import '@localTypes/global';
// @ts-ignore
if (!global.__GLOBAL__) {
  // @ts-ignore
  global.__GLOBAL__ = {};
}

// @ts-ignore
const { __GLOBAL__ } = global;

__GLOBAL__.nodeId = 0;
__GLOBAL__.animationId = 0;
__GLOBAL__.renderCount = 0;

const {
  asyncStorage: AsyncStorage,
  bridge: Bridge,
  device: Device,
  document: UIManager,
  register: HippyRegister,
  on: addEventListener,
  off: removeEventListener,
  emit: dispatchEvent,
  // @ts-ignore
} = global.Hippy;

export {
  addEventListener,
  removeEventListener,
  dispatchEvent,
  AsyncStorage,
  Bridge,
  Device,
  HippyRegister,
  UIManager,
};
