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

export function checkUpdateDimension() {
  const initData = {
    width: 0,
    height: 0,
    scale: 1,
    fontScale: 1,
    statusBarHeight: 0,
    navigationBarHeight: 0,
  };
  const windowPhysicalPixels = initData;
  windowPhysicalPixels.width = window.innerWidth;
  windowPhysicalPixels.height = window.innerHeight;
  windowPhysicalPixels.scale = window.devicePixelRatio;
  windowPhysicalPixels.fontScale = window.devicePixelRatio;
  // TODO need implement api to get statusBarHeight
  windowPhysicalPixels.statusBarHeight = 0;
  // TODO need implement api to get navigationBarHeight
  windowPhysicalPixels.navigationBarHeight = 0;

  const screenPhysicalPixels = initData;
  screenPhysicalPixels.width = window.innerWidth;
  screenPhysicalPixels.height = window.innerHeight;
  screenPhysicalPixels.scale = window.devicePixelRatio;
  screenPhysicalPixels.fontScale = window.devicePixelRatio;
  // TODO need implement api to get statusBarHeight
  screenPhysicalPixels.statusBarHeight = 0;
  // TODO need implement api to get navigationBarHeight
  screenPhysicalPixels.navigationBarHeight = 0;
  return { windowPhysicalPixels, screenPhysicalPixels };
}

export const nativeGlobal = {
  OS: 'web',
  Platform: {
    OS: 'android',
    Localization: undefined,
  },
  Dimensions: {
    window: {
      scale: window.devicePixelRatio || 1,
      height: window.innerHeight,
      width: window.innerWidth,
    },
    ...checkUpdateDimension(),
  },
};


