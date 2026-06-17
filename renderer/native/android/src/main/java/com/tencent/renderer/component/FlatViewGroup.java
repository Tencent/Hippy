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
import android.graphics.Path;
import android.graphics.Rect;
import android.os.Build;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;

import com.tencent.mtt.hippy.uimanager.RenderManager;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.renderer.node.RenderNode;

/**
 * FlatViewGroup designed for base class of Hippy image view, Hippy view and Hippy text view,
 * this base class is mainly responsible for the flattening rendering of child nodes.
 */
public class FlatViewGroup extends ViewGroup {

    private static final String TAG = "FlatViewGroup";
    private static final float TRANSFORM_EPSILON = 1e-4f;
    private static final int MAX_TRANSFORM_ANCESTOR_DEPTH = 20;
    // UI thread only: Android View drawing is expected to be single-threaded, so this
    // static counter is only used to avoid nested offscreen layers within one draw pass.
    private static int sOffscreenLayerDepth = 0;
    private final DispatchDrawHelper mDispatchDrawHelper = new DispatchDrawHelper();
    // Reused during draw() to avoid allocation. Safe under the same UI-thread-only
    // drawing assumption as sOffscreenLayerDepth.
    private final Rect mLayerBounds = new Rect();

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

    private boolean hasAncestorOrSelfTransform() {
        View view = this;
        for (int depth = 0; view != null && depth < MAX_TRANSFORM_ANCESTOR_DEPTH; depth++) {
            float sx = view.getScaleX();
            float sy = view.getScaleY();
            float rz = view.getRotation();
            float rx = view.getRotationX();
            float ry = view.getRotationY();
            if (Math.abs(sx - 1f) > TRANSFORM_EPSILON
                    || Math.abs(sy - 1f) > TRANSFORM_EPSILON
                    || Math.abs(rz) > TRANSFORM_EPSILON
                    || Math.abs(rx) > TRANSFORM_EPSILON
                    || Math.abs(ry) > TRANSFORM_EPSILON) {
                return true;
            }
            ViewParent parent = view.getParent();
            if (parent instanceof View) {
                view = (View) parent;
            } else {
                break;
            }
        }
        return false;
    }

    private boolean shouldDrawInOffscreenLayer() {
        // Keep the ancestor transform walk on the old-HWUI fallback path only. Newer
        // Android versions handle Canvas scaling for complex drawing operations, so
        // they can short-circuit before hasAncestorOrSelfTransform().
        return sOffscreenLayerDepth == 0
                && getWidth() > 0
                && getHeight() > 0
                && Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP
                && Build.VERSION.SDK_INT <= Build.VERSION_CODES.O_MR1
                && hasAncestorOrSelfTransform();
    }

    @Override
    public void draw(Canvas canvas) {
        RenderNode node = RenderManager.getRenderNode(this);
        if (node == null) {
            super.draw(canvas);
            return;
        }
        boolean clipChildren = getClipChildren();
        Component component = node.getComponent();
        Path roundCornerClipPath = (component != null) ? component.getContentRegionPath() : null;
        boolean useOffscreenLayer = shouldDrawInOffscreenLayer();
        int restoreCount = -1;
        if (useOffscreenLayer) {
            canvas.getClipBounds(mLayerBounds);
            restoreCount = canvas.saveLayer(mLayerBounds.left, mLayerBounds.top,
                    mLayerBounds.right, mLayerBounds.bottom, null);
            if (clipChildren) {
                if (roundCornerClipPath != null) {
                    canvas.clipPath(roundCornerClipPath);
                } else {
                    canvas.clipRect(0, 0, getWidth(), getHeight());
                }
            } else {
                // Even without clipping children, the layer is still useful on old
                // HWUI when an ancestor transform is present: it isolates this view's
                // complex/path drawing into one local rasterization step instead of
                // letting nested draws trigger their own scaled texture artifacts.
            }
        } else if (clipChildren) {
            restoreCount = canvas.save();
            if (roundCornerClipPath != null) {
                canvas.clipPath(roundCornerClipPath);
            } else {
                canvas.clipRect(0, 0, getWidth(), getHeight());
            }
        }
        if (useOffscreenLayer) {
            sOffscreenLayerDepth++;
        }
        try {
            super.draw(canvas);
        } finally {
            if (restoreCount >= 0) {
                canvas.restoreToCount(restoreCount);
            }
            if (useOffscreenLayer) {
                sOffscreenLayerDepth--;
            }
        }
    }

    @Override
    protected void dispatchDraw(Canvas canvas) {
        RenderNode node = RenderManager.getRenderNode(this);
        if (node == null) {
            super.dispatchDraw(canvas);
            return;
        }
        mDispatchDrawHelper.onDispatchDrawStart(canvas, node);
        super.dispatchDraw(canvas);
        if (mDispatchDrawHelper.isActive()) {
            // Check the remaining non rendered sub nodes, behind the last sub node with host view
            mDispatchDrawHelper.drawNext(this);
        }
        mDispatchDrawHelper.onDispatchDrawEnd();
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