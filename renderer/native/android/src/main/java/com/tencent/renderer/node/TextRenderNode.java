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

import static com.tencent.renderer.NativeRenderer.NODE_ID;
import static com.tencent.renderer.NativeRenderer.NODE_INDEX;
import static com.tencent.renderer.NativeRenderer.NODE_PROPS;

import android.util.SparseArray;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.renderer.component.text.TextRenderSupplier;
import com.tencent.renderer.utils.MapUtils;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public class TextRenderNode extends RenderNode {

    private static final String TAG = "TextRenderNode";
    /**
     * Save the data information of the virtual sub node for node snapshot.
     */
    @Nullable
    private SparseArray<Map<String, Object>> mVirtualChildrenInfo;
    @Nullable
    private ArrayList<Integer> mChildrenOrder;
    @Nullable
    private TextRenderSupplier mRenderSupplier;

    public TextRenderNode(int rootId, int id, @NonNull String className,
            @NonNull ControllerManager controllerManager) {
        super(rootId, id, className, controllerManager);
    }

    public TextRenderNode(int rootId, int id, @Nullable Map<String, Object> props,
            @NonNull String className, @NonNull ControllerManager controllerManager,
            boolean isLazyLoad) {
        super(rootId, id, props, className, controllerManager, isLazyLoad);
    }

    @Override
    public void onDeleted() {
        super.onDeleted();
        if (mVirtualChildrenInfo != null) {
            mVirtualChildrenInfo.clear();
            mVirtualChildrenInfo = null;
        }
        if (mChildrenOrder != null) {
            mChildrenOrder.clear();
            mChildrenOrder = null;
        }
    }

    public void onCreateVirtualChild(int nodeId, int index,
            @NonNull Map<String, Object> childInfo) {
        if (mVirtualChildrenInfo == null) {
            mVirtualChildrenInfo = new SparseArray<>(4);
        }
        if (mChildrenOrder == null) {
            mChildrenOrder = new ArrayList<>(4);
        }
        index = (index < 0) ? 0 : Math.min(index, mVirtualChildrenInfo.size());
        mVirtualChildrenInfo.put(nodeId, childInfo);
        mChildrenOrder.add(index, nodeId);
    }

    public void onUpdateVirtualChild(int nodeId, @Nullable Map<String, Object> diffProps,
            @Nullable List<Object> delProps) {
        if (mVirtualChildrenInfo == null) {
            return;
        }
        Map<String, Object> childInfo = mVirtualChildrenInfo.get(nodeId);
        if (childInfo == null) {
            return;
        }
        Map<String, Object> props = MapUtils.getMapValue(childInfo, NODE_PROPS);
        if (props == null) {
            props = new HashMap<>();
            childInfo.put(NODE_PROPS, props);
        }
        if (diffProps != null) {
            for (Map.Entry<String, Object> entry : diffProps.entrySet()) {
                props.put(entry.getKey(), entry.getValue());
            }
        }
        if (delProps != null) {
            for (Object key : delProps) {
                props.put(key.toString(), null);
            }
        }
    }

    public void onDeleteVirtualChild(Integer nodeId) {
        if (mVirtualChildrenInfo != null && mChildrenOrder != null) {
            mVirtualChildrenInfo.remove(nodeId);
            mChildrenOrder.remove(nodeId);
        }
    }

    @SuppressWarnings("rawtypes")
    public void onMoveVirtualChild(@NonNull List<Object> list) {
        if (mVirtualChildrenInfo == null || mChildrenOrder == null) {
            return;
        }
        for (int i = 0; i < list.size(); i++) {
            try {
                final Map node = (Map) list.get(i);
                Integer id = ((Number) Objects.requireNonNull(node.get(NODE_ID))).intValue();
                int index = ((Number) Objects.requireNonNull(node.get(NODE_INDEX))).intValue();
                mChildrenOrder.remove(id);
                mChildrenOrder.add(index, id);
            } catch (NullPointerException e) {
                LogUtils.w(TAG, "onVirtualChildMove: " + e.getMessage());
            }
        }
    }

    @Override
    public void updateExtra(@Nullable Object object) {
        super.updateExtra(object);
        if (object instanceof TextRenderSupplier) {
            mRenderSupplier = (TextRenderSupplier) object;
        }
    }

    public float getPaddingLeft() {
        return (mRenderSupplier != null) ? mRenderSupplier.leftPadding : 0.0f;
    }

    public float getPaddingRight() {
        return (mRenderSupplier != null) ? mRenderSupplier.rightPadding : 0.0f;
    }

    public float getPaddingTop() {
        return (mRenderSupplier != null) ? mRenderSupplier.topPadding : 0.0f;
    }

    public float getPaddingBottom() {
        return (mRenderSupplier != null) ? mRenderSupplier.bottomPadding : 0.0f;
    }

    public void recordVirtualChildren(@NonNull List<Map<String, Object>> nodeInfoList) {
        if (mVirtualChildrenInfo != null && mChildrenOrder != null) {
            for (int i = 0; i < mChildrenOrder.size(); i++) {
                Map<String, Object> childInfo = mVirtualChildrenInfo.get(mChildrenOrder.get(i));
                if (childInfo != null) {
                    nodeInfoList.add(childInfo);
                }
            }
        }
    }
}
