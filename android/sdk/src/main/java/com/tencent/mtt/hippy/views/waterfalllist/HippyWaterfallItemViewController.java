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
package com.tencent.mtt.hippy.views.waterfalllist;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.mtt.hippy.uimanager.HippyViewController;
import com.tencent.mtt.hippy.uimanager.RenderNode;

@HippyController(name = WaterFallComponentName.ITEM, isLazyLoad = true)
public class HippyWaterfallItemViewController extends
  HippyViewController<HippyWaterfallItemView> {

  static final String TAG = WaterFallComponentName.ITEM;

  @Override
  protected View createViewImpl(Context context) {
    return new HippyWaterfallItemView(context);
  }

  @HippyControllerProps(name = "type", defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
  public void setListItemType(HippyWaterfallItemView listItemView, int type) {
    listItemView.setType(type);
  }

  @Override
  public RenderNode createRenderNode(int id, HippyMap props, String className,
    HippyRootView hippyRootView, ControllerManager controllerManager,
    boolean lazy) {
    return new HippyWaterfallItemRenderNode(id, props, className, hippyRootView,
      controllerManager, lazy);
  }

  @Override
  protected boolean shouldInterceptLayout(View view, int x, int y, int width, int height) {
    ViewParent vp = view.getParent();
    if (vp instanceof ViewGroup) {
      ViewGroup vg = (ViewGroup) vp;
      int leftPadding = vg.getPaddingLeft();
      if (leftPadding > 0) {
        x += leftPadding;
        view.layout(x, y, x + width, y + height);
        return true;
      }
    }
    return false;
  }
}
