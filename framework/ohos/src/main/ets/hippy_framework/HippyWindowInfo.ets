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

import { window } from '@kit.ArkUI';
import { HippyLibrary } from '../hippy_library/HippyLibrary';
import { LogUtils } from '../support/utils/LogUtils';

export class HippyWindowInfo {
  private mainWindow: window.Window
  private libHippy: HippyLibrary

  constructor(mainWindow: window.Window, libHippy: HippyLibrary) {
    this.mainWindow = mainWindow
    this.libHippy = libHippy
    this.mainWindow.on('keyboardHeightChange', this.keyboardListener)
  }

  onDestroy(): void {
    this.mainWindow.off('keyboardHeightChange', this.keyboardListener)
  }

  keyboardListener: Callback<number> = (height) => {
    let h = px2vp(height);
    LogUtils.i('hippy', 'keyboard height change: ' + h);
    this.libHippy.NativeRenderer_KeyboardHeightChange(h);
  }
}
