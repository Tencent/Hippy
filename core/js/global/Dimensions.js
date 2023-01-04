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


function transferToUnifiedDimensions(nativeDimensions) {
  let nativeWindow;
  let nativeScreen;
  if (global.__HIPPYNATIVEGLOBAL__.OS === 'ios') {
    ({ window: nativeWindow, screen: nativeScreen  } = nativeDimensions);
  } else {
    ({ windowPhysicalPixels: nativeWindow, screenPhysicalPixels: nativeScreen } = nativeDimensions);
  }
  return {
    nativeWindow,
    nativeScreen,
  };
}

function getProcessedDimensions(nativeDimensions) {
  let window = {};
  let screen = {};
  const { nativeWindow, nativeScreen } = transferToUnifiedDimensions(nativeDimensions);
  if (nativeWindow) {
    // android is physical resolution, divided by scale needed
    if (global.__HIPPYNATIVEGLOBAL__.OS === 'ios') {
      window = nativeWindow;
    } else {
      const { width, scale, height, fontScale, statusBarHeight, navigationBarHeight, ...options } = nativeWindow;
      window = {
        scale,
        fontScale,
        width: width / scale,
        height: height / scale,
        statusBarHeight: statusBarHeight / scale,
        navigatorBarHeight: navigationBarHeight / scale,
        ...options,
      };
    }
  }
  if (nativeScreen) {
    // android is physical resolution, divided by scale needed
    if (global.__HIPPYNATIVEGLOBAL__.OS === 'ios') {
      screen = nativeScreen;
    } else {
      const { width, scale, height, fontScale, statusBarHeight, navigationBarHeight, ...options } = nativeScreen;
      screen = {
        scale,
        fontScale,
        statusBarHeight,
        width: width / scale,
        height: height / scale,
        navigatorBarHeight: navigationBarHeight / scale,
        ...options,
      };
    }
  }
  return {
    window,
    screen,
  };
}

const Dimensions = {
  get(key) {
    const device = Hippy.device || {};
    return device[key];
  },
  set(nativeDimensions) {
    if (!nativeDimensions) {
      return;
    }
    const { window, screen } = getProcessedDimensions(nativeDimensions);
    Hippy.device.window = window;
    Hippy.device.screen = screen;
    Hippy.device.pixelRatio = Hippy.device.window.scale;
  },
  init() {
    this.set(__HIPPYNATIVEGLOBAL__.Dimensions);
  },
};

Dimensions.init();

__GLOBAL__.jsModuleList = {
  Dimensions,
};
