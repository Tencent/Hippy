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

import { HippyElement } from './runtime/element/hippy-element';
import { Native } from './runtime/native';

import type { HippyAppOptions } from './index';

/**
 * Drawing the iOS Status Bar
 *
 * @param appOptions - options
 */
export function drawIphoneStatusBar(appOptions: HippyAppOptions): HippyElement | null {
  const { iPhone } = appOptions;
  let statusBarOpts;
  if (iPhone?.statusBar) {
    statusBarOpts = iPhone.statusBar;
  }
  if (statusBarOpts?.disabled) {
    return null;
  }
  const statusBar = new HippyElement('div');
  const { statusBarHeight } = Native.dimensions.screen;

  // Initialize the iOS status bar
  if (Native.isVerticalScreen) {
    statusBar.setStyle('height', statusBarHeight);
  } else {
    statusBar.setStyle('height', 0);
  }

  // Set safe area background color
  let backgroundColor = 4282431619;

  if (Number.isInteger(backgroundColor)) {
    ({ backgroundColor } = statusBarOpts);
  }
  statusBar.setStyle('backgroundColor', backgroundColor);

  // Set safe area background image if defined
  if (typeof statusBarOpts.backgroundImage === 'string') {
    const statusBarImage = new HippyElement('img');
    statusBarImage.setStyle('width', Native.dimensions.screen.width);
    statusBarImage.setStyle('height', statusBarHeight);
    statusBarImage.setAttribute(
      'src',
      appOptions.iPhone?.statusBar?.backgroundImage,
    );
    statusBar.appendChild(statusBarImage);
  }

  // Listen the screen rotate event
  statusBar.addEventListener('layout', () => {
    if (Native.isVerticalScreen) {
      statusBar.setStyle('height', statusBarHeight);
    } else {
      statusBar.setStyle('height', 0);
    }
  });

  return statusBar;
}
