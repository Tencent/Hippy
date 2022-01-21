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

if (Hippy.device.platform.OS === 'android') {
  Hippy.device.vibrate = (pattern, repeat) => {
    let _pattern = pattern;
    let _repeat = repeat;
    if (typeof pattern === 'number') {
      _pattern = [0, pattern];
    }

    if (repeat === undefined) {
      _repeat = -1;
    }

    Hippy.bridge.callNativeWithCallbackId('UtilsModule', 'vibrate', true, _pattern, _repeat);
  };

  Hippy.device.cancelVibrate = () => {
    Hippy.bridge.callNativeWithCallbackId('UtilsModule', 'cancel', true);
  };
} else if (Hippy.device.platform.OS === 'ios') { // to_do
  Hippy.device.vibrate = () => {};
  Hippy.device.cancelVibrate = () => {};
}
