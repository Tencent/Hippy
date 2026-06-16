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

    /**
     * Returns {@code true} if {@code this} view, or any of its ancestors up
     * to (but not including) the root view, has a non-identity transform
     * applied via the View RenderNode properties
     * ({@link View#getScaleX}, {@link View#getScaleY},
     * {@link View#getRotation}, {@link View#getRotationX},
     * {@link View#getRotationY}).
     *
     * <p>Why we walk the view tree instead of inspecting the canvas matrix:
     * with hardware-accelerated rendering, the canvas passed into
     * {@code dispatchDraw} is a per-RenderNode RecordingCanvas whose matrix
     * only contains the local translations performed during the current
     * RenderNode's display-list recording; the scale/rotation properties of
     * an ancestor RenderNode are applied later, on the RenderThread, during
     * composition, and never appear in this canvas's matrix. Walking the
     * view tree's logical transform properties gives us the truthful
     * "is anyone scaling me?" answer regardless of whether software or
     * hardware rendering is in effect.
     *
     * <p>This is used to gate the {@link Canvas#saveLayer} fallback in
     * {@link #dispatchDraw(Canvas)}: on older HWUI versions, a {@link
     * Canvas#clipPath} command issued under an ancestor RenderNode that is
     * later scaled does not necessarily compose correctly with that scale.
     * Android's hardware acceleration docs state that before API 28, some
     * Canvas operations were implemented as scale-1.0 textures and then scaled
     * by the GPU; starting from API 28, all drawing operations can scale
     * correctly. Forcing an offscreen layer for the duration of the children
     * draw isolates the clip into a pre-rasterized buffer that is then
     * resampled by the ancestor scale, which is the same way the ancestor
     * scales every other pixel and therefore stays geometrically consistent.
     */
    private boolean hasAncestorOrSelfTransform() {
        View v = this;
        // Walk up until we hit a non-View parent (Window root), null, or the
        // depth guard. A bounded walk keeps dispatchDraw predictable in deeply
        // nested list/item trees while still covering the common transform
        // owners (self, item container, page container, transition wrapper).
        for (int depth = 0; v != null && depth < MAX_TRANSFORM_ANCESTOR_DEPTH; depth++) {
            float sx = v.getScaleX();
            float sy = v.getScaleY();
            float rz = v.getRotation();
            float rx = v.getRotationX();
            float ry = v.getRotationY();
            if (Math.abs(sx - 1f) > TRANSFORM_EPSILON
                    || Math.abs(sy - 1f) > TRANSFORM_EPSILON
                    || Math.abs(rz) > TRANSFORM_EPSILON
                    || Math.abs(rx) > TRANSFORM_EPSILON
                    || Math.abs(ry) > TRANSFORM_EPSILON) {
                return true;
            }
            ViewParent p = v.getParent();
            if (p instanceof View) {
                v = (View) p;
            } else {
                break;
            }
        }
        return false;
    }

    @Override
    protected void dispatchDraw(Canvas canvas) {
        RenderNode node = RenderManager.getRenderNode(this);
        if (node == null) {
            super.dispatchDraw(canvas);
            return;
        }
        boolean clipChildren = getClipChildren();
        Component component = node.getComponent();
        Path roundCornerClipPath = (clipChildren && component != null)
                ? component.getContentRegionPath() : null;
        // Decide whether we need to escape into an offscreen layer to
        // guarantee that rounded-corner clipping composes correctly with any
        // ancestor scale. We do this only when:
        //   1. there is actually a rounded-corner clip to apply, AND
        //   2. this view or one of its ancestors carries a non-trivial scale
        //      or rotation transform.
        // This fallback is limited to Android 8.1 (API 27) and below. API 28
        // is the cutoff because Android's hardware acceleration docs state
        // that Canvas scaling for all drawing operations works from API 28
        // onward.
        // In all other cases the legacy clipPath / clipRect path is kept
        // verbatim, so non-transformed scenes and newer Android versions pay
        // zero extra cost.
        //
        // The layer scope covers exactly the children draw - dispatchDraw is
        // invoked after onDraw, so the BackgroundDrawable shadow has already
        // been recorded into the parent RenderNode's display list and is not
        // intercepted by the layer.
        boolean useOffscreenLayer = roundCornerClipPath != null
                && Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP
                && Build.VERSION.SDK_INT <= Build.VERSION_CODES.O_MR1
                && hasAncestorOrSelfTransform();
        int restoreCount;
        if (useOffscreenLayer) {
            // saveLayer with a null paint creates a transparent offscreen
            // buffer sized to the current clip; subsequent draws are
            // rasterized into that buffer and the buffer is composited back
            // at restore time. The clipPath issued *inside* the layer is
            // applied while rasterizing, before the ancestor scale resamples
            // the buffer, so the resulting rounded-corner mask scales
            // together with every other pixel.
            restoreCount = canvas.saveLayer(0, 0, getRight() - getLeft(),
                    getBottom() - getTop(), null);
            canvas.clipPath(roundCornerClipPath);
        } else {
            restoreCount = canvas.save();
            if (clipChildren) {
                if (roundCornerClipPath != null) {
                    canvas.clipPath(roundCornerClipPath);
                } else {
                    canvas.clipRect(0, 0, getRight() - getLeft(), getBottom() - getTop());
                }
            }
        }
        mDispatchDrawHelper.onDispatchDrawStart(canvas, node);
        super.dispatchDraw(canvas);
        if (mDispatchDrawHelper.isActive()) {
            // Check the remaining non rendered sub nodes, behind the last sub node with host view
            mDispatchDrawHelper.drawNext(this);
        }
        mDispatchDrawHelper.onDispatchDrawEnd();
        canvas.restoreToCount(restoreCount);
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