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
import { HippyMap, HippyValue } from '../common/HippyTypes';
import deviceinfo from '@ohos.deviceInfo';
import { TextUtils } from './TextUtils';
import { display } from '@kit.ArkUI';
import { LogUtils } from './LogUtils';
import { PixelUtil } from './PixelUtil';

const DIMENSSION_TAG = "DimensionsUtil"

export class DimensionsUtil {
  static STATUS_BAR_HEIGHT: number = -1;
  private static NAV_BAR_HEIGHT_RES_NAME = "navigation_bar_height";
  private static NAV_BAR_HEIGHT_LANDSCAPE_RES_NAME = "navigation_bar_height_landscape";
  private static SHOW_NAV_BAR_RES_NAME = "config_showNavigationBar";
  private static NAVIGATE_BAR_HEIGHT = 0;

  static async getDimensions(ww: number, wh: number, context: Context,
                             shouldUseScreenDisplay: boolean): Promise<HippyMap> {
    let displayClass: display.Display = display.getDefaultDisplaySync();
    await DimensionsUtil.getStatusBarHeight(displayClass);
    let dimensionMap = new Map<string, HippyValue | Map<string, HippyValue>>()

    let windowDisplayMetricsMap = new Map<string, HippyValue>()
    windowDisplayMetricsMap.set("width", ww >= 0 ? ww : displayClass.width);
    windowDisplayMetricsMap.set("height", wh >= 0 ? wh : displayClass.height);
    windowDisplayMetricsMap.set("scale", displayClass.densityPixels / PixelUtil.getDensityScale());
    windowDisplayMetricsMap.set("fontScale", displayClass.scaledDensity / PixelUtil.getDensityScale());
    windowDisplayMetricsMap.set("densityDpi", displayClass.densityDPI / PixelUtil.getDensityScale());
    windowDisplayMetricsMap.set("statusBarHeight", DimensionsUtil.STATUS_BAR_HEIGHT);
    windowDisplayMetricsMap.set("navigationBarHeight", DimensionsUtil.NAVIGATE_BAR_HEIGHT);
    dimensionMap.set("windowPhysicalPixels", windowDisplayMetricsMap);

    let screenDisplayMetricsMap = new Map<string, HippyValue>()
    screenDisplayMetricsMap.set("width", displayClass.width);
    screenDisplayMetricsMap.set("height", displayClass.height);
    screenDisplayMetricsMap.set("scale", displayClass.densityPixels / PixelUtil.getDensityScale());
    screenDisplayMetricsMap.set("fontScale", displayClass.scaledDensity / PixelUtil.getDensityScale());
    screenDisplayMetricsMap.set("densityDpi", displayClass.densityDPI / PixelUtil.getDensityScale());
    screenDisplayMetricsMap.set("statusBarHeight", DimensionsUtil.STATUS_BAR_HEIGHT);
    screenDisplayMetricsMap.set("navigationBarHeight", DimensionsUtil.NAVIGATE_BAR_HEIGHT);
    dimensionMap.set("screenPhysicalPixels", screenDisplayMetricsMap);
    return dimensionMap
  }

  public static async getStatusBarHeight(displayClass: display.Display): Promise<number> {
    LogUtils.d(DIMENSSION_TAG, 'Succeeded in getting cutoutInfo.');
    if (DimensionsUtil.STATUS_BAR_HEIGHT > 0) {
      return DimensionsUtil.STATUS_BAR_HEIGHT
    }
    try {
      let data: display.CutoutInfo = await displayClass.getCutoutInfo();
      LogUtils.d(DIMENSSION_TAG, 'Succeeded in getting cutoutInfo. Data: ' + JSON.stringify(data));
      if (data.waterfallDisplayAreaRects.bottom.height > 0) {
        DimensionsUtil.NAVIGATE_BAR_HEIGHT = data.waterfallDisplayAreaRects.bottom.height
      }
      if (data.waterfallDisplayAreaRects.top.height > 0) { //瀑布屏曲面部分显示区域
        DimensionsUtil.STATUS_BAR_HEIGHT = data.waterfallDisplayAreaRects.top.top + data.waterfallDisplayAreaRects.top.height
      }
      if (DimensionsUtil.STATUS_BAR_HEIGHT < 1 && data.boundingRects && data.boundingRects.length > 0) { //挖孔、刘海等区域的边界矩形
        DimensionsUtil.STATUS_BAR_HEIGHT = data.boundingRects[0].top + data.boundingRects[0].height
      }
    } catch (exception) {
      LogUtils.e(DIMENSSION_TAG, 'Failed to obtain the default display object. Code: ' + JSON.stringify(exception));
    }
    return DimensionsUtil.STATUS_BAR_HEIGHT
  }

  public static convertDimensionsToDp(dimensionMap: HippyMap) {
    if (dimensionMap != null) {
      DimensionsUtil.convertPhysicalPixelsToDp(dimensionMap.get("windowPhysicalPixels") as HippyMap);
      DimensionsUtil.convertPhysicalPixelsToDp(dimensionMap.get("screenPhysicalPixels") as HippyMap);
    }
  }

  private static getNavigationBarIsMinKeyName(): string {
    let brand: string = deviceinfo.brand;
    LogUtils.d(DIMENSSION_TAG, 'the value of the device brand is :' + brand);
    if (TextUtils.isEmpty(brand)) {
      return "navigationbar_is_min";
    }

    if ("HUAWEI" == brand.toUpperCase()) {
      return "navigationbar_is_min";
    } else if ("XIAOMI" == brand.toUpperCase()) {
      return "force_fsg_nav_bar";
    } else if ("VIVO" == brand.toUpperCase()) {
      return "navigation_gesture_on";
    } else if ("OPPO" == brand.toUpperCase()) {
      return "navigation_gesture_on";
    } else {
      return "navigationbar_is_min";
    }
  }

  private static checkNavigationBarShow(context: Context): boolean {
    let checkResult = false;
    return checkResult
  }

  private static convertPhysicalPixelsToDp(map: HippyMap) {
    if (map != null) {
      let scale = map.get("scale");
      DimensionsUtil.divideByScale(map, "width", scale as number);
      DimensionsUtil.divideByScale(map, "height", scale as number);
      DimensionsUtil.divideByScale(map, "statusBarHeight", scale as number);
      DimensionsUtil.divideByScale(map, "navigationBarHeight", scale as number);
    }
  }

  private static divideByScale(map: HippyMap, key: string, scale: number) {
    let value = map.get(key);
    if (value as number > 0) {
      map.set(key, (value as number / scale) as number);
    }
  }
}
