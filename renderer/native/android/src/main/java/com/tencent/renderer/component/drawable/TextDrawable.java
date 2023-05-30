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
import android.graphics.Path;
import android.graphics.PixelFormat;
import android.graphics.Rect;
import android.graphics.RectF;
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
    private final RectF mContentRegion = new RectF();
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

    @Override
    protected void onBoundsChange(Rect bounds) {
        super.onBoundsChange(bounds);
        mContentRegion.set(bounds);
    }

    @Nullable
    public Layout getTextLayout() {
        return mLayout;
    }

    private void updateContentRegionIfNeeded() {
        if (mBackgroundHolder != null) {
            mContentRegion.set(mBackgroundHolder.getContentRectF());
            float borderWidth = mBackgroundHolder.getBorderWidth();
            if (borderWidth > 1.0f) {
                mContentRegion.inset(borderWidth, borderWidth);
            }
        }
    }

    @Override
    public void draw(@NonNull Canvas canvas) {
        final int width = getBounds().width();
        final int height = getBounds().height();
        if (width == 0 || height == 0 || mLayout == null) {
            return;
        }
        updateContentRegionIfNeeded();
        final Path borderRadiusPath =
                (mBackgroundHolder != null) ? mBackgroundHolder.getBorderRadiusPath() : null;
        canvas.save();
        if (borderRadiusPath != null) {
            canvas.clipPath(borderRadiusPath);
        } else {
            canvas.clipRect(mContentRegion);
        }
        canvas.translate(getTextLayoutOffsetX(), getTextLayoutOffsetY());
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

    public float getTextLayoutOffsetX() {
        if (mLayout == null) {
            return 0;
        }
        final int width = getBounds().width();
        final float borderWidth = (mBackgroundHolder != null) ? mBackgroundHolder.getBorderWidth() : 0.0f;
        switch (mLayout.getAlignment()) {
            case ALIGN_CENTER:
                return (width - mLayout.getWidth()) / 2.0f;
            case ALIGN_OPPOSITE:
                return width - mRightPadding - borderWidth - mLayout.getWidth();
            default:
                return mLeftPadding + borderWidth;
        }
    }

    public float getTextLayoutOffsetY() {
        if (mLayout == null) {
            return 0;
        }
        final float borderWidth = (mBackgroundHolder != null) ? mBackgroundHolder.getBorderWidth() : 0.0f;
        return mTopPadding + borderWidth;
    }
}
