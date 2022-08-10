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
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RectF;
import androidx.annotation.ColorInt;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.Px;
import com.tencent.mtt.hippy.utils.LogUtils;
import java.util.List;

public class BackgroundDrawable extends BaseDrawable implements BackgroundHolder {

    private static final String TAG = "BackgroundDrawable";
    private int mBackgroundColor = Color.TRANSPARENT;
    private int mBorderWidth = 0;
    private int mBorderColor = Color.TRANSPARENT;
    private float mBorderRadius = 0.0f;
    private BorderStyle mBorderStyle = BorderStyle.SOLID;
    @Nullable
    private Paint mPaint;
    @Nullable
    private BorderRadius mBorderRadii;
    @Nullable
    private BorderWidth mBorderWidths;
    @Nullable
    private BorderColor mBorderColors;
    @Nullable
    private Path mBorderPath;
    @Nullable
    private Path mBorderRadiusPath;
    @Nullable
    private GradientPaint mGradientPaint;

    public enum BorderArc {
        TOP_LEFT,
        TOP_RIGHT,
        BOTTOM_RIGHT,
        BOTTOM_LEFT,
        ALL
    }

    public enum BorderSide {
        LEFT,
        TOP,
        RIGHT,
        BOTTOM,
        ALL
    }

    public enum BorderStyle {
        NONE,
        SOLID,
        DOTTED,
        DASHED
    }

    @Override
    public void draw(@NonNull Canvas canvas) {
        if (getBounds().width() == 0 || getBounds().height() == 0) {
            return;
        }
        if (mPaint == null) {
            mPaint = new Paint();
        }
        mPaint.reset();
        drawShadow(canvas);
        updatePath();
        if (hasBorderRadius()) {
            drawBackgroundColorWithRadius(canvas);
            drawBorderWithRadius(canvas);
        } else {
            drawBackgroundColor(canvas);
            drawBorder(canvas);
        }
    }

    public boolean shouldUpdatePath() {
        return mUpdatePathRequired;
    }

    @Override
    public RectF getContentRectF() {
        return mRect;
    }

    @Nullable
    public Path getBorderRadiusPath() {
        return mBorderRadiusPath;
    }

    @Override
    @Nullable
    public BorderRadius getBorderRadii() {
        return mBorderRadii;
    }

    @Override
    public float getBorderRadius() {
        return mBorderRadius;
    }

    @Override
    public int getBorderWidth() {
        return mBorderWidth;
    }

    @Override
    public boolean hasBorderRadius() {
        if (mBorderRadius > 0) {
            return true;
        }
        return mBorderRadii != null && (mBorderRadii.bottomRight > 0 || mBorderRadii.topRight > 0
                || mBorderRadii.bottomLeft > 0 || mBorderRadii.topLeft > 0);
    }

    private boolean hasTransparentBorderColor() {
        if (mBorderColor == Color.TRANSPARENT && mBorderColors == null) {
            return true;
        }
        return mBorderColors != null && mBorderColors.left == Color.TRANSPARENT
                && mBorderColors.top == Color.TRANSPARENT
                && mBorderColors.right == Color.TRANSPARENT
                && mBorderColors.bottom == Color.TRANSPARENT;
    }

    private boolean hasSingleBorderColor() {
        if (mBorderColors == null && mBorderColor != Color.TRANSPARENT) {
            return true;
        }
        return mBorderColors != null && mBorderColors.left == mBorderColors.top
                && mBorderColors.top == mBorderColors.right
                && mBorderColors.right == mBorderColors.bottom;
    }

    protected void updatePath() {
        if (!mUpdatePathRequired) {
            return;
        }
        if (mBorderRadiusPath == null) {
            mBorderRadiusPath = new Path();
        } else {
            mBorderRadiusPath.reset();
        }
        final RectF rect = new RectF(mRect);
        if (mBorderWidth > 1) {
            rect.inset(mBorderWidth, mBorderWidth);
        }
        final float topLeft = (mBorderRadii != null) ? mBorderRadii.topLeft : mBorderRadius;
        final float topRight = (mBorderRadii != null) ? mBorderRadii.topRight : mBorderRadius;
        final float bottomRight = (mBorderRadii != null) ? mBorderRadii.bottomRight : mBorderRadius;
        final float bottomLeft = (mBorderRadii != null) ? mBorderRadii.bottomLeft : mBorderRadius;
        mBorderRadiusPath.addRoundRect(rect,
                new float[]{topLeft, topLeft, topRight, topRight, bottomRight, bottomRight,
                        bottomLeft, bottomLeft}, Path.Direction.CW);
        mUpdatePathRequired = false;
    }

    protected void drawBackgroundColor(@NonNull Canvas canvas) {
        if (mGradientPaint != null && mGradientPaint.initialize(mRect)) {
            canvas.drawRect(mRect, mGradientPaint);
        } else if (mPaint != null) {
            mPaint.setColor(mBackgroundColor);
            mPaint.setStyle(Paint.Style.FILL);
            canvas.drawRect(mRect, mPaint);
        }
    }

    protected void drawBackgroundColorWithRadius(@NonNull Canvas canvas) {
        if (mGradientPaint != null && mGradientPaint.initialize(mRect)) {
            canvas.drawPath(mBorderRadiusPath, mGradientPaint);
        } else if (mPaint != null) {
            mPaint.setColor(mBackgroundColor);
            mPaint.setStyle(Paint.Style.FILL);
            canvas.drawPath(mBorderRadiusPath, mPaint);
        }
    }

    private float getMaxBorderRadius() {
        float maxRadius = mBorderRadius;
        if (mBorderRadii != null) {
            if (mBorderRadii.topLeft > maxRadius) {
                maxRadius = mBorderRadii.topLeft;
            }
            if (mBorderRadii.topRight > maxRadius) {
                maxRadius = mBorderRadii.topRight;
            }
            if (mBorderRadii.bottomRight > maxRadius) {
                maxRadius = mBorderRadii.bottomRight;
            }
            if (mBorderRadii.bottomLeft > maxRadius) {
                maxRadius = mBorderRadii.bottomLeft;
            }
        }
        return maxRadius;
    }

    protected void drawShadow(@NonNull Canvas canvas) {
        if (mShadowPaint == null) {
            return;
        }
        RectF shadowRect = mShadowPaint.initialize(getBounds());
        if (shadowRect != null) {
            float maxRadius = getMaxBorderRadius();
            canvas.drawRoundRect(shadowRect, maxRadius, maxRadius, mShadowPaint);
        }
    }

    protected void drawBorder(@NonNull Canvas canvas) {
        if (mBorderStyle == BorderStyle.NONE || hasTransparentBorderColor()) {
            return;
        }
        final int leftWidth = (mBorderWidths == null) ? mBorderWidth : mBorderWidths.left;
        final int topWidth = (mBorderWidths == null) ? mBorderWidth : mBorderWidths.top;
        final int rightWidth = (mBorderWidths == null) ? mBorderWidth : mBorderWidths.right;
        final int bottomWidth = (mBorderWidths == null) ? mBorderWidth : mBorderWidths.bottom;
        if (leftWidth == 0 && topWidth == 0 && rightWidth == 0 && bottomWidth == 0) {
            return;
        }
        final int leftColor = (mBorderColors == null) ? mBorderColor : mBorderColors.left;
        final int topColor = (mBorderColors == null) ? mBorderColor : mBorderColors.top;
        final int rightColor = (mBorderColors == null) ? mBorderColor : mBorderColors.right;
        final int bottomColor = (mBorderColors == null) ? mBorderColor : mBorderColors.bottom;
        float top = mRect.top;
        float left = mRect.left;
        float width = mRect.width();
        float height = mRect.height();
        if (mBorderPath == null) {
            mBorderPath = new Path();
        }
        assert mPaint != null;
        if (leftWidth > 0 && leftColor != Color.TRANSPARENT) {
            mPaint.setColor(leftColor);
            mBorderPath.reset();
            mBorderPath.moveTo(left, top);
            mBorderPath.lineTo(left + leftWidth, top + topWidth);
            mBorderPath.lineTo(left + leftWidth, top + height - bottomWidth);
            mBorderPath.lineTo(left, top + height);
            mBorderPath.lineTo(left, top);
            canvas.drawPath(mBorderPath, mPaint);
        }
        if (topWidth > 0 && topColor != Color.TRANSPARENT) {
            mPaint.setColor(topColor);
            mBorderPath.reset();
            mBorderPath.moveTo(left, top);
            mBorderPath.lineTo(left + leftWidth, top + topWidth);
            mBorderPath.lineTo(left + width - rightWidth, top + topWidth);
            mBorderPath.lineTo(left + width, top);
            mBorderPath.lineTo(left, top);
            canvas.drawPath(mBorderPath, mPaint);
        }
        if (rightWidth > 0 && rightColor != Color.TRANSPARENT) {
            mPaint.setColor(rightColor);
            mBorderPath.reset();
            mBorderPath.moveTo(left + width, top);
            mBorderPath.lineTo(left + width, top + height);
            mBorderPath.lineTo(left + width - rightWidth, top + height - bottomWidth);
            mBorderPath.lineTo(left + width - rightWidth, top + topWidth);
            mBorderPath.lineTo(left + width, top);
            canvas.drawPath(mBorderPath, mPaint);
        }
        if (bottomWidth > 0 && bottomColor != Color.TRANSPARENT) {
            mPaint.setColor(bottomColor);
            mBorderPath.reset();
            mBorderPath.moveTo(left, top + height);
            mBorderPath.lineTo(left + width, top + height);
            mBorderPath.lineTo(left + width - rightWidth, top + height - bottomWidth);
            mBorderPath.lineTo(left + leftWidth, top + height - bottomWidth);
            mBorderPath.lineTo(left, top + height);
            canvas.drawPath(mBorderPath, mPaint);
        }
    }

    private void drawLeftBorderWithRadiusAndColor(@NonNull Canvas canvas,
            float topLeft, float bottomLeft, int color, float halfWidth) {
        if (color == Color.TRANSPARENT || mBorderPath == null) {
            return;
        }
        assert mPaint != null;
        mPaint.setColor(color);
        mBorderPath.reset();
        mBorderPath.moveTo(mRect.left + halfWidth, mRect.top + topLeft);
        mBorderPath.lineTo(mRect.left + halfWidth, mRect.bottom - bottomLeft);
        mBorderPath.addArc(
                mRect.left + halfWidth,
                mRect.top + halfWidth,
                mRect.left + 2 * topLeft - halfWidth,
                mRect.top + 2 * topLeft - halfWidth,
                -180, 45);
        mBorderPath.addArc(
                mRect.left + halfWidth,
                mRect.bottom - 2 * bottomLeft + halfWidth,
                mRect.left + 2 * bottomLeft - halfWidth,
                mRect.bottom - halfWidth,
                135, 45);
        canvas.drawPath(mBorderPath, mPaint);
    }

    private void drawTopBorderWithRadiusAndColor(@NonNull Canvas canvas,
            float topLeft, float topRight, int color, float halfWidth) {
        if (color == Color.TRANSPARENT || mBorderPath == null) {
            return;
        }
        assert mPaint != null;
        mPaint.setColor(color);
        mBorderPath.reset();
        mBorderPath.moveTo(mRect.left + topLeft, mRect.top + halfWidth);
        mBorderPath.lineTo(mRect.right - topRight, mRect.top + halfWidth);
        mBorderPath.addArc(
                mRect.left + halfWidth,
                mRect.top + halfWidth,
                mRect.left + 2 * topLeft - halfWidth,
                mRect.top + 2 * topLeft - halfWidth,
                -135, 45);
        mBorderPath.addArc(
                mRect.right - 2 * topRight + halfWidth,
                mRect.top + halfWidth,
                mRect.right - halfWidth,
                mRect.top + 2 * topRight - halfWidth,
                -90, 45);
        canvas.drawPath(mBorderPath, mPaint);
    }

    private void drawRightBorderWithRadiusAndColor(@NonNull Canvas canvas,
            float topRight, float bottomRight, int color, float halfWidth) {
        if (color == Color.TRANSPARENT || mBorderPath == null) {
            return;
        }
        assert mPaint != null;
        mPaint.setColor(color);
        mBorderPath.reset();
        mBorderPath.moveTo(mRect.right - halfWidth, mRect.top + topRight);
        mBorderPath.lineTo(mRect.right - halfWidth, mRect.bottom - bottomRight);
        mBorderPath.addArc(
                mRect.right - 2 * bottomRight + halfWidth,
                mRect.bottom - 2 * bottomRight + halfWidth,
                mRect.right - halfWidth,
                mRect.bottom - halfWidth,
                -0, 45);
        mBorderPath.addArc(
                mRect.right - 2 * topRight + halfWidth,
                mRect.top + halfWidth,
                mRect.right - halfWidth,
                mRect.top + 2 * topRight - halfWidth,
                -45, 45);
        canvas.drawPath(mBorderPath, mPaint);
    }

    private void drawBottomBorderWithRadiusAndColor(@NonNull Canvas canvas,
            float bottomLeft, float bottomRight, int color, float halfWidth) {
        if (color == Color.TRANSPARENT || mBorderPath == null) {
            return;
        }
        assert mPaint != null;
        mPaint.setColor(color);
        mBorderPath.reset();
        mBorderPath.moveTo(mRect.left + bottomLeft, mRect.bottom - halfWidth);
        mBorderPath.lineTo(mRect.right - bottomRight, mRect.bottom - halfWidth);
        mBorderPath.addArc(
                mRect.right - 2 * bottomRight + halfWidth,
                mRect.bottom - 2 * bottomRight + halfWidth,
                mRect.right - halfWidth,
                mRect.bottom - halfWidth,
                45, 45);
        mBorderPath.addArc(
                mRect.left + halfWidth,
                mRect.bottom - 2 * bottomLeft + halfWidth,
                mRect.left + 2 * bottomLeft - halfWidth,
                mRect.bottom - halfWidth,
                90, 45);
        canvas.drawPath(mBorderPath, mPaint);
    }

    private void drawBorderWithRadiusAndColor(@NonNull Canvas canvas) {
        if (mBorderRadii == null || mBorderColors == null) {
            return;
        }
        if (mBorderPath == null) {
            mBorderPath = new Path();
        }
        float halfWidth = mBorderWidth / 2.0f;
        drawLeftBorderWithRadiusAndColor(canvas, mBorderRadii.topLeft, mBorderRadii.bottomLeft,
                mBorderColors.left, halfWidth);
        drawTopBorderWithRadiusAndColor(canvas, mBorderRadii.topLeft, mBorderRadii.topRight,
                mBorderColors.top, halfWidth);
        drawRightBorderWithRadiusAndColor(canvas, mBorderRadii.topRight, mBorderRadii.bottomRight,
                mBorderColors.right, halfWidth);
        drawBottomBorderWithRadiusAndColor(canvas, mBorderRadii.bottomLeft,
                mBorderRadii.bottomRight, mBorderColors.bottom, halfWidth);
    }

    protected void drawBorderWithRadius(@NonNull Canvas canvas) {
        if (mBorderStyle == BorderStyle.NONE || mBorderWidth == 0 || hasTransparentBorderColor()) {
            return;
        }
        assert mPaint != null;
        mPaint.setStyle(Paint.Style.STROKE);
        mPaint.setStrokeWidth(mBorderWidth);
        if (hasSingleBorderColor()) {
            int borderColor = (mBorderColors != null) ? mBorderColors.left : mBorderColor;
            mPaint.setColor(borderColor);
            canvas.drawPath(mBorderRadiusPath, mPaint);
        } else {
            drawBorderWithRadiusAndColor(canvas);
        }
    }

    public void setBorderStyle(BorderStyle style) {
    }

    public void setBorderRadius(@Px float radius) {
        mBorderRadius = Math.max(radius, 0.0f);
        if (mBorderRadii != null) {
            mBorderRadii.setBorderRadius(mBorderRadius, BorderArc.ALL);
        }
        mUpdatePathRequired = true;
    }

    public void setBorderRadius(@Px float radius, BorderArc arc) {
        if (mBorderRadii == null) {
            mBorderRadii = new BorderRadius(mBorderRadius);
        }
        mBorderRadii.setBorderRadius(Math.max(radius, 0.0f), arc);
        mUpdatePathRequired = true;
    }

    public void setBorderWidth(@Px float width) {
        mBorderWidth = Math.max(Math.round(width), 0);
        if (mBorderWidths != null) {
            mBorderWidths.setBorderWith(mBorderWidth, BorderSide.ALL);
        }
        mUpdatePathRequired = true;
    }

    public void setBorderWidth(@Px float width, BorderSide side) {
        if (mBorderWidths == null) {
            mBorderWidths = new BorderWidth(mBorderWidth);
        }
        mBorderWidths.setBorderWith(Math.max(Math.round(width), 0), side);
        mUpdatePathRequired = true;
    }

    public void setBorderColor(@ColorInt int color) {
        mBorderColor = color;
        if (mBorderColors != null) {
            mBorderColors.setBorderColor(color, BorderSide.ALL);
        }
    }

    public void setBorderColor(@ColorInt int color, BorderSide side) {
        if (mBorderColors == null) {
            mBorderColors = new BorderColor(mBorderColor);
        }
        mBorderColors.setBorderColor(color, side);
    }

    public void setBackgroundColor(@ColorInt int color) {
        mBackgroundColor = color;
    }

    @NonNull
    private GradientPaint ensureGradientPaint() {
        if (mGradientPaint == null) {
            mGradientPaint = new GradientPaint();
        }
        return mGradientPaint;
    }

    public void setGradientAngleDesc(@NonNull String angleDesc) {
        ensureGradientPaint().setGradientAngleDesc(angleDesc);
    }

    public void setGradientColors(@NonNull List<Integer> colors) {
        ensureGradientPaint().setGradientColors(colors);
    }

    public void setGradientPositions(@NonNull List<Float> positions) {
        ensureGradientPaint().setGradientPositions(positions);
    }

    public void setShadowOffsetX(@Px float offsetX) {
        ensureShadowPaint().setShadowOffsetX(offsetX);
    }

    public void setShadowOffsetY(@Px float offsetY) {
        ensureShadowPaint().setShadowOffsetY(offsetY);
    }

    public void setShadowRadius(@Px float radius) {
        ensureShadowPaint().setShadowRadius(radius);
    }

    public void setShadowOpacity(float opacity) {
        ensureShadowPaint().setShadowOpacity(opacity);
    }

    public void setShadowColor(@ColorInt int color) {
        ensureShadowPaint().setShadowColor(color);
    }

    @SuppressWarnings("SuspiciousNameCombination")
    public static class BorderWidth {

        public int left;
        public int top;
        public int right;
        public int bottom;

        public BorderWidth(@Px int width) {
            left = width;
            top = width;
            right = width;
            bottom = width;
        }

        public void setBorderWith(@Px int width, BorderSide side) {
            switch (side) {
                case LEFT:
                    left = width;
                    break;
                case TOP:
                    top = width;
                    break;
                case RIGHT:
                    right = width;
                    break;
                case BOTTOM:
                    bottom = width;
                    break;
                case ALL:
                    left = width;
                    top = width;
                    right = width;
                    bottom = width;
                    break;
                default:
                    LogUtils.w(TAG, "setBorderWith: Unknown side: " + side);
            }
        }
    }

    public static class BorderRadius {

        public float topLeft;
        public float topRight;
        public float bottomRight;
        public float bottomLeft;

        public BorderRadius(@Px float radius) {
            topLeft = radius;
            topRight = radius;
            bottomRight = radius;
            bottomLeft = radius;
        }

        public void setBorderRadius(@Px float radius, BorderArc arc) {
            switch (arc) {
                case TOP_LEFT:
                    topLeft = radius;
                    break;
                case TOP_RIGHT:
                    topRight = radius;
                    break;
                case BOTTOM_RIGHT:
                    bottomRight = radius;
                    break;
                case BOTTOM_LEFT:
                    bottomLeft = radius;
                    break;
                case ALL:
                    topLeft = radius;
                    topRight = radius;
                    bottomRight = radius;
                    bottomLeft = radius;
                    break;
                default:
                    LogUtils.w(TAG, "setBorderRadius: Unknown arc: " + arc);
            }
        }
    }

    public static class BorderColor {

        public int left;
        public int top;
        public int right;
        public int bottom;

        public BorderColor(@ColorInt int color) {
            left = color;
            top = color;
            right = color;
            bottom = color;
        }

        public void setBorderColor(@ColorInt int color, BorderSide side) {
            switch (side) {
                case LEFT:
                    left = color;
                    break;
                case TOP:
                    top = color;
                    break;
                case RIGHT:
                    right = color;
                    break;
                case BOTTOM:
                    bottom = color;
                    break;
                case ALL:
                    left = color;
                    top = color;
                    right = color;
                    bottom = color;
                    break;
                default:
                    LogUtils.w(TAG, "setBorderColor: Unknown side: " + side);
            }
        }
    }
}
