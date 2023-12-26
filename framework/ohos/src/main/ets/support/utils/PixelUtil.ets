import { HippyLibrary } from "../../hippy_library/HippyLibrary"
import { LogUtils } from "./LogUtils";

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
declare function vp2px(vp: number): number

export class PixelUtil {
  // 缩放字体和宽高
  public static setDensityScale(densityScale: number, libHippy: HippyLibrary): void {
    LogUtils.i('PixelUtil', 'set density scale: ' + densityScale)
    PixelUtil.densityScale = densityScale
    PixelUtil.density = vp2px(1.0) / PixelUtil.densityScale
    libHippy?.Setting_SetDensityScale(densityScale)
  }

  // 只缩放字体
  public static setFontSizeScale(scale: number, libHippy: HippyLibrary): void {
    LogUtils.i('PixelUtil', 'set font size scale: ' + scale)
    PixelUtil.fontSizeScale = scale
    libHippy?.Setting_SetFontSizeScale(scale)
  }

  public static getDensityScale(): number {
    return PixelUtil.densityScale
  }

  public static getFontSizeScale(): number {
    return PixelUtil.fontSizeScale
  }

  public static px2dp(value: number): number {
    return value / PixelUtil.getDensity();
  }

  public static vp2dp(value: number): number {
    return value * PixelUtil.densityScale
  }

  public static getDensity(): number {
    return PixelUtil.density
  }

  public static updateDensity(libHippy: HippyLibrary): void {
    let newValue = vp2px(1.0)
    if (newValue != PixelUtil.vp2pxValue) {
      PixelUtil.vp2pxValue = newValue
      PixelUtil.density = newValue / PixelUtil.densityScale
      libHippy?.Setting_SetDensity(PixelUtil.density)
    }
  }

  private static densityScale: number = 1.0
  private static density: number = vp2px(1.0) / 1.0
  private static vp2pxValue: number = vp2px(1.0)
  private static fontSizeScale: number = 1.0
}
