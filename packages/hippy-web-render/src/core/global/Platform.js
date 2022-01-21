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
/* eslint-disable no-unused-vars */
/*
  IOS __HIPPYNATIVEGLOBAL__ : {
    Device : 'iPhone XR',
    SDKVersion : '0.2.1',
    OS ：'ios',
    OSVersion : '12.0'
  }

  Android __HIPPYNATIVEGLOBAL__ : {
    Platform : {
      OS : 'android',
      APILevel : 'xxx'
    }
  }

  Hippy.device.platform = {
    'OS': 'web',
    'Device': '',
    'OSVersion': '', // for ios
    'SDKVersion': '',
    'APILevel': '', // for android
    'AppVersion': '', // to_do
    'PixelRatio' : 1, // to_do
    'Dimensions' : { // to_do
      window : {
        width : 1,
        height : 1,
        scale : 1,
        fontScale : 1
      },
      screen : {
        width : 1,
        height : 1,
        scale : 1,
        fontScale : 1,
        statusBarHeight : 1
      }
    }
  };
*/

Hippy.device.platform = {};

if (typeof __HIPPYNATIVEGLOBAL__ !== 'undefined') {
  const Localization = { country: '', language: '', direction: 0 };
  if (__HIPPYNATIVEGLOBAL__.OS === 'ios') {
    Hippy.device.platform.OS = __HIPPYNATIVEGLOBAL__.OS;
    Hippy.device.platform.Device = __HIPPYNATIVEGLOBAL__.Device;
    Hippy.device.platform.OSVersion = __HIPPYNATIVEGLOBAL__.OSVersion;
    Hippy.device.platform.SDKVersion = __HIPPYNATIVEGLOBAL__.SDKVersion;
    Hippy.device.platform.Localization = __HIPPYNATIVEGLOBAL__.Localization || Localization;
  } else {
    Hippy.device.platform.OS = __HIPPYNATIVEGLOBAL__.Platform.OS;
    Hippy.device.platform.APILevel = __HIPPYNATIVEGLOBAL__.Platform.APILevel;
    Hippy.device.platform.Localization = __HIPPYNATIVEGLOBAL__.Platform.Localization || Localization;
  }
}
