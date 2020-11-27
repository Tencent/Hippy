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
package com.tencent.mtt.hippy.views.viewpager;

import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.uimanager.HippyViewController;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;

import android.content.Context;
import android.text.TextUtils;
import android.view.View;
import android.view.ViewGroup;


/**
 * Created by ceasoncai on 2017/12/15.
 */
@HippyController(name = HippyViewPagerController.CLASS_NAME)
public class HippyViewPagerController extends HippyViewController<HippyViewPager>
{
	public static final String CLASS_NAME					= "ViewPager";

	private static final String TAG							= "HippyViewPagerController";

	private static final String FUNC_SET_PAGE				= "setPage";
	private static final String FUNC_SET_PAGE_WITHOUT_ANIM	= "setPageWithoutAnimation";

  private static final String FUNC_SET_INDEX				= "setIndex";
  private static final String FUNC_NEXT_PAGE				= "next";
  private static final String FUNC_PREV_PAGE				= "prev";

	@Override
	protected View createViewImpl(Context context)
	{
		HippyViewPager viewPager = new HippyViewPager(context);
		return viewPager;
	}

  @Override
  protected View createViewImpl(Context context, HippyMap iniProps)
  {
    boolean isVertical = false;
    if (iniProps != null) {
      if ((iniProps.containsKey("direction") && iniProps.getString("direction").equals("vertical"))
      || iniProps.containsKey("vertical")) {
        isVertical = true;
      }
    }

    return new HippyViewPager(context, isVertical);
  }

	@Override
	public View getChildAt(HippyViewPager hippyViewPager, int i)
	{
		return hippyViewPager.getViewFromAdapter(i);
	}

	@Override
	public int getChildCount(HippyViewPager hippyViewPager)
	{
		return hippyViewPager.getAdapter().getCount();
	}

	@Override
	protected void addView(ViewGroup parentView, View view, int index)
	{
		LogUtils.d(TAG, "addView: " + parentView.hashCode() + ", index=" + index);
		if (parentView instanceof HippyViewPager && view instanceof HippyViewPagerItem)
		{
			HippyViewPager hippyViewPager = (HippyViewPager) parentView;
			hippyViewPager.addViewToAdapter((HippyViewPagerItem) view, index);
		}
		else
		{
			LogUtils.e(TAG, "add view got invalid params");
		}
	}

	@Override
	protected void deleteChild(ViewGroup parentView, View childView)
	{
		LogUtils.d(TAG, "deleteChild: " + parentView.hashCode());
		if (parentView instanceof HippyViewPager && childView instanceof HippyViewPagerItem)
		{
			((HippyViewPager) parentView).removeViewFromAdapter((HippyViewPagerItem) childView);
		}
		else
		{
			LogUtils.e(TAG, "delete view got invalid params");
		}
	}

	@Override
	protected void onManageChildComplete(HippyViewPager viewPager)
	{
		viewPager.setChildCountAndUpdate(viewPager.getAdapter().getItemViewSize());
	}

	@HippyControllerProps(name = "initialPage", defaultNumber = 0, defaultType = HippyControllerProps.NUMBER)
	public void setInitialPage(HippyViewPager parent, int initialPage)
	{
		parent.setInitialPageIndex(initialPage);
	}

	@HippyControllerProps(name = "scrollEnabled", defaultBoolean = true, defaultType = HippyControllerProps.BOOLEAN)
	public void setScrollEnabled(HippyViewPager viewPager, boolean value)
	{
		viewPager.setScrollEnabled(value);
	}

	@HippyControllerProps(name = "pageMargin", defaultNumber = 0, defaultType = HippyControllerProps.NUMBER)
	public void setPageMargin(HippyViewPager pager, float margin)
	{
		pager.setPageMargin((int) PixelUtil.dp2px(margin));
	}
	@HippyControllerProps(name = NodeProps.OVERFLOW, defaultType = HippyControllerProps.STRING, defaultString = "visible")
	public void setOverflow(HippyViewPager pager, String overflow)
	{
		pager.setOverflow(overflow);
	}

  @HippyControllerProps(name = "pageSize", defaultNumber = 1.f, defaultType = HippyControllerProps.NUMBER)
  public void setPageSize(HippyViewPager pager, float pageSize) {
    pager.getAdapter().setPageSize(pageSize);
  }

  @HippyControllerProps(name = "loop", defaultBoolean = false, defaultType = HippyControllerProps.BOOLEAN)
  public void loop(HippyViewPager pager, boolean loop) {
    pager.getAdapter().setLoop(loop);
  }

  @HippyControllerProps(name = "middlePageOffset", defaultNumber = 1.f, defaultType = HippyControllerProps.NUMBER)
  public void setMiddlePageOffset(HippyViewPager pager, float middlePageOffset) {
    pager.middlePageOffset = middlePageOffset;
  }

	@Override
	public void dispatchFunction(HippyViewPager view, String functionName, HippyArray var)
	{
		if (view == null)
		{
			return;
		}

    int curr = view.getCurrentItem();

		switch (functionName)
		{
			case FUNC_SET_PAGE:
				if (var != null)
				{
					Object selected = var.get(0);
					if (selected instanceof Integer)
					{
						view.switchToPage((int) selected, true);
					}
				}
				break;
			case FUNC_SET_PAGE_WITHOUT_ANIM:
				if (var != null)
				{
					Object selected = var.get(0);
					if (selected instanceof Integer)
					{
						view.switchToPage((int) selected, false);
					}
				}
				break;
      case FUNC_SET_INDEX:
        if (var != null && var.size() > 0) {
          HippyMap paramsMap = var.getMap(0);
          if (paramsMap != null && paramsMap.size() > 0 && paramsMap.containsKey("index")) {
            int index  = paramsMap.getInt("index");
            boolean animated = paramsMap.containsKey("animated") ?
              paramsMap.getBoolean("animated") : true;
            view.switchToPage(index, animated);
          }
        }
        break;
      case FUNC_NEXT_PAGE:
        int total = view.getAdapter().getCount();
        if (curr < total - 1) {
          view.switchToPage(curr + 1, true);
        }
        break;
      case FUNC_PREV_PAGE:
        if (curr > 0) {
          view.switchToPage(curr - 1, true);
        }
        break;
			default:
				break;
		}
	}

  @Override
  public void dispatchFunction(HippyViewPager view, String functionName, HippyArray params, Promise promise)
  {
    if (view == null) {
      return;
    }

    switch (functionName)
    {
      case FUNC_SET_INDEX:
        if (params != null && params.size() > 0) {
          HippyMap paramsMap = params.getMap(0);
          if (paramsMap != null && paramsMap.size() > 0 && paramsMap.containsKey("index")) {
            int index  = paramsMap.getInt("index");
            boolean animated = paramsMap.containsKey("animated") ?
              paramsMap.getBoolean("animated") : true;
            view.setCallBackPromise(promise);
            view.switchToPage(index, animated);
            return;
          }
        }

        if (promise != null) {
          String msg = "invalid parameter!";
          HippyMap resultMap = new HippyMap();
          resultMap.pushString("msg", msg);
          promise.resolve(resultMap);
        }
        break;
      default:
        break;
    }
  }
}
