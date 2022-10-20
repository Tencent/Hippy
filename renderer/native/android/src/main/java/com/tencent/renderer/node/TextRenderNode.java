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

import android.util.SparseArray;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.renderer.component.text.TextRenderSupplier;
import java.util.List;
import java.util.Map;

public class TextRenderNode extends RenderNode {

    /**
     * Save the data information of the virtual sub node for node snapshot.
     */
    @Nullable
    private SparseArray<Map<String, Object>> mVirtualChildrenInfo;
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

    public void onVirtualChildUpdated(int nodeId, @NonNull Map<String, Object> childInfo) {
        if (mVirtualChildrenInfo == null) {
            mVirtualChildrenInfo = new SparseArray<>(4);
        }
        mVirtualChildrenInfo.put(nodeId, childInfo);
    }

    public void onVirtualChildDeleted(int nodeId) {
        if (mVirtualChildrenInfo != null) {
            mVirtualChildrenInfo.remove(nodeId);
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
        if (mVirtualChildrenInfo != null) {
            for (int i = 0; i < mVirtualChildrenInfo.size(); i++) {
                Map<String, Object> childInfo = mVirtualChildrenInfo.valueAt(i);
                if (childInfo != null) {
                    nodeInfoList.add(childInfo);
                }
            }
        }
    }
}
