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
package com.tencent.mtt.tkd.views.list;

import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.mtt.hippy.uimanager.HippyViewController;
import com.tencent.mtt.hippy.uimanager.ListViewRenderNode;
import com.tencent.mtt.hippy.uimanager.RenderNode;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.views.list.HippyListView;
import com.tencent.mtt.hippy.views.list.HippyListViewController;
import com.tencent.mtt.supportui.views.recyclerview.BaseLayoutManager;
import com.tencent.mtt.tkd.views.list.TkdListView;
import com.tencent.mtt.supportui.views.recyclerview.RecyclerViewBase;
import com.tencent.mtt.supportui.views.recyclerview.RecyclerViewItem;
import com.tencent.mtt.tkd.views.scroll.TkdScrollView;

import android.content.Context;
import android.text.TextUtils;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;

/**
 * Created by leonardgong on 2017/12/7 0007.
 */

@HippyController(name = TkdListViewController.CLASS_NAME)
public class TkdListViewController extends HippyListViewController
{
	public static final String CLASS_NAME = "tkdListView";
  private static final String	SCROLL_TO_POSITION = "scrollToPosition";

	protected View createViewImpl(Context context)
	{
		return new TkdListView(context);
	}

  @Override
  protected View createViewImpl(Context context, HippyMap iniProps)
  {
    if (iniProps != null && iniProps.containsKey("horizontal"))
    {
      return new TkdListView(context, BaseLayoutManager.HORIZONTAL);
    }
    else
    {
      return new TkdListView(context, BaseLayoutManager.VERTICAL);
    }
  }

	@HippyControllerProps(name = "enableExposureReport")
	public void setOnExposureReport(HippyListView hippyListView, boolean enable)
	{
		if (hippyListView instanceof TkdListView) {
			TkdListView listView = (TkdListView) hippyListView;
			listView.setEnableExposureReport(enable);
		}
	}

  @HippyControllerProps(name = "preloadDistance", defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
  public void setPreloadDistance(HippyListView hippyListView, int preloadDistance)
  {
    if (hippyListView instanceof TkdListView) {
      TkdListView listView = (TkdListView) hippyListView;
      listView.setPreloadDistance(preloadDistance);
    }
  }

  @HippyControllerProps(name = "scrollMinOffset", defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
  public void setScrollMinOffset(HippyListView hippyListView, int scrollMinOffset)
  {
    if (hippyListView instanceof TkdListView) {
      TkdListView listView = (TkdListView) hippyListView;
      listView.setScrollMinOffset(scrollMinOffset);
    }
  }

  @Override
  public void dispatchFunction(HippyListView view, String functionName, HippyArray dataArray)
  {
    super.dispatchFunction(view, functionName, dataArray);
    switch (functionName)
    {
      case "loadMoreFinish ":
      {
        if (view instanceof TkdListView) {
          TkdListView listView = (TkdListView)view;
          listView.setIsLoading(false);
        }
        break;
      }
    }
  }

  @Override
  public void dispatchFunction(HippyListView view, String functionName, HippyArray params, Promise promise)
  {
    super.dispatchFunction(view, functionName, params, promise);
    if(view instanceof TkdListView) {
      if (TextUtils.equals(SCROLL_TO_POSITION, functionName)) {
        String msg = "";
        int distance = 0;
        int duration = 0;
        if (params != null && params.size() > 0) {
          HippyMap paramsMap = params.getMap(0);
          if (paramsMap != null) {
            distance = (int)PixelUtil.dp2px(paramsMap.getInt("distance"));
            duration = paramsMap.getInt("duration");
          }
        } else {
          msg = "invalid parameter!";
        }

        if (distance != 0) {
          ((TkdListView)view).scrollToIndex(distance, duration, promise);
        } else {
          msg = "invalid distance parameter!";
        }

        if (!TextUtils.isEmpty(msg) && promise != null) {
          HippyMap resultMap = new HippyMap();
          resultMap.pushString("msg", msg);
          promise.resolve(resultMap);
        }
      }
    }
  }
}
