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

import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.mtt.hippy.uimanager.RenderNode;

import java.util.Map;

public class HippyWaterfallViewNode extends RenderNode {

  static final String TAG = "HippyWaterfallViewNode";

  public HippyWaterfallViewNode(int rootId, int id, @Nullable Map<String, Object> props,
          @NonNull String className, @NonNull ControllerManager controllerManager, boolean isLazyLoad) {
    super(rootId, id, props, className, controllerManager, isLazyLoad);
  }

  @Override
  protected void addChildToPendingList(RenderNode renderNode) {
  }

  @Override
  public boolean removeChild(RenderNode uiNode) {
    if (uiNode instanceof HippyWaterfallItemRenderNode) {
      HippyWaterfallItemRenderNode listItemRenderNode = (HippyWaterfallItemRenderNode) uiNode;
      listItemRenderNode.setRecycleItemTypeChangeListener(null);
    }
    return super.removeChild(uiNode);
  }

}
