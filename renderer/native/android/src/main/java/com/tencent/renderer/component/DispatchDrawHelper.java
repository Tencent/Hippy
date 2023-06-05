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

import android.graphics.Canvas;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.tencent.renderer.node.RenderNode;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;

public class DispatchDrawHelper {

    private int mDrawIndex;
    @Nullable
    private Canvas mCanvas;
    @Nullable
    private RenderNode mNode;
    /** Render order of nodes from new order according to zIndex attribute. */
    @NonNull
    private ArrayList<RenderNode> mDrawingOrder;

    public void onDispatchDrawStart(Canvas canvas, @NonNull RenderNode node) {
        mCanvas = canvas;
        mNode = node;
        mDrawIndex = 0;
        mDrawingOrder = node.getDrawingOrder();
    }

    public void onDispatchDrawEnd() {
        mCanvas = null;
        mNode = null;
    }

    public boolean isActive() {
        return mCanvas != null && mNode != null && mDrawIndex < mNode.getChildCount();
    }

    public int drawNext(@NonNull ViewGroup parent) {
        if (mCanvas == null || mNode == null) {
            return -1;
        }
        int size = mDrawingOrder.size();
        for (int i = mDrawIndex; i < size; i++) {
            final RenderNode child = mDrawingOrder.get(i);
            if (child == null) {
                continue;
            }
            // If child has host view, just record draw index and return index of child.
            if (child.getHostView() != null) {
                mDrawIndex = i + 1;
                return parent.indexOfChild(child.getHostView());
            }
            Component component = child.getComponent();
            if (component != null) {
                mCanvas.save();
                // The coordinate origin needs to be translated to the upper left corner of
                // the sub view before drawing.
                mCanvas.translate(child.getX(), child.getY());
                component.onDraw(mCanvas, 0, 0, child.getWidth(), child.getHeight());
                mCanvas.restore();
            }
        }
        mDrawIndex = size;
        return -1;
    }
}
