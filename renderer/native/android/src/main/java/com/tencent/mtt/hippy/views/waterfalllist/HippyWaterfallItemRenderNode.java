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

import static com.tencent.renderer.node.ListItemRenderNode.ITEM_VIEW_TYPE;

import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.renderer.node.ListItemRenderNode;
import com.tencent.renderer.node.RenderNode;

import java.util.List;
import java.util.Map;

public class HippyWaterfallItemRenderNode extends RenderNode {

    static final String TAG = "HippyWaterfallItemNode";
    IRecycleItemTypeChange mRecycleItemTypeChangeListener;

    public HippyWaterfallItemRenderNode(int rootId, int id, @Nullable Map<String, Object> props,
            @NonNull String className, @NonNull ControllerManager controllerManager, boolean isLazyLoad) {
        super(rootId, id, props, className, controllerManager, isLazyLoad);
    }

    @Override
    public String toString() {
        return "[type:" + getType() + "]" + super.toString();
    }

    public int getType() {
        int type = -1;
        Map<String, Object> props = getProps();
        if (props != null) {
            Object valueObj = props.get("type");
            if (props.get("type") instanceof Number) {
                type = ((Number) valueObj).intValue();
            }
        }
        return type;
    }


    private int getItemViewType(@NonNull Map<String, Object> props) {
        int viewType = 0;
        Object viewTypeObj = props.get(ITEM_VIEW_TYPE);
        if (viewTypeObj instanceof Number) {
            viewType = ((Number) viewTypeObj).intValue();
        } else if (viewTypeObj instanceof String) {
            try {
                viewType = Integer.parseInt((String) viewTypeObj);
            } catch (NumberFormatException ignored) {
                //Incorrect number string, not need to handle this exception.
            }
        }
        if (viewType <= 0) {
            viewTypeObj = props.get(ListItemRenderNode.ITEM_VIEW_TYPE_NEW);
            if (viewTypeObj instanceof Number) {
                viewType = ((Number) viewTypeObj).intValue();
            }
        }
        return Math.max(viewType, 0);
    }

    @Override
    public void checkPropsToUpdate(@Nullable Map<String, Object> diffProps,
            @Nullable List<Object> delProps) {
        int oldType = mProps != null ? getItemViewType(mProps) : 0;
        super.checkPropsToUpdate(diffProps, delProps);
        int newType = mProps != null ? getItemViewType(mProps) : 0;
        if (mRecycleItemTypeChangeListener != null && oldType != newType) {
            mRecycleItemTypeChangeListener.onRecycleItemTypeChanged(oldType, newType, this);
        }
    }

    public void setRecycleItemTypeChangeListener(
            IRecycleItemTypeChange recycleItemTypeChangeListener) {
        mRecycleItemTypeChangeListener = recycleItemTypeChangeListener;
    }

    public interface IRecycleItemTypeChange {

        void onRecycleItemTypeChanged(int oldType, int newType,
                HippyWaterfallItemRenderNode listItemNode);
    }

}
