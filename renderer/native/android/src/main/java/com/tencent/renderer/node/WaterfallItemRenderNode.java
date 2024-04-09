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

package com.tencent.renderer.node;

import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import androidx.recyclerview.widget.StaggeredGridLayoutManager;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.mtt.hippy.uimanager.RenderManager;
import com.tencent.renderer.utils.MapUtils;
import java.util.Map;

public class  WaterfallItemRenderNode extends ListItemRenderNode {

    static final String TAG = "HippyWaterfallItemNode";

    private int mSpanIndex = -1;

    private boolean mFullSpan = false;

    public WaterfallItemRenderNode(int rootId, int id, @Nullable Map<String, Object> props,
            @NonNull String className, @NonNull ControllerManager controllerManager, boolean isLazyLoad) {
        super(rootId, id, props, className, controllerManager, isLazyLoad);
    }

    public int getSpanIndex() {
        return mSpanIndex;
    }

    public void setSpanIndex(int index) {
        mSpanIndex = index;
    }

    public void setFullSpan(boolean fullSpan) {
        mFullSpan = fullSpan;
    }

    public boolean isFullSpan() {
        return mFullSpan;
    }

    public boolean checkFullSpanProperty() {
        if (mProps != null) {
            return MapUtils.getBooleanValue(mProps, NodeProps.FULL_SPAN, false);
        }
        return false;
    }

    @Override
    public void onBindViewHolder(@NonNull RenderNode fromNode, @NonNull View itemView) {
        super.onBindViewHolder(fromNode, itemView);
        final ViewGroup.LayoutParams lp = itemView.getLayoutParams();
        if (lp instanceof StaggeredGridLayoutManager.LayoutParams) {
            ((StaggeredGridLayoutManager.LayoutParams) lp).setFullSpan(mFullSpan);
        }
    }
}
