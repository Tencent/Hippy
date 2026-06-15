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
import android.graphics.PathEffect;
import android.graphics.RectF;
import android.graphics.Region;
import androidx.annotation.ColorInt;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.Px;
import com.tencent.mtt.hippy.utils.LogUtils;
import java.util.List;

public class BackgroundDrawable extends BaseDrawable implements BackgroundHolder {

    private static final String TAG = "BackgroundDrawable";
    private final BorderResolvedInfo mResolvedInfo = new BorderResolvedInfo();
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
    private BorderStyles mBorderStyles;
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
        } else {
            mPaint.reset();
        }
        mPaint.setAntiAlias(true);
        drawShadow(canvas);
        updatePath();
        drawBackgroundColor(canvas);
        drawBorder(canvas);
    }

    public boolean shouldUpdatePath() {
        return mUpdatePathRequired;
    }

    @NonNull
    @Override
    public RectF getContentRegion() {
        updatePath();
        return mResolvedInfo.contentRegion;
    }

    @Nullable
    @Override
    public Path getContentPath() {
        updatePath();
        return mResolvedInfo.hasContentRadius ? mResolvedInfo.borderInsidePath : null;
    }

    @Nullable
    @Override
    public Path getBorderPath() {
        updatePath();
        return mResolvedInfo.hasBorderRadius ? mResolvedInfo.borderOutsidePath : null;
    }

    protected void updatePath() {
        if (!mUpdatePathRequired) {
            return;
        }
        mResolvedInfo.resolve(mRect,
                mBorderWidth, mBorderWidths,
                mBorderRadius, mBorderRadii,
                mBorderColor, mBorderColors,
                mBorderStyle, mBorderStyles);
        mUpdatePathRequired = false;
    }

    protected void drawBackgroundColor(@NonNull Canvas canvas) {
        final Paint paint;
        if (mGradientPaint != null && mGradientPaint.initialize(mRect)) {
            paint = mGradientPaint;
        } else if (mPaint != null && mBackgroundColor != Color.TRANSPARENT) {
            mPaint.setColor(mBackgroundColor);
            mPaint.setStyle(Paint.Style.FILL);
            paint = mPaint;
        } else {
            // no background
            return;
        }

        if (mResolvedInfo.hasBorderRadius) {
            // Prefer Canvas.drawRoundRect over Canvas.drawPath when the four corners
            // share the same radius.
            //
            // drawRoundRect maps to a dedicated HWUI primitive on all supported API
            // levels and is recorded as a vector command in the parent RenderNode's
            // display list, so any ancestor transform (e.g. transform: scale()) is
            // applied as a matrix transform at draw time and the result remains
            // crisp at any scale.
            //
            // drawPath, in contrast, has historically been observed on some
            // older HWUI versions to render arbitrary Path geometry through a
            // path-tessellation cache: the tessellated result may be cached and
            // reused, and on those versions an ancestor RenderNode being scaled
            // later does not necessarily trigger a re-tessellation at the new
            // effective scale, which manifests as blurry / aliased rounded
            // corners. The exact mechanism, the affected version range and
            // OEM coverage are all HWUI implementation details outside of our
            // control, but the observable symptom is reliably absent when the
            // same geometry is drawn via drawRoundRect. We therefore prefer
            // drawRoundRect whenever the geometry can be expressed as a
            // uniform-radius round rect.
            float uniformRadius = mResolvedInfo.getUniformBorderRadius();
            if (uniformRadius >= 0) {
                canvas.drawRoundRect(mRect, uniformRadius, uniformRadius, paint);
            } else {
                // Non-uniform per-corner radii cannot be expressed by drawRoundRect;
                // fall back to the pre-built rounded-rect Path here. This branch may
                // still be affected by the older-HWUI drawPath issue described
                // above, but it is rarely hit in practice.
                assert mResolvedInfo.borderOutsidePath != null;
                canvas.drawPath(mResolvedInfo.borderOutsidePath, paint);
            }
        } else {
            canvas.drawRect(mRect, paint);
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
            canvas.save();
            canvas.clipRect(getBounds());
            float maxRadius = getMaxBorderRadius();
            canvas.drawRoundRect(shadowRect, maxRadius, maxRadius, mShadowPaint);
            canvas.restore();
        }
    }

    protected void drawBorder(@NonNull Canvas canvas) {
        if (!mResolvedInfo.hasVisibleBorder) {
            return;
        }
        // Fast path: the four sides share the same width / color / style (i.e.
        // !drawBorderSideBySide) AND the four corners share the same resolved
        // radius. Under these conditions the border can be expressed exactly as
        // a single stroked round rect along the geometric midline of the band
        // between borderOutsidePath and borderInsidePath, which lets us emit
        // the border as one Canvas.drawRoundRect command.
        //
        // Why a fast path is needed:
        //
        // The general path below relies on
        //     canvas.clipPath(borderOutsidePath);
        //     canvas.clipPath(borderInsidePath, Region.Op.DIFFERENCE);
        //     canvas.drawPath(borderMidlinePath, STROKE);
        // to confine the stroke to the border band. On some older HWUI
        // versions, non-rectangular clipPath - and especially non-INTERSECT
        // clipPath such as Region.Op.DIFFERENCE used here - is not
        // accelerated directly on the GPU; instead the affected RenderNode is
        // rendered into an intermediate offscreen surface so that the clip
        // can be applied via per-pixel masking. Whether the fallback uses an
        // HWUI layer, the path tessellation cache or another mechanism, and
        // exactly which Android versions / OEM builds are affected, are HWUI
        // implementation details outside of our control. What matters here
        // is the observable effect: once the RenderNode's content has been
        // rasterized at its natural size, an ancestor transform such as
        // transform: scale(1.5) can only resample that raster, producing
        // visibly blurry / aliased corners and a border that does not appear
        // to scale together with its parent. This was originally reported
        // on an API 24 device, with an API 31 device rendering correctly;
        // those two data points are the only ones we have actually verified
        // and should not be read as a precise affected-version range.
        //
        // Canvas.drawRoundRect, by contrast, is a first-class HWUI primitive
        // on every supported API level and is recorded into the display list
        // as a vector command, so it is unaffected by the issue above.
        if (!mResolvedInfo.drawBorderSideBySide
                && mResolvedInfo.hasBorderRadius
                && mResolvedInfo.hasContentRadius
                && mResolvedInfo.borderMidlineRect != null) {
            float uniformRadius = mResolvedInfo.getUniformBorderRadius();
            if (uniformRadius >= 0) {
                assert mPaint != null;
                float strokeWidth = mResolvedInfo.strokeWidth.left;
                // Geometry of the fast path:
                //   - borderMidlineRect is the outer rect inset by borderWidth/2
                //     on each side, i.e. the centerline of the border band.
                //   - With strokeWidth = borderWidth, the STROKE expands by
                //     borderWidth/2 on each side of the midline, so the outer
                //     edge of the stroke lands exactly on borderOutsidePath
                //     and the inner edge lands exactly on borderInsidePath.
                //   - The midline radius is therefore (uniformRadius -
                //     borderWidth/2). Within this fast path we already require
                //     !drawBorderSideBySide (equal widths on all four sides)
                //     and a uniform corner radius, under which the
                //     hasContentRadius predicate (see
                //     BorderResolvedInfo#hasContentRadius) reduces to
                //     uniformRadius > borderWidth, so midlineRadius is
                //     strictly positive. The Math.max(0f, ...) is purely
                //     defensive against floating-point rounding when the two
                //     values are extremely close.
                // The stroked round rect therefore tiles exactly the band
                // that the general path would have produced via clipPath,
                // with no clipping required.
                float midlineRadius = Math.max(0f, uniformRadius - strokeWidth * 0.5f);
                mPaint.setStyle(Paint.Style.STROKE);
                mPaint.setStrokeWidth(strokeWidth);
                mPaint.setColor(mResolvedInfo.borderColor.left);
                mPaint.setPathEffect(mResolvedInfo.pathEffect.left);
                canvas.drawRoundRect(mResolvedInfo.borderMidlineRect,
                        midlineRadius, midlineRadius, mPaint);
                return;
            }
        }
        // General path: per-side widths / colors / styles, non-uniform corner
        // radii, or no rounded corners at all. Falls back to the historical
        // clipPath + drawPath implementation. On older HWUI versions this path
        // may still trigger the offscreen-rasterization behavior described
        // above, but in those cases the geometry cannot be reduced to a single
        // drawRoundRect; addressing it would require a more involved rewrite
        // (e.g. building the border band as a closed Path and filling it).
        canvas.save();
        if (mResolvedInfo.hasBorderRadius) {
            canvas.clipPath(mResolvedInfo.borderOutsidePath);
            if (mResolvedInfo.hasContentRadius) {
                canvas.clipPath(mResolvedInfo.borderInsidePath, Region.Op.DIFFERENCE);
            }
        }
        if (!mResolvedInfo.drawBorderSideBySide) {
            assert mPaint != null;
            mPaint.setStyle(Paint.Style.STROKE);
            mPaint.setStrokeWidth(mResolvedInfo.strokeWidth.left);
            mPaint.setColor(mResolvedInfo.borderColor.left);
            mPaint.setPathEffect(mResolvedInfo.pathEffect.left);
            if (mResolvedInfo.hasContentRadius) {
                canvas.drawPath(mResolvedInfo.borderMidlinePath, mPaint);
            } else {
                canvas.drawRect(mResolvedInfo.borderMidlineRect, mPaint);
            }
        } else {
            drawBorderSideInternal(canvas,
                    mResolvedInfo.strokeWidth.left,
                    mResolvedInfo.borderColor.left,
                    mResolvedInfo.pathEffect.left,
                    mResolvedInfo.borderSideMidline.left,
                    mResolvedInfo.borderSideClip.left);
            drawBorderSideInternal(canvas,
                    mResolvedInfo.strokeWidth.top,
                    mResolvedInfo.borderColor.top,
                    mResolvedInfo.pathEffect.top,
                    mResolvedInfo.borderSideMidline.top,
                    mResolvedInfo.borderSideClip.top);
            drawBorderSideInternal(canvas,
                    mResolvedInfo.strokeWidth.right,
                    mResolvedInfo.borderColor.right,
                    mResolvedInfo.pathEffect.right,
                    mResolvedInfo.borderSideMidline.right,
                    mResolvedInfo.borderSideClip.right);
            drawBorderSideInternal(canvas,
                    mResolvedInfo.strokeWidth.bottom,
                    mResolvedInfo.borderColor.bottom,
                    mResolvedInfo.pathEffect.bottom,
                    mResolvedInfo.borderSideMidline.bottom,
                    mResolvedInfo.borderSideClip.bottom);
        }
        canvas.restore();
    }

    private void drawBorderSideInternal(@NonNull Canvas canvas, int strokeWidth, int color,
            @Nullable PathEffect pathEffect, Path borderPath, Path clipPath) {
        if (strokeWidth <= 0) {
            return;
        }
        assert mPaint != null;
        mPaint.setStyle(Paint.Style.STROKE);
        mPaint.setStrokeWidth(strokeWidth);
        mPaint.setColor(color);
        mPaint.setPathEffect(pathEffect);
        canvas.save();
        canvas.clipPath(clipPath);
        canvas.drawPath(borderPath, mPaint);
        canvas.restore();
    }

    public void setBorderStyle(BorderStyle style) {
        mBorderStyle = style;
        if (mBorderStyles != null) {
            mBorderStyles.setBorderStyle(style, BorderSide.ALL);
        }
        mUpdatePathRequired = true;
    }

    public void setBorderStyle(BorderStyle style, BorderSide side) {
        if (mBorderStyles == null) {
            mBorderStyles = new BorderStyles(mBorderStyle);
        }
        mBorderStyles.setBorderStyle(style, side);
        mUpdatePathRequired = true;
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
        mUpdatePathRequired = true;
    }

    public void setBorderColor(@ColorInt int color, BorderSide side) {
        if (mBorderColors == null) {
            mBorderColors = new BorderColor(mBorderColor);
        }
        mBorderColors.setBorderColor(color, side);
        mUpdatePathRequired = true;
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

        public boolean hasSameWidthOnAllSides() {
            return left == top && top == right && right == bottom;
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

        public boolean hasSameRadiusOnAllSides() {
            return topLeft == topRight && topRight == bottomRight && bottomRight == bottomLeft;
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

        public boolean hasSameColorOnAllSides() {
            return left == top && top == right && right == bottom;
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

    public static class BorderStyles {

        public BorderStyle left;
        public BorderStyle top;
        public BorderStyle right;
        public BorderStyle bottom;

        public BorderStyles(BorderStyle style) {
            left = style;
            top = style;
            right = style;
            bottom = style;
        }

        public boolean hasSameStyleOnAllSides() {
            return left == top && top == right && right == bottom;
        }

        public void setBorderStyle(BorderStyle style, BorderSide side) {
            switch (side) {
                case LEFT:
                    left = style;
                    break;
                case TOP:
                    top = style;
                    break;
                case RIGHT:
                    right = style;
                    break;
                case BOTTOM:
                    bottom = style;
                    break;
                case ALL:
                    left = style;
                    top = style;
                    right = style;
                    bottom = style;
                    break;
                default:
                    LogUtils.w(TAG, "setBorderStyle: Unknown side: " + side);
            }
        }
    }
}
