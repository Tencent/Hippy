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

import static com.tencent.renderer.NativeRenderException.ExceptionCode.ON_BIND_VIEW_HOLDER_ERR;
import static com.tencent.renderer.NativeRenderException.ExceptionCode.ON_CREATE_VIEW_HOLDER_ERR;

import android.text.TextUtils;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.mtt.hippy.uimanager.RenderManager;
import com.tencent.mtt.hippy.views.list.HippyListItemView;
import com.tencent.mtt.hippy.views.list.IRecycleItemTypeChange;
import com.tencent.renderer.NativeRenderException;
import com.tencent.renderer.utils.MapUtils;
import java.util.List;
import java.util.Map;

public class ListItemRenderNode extends RenderNode {

    private static final String TAG = "ListItemRenderNode";
    public static final String ITEM_VIEW_TYPE = "type";
    public static final String ITEM_STICKY = "sticky";
    public static final String ITEM_VIEW_TYPE_NEW = "itemViewType";
    private int mLeft;
    private int mTop;
    private boolean mShouldSticky;
    private IRecycleItemTypeChange mRecycleItemTypeChangeListener;

    public ListItemRenderNode(int rootId, int id, @Nullable Map<String, Object> props,
            @NonNull String className, @NonNull ControllerManager componentManager,
            boolean isLazyLoad) {
        super(rootId, id, props, className, componentManager, isLazyLoad);
        if (props != null) {
            mShouldSticky = MapUtils.getBooleanValue(props, ITEM_STICKY);
        }
    }

    private void removeChildrenView(RenderNode node) {
        for (int i = 0; i < node.getChildCount(); i++) {
            RenderNode child = node.getChildAt(i);
            if (child != null) {
                mControllerManager.deleteChild(child.getRootId(), node.getId(), child.getId(),
                        true);
            }
        }
    }

    private void removeView() {
        RenderNode parentNode = getParent();
        if (parentNode != null) {
            mControllerManager.deleteChild(mRootId, parentNode.getId(), mId, true);
        } else {
            mControllerManager.deleteChildRecursive(mRootId, null, getHostView(), true);
        }
    }

    @Nullable
    public View onCreateViewHolder() throws NativeRenderException {
        View view;
        if (mShouldSticky) {
            view = mControllerManager.findView(mRootId, mId);
            if (view != null && view.getParent() != null) {
                // If the sticky item is mounted to an external container, we should not
                // repeatedly create a child view of the item, and directly return null.
                return null;
            }
        }
        setLazy(false);
        view = prepareHostViewRecursive();
        mountHostViewRecursive();
        if (view == null) {
            throw new NativeRenderException(
                    ON_CREATE_VIEW_HOLDER_ERR, "View creation failed!");
        }
        return view;
    }

    public void onViewHolderDetached() {
        View hostView = getHostView();
        if (hostView instanceof HippyListItemView) {
            ((HippyListItemView) hostView).moveToExposureState(HippyListItemView.EXPOSURE_STATE_INVISIBLE);
        }
    }

    public void onViewHolderAbandoned() {
        setLazy(true);
        removeView();
    }

    public void onBindViewHolder(@NonNull View itemView) {
        if (itemView.getId() != mId) {
            return;
        }
        View hostView = getHostView();
        if (hostView == null) {
            mControllerManager.addView(mRootId, itemView);
            setHostView(itemView);
            setLazy(false);
            prepareHostViewRecursive();
            mountHostViewRecursive();
        }
    }

    public void onBindViewHolder(@NonNull RenderNode fromNode, @NonNull View itemView) {
        if (!TextUtils.equals(fromNode.getClassName(), mClassName)
                || fromNode.getId() != itemView.getId()) {
            NativeRenderException exception = new NativeRenderException(
                    ON_BIND_VIEW_HOLDER_ERR,
                    "Cannot complete binding with from class name: " + fromNode.getClassName()
                            + ", to class name: " + mClassName + ", from id " + fromNode.getId()
                            + ", item view id " + itemView.getId());
            mControllerManager.getNativeRender().handleRenderException(exception);
            return;
        }
        if (getHostView() instanceof ViewGroup) {
            // Due to the hippy recycler view default use stable ID, toNode do not have a host view
            // under normal scrolling conditions. However, if there are list switching and move node
            // scenarios, toNode may has a host view and the subview is not empty, so the subview
            // must be cleared and recreated, otherwise it cannot be mounted to the new itemView,
            // causing the item view to display blank.
            int count = ((ViewGroup) getHostView()).getChildCount();
            if (count > 0) {
                removeChildrenView(this);
            }
        }
        removeChildrenView(fromNode);
        fromNode.setLazy(true);
        setLazy(false);
        mControllerManager.replaceId(mRootId, itemView, mId, true);
        prepareHostViewRecursive();
        setHostView(itemView);
        Map<String, Object> diffProps = checkPropsShouldReset(fromNode);
        mControllerManager.updateProps(this, null, null, diffProps, true);
        mountHostViewRecursive();
    }

    public int getLeft() {
        return mLeft;
    }

    public int getTop() {
        return mTop;
    }

    @Override
    public void onZIndexChanged() {
        // List view items do not need to support changes to z index
    }

    @Override
    public void updateLayout(int x, int y, int w, int h) {
        super.updateLayout(x, y, w, h);
        mLeft = x;
        mTop = y;
        View view = mControllerManager.findView(mRootId, mId);
        mX = view != null ? view.getLeft() : 0;
        mY = view != null ? view.getTop() : 0;
        if (getParent() != null) {
            RenderManager renderManager = mControllerManager.getRenderManager();
            if (renderManager != null) {
                renderManager.addUpdateNodeIfNeeded(mRootId, getParent());
            }
        }
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
        Object stickyObj = mProps.get(ITEM_STICKY);
        if (stickyObj instanceof Boolean) {
            mShouldSticky = (Boolean) stickyObj;
        }
    }

    public int getItemViewType() {
        return mProps != null ? getItemViewType(mProps) : 0;
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

    @Override
    public boolean shouldSticky() {
        return mShouldSticky;
    }
}
