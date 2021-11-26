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

/* eslint-disable import/prefer-default-export */

import ElementNode from '../renderer/element-node';
import Native from './native';

function drawStatusBar(appOptions = {}) {
  const { iPhone } = appOptions;
  let statusBarOpts = {};
  if (iPhone && iPhone.statusBar) {
    statusBarOpts = iPhone.statusBar;
  }
  if (statusBarOpts.disabled) {
    return null;
  }
  const statusBar = new ElementNode('div');
  const { statusBarHeight } = Native.Dimensions.screen;

  // Initial status bar
  if (Native.screenIsVertical) {
    statusBar.setStyle('height', statusBarHeight);
  } else {
    statusBar.setStyle('height', 0);
  }

  // Set safe area background color
  let backgroundColor = 4282431619; // Vue green
  // FIXME: Use Number.isInteger to check backgroundColor type.
  if (typeof statusBarOpts.backgroundColor === 'number') {
    ({ backgroundColor } = statusBarOpts);
  }
  statusBar.setStyle('backgroundColor', backgroundColor);

  // Set safe area background image if defined
  if (typeof statusBarOpts.backgroundImage === 'string') {
    const statusBarImage = new ElementNode('img');
    statusBarImage.setStyle('width', Native.Dimensions.screen.width);
    statusBarImage.setStyle('height', statusBarHeight);
    statusBarImage.setAttribute('src', appOptions.statusBarOpts.backgroundImage);
    statusBar.appendChild(statusBarImage);
  }

  // Listen the screen rotate event
  statusBar.addEventListener('layout', () => {
    if (Native.screenIsVertical) {
      statusBar.setStyle('height', statusBarHeight);
    } else {
      statusBar.setStyle('height', 0);
    }
  });

  return statusBar;
}

export {
  drawStatusBar,
};
