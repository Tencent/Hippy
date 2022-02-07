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

import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.mtt.hippy.uimanager.RenderNode;

import java.util.Map;

public class HippyWaterfallItemRenderNode extends RenderNode {

    static final String TAG = "HippyWaterfallItemNode";
    IRecycleItemTypeChange mRecycleItemTypeChangeListener;

    public HippyWaterfallItemRenderNode(int id, @Nullable Map<String, Object> props,
            @NonNull String className, @NonNull ViewGroup hippyRootView,
            @NonNull ControllerManager controllerManager, boolean lazy) {
        super(id, props, className, hippyRootView, controllerManager, lazy);
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

    @Override
    public void updateProps(@NonNull Map<String, Object> props) {
        int oldType = 0;
        int newType = 0;
        Object valueObj = null;
        if (props != null) {
            valueObj = props.get("type");
            if (valueObj instanceof Number) {
                newType = ((Number) valueObj).intValue();
            }
        }
        if (getProps() != null) {
            valueObj = getProps().get("type");
            if (valueObj instanceof Number) {
                oldType = ((Number) valueObj).intValue();
            }
        }
        if (mRecycleItemTypeChangeListener != null && oldType != newType) {
            mRecycleItemTypeChangeListener.onRecycleItemTypeChanged(oldType, newType, this);
        }
        super.updateProps(props);
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
