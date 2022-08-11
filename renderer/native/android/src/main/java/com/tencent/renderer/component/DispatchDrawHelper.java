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
import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.uimanager.RenderNode;

public class DispatchDrawHelper {
    @Nullable
    private Canvas mCanvas;
    private int mDrawIndex;
    private RenderNode mNode;

    public void onDispatchDrawStart(Canvas canvas, @Nullable RenderNode node) {
        mCanvas = canvas;
        mNode = node;
        mDrawIndex = 0;
    }

    public void onDispatchDrawEnd() {
        mCanvas = null;
        mNode = null;
    }

    public boolean isActive() {
        return mCanvas != null && mNode != null && mDrawIndex < mNode.getChildCount();
    }

    public void drawNext() {
        if (mCanvas == null || mNode == null) {
            return;
        }
        int size = mNode.getChildCount();
        for (int i = mDrawIndex; i < size; i++) {
            final RenderNode child = mNode.getChildAt(i);
            if (child == null) {
                continue;
            }
            if (child.getHostView() != null) {
                mDrawIndex = i + 1;
                return;
            }
            Component component = child.getComponent();
            if (component != null) {
                mCanvas.save();
                mCanvas.translate(child.getX(), child.getY());
                component.onDraw(mCanvas, 0, 0, child.getWidth(), child.getHeight());
                mCanvas.restore();
            }
        }
        mDrawIndex = size;
    }
}
