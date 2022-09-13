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

import android.view.View;

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyInstanceContext;
import com.tencent.mtt.hippy.uimanager.RenderNode;
import com.tencent.mtt.supportui.views.recyclerview.RecyclerViewItem;

public class HippyViewUtil {

  public static HippyEngineContext getEngineContext(View view) {
    if (view.getContext() instanceof HippyInstanceContext) {
      return ((HippyInstanceContext) view.getContext()).getEngineContext();
    }
    return null;
  }

  public static RenderNode getRenderNode(View view) {
    HippyEngineContext engineContext = getEngineContext(view);
    if (engineContext != null) {
      return engineContext.getRenderManager().getRenderNode(getNodeId(view));
    }
    return null;
  }

  public static int getNodeId(View view) {
    if (view instanceof RecyclerViewItem) {
      View child = ((RecyclerViewItem) view).getChildAt(0);
      if (child != null) {
        return child.getId();
      }
    }
    return view.getId();
  }

}
