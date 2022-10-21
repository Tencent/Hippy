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

/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-rest-params */
/* eslint-disable prefer-spread */

const timer = internalBinding('TimerModule');

global.setTimeout = function (cb, sleepTime) {
  const args = Array.prototype.slice.call(arguments, 2);
  return timer.SetTimeout(() => cb.apply(null, args), sleepTime);
};

global.clearTimeout = (timerId) => {
  if (Number.isInteger(timerId) && timerId > 0) {
    timer.ClearTimeout(timerId);
  }
};

global.setInterval = function (cb, intervalTime) {
  const args = Array.prototype.slice.call(arguments, 2);
  return timer.SetInterval(() => cb.apply(null, args), intervalTime);
};

global.clearInterval = (timerId) => {
  if (Number.isInteger(timerId) && timerId > 0) {
    timer.ClearInterval(timerId);
  }
};
