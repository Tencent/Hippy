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
import android.graphics.ColorFilter;
import android.graphics.Paint;
import android.graphics.PixelFormat;
import android.graphics.drawable.Drawable;

import android.text.Layout;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.renderer.component.text.TextRenderSupplier;

public class TextDrawable extends Drawable {

    private boolean mTextBold = false;
    private int mCustomTextColor = 0;
    private float mLeftPadding;
    private float mRightPadding;
    private float mBottomPadding;
    private float mTopPadding;
    @Nullable
    private Layout mLayout;
    @Nullable
    private BackgroundHolder mBackgroundHolder;

    public void setTextLayout(@NonNull Object obj) {
        if (obj instanceof TextRenderSupplier) {
            mLayout = ((TextRenderSupplier) obj).layout;
            mLeftPadding = ((TextRenderSupplier) obj).leftPadding;
            mRightPadding = ((TextRenderSupplier) obj).rightPadding;
            mBottomPadding = ((TextRenderSupplier) obj).bottomPadding;
            mTopPadding = ((TextRenderSupplier) obj).topPadding;
        } else if (obj instanceof Layout) {
            mLayout = (Layout) obj;
        }
    }

    public void setBackgroundHolder(@Nullable BackgroundHolder holder) {
        mBackgroundHolder = holder;
    }

    @Nullable
    public Layout getTextLayout() {
        return mLayout;
    }

    @Override
    public void draw(@NonNull Canvas canvas) {
        final int width = getBounds().width();
        final int height = getBounds().height();
        if (width == 0 || height == 0 || mLayout == null) {
            return;
        }
        canvas.save();
        float borderWidth = (mBackgroundHolder != null) ? mBackgroundHolder.getBorderWidth() : 0.0f;
        float dx = mLeftPadding + borderWidth;
        float dy = mTopPadding + borderWidth;
        switch (mLayout.getAlignment()) {
            case ALIGN_CENTER:
                dy = (height - mLayout.getHeight()) / 2.0f;
                dx = (width - mLayout.getWidth()) / 2.0f;
                canvas.translate(dx, dy);
                break;
            case ALIGN_OPPOSITE:
                dx = width - mRightPadding - borderWidth
                        - mLayout.getWidth();
                canvas.translate(dx, dy);
                break;
            default:
                canvas.translate(dx, dy);
        }
        Paint paint = mLayout.getPaint();
        if (paint != null) {
            paint.setFakeBoldText(mTextBold);
        }
        mLayout.draw(canvas);
        canvas.restore();
    }

    @Override
    public int getOpacity() {
        return PixelFormat.UNKNOWN;
    }

    @Override
    public void setAlpha(int alpha) {

    }

    @Override
    public void setColorFilter(ColorFilter colorFilter) {

    }
}
