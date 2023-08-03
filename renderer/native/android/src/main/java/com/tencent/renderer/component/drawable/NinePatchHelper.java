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

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Movie;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.NinePatchDrawable;
import androidx.annotation.NonNull;
import androidx.core.graphics.Insets;
import com.tencent.mtt.hippy.utils.ContextHolder;
import com.tencent.mtt.hippy.utils.PixelUtil;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;

public class NinePatchHelper {

    public static NinePatchDrawable createNinePatchDrawable(Bitmap bitmap, Insets insets) {
        int scaledWidth = Math.round(PixelUtil.dp2px(bitmap.getWidth()));
        int scaledHeight = Math.round(PixelUtil.dp2px(bitmap.getHeight()));
        Bitmap scaled = Bitmap.createScaledBitmap(bitmap, scaledWidth, scaledHeight, true);
        return new NinePatchDrawable(ContextHolder.getAppContext().getResources(), scaled,
                NinePatchHelper.createNinePatchTrunk(scaled, insets), null, null);
    }

    private static byte[] createNinePatchTrunk(Bitmap bitmap, Insets insets) {
        int[] xRegions = new int[]{insets.left, bitmap.getWidth() - insets.right};
        int[] yRegions = new int[]{insets.top, bitmap.getHeight() - insets.bottom};
        int NO_COLOR = 0x00000001;
        int colorSize = 9;
        int bufferSize = xRegions.length * 4 + yRegions.length * 4 + colorSize * 4 + 32;

        ByteBuffer byteBuffer = ByteBuffer.allocate(bufferSize).order(ByteOrder.nativeOrder());
        // 第一个byte，要不等于0
        byteBuffer.put((byte) 1);

        //mDivX length
        byteBuffer.put((byte) 2);
        //mDivY length
        byteBuffer.put((byte) 2);
        //mColors length
        byteBuffer.put((byte) colorSize);

        //skip
        byteBuffer.putInt(0);
        byteBuffer.putInt(0);

        //padding 先设为0
        byteBuffer.putInt(0);
        byteBuffer.putInt(0);
        byteBuffer.putInt(0);
        byteBuffer.putInt(0);

        //skip
        byteBuffer.putInt(0);

        // mDivX
        byteBuffer.putInt(xRegions[0]);
        byteBuffer.putInt(xRegions[1]);

        // mDivY
        byteBuffer.putInt(yRegions[0]);
        byteBuffer.putInt(yRegions[1]);

        // mColors
        for (int i = 0; i < colorSize; i++) {
            byteBuffer.putInt(NO_COLOR);
        }

        return byteBuffer.array();
    }

    public static void drawGif(@NonNull Canvas canvas, @NonNull Movie movie, Paint paint, RectF contentRegion,
            Insets insets) {
        int srcWidth = movie.width();
        int srcHeight = movie.height();
        int centerLeft = Math.round(contentRegion.left + insets.left);
        int centerTop = Math.round(contentRegion.top + insets.top);
        int centerRight = Math.round(contentRegion.right - insets.right);
        int centerBottom = Math.round(contentRegion.bottom - insets.bottom);
        float scaleX = (float) (centerRight - centerLeft) / (srcWidth - insets.left - insets.right);
        float scaleY = (float) (centerBottom - centerTop) / (srcHeight - insets.top - insets.bottom);
        // top-left
        canvas.save();
        canvas.clipRect(contentRegion.left, contentRegion.top, centerLeft, centerTop);
        movie.draw(canvas, contentRegion.left, contentRegion.top, paint);
        canvas.restore();
        // top-right
        canvas.save();
        canvas.clipRect(centerRight, contentRegion.top, contentRegion.right, centerTop);
        movie.draw(canvas, contentRegion.right - srcWidth, contentRegion.top, paint);
        canvas.restore();
        // bottom-left
        canvas.save();
        canvas.clipRect(contentRegion.left, centerBottom, centerLeft, contentRegion.bottom);
        movie.draw(canvas, contentRegion.left, contentRegion.bottom - srcHeight, paint);
        canvas.restore();
        // bottom-right
        canvas.save();
        canvas.clipRect(centerRight, centerBottom, contentRegion.right, contentRegion.bottom);
        movie.draw(canvas, contentRegion.right - srcWidth, contentRegion.bottom - srcHeight, paint);
        canvas.restore();
        // left
        canvas.save();
        canvas.clipRect(contentRegion.left, centerTop, centerLeft, centerBottom);
        canvas.scale(1, scaleY, 0, centerTop);
        movie.draw(canvas, contentRegion.left, contentRegion.top, paint);
        canvas.restore();
        // right
        canvas.save();
        canvas.clipRect(centerRight, centerTop, contentRegion.right, centerBottom);
        canvas.scale(1, scaleY, 0, centerTop);
        movie.draw(canvas, contentRegion.right - srcWidth, contentRegion.top, paint);
        canvas.restore();
        // top
        canvas.save();
        canvas.clipRect(centerLeft, contentRegion.top, centerRight, centerTop);
        canvas.scale(scaleX, 1, centerLeft, 0);
        movie.draw(canvas, contentRegion.left, contentRegion.top, paint);
        canvas.restore();
        // bottom
        canvas.save();
        canvas.clipRect(centerLeft, centerBottom, centerRight, contentRegion.bottom);
        canvas.scale(scaleX, 1, centerLeft, 0);
        movie.draw(canvas, contentRegion.left, contentRegion.bottom - srcHeight, paint);
        canvas.restore();
        // center
        canvas.save();
        canvas.clipRect(centerLeft, centerTop, centerRight, centerBottom);
        canvas.scale(scaleX, scaleY, centerLeft, centerTop);
        movie.draw(canvas, contentRegion.left, contentRegion.top, paint);
        canvas.restore();
    }

    public static void drawDrawable(@NonNull Canvas canvas, @NonNull Drawable drawable, RectF contentRegion,
            Insets insets) {
        int srcWidth = Math.round(PixelUtil.dp2px(drawable.getIntrinsicWidth()));
        int srcHeight = Math.round(PixelUtil.dp2px(drawable.getIntrinsicHeight()));
        assert srcWidth > 0 && srcHeight > 0;
        drawable.setBounds(0, 0, srcWidth, srcHeight);
        int centerLeft = Math.round(contentRegion.left + insets.left);
        int centerTop = Math.round(contentRegion.top + insets.top);
        int centerRight = Math.round(contentRegion.right - insets.right);
        int centerBottom = Math.round(contentRegion.bottom - insets.bottom);
        float scaleX = (float) (centerRight - centerLeft) / (srcWidth - insets.left - insets.right);
        float scaleY = (float) (centerBottom - centerTop) / (srcHeight - insets.top - insets.bottom);
        // top-left
        canvas.save();
        canvas.clipRect(contentRegion.left, contentRegion.top, centerLeft, centerTop);
        canvas.translate(contentRegion.left, contentRegion.top);
        drawable.draw(canvas);
        canvas.restore();
        // top-right
        canvas.save();
        canvas.clipRect(centerRight, contentRegion.top, contentRegion.right, centerTop);
        canvas.translate(contentRegion.right - srcWidth, contentRegion.top);
        drawable.draw(canvas);
        canvas.restore();
        // bottom-left
        canvas.save();
        canvas.clipRect(contentRegion.left, centerBottom, centerLeft, contentRegion.bottom);
        canvas.translate(contentRegion.left, contentRegion.bottom - srcHeight);
        drawable.draw(canvas);
        canvas.restore();
        // bottom-right
        canvas.save();
        canvas.clipRect(centerRight, centerBottom, contentRegion.right, contentRegion.bottom);
        canvas.translate(contentRegion.right - srcWidth, contentRegion.bottom - srcHeight);
        drawable.draw(canvas);
        canvas.restore();
        // left
        canvas.save();
        canvas.clipRect(contentRegion.left, centerTop, centerLeft, centerBottom);
        canvas.scale(1, scaleY, 0, centerTop);
        canvas.translate(contentRegion.left, contentRegion.top);
        drawable.draw(canvas);
        canvas.restore();
        // right
        canvas.save();
        canvas.clipRect(centerRight, centerTop, contentRegion.right, centerBottom);
        canvas.scale(1, scaleY, 0, centerTop);
        canvas.translate(contentRegion.right - srcWidth, contentRegion.top);
        drawable.draw(canvas);
        canvas.restore();
        // top
        canvas.save();
        canvas.clipRect(centerLeft, contentRegion.top, centerRight, centerTop);
        canvas.scale(scaleX, 1, centerLeft, 0);
        canvas.translate(contentRegion.left, contentRegion.top);
        drawable.draw(canvas);
        canvas.restore();
        // bottom
        canvas.save();
        canvas.clipRect(centerLeft, centerBottom, centerRight, contentRegion.bottom);
        canvas.scale(scaleX, 1, centerLeft, 0);
        canvas.translate(contentRegion.left, contentRegion.bottom - srcHeight);
        drawable.draw(canvas);
        canvas.restore();
        // center
        canvas.save();
        canvas.clipRect(centerLeft, centerTop, centerRight, centerBottom);
        canvas.scale(scaleX, scaleY, centerLeft, centerTop);
        canvas.translate(contentRegion.left, contentRegion.top);
        drawable.draw(canvas);
        canvas.restore();
    }

}
