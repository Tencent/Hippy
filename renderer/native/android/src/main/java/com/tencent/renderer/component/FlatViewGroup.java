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

package com.tencent.renderer.component;

import android.content.Context;
import android.graphics.Canvas;
import android.view.ViewGroup;

import com.tencent.mtt.hippy.uimanager.RenderManager;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.renderer.node.RenderNode;

/**
 * FlatViewGroup designed for base class of Hippy image view, Hippy view and Hippy text view,
 * this base class is mainly responsible for the flattening rendering of child nodes.
 */
public class FlatViewGroup extends ViewGroup {

    private static final String TAG = "FlatViewGroup";
    private final DispatchDrawHelper mDispatchDrawHelper = new DispatchDrawHelper();

    public FlatViewGroup(Context context) {
        super(context);
        setWillNotDraw(false);
        setChildrenDrawingOrderEnabled(true);
        setClipChildren(false);
    }

    public void onBatchComplete() {
        RenderNode node = RenderManager.getRenderNode(this);
        if (node != null && node.getComponent() != null) {
            // If show the ripple effect, should set layer drawable to background.
            setBackground(node.getComponent().getBackground());
        }
    }

    @Override
    protected void onLayout(boolean changed,
            int l, int t, int r, int b) {
    }

    @Override
    public void setClipChildren(boolean clipChildren) {
        super.setClipChildren(clipChildren);
        RenderNode node = RenderManager.getRenderNode(this);
        if (node != null && node.getComponent() != null) {
            node.getComponent().setClipChildren(clipChildren);
        }
    }

    @Override
    protected void onAttachedToWindow() {
        super.onAttachedToWindow();
        RenderNode node = RenderManager.getRenderNode(this);
        if (node != null) {
            LogUtils.d(TAG, "onAttachedToWindow node id " + node.getId() + ", view id " + getId());
            node.onHostViewAttachedToWindow();
        }
    }

    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
    }

    @Override
    protected int getChildDrawingOrder(int childCount, int i) {
        int index = -1;
        if (mDispatchDrawHelper.isActive()) {
            // Go through the children nodes here for flattening rendering
            index = mDispatchDrawHelper.drawNext(this);
        }
        return (index < 0 || index >= getChildCount()) ? i : index;
    }

    @Override
    protected void dispatchDraw(Canvas canvas) {
        RenderNode node = RenderManager.getRenderNode(this);
        if (node == null) {
            super.dispatchDraw(canvas);
            return;
        }
        boolean clipChildren = getClipChildren();
        canvas.save();
        if (clipChildren) {
            Component component = node.getComponent();
            if (component != null && component.getContentRegionPath() != null) {
                canvas.clipPath(component.getContentRegionPath());
            } else {
                canvas.clipRect(0, 0, getRight() - getLeft(), getBottom() - getTop());
            }
        }
        mDispatchDrawHelper.onDispatchDrawStart(canvas, node);
        super.dispatchDraw(canvas);
        if (mDispatchDrawHelper.isActive()) {
            // Check the remaining non rendered sub nodes, behind the last sub node with host view
            mDispatchDrawHelper.drawNext(this);
        }
        mDispatchDrawHelper.onDispatchDrawEnd();
        canvas.restore();
    }

    @Override
    protected void onDraw(Canvas canvas) {
        // If there is already a background drawable, it is no longer necessary to
        // call component draw.
        if (getBackground() != null) {
            return;
        }
        RenderNode node = RenderManager.getRenderNode(this);
        if (node != null) {
            Component component = node.getComponent();
            if (component != null) {
                component.onDraw(canvas, 0, 0, getRight() - getLeft(), getBottom() - getTop());
            }
        }
    }
}
