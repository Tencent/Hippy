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

// 屏幕尺寸信息类型
export interface ScreenSize {
  width: number;
  height: number;
}

/**
 * 设置屏幕尺寸数据
 *
 * @param newScreenSize - 要设置的新屏幕尺寸数据
 *
 * @public
 */
export function setScreenSize(newScreenSize: ScreenSize): void {
  if (newScreenSize.width && newScreenSize.height) {
    const { screen } = global?.Hippy?.device;
    if (screen) {
      screen.width = newScreenSize.width;
      screen.height = newScreenSize.height;
    }
  }
}
