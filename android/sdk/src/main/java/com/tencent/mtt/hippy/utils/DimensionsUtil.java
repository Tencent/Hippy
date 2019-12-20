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
import android.os.Build;
import android.util.DisplayMetrics;
import android.view.Display;
import android.view.WindowManager;

import com.tencent.mtt.hippy.common.HippyMap;

import java.lang.reflect.Field;
import java.lang.reflect.Method;

public class DimensionsUtil
{

	private static int STATUS_BAR_HEIGHT = -1;

	public static HippyMap getDimensions(int windowWidth, int windowHeight, Context context, boolean shouldUseScreenDisplay)
	{
		if (context == null)
		{
			return null;
		}

		DisplayMetrics windowDisplayMetrics = context.getResources().getDisplayMetrics();
		DisplayMetrics screenDisplayMetrics = new DisplayMetrics();
		screenDisplayMetrics.setTo(windowDisplayMetrics);
		WindowManager windowManager = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
		Display defaultDisplay = windowManager.getDefaultDisplay();
		if (Build.VERSION.SDK_INT >= 17)
		{
			defaultDisplay.getRealMetrics(screenDisplayMetrics);
		}
		else
		{
			try
			{
				Method mGetRawH = Display.class.getMethod("getRawHeight");
				Method mGetRawW = Display.class.getMethod("getRawWidth");

				Object width = mGetRawW.invoke(defaultDisplay);
				screenDisplayMetrics.widthPixels = width!=null? (Integer) width:0;

				Object height = mGetRawH.invoke(defaultDisplay);
				screenDisplayMetrics.heightPixels =  height!=null? (Integer) height:0;
			}
			catch (Throwable throwable)
			{
				throwable.printStackTrace();
			}
		}

		// construct param
		HippyMap dimensionMap = new HippyMap();
		if (STATUS_BAR_HEIGHT < 0)
		{
			Class<?> c = null;
			Object obj = null;
			Field field = null;
			int x = 0;
			try
			{
				c = Class.forName("com.android.internal.R$dimen");
				obj = c.newInstance();
				field = c.getField("status_bar_height");
				x = Integer.parseInt(field.get(obj).toString());
				STATUS_BAR_HEIGHT = context.getResources().getDimensionPixelSize(x);
			}
			catch (Exception e)
			{
				STATUS_BAR_HEIGHT = -1;
				e.printStackTrace();
			}

			if (STATUS_BAR_HEIGHT < 1)
			{
				int statebarH_id = context.getResources().getIdentifier("statebar_height", "dimen", context.getPackageName());
				STATUS_BAR_HEIGHT = Math.round(context.getResources().getDimension(statebarH_id));
			}
		}
		HippyMap windowDisplayMetricsMap = new HippyMap();
		if (shouldUseScreenDisplay)
		{
			windowDisplayMetricsMap.pushInt("width", windowWidth >= 0 ? windowWidth : screenDisplayMetrics.widthPixels);
			windowDisplayMetricsMap.pushInt("height", windowHeight >= 0 ? windowHeight : screenDisplayMetrics.heightPixels);
			windowDisplayMetricsMap.pushDouble("scale", screenDisplayMetrics.density);
			windowDisplayMetricsMap.pushDouble("fontScale", screenDisplayMetrics.scaledDensity);
			windowDisplayMetricsMap.pushDouble("densityDpi", screenDisplayMetrics.densityDpi);
			windowDisplayMetricsMap.pushDouble("statusBarHeight", STATUS_BAR_HEIGHT);

			dimensionMap.pushMap("windowPhysicalPixels", windowDisplayMetricsMap);
		}
		else
		{
			windowDisplayMetricsMap.pushInt("width", windowWidth >= 0 ? windowWidth : windowDisplayMetrics.widthPixels);
			windowDisplayMetricsMap.pushInt("height", windowHeight >= 0 ? windowHeight : windowDisplayMetrics.heightPixels);
			windowDisplayMetricsMap.pushDouble("scale", windowDisplayMetrics.density);
			windowDisplayMetricsMap.pushDouble("fontScale", windowDisplayMetrics.scaledDensity);
			windowDisplayMetricsMap.pushDouble("densityDpi", windowDisplayMetrics.densityDpi);
            windowDisplayMetricsMap.pushDouble("statusBarHeight", STATUS_BAR_HEIGHT);

			dimensionMap.pushMap("windowPhysicalPixels", windowDisplayMetricsMap);
		}
		HippyMap screenDisplayMetricsMap = new HippyMap();
		screenDisplayMetricsMap.pushInt("width", screenDisplayMetrics.widthPixels);
		screenDisplayMetricsMap.pushInt("height", screenDisplayMetrics.heightPixels);
		screenDisplayMetricsMap.pushDouble("scale", screenDisplayMetrics.density);
		screenDisplayMetricsMap.pushDouble("fontScale", screenDisplayMetrics.scaledDensity);
		screenDisplayMetricsMap.pushDouble("densityDpi", screenDisplayMetrics.densityDpi);
        screenDisplayMetricsMap.pushDouble("statusBarHeight", STATUS_BAR_HEIGHT);

		dimensionMap.pushMap("screenPhysicalPixels", screenDisplayMetricsMap);
		return dimensionMap;
	}
}
