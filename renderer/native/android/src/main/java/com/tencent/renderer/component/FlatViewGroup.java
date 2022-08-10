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
import android.graphics.Rect;
import android.graphics.drawable.LayerDrawable;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.uimanager.RenderNode;
import com.tencent.renderer.NativeRender;
import com.tencent.renderer.NativeRendererManager;

public class FlatViewGroup extends ViewGroup {

    public FlatViewGroup(Context context) {
        super(context);
        setWillNotDraw(false);
        setChildrenDrawingOrderEnabled(true);
        //setClipChildren(false);
    }

    public void onBatchComplete() {
        Component component = getComponent(this);
        if (component != null) {
            // If show the ripple effect, should set layer drawable to background.
            setBackground(component.getBackground());
        }
    }

    /**
     * Replace view id when recycler view item reuse.
     *
     * @param rootId the root node id
     * @param oldId previously bound node id
     * @param oldId the node id to be bound
     */
    public void onReplaceId(int rootId, int oldId, int newId) {
        NativeRender nativeRenderer = NativeRendererManager.getNativeRenderer(getContext());
        if (nativeRenderer == null) {
            return;
        }
        RenderNode node = nativeRenderer.getRenderManager().getRenderNode(rootId, oldId);
        if (node != null) {
            Component component = node.getComponent();
            if (component != null) {
                // Notify component the node has been detached from host view.
                component.onDetachedFromHostView();
            }
        }
        node = nativeRenderer.getRenderManager().getRenderNode(rootId, newId);
        if (node != null) {
            Component component = node.getComponent();
            if (component != null) {
                // Notify component the node will attached to host view.
                component.onAttachedToHostView();
            }
        }
    }

    @Override
    protected void onLayout(boolean changed,
            int l, int t, int r, int b) {
    }

    @Override
    protected void onAttachedToWindow() {
        super.onAttachedToWindow();
        Component component = getComponent(this);
        if (component != null) {
            component.onHostViewAttachedToWindow();
        }
    }

    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
    }

    @Override
    protected void dispatchDraw(Canvas canvas) {
        super.dispatchDraw(canvas);
    }

    @Override
    protected void onDraw(Canvas canvas) {
        // If there is already a background drawable, it is no longer necessary to
        // call component draw.
        if (getBackground() != null) {
            return;
        }
        Component component = getComponent(this);
        if (component != null) {
            Rect bounds = new Rect(0, 0, getRight() - getLeft(), getBottom() - getTop());
            component.onDraw(canvas, bounds);
        }
    }

    @Nullable
    public static Component getComponent(@NonNull View view) {
        NativeRender nativeRenderer = NativeRendererManager.getNativeRenderer(view.getContext());
        if (nativeRenderer != null) {
            RenderNode node = nativeRenderer.getRenderManager().getRenderNode(view);
            if (node != null) {
                return node.getComponent();
            }
        }
        return null;
    }
}
