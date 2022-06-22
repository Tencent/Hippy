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
package com.tencent.mtt.hippy.uimanager;

import android.view.View;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.views.list.IRecycleItemTypeChange;
import java.util.Map;

@SuppressWarnings({"deprecation", "unused"})
public class ListItemRenderNode extends RenderNode {

    public static final String ITEM_VIEW_TYPE = "type";
    public static final String ITEM_STICKY = "sticky";
    public static final String ITEM_VIEW_TYPE_NEW = "itemViewType";

    private boolean mShouldSticky;
    private IRecycleItemTypeChange mRecycleItemTypeChangeListener;

    public ListItemRenderNode(int rootId, int id, @Nullable Map<String, Object> props, @NonNull String className,
            @NonNull ControllerManager componentManager, boolean isLazyLoad) {
        super(rootId, id, props, className, componentManager, isLazyLoad);
        if (props.get(ITEM_STICKY) instanceof Boolean) {
            mShouldSticky = (boolean) mProps.get(ITEM_STICKY);
        }
    }

    /**
     * y值是前端传入的，前端没有复用的概念，所有y是整个list长度的y值，并不是recyclerView的排版的y。 真正意义上面的y是排版到屏幕范围以内的y，也是子view相对于recyclerView的起始位置的y，也就是子view的top
     * 系统的recyclerView在刷新list前，layoutManager会调用anchorInfo.assignFromView，取第一个view计算当前的
     * anchorInfo，如果整个地方把y值修改了，导致anchorInfo会取不对. 这里保证updateLayout不要改变已经挂在到RecyclerView的view的top
     */
    @Override
    public void updateLayout(int x, int y, int w, int h) {
        super.updateLayout(x, y, w, h);
        View renderView = mControllerManager.findView(mRootId, mId);
        mY = renderView != null ? renderView.getTop() : 0;
        if (getParent() != null && mControllerManager != null && mControllerManager.getRenderManager()
                != null) { // 若屏幕内node更新引起了item整体变化，需要通知ListView发起dispatchLayout重排版
            RenderManager renderManager = mControllerManager.getRenderManager();
            if (renderManager != null) {
                renderManager.addUpdateNodeIfNeeded(mRootId, getParent());
            }
        }
    }

    @Override
    public void updateProps(@NonNull Map<String, Object> newProps) {
        int oldType = getTypeFromMap(mProps);
        int newType = getTypeFromMap(newProps);
        if (mRecycleItemTypeChangeListener != null && oldType != newType) {
            mRecycleItemTypeChangeListener.onRecycleItemTypeChanged(oldType, newType, this);
        }
        super.updateProps(newProps);
        Object stickyObj = mProps.get(ITEM_STICKY);
        if (stickyObj instanceof Boolean) {
            mShouldSticky = (Boolean) stickyObj;
        }
    }

    public int getItemViewType() {
        return getTypeFromMap(mProps);
    }

    private int getTypeFromMap(@NonNull Map<String, Object> props) {
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
        return viewType < 0 ? 0 : viewType;
    }

    @Override
    public int indexFromParent() {
        return super.indexFromParent();
    }

    public void setRecycleItemTypeChangeListener(
            IRecycleItemTypeChange recycleItemTypeChangeListener) {
        mRecycleItemTypeChangeListener = recycleItemTypeChangeListener;
    }

    public boolean isPullFooter() {
        return false;
    }

    public boolean isPullHeader() {
        return false;
    }

    public boolean shouldSticky() {
        return mShouldSticky;
    }

    /**
     * 异常情况下，如果view已经存在，需要删除它，前提是view没有parent的情况， 有parent的情况出现在sticky属性的view，当前可能是正在置顶的view，这种是不能调用删除的，是正常情况，
     * hasView为true，通过createView是拿到已经存在的view。
     *
     * @return 是否需要删除view
     */
    public boolean needDeleteExistRenderView() {
        if (mControllerManager.hasView(mRootId, mId)) {
            return mControllerManager.createView(mRootId, mId, mClassName, mProps).getParent()
                    == null;
        }
        return false;
    }

    public boolean isViewExist() {
        return mControllerManager.hasView(mRootId, mId);
    }
}
