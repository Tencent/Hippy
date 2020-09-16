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
package com.tencent.mtt.hippy.views.refresh;

import android.content.Context;
import android.view.View;

import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.mtt.hippy.uimanager.HippyViewController;
import com.tencent.mtt.hippy.uimanager.PullHeaderRenderNode;
import com.tencent.mtt.hippy.uimanager.RenderNode;
import com.tencent.mtt.hippy.views.list.HippyListView;

@HippyController(name = HippyPullHeaderViewController.CLASS_NAME, isLazyLoad = true)
public class HippyPullHeaderViewController extends HippyViewController<HippyPullHeaderView>
{
	public static final String CLASS_NAME = "PullHeaderView";

	@Override
	protected View createViewImpl(Context context)
	{
		return new HippyPullHeaderView(context);
	}

	@Override
	public RenderNode createRenderNode(int id,  HippyMap props, String className, HippyRootView hippyRootView, ControllerManager controllerManager, boolean lazy) {
		return new PullHeaderRenderNode(id,  props, className, hippyRootView, controllerManager, lazy);
	}

  @Override
  public void dispatchFunction(HippyPullHeaderView view, String functionName, HippyArray dataArray)
  {
    super.dispatchFunction(view, functionName, dataArray);
    View parent = view.getParentView();
    if (parent != null && parent instanceof HippyListView) {
      switch (functionName)
      {
        case "collapsePullHeader":
        {
          ((HippyListView)parent).onHeaderRefreshFinish();
          break;
        }

        case "expandPullHeader":
        {
          ((HippyListView)parent).onHeaderRefresh();
          break;
        }
      }
    }
  }
}
