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
/* eslint-disable prefer-rest-params */
/* eslint-disable prefer-spread */

const AnimationFrameModule = internalBinding('AnimationFrameModule');

global.requestAnimationFrame = (cb) => {
  if (cb) {
    if (__GLOBAL__.canRequestAnimationFrame) {
      __GLOBAL__.canRequestAnimationFrame = false;
      __GLOBAL__.requestAnimationFrameId += 1;
      __GLOBAL__.requestAnimationFrameQueue[__GLOBAL__.requestAnimationFrameId] = [];
      __GLOBAL__.requestAnimationFrameQueue[__GLOBAL__.requestAnimationFrameId].push(cb);
      AnimationFrameModule.RequestAnimationFrame(__GLOBAL__.requestAnimationFrameId);
    } else if (__GLOBAL__.requestAnimationFrameQueue[__GLOBAL__.requestAnimationFrameId]) {
      __GLOBAL__.requestAnimationFrameQueue[__GLOBAL__.requestAnimationFrameId].push(cb);
    }
    return '';
  }
  throw new TypeError('Invalid arguments');
};

global.cancelAnimationFrame = () => {
  AnimationFrameModule.CancelAnimationFrame();
};
