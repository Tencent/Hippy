/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

export const Dimensions = {
  get(key: keyof HippyDeviceInfo) {
    const device = Hippy.device || {};
    return device[key];
  },
  set(nativeDimensions) {
    if (!nativeDimensions) {
      return;
    }
    const { windowPhysicalPixels = null, screenPhysicalPixels = null } = nativeDimensions;
    if (windowPhysicalPixels) {
      Hippy.device.window = {
        width: windowPhysicalPixels.width,
        height: windowPhysicalPixels.height,
        scale: windowPhysicalPixels.scale,
        fontScale: windowPhysicalPixels.fontScale,
        statusBarHeight: windowPhysicalPixels.statusBarHeight,
        navigatorBarHeight: windowPhysicalPixels.navigationBarHeight,
      };
    }

    if (screenPhysicalPixels) {
      Hippy.device.screen = {
        width: screenPhysicalPixels.width,
        height: screenPhysicalPixels.height,
        scale: screenPhysicalPixels.scale,
        fontScale: screenPhysicalPixels.fontScale,
        statusBarHeight: screenPhysicalPixels.statusBarHeight, // px unit
        navigatorBarHeight: screenPhysicalPixels.navigationBarHeight,
      };
    }

    Hippy.device.pixelRatio = Hippy.device.window.scale;
  },
  init() {
    const { windowPhysicalPixels, screenPhysicalPixels } = __HIPPYNATIVEGLOBAL__.Dimensions as any;
    this.set({
      windowPhysicalPixels,
      screenPhysicalPixels,
    });
  },
};


