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

package com.tencent.renderer.component.drawable;

import android.graphics.Canvas;
import android.graphics.RectF;
import androidx.annotation.NonNull;
import androidx.core.graphics.Insets;

public class NinePatchHelper {

    public static <T> void draw(@NonNull Canvas canvas, @NonNull DrawFunction<T> func, T obj, int srcWidth,
            int srcHeight, float density, RectF contentRegion, Insets insets) {
        assert srcWidth > 0 && srcHeight > 0;
        int centerLeft = (int) (contentRegion.left + insets.left);
        int centerTop = (int) (contentRegion.top + insets.top);
        int centerRight = (int) (contentRegion.right - insets.right);
        int centerBottom = (int) (contentRegion.bottom - insets.bottom);
        float srcInsetsLeft = insets.left / density;
        float srcInsetsTop = insets.top / density;
        float srcInsetsRight = insets.right / density;
        float srcInsetsBottom = insets.bottom / density;
        float scaleX = (centerRight - centerLeft) / (srcWidth - srcInsetsLeft - srcInsetsRight);
        float scaleY = (centerBottom - centerTop) / (srcHeight - srcInsetsTop - srcInsetsBottom);
        // top-left
        canvas.save();
        canvas.clipRect(contentRegion.left, contentRegion.top, centerLeft, centerTop);
        canvas.translate(contentRegion.left, contentRegion.top);
        canvas.scale(density, density);
        func.draw(canvas, obj);
        canvas.restore();
        // top-right
        canvas.save();
        canvas.clipRect(centerRight, contentRegion.top, contentRegion.right, centerTop);
        canvas.scale(density, density, centerRight, contentRegion.top);
        canvas.translate(centerRight + srcInsetsRight - srcWidth, contentRegion.top);
        func.draw(canvas, obj);
        canvas.restore();
        // bottom-left
        canvas.save();
        canvas.clipRect(contentRegion.left, centerBottom, centerLeft, contentRegion.bottom);
        canvas.scale(density, density, contentRegion.left, centerBottom);
        canvas.translate(contentRegion.left, centerBottom + srcInsetsBottom - srcHeight);
        func.draw(canvas, obj);
        canvas.restore();
        // bottom-right
        canvas.save();
        canvas.clipRect(centerRight, centerBottom, contentRegion.right, contentRegion.bottom);
        canvas.scale(density, density, centerRight, centerBottom);
        canvas.translate(centerRight + srcInsetsRight - srcWidth, centerBottom + srcInsetsBottom - srcHeight);
        func.draw(canvas, obj);
        canvas.restore();
        // left
        canvas.save();
        canvas.clipRect(contentRegion.left, centerTop, centerLeft, centerBottom);
        canvas.scale(density, scaleY, contentRegion.left, centerTop);
        canvas.translate(contentRegion.left, centerTop - srcInsetsTop);
        func.draw(canvas, obj);
        canvas.restore();
        // right
        canvas.save();
        canvas.clipRect(centerRight, centerTop, contentRegion.right, centerBottom);
        canvas.scale(density, scaleY, centerRight, centerTop);
        canvas.translate(centerRight + srcInsetsRight - srcWidth, centerTop - srcInsetsTop);
        func.draw(canvas, obj);
        canvas.restore();
        // top
        canvas.save();
        canvas.clipRect(centerLeft, contentRegion.top, centerRight, centerTop);
        canvas.scale(scaleX, density, centerLeft, contentRegion.top);
        canvas.translate(centerLeft - srcInsetsLeft, contentRegion.top);
        func.draw(canvas, obj);
        canvas.restore();
        // bottom
        canvas.save();
        canvas.clipRect(centerLeft, centerBottom, centerRight, contentRegion.bottom);
        canvas.scale(scaleX, density, centerLeft, centerBottom);
        canvas.translate(centerLeft - srcInsetsLeft, centerBottom + srcInsetsBottom - srcHeight);
        func.draw(canvas, obj);
        canvas.restore();
        // center
        canvas.save();
        canvas.clipRect(centerLeft, centerTop, centerRight, centerBottom);
        canvas.scale(scaleX, scaleY, centerLeft, centerTop);
        canvas.translate(centerLeft - srcInsetsLeft, centerTop - srcInsetsTop);
        func.draw(canvas, obj);
        canvas.restore();
    }

    public interface DrawFunction<T> {

        void draw(Canvas canvas, T obj);
    }

}
