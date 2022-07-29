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
  let nativeSafeArea;
  if (global.__HIPPYNATIVEGLOBAL__.OS === 'ios') {
    ({ window: nativeWindow, screen: nativeScreen, safeArea: nativeSafeArea  } = nativeDimensions);
  } else {
    ({ windowPhysicalPixels: nativeWindow,
      screenPhysicalPixels: nativeScreen,
      safeAreaPhysicalPixels: nativeSafeArea } = nativeDimensions);
  }
  return {
    nativeWindow,
    nativeScreen,
    nativeSafeArea,
  };
}

function getProcessedDimensions(nativeDimensions) {
  let window = {};
  let screen = {};
  let safeArea = {};
  const { nativeWindow, nativeScreen, nativeSafeArea } = transferToUnifiedDimensions(nativeDimensions);
  if (nativeWindow) {
    // android is physical resolution, divided by scale needed
    global.__HIPPYNATIVEGLOBAL__.OS === 'ios'
      ? window = nativeWindow
      : window = {
        width: nativeWindow.width / nativeWindow.scale,
        height: nativeWindow.height / nativeWindow.scale,
        scale: nativeWindow.scale,
        fontScale: nativeWindow.fontScale,
        statusBarHeight: nativeWindow.statusBarHeight / nativeWindow.scale,
        navigatorBarHeight: nativeWindow.navigationBarHeight / nativeWindow.scale,
      };
  }
  if (nativeScreen) {
    // android is physical resolution, divided by scale needed
    global.__HIPPYNATIVEGLOBAL__.OS === 'ios'
      ? screen = nativeScreen
      : screen = {
        width: nativeScreen.width / nativeScreen.scale,
        height: nativeScreen.height / nativeScreen.scale,
        scale: nativeScreen.scale,
        fontScale: nativeScreen.fontScale,
        statusBarHeight: nativeScreen.statusBarHeight,
        navigatorBarHeight: nativeScreen.navigationBarHeight / nativeScreen.scale,
      };
  }
  if (nativeSafeArea) {
    // android is physical resolution, divided by scale needed
    global.__HIPPYNATIVEGLOBAL__.OS === 'ios'
      ? safeArea = nativeSafeArea
      : safeArea = {
        left: nativeSafeArea.left,
        right: nativeSafeArea.right,
        top: nativeSafeArea.top,
        bottom: nativeSafeArea.bottom,
      };
  }
  return {
    window,
    screen,
    safeArea,
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
    const { window, screen, safeArea } = getProcessedDimensions(nativeDimensions);
    Hippy.device.window = window;
    Hippy.device.screen = screen;
    Hippy.device.safeArea = safeArea;
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
