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

package com.tencent.mtt.hippy.views.waterfall;

import android.content.Context;
import android.view.ViewGroup;
import androidx.recyclerview.widget.StaggeredGridLayoutManager;
import com.tencent.mtt.hippy.uimanager.RenderManager;
import com.tencent.mtt.hippy.views.list.HippyListItemView;
import com.tencent.renderer.node.RenderNode;
import com.tencent.renderer.node.WaterfallItemRenderNode;

public class HippyWaterfallItemView extends HippyListItemView {

    static final String TAG = "HippyWaterfallItemView";

    public HippyWaterfallItemView(Context context) {
        super(context);
    }

    @Override
    public void setLayoutParams(ViewGroup.LayoutParams params) {
        super.setLayoutParams(params);
        if (params instanceof StaggeredGridLayoutManager.LayoutParams) {
            RenderNode node = RenderManager.getRenderNode(this);
            if (node instanceof WaterfallItemRenderNode) {
                ((StaggeredGridLayoutManager.LayoutParams) params).setFullSpan(
                        ((WaterfallItemRenderNode) node).checkFullSpanProperty());
            }
        }
    }
}
