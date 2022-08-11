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

/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */

const { JSTimersExecution } = require('../../modules/ios/jsTimersExecution.js');

const RCTTiming = __GLOBAL__.NativeModules.Timing;

global.requestAnimationFrame = (func) => {
  const id = JSTimersExecution.GUID;
  JSTimersExecution.GUID += 1;
  let freeIndex = JSTimersExecution.timerIDs.indexOf(null);

  if (freeIndex === -1) {
    freeIndex = JSTimersExecution.timerIDs.length;
  }

  JSTimersExecution.timerIDs[freeIndex] = id;
  JSTimersExecution.callbacks[freeIndex] = func;
  JSTimersExecution.types[freeIndex] = 'requestAnimationFrame';
  RCTTiming.createTimer(id, 1, Date.now(), /* recurring */ false);

  return id;
};

global.cancelAnimationFrame = (timerID) => {
  if (timerID === null || timerID === undefined) {
    return;
  }

  const index = JSTimersExecution.timerIDs.indexOf(timerID);
  if (index !== -1) {
    JSTimersExecution._clearIndex(index);
    RCTTiming.deleteTimer(timerID);
  }
};
