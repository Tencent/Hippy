/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.tencent.mtt.hippy.utils;

import android.content.Context;
import android.content.res.Configuration;
import android.content.res.Resources;
import android.content.res.Resources.NotFoundException;
import android.graphics.Insets;
import android.os.Build;
import android.provider.Settings;
import android.view.WindowInsets;
import androidx.annotation.NonNull;
import android.text.TextUtils;
import android.util.DisplayMetrics;
import android.view.Display;
import android.view.WindowManager;

import 	android.view.WindowMetrics;
import com.tencent.mtt.hippy.common.HippyMap;

import java.lang.reflect.Field;
import java.lang.reflect.Method;

@SuppressWarnings("deprecation")
public class DimensionsUtil {

  private static final String NAV_BAR_HEIGHT_RES_NAME = "navigation_bar_height";
  private static final String NAV_BAR_HEIGHT_LANDSCAPE_RES_NAME = "navigation_bar_height_landscape";
  private static final String SHOW_NAV_BAR_RES_NAME = "config_showNavigationBar";
  private static int STATUS_BAR_HEIGHT = -1;

  private static String getNavigationBarIsMinKeyName() {
    String brand = Build.BRAND;
    if (TextUtils.isEmpty(brand)) {
      return "navigationbar_is_min";
    }

    if (brand.equalsIgnoreCase("HUAWEI")) {
      return "navigationbar_is_min";
    } else if (brand.equalsIgnoreCase("XIAOMI")) {
      return "force_fsg_nav_bar";
    } else if (brand.equalsIgnoreCase("VIVO")) {
      return "navigation_gesture_on";
    } else if (brand.equalsIgnoreCase("OPPO")) {
      return "navigation_gesture_on";
    } else {
      return "navigationbar_is_min";
    }
  }

  private static boolean checkNavigationBarShow(@NonNull Context context) {
    boolean checkResult = false;
    Resources rs = context.getResources();
    int id = rs.getIdentifier(SHOW_NAV_BAR_RES_NAME, "bool", "android");
    if (id > 0) {
      checkResult = rs.getBoolean(id);
    }
    try {
      @SuppressWarnings("rawtypes") Class systemPropertiesClass = Class
          .forName("android.os.SystemProperties");
      @SuppressWarnings("unchecked") Method m = systemPropertiesClass
          .getMethod("get", String.class);
      String navBarOverride = (String) m.invoke(systemPropertiesClass, "qemu.hw.mainkeys");
      //判断是否隐藏了底部虚拟导航
      int navigationBarIsMin;
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
        navigationBarIsMin = Settings.System.getInt(context.getContentResolver(),
            getNavigationBarIsMinKeyName(), 0);
      } else {
        navigationBarIsMin = Settings.Global.getInt(context.getContentResolver(),
            getNavigationBarIsMinKeyName(), 0);
      }
      if ("1".equals(navBarOverride) || 1 == navigationBarIsMin) {
        checkResult = false;
      } else if ("0".equals(navBarOverride)) {
        checkResult = true;
      }
    } catch (Exception e) {
      e.printStackTrace();
    }

    return checkResult;
  }

  /**
   * 获取虚拟按键的高度 1. 全面屏下 1.1 开启全面屏开关-返回0 1.2 关闭全面屏开关-执行非全面屏下处理方式 2. 非全面屏下 2.1 没有虚拟键-返回0 2.1 虚拟键隐藏-返回0
   * 2.2 虚拟键存在且未隐藏-返回虚拟键实际高度
   */
  public static int getNavigationBarHeight(Context context) {
    assert (context != null);

    //noinspection ConstantConditions
    if (context == null || !checkNavigationBarShow(context)) {
      return 0;
    }

    String navBarHeightIdentifier = (context.getResources().getConfiguration().orientation
        != Configuration.ORIENTATION_LANDSCAPE)
        ? NAV_BAR_HEIGHT_RES_NAME : NAV_BAR_HEIGHT_LANDSCAPE_RES_NAME;

    int result = 0;
    try {
      int resourceId = context.getResources()
          .getIdentifier(navBarHeightIdentifier, "dimen", "android");
      result = context.getResources().getDimensionPixelSize(resourceId);
    } catch (NotFoundException e) {
      LogUtils.d("DimensionsUtil", "getNavigationBarHeight: " + e.getMessage());
    }
    return result;
  }

  public static int getStatusBarHeight() {
    Context context = ContextHolder.getAppContext();
    assert context != null;
    if (STATUS_BAR_HEIGHT > 0) {
      return STATUS_BAR_HEIGHT;
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      WindowManager wm = (WindowManager) ContextHolder.getAppContext()
              .getSystemService(Context.WINDOW_SERVICE);
      WindowMetrics windowMetrics = wm.getCurrentWindowMetrics();
      WindowInsets windowInsets = windowMetrics.getWindowInsets();
      Insets insets = windowInsets
              .getInsetsIgnoringVisibility(WindowInsets.Type.statusBars());
      STATUS_BAR_HEIGHT = insets.top;
    } else {
      Class<?> c;
      Object obj;
      Field field;
      int x;
      try {
        c = Class.forName("com.android.internal.R$dimen");
        obj = c.newInstance();
        field = c.getField("status_bar_height");
        //noinspection ConstantConditions
        x = Integer.parseInt(field.get(obj).toString());
        STATUS_BAR_HEIGHT = context.getResources().getDimensionPixelSize(x);
      } catch (Exception e) {
        STATUS_BAR_HEIGHT = -1;
        e.printStackTrace();
      }

      if (STATUS_BAR_HEIGHT < 1) {
        try {
          int statebarH_id = context.getResources()
                  .getIdentifier("statebar_height", "dimen", context.getPackageName());
          STATUS_BAR_HEIGHT = Math.round(context.getResources().getDimension(statebarH_id));
        } catch (NotFoundException e) {
          LogUtils.d("DimensionsUtil", "getDimensions: " + e.getMessage());
        }
      }
    }

    return STATUS_BAR_HEIGHT;
  }

  public static HippyMap getDimensions(int windowWidth, int windowHeight, Context context,
      boolean shouldUseScreenDisplay) {
    if (context == null) {
      return null;
    }

    DisplayMetrics windowDisplayMetrics = context.getResources().getDisplayMetrics();
    DisplayMetrics screenDisplayMetrics = new DisplayMetrics();
    screenDisplayMetrics.setTo(windowDisplayMetrics);
    WindowManager windowManager = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
    Display defaultDisplay = windowManager.getDefaultDisplay();
    if (Build.VERSION.SDK_INT >= 17) {
      defaultDisplay.getRealMetrics(screenDisplayMetrics);
    } else {
      try {
        @SuppressWarnings("JavaReflectionMemberAccess") Method mGetRawH = Display.class
            .getMethod("getRawHeight");
        @SuppressWarnings("JavaReflectionMemberAccess") Method mGetRawW = Display.class
            .getMethod("getRawWidth");

        Object width = mGetRawW.invoke(defaultDisplay);
        screenDisplayMetrics.widthPixels = width != null ? (Integer) width : 0;

        Object height = mGetRawH.invoke(defaultDisplay);
        screenDisplayMetrics.heightPixels = height != null ? (Integer) height : 0;
      } catch (Throwable throwable) {
        throwable.printStackTrace();
      }
    }

    // construct param
    HippyMap dimensionMap = new HippyMap();
    getStatusBarHeight();
    int navigationBarHeight = getNavigationBarHeight(context);
    HippyMap windowDisplayMetricsMap = new HippyMap();

    if (shouldUseScreenDisplay) {
      windowDisplayMetricsMap
          .pushInt("width", windowWidth >= 0 ? windowWidth : screenDisplayMetrics.widthPixels);
      windowDisplayMetricsMap
          .pushInt("height", windowHeight >= 0 ? windowHeight : screenDisplayMetrics.heightPixels);
      windowDisplayMetricsMap.pushDouble("scale", screenDisplayMetrics.density);
      windowDisplayMetricsMap.pushDouble("fontScale", screenDisplayMetrics.scaledDensity);
      windowDisplayMetricsMap.pushDouble("densityDpi", screenDisplayMetrics.densityDpi);
    } else {
      windowDisplayMetricsMap
          .pushInt("width", windowWidth >= 0 ? windowWidth : windowDisplayMetrics.widthPixels);
      windowDisplayMetricsMap
          .pushInt("height", windowHeight >= 0 ? windowHeight : windowDisplayMetrics.heightPixels);
      windowDisplayMetricsMap.pushDouble("scale", windowDisplayMetrics.density);
      windowDisplayMetricsMap.pushDouble("fontScale", windowDisplayMetrics.scaledDensity);
      windowDisplayMetricsMap.pushDouble("densityDpi", windowDisplayMetrics.densityDpi);
    }
    windowDisplayMetricsMap.pushDouble("statusBarHeight", STATUS_BAR_HEIGHT);
    windowDisplayMetricsMap.pushDouble("navigationBarHeight", navigationBarHeight);
    dimensionMap.pushMap("windowPhysicalPixels", windowDisplayMetricsMap);

    HippyMap screenDisplayMetricsMap = new HippyMap();
    screenDisplayMetricsMap.pushInt("width", screenDisplayMetrics.widthPixels);
    screenDisplayMetricsMap.pushInt("height", screenDisplayMetrics.heightPixels);
    screenDisplayMetricsMap.pushDouble("scale", screenDisplayMetrics.density);
    screenDisplayMetricsMap.pushDouble("fontScale", screenDisplayMetrics.scaledDensity);
    screenDisplayMetricsMap.pushDouble("densityDpi", screenDisplayMetrics.densityDpi);
    screenDisplayMetricsMap.pushDouble("statusBarHeight", STATUS_BAR_HEIGHT);
    screenDisplayMetricsMap.pushDouble("navigationBarHeight", navigationBarHeight);

    dimensionMap.pushMap("screenPhysicalPixels", screenDisplayMetricsMap);
    return dimensionMap;
  }
}
