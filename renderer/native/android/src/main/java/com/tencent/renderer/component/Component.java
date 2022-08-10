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

import android.content.res.ColorStateList;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Rect;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.Drawable;

import android.graphics.drawable.LayerDrawable;
import android.graphics.drawable.RippleDrawable;
import android.os.Build;
import android.text.Layout;
import android.view.ViewGroup;
import androidx.annotation.ColorInt;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.Px;
import com.tencent.mtt.hippy.uimanager.RenderNode;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.renderer.component.drawable.BackgroundDrawable;
import com.tencent.renderer.component.drawable.BackgroundDrawable.BorderArc;
import com.tencent.renderer.component.drawable.BackgroundDrawable.BorderSide;
import com.tencent.renderer.component.drawable.BackgroundDrawable.BorderStyle;
import com.tencent.renderer.component.drawable.ContentDrawable;
import com.tencent.renderer.component.drawable.TextDrawable;
import java.lang.ref.WeakReference;
import java.util.List;
import java.util.Map;

public class Component implements Drawable.Callback {

    private static final String PROPERTY_RIPPLE_COLOR = "color";
    private static final String PROPERTY_RIPPLE_RADIUS = "rippleRadius";
    private static final String PROPERTY_RIPPLE_BORDERLESS = "borderless";

    @Nullable
    protected BackgroundDrawable mBackgroundDrawable;
    @Nullable
    protected ContentDrawable mContentDrawable;
    @Nullable
    protected RippleDrawable mRippleDrawable;
    @Nullable
    protected TextDrawable mTextDrawable;
    @Nullable
    protected LayerDrawable mLayerDrawable;
    protected Rect mBounds = new Rect();
    protected final WeakReference<RenderNode> mHostRef;
    private boolean mHasDrawableEnsured = false;

    public Component(RenderNode node) {
        mHostRef = new WeakReference<>(node);
    }

    public void onDraw(@NonNull Canvas canvas, Rect bounds) {
        boolean isPathChanged = false;
        canvas.save();
        canvas.clipRect(bounds);
        // Draw background
        if (mBackgroundDrawable != null) {
            // Should get the status of whether the path needs to be updated before draw background,
            // it will be reset after the background has been drawn.
            isPathChanged = mBackgroundDrawable.shouldUpdatePath();
            mBackgroundDrawable.setBounds(bounds);
            mBackgroundDrawable.draw(canvas);
        }
        // Draw content of image
        if (mContentDrawable != null) {
            mContentDrawable.setBounds(bounds);
            mContentDrawable.onPathChanged(isPathChanged);
            mContentDrawable.draw(canvas);
        }
        // Draw text
        if (mTextDrawable != null) {
            mTextDrawable.setBounds(bounds);
            mTextDrawable.draw(canvas);
        }
        canvas.restore();
    }

    protected void invalidate() {
        if (mHostRef.get() != null) {
            mHostRef.get().invalidate();
        }
    }

    protected void postInvalidateDelayed(long delayMilliseconds) {
        if (mHostRef.get() != null) {
            mHostRef.get().postInvalidateDelayed(delayMilliseconds);
        }
    }

    @Override
    public void invalidateDrawable(@NonNull Drawable who) {
        invalidate();
    }

    /**
     * A Drawable can call this to schedule the next frame of its animation.
     * this method is currently used to trigger the rendering of GIF images.
     */
    @Override
    public void scheduleDrawable(@NonNull Drawable who, @NonNull Runnable what, long when) {
        postInvalidateDelayed(when);
    }

    @Override
    public void unscheduleDrawable(@NonNull Drawable who, @NonNull Runnable what) {

    }

    protected void onHostViewAttachedToWindow() {
        // Stub method.
    }

    /**
     * On render node detached from host view
     *
     * <p>When the recycler view scrolls, this method is called when the ID is reused.
     * @see com.tencent.renderer.component.FlatViewGroup#onReplaceId(int, int, int)
     */
    public void onDetachedFromHostView() {
        if (mContentDrawable != null) {
            mContentDrawable.reset();
        }
    }

    /**
     * On render node attached to new host view
     *
     * <p>When the recycler view scrolls, this method is called when the ID is reused.
     * @see com.tencent.renderer.component.FlatViewGroup#onReplaceId(int, int, int)
     */
    public void onAttachedToHostView() {
        // Stub method.
    }

    /**
     * Get background layer drawable
     *
     * <p>At present, display RippleDrawable by setting the view background, it may not be the best
     * implementation, because we cannot flatten the view for ripple effect.
     *
     * @return the background drawable {@link LayerDrawable}
     */
    @Nullable
    public Drawable getBackground() {
        if (mRippleDrawable == null) {
            mLayerDrawable = null;
            return null;
        }
        if (mLayerDrawable == null || mHasDrawableEnsured) {
            Drawable[] drawables = new Drawable[]{mBackgroundDrawable, mContentDrawable,
                    mRippleDrawable};
            mLayerDrawable = new LayerDrawable(drawables);
        }
        mHasDrawableEnsured = false;
        return mLayerDrawable;
    }

    @Nullable
    public RippleDrawable getRippleDrawable() {
        return mRippleDrawable;
    }

    public void ensureRippleDrawable(@Nullable Map params) {
        if (params == null || params.isEmpty()) {
            mRippleDrawable = null;
            mLayerDrawable = null;
            return;
        }
        int color = Color.BLUE;
        int radius = 0;
        Drawable mask = null;
        Object value = params.get(PROPERTY_RIPPLE_COLOR);
        if (value instanceof Number) {
            color = ((Number) value).intValue();
        }
        value = params.get(PROPERTY_RIPPLE_RADIUS);
        if (value instanceof Number) {
            double rd = ((Number) value).doubleValue();
            radius = (int) (PixelUtil.dp2px(rd) + 0.5);
        }
        value = params.get(PROPERTY_RIPPLE_BORDERLESS);
        if (value == null || (value instanceof Boolean && !((boolean) value))) {
            mask = new ColorDrawable(Color.WHITE);
        }
        ColorStateList colorStateList =
                new ColorStateList(new int[][]{new int[]{}}, new int[]{color});
        mRippleDrawable = new RippleDrawable(colorStateList, null, mask);
        if (android.os.Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && radius > 0) {
            mRippleDrawable.setRadius(radius);
        }
        mHasDrawableEnsured = true;
    }

    @Nullable
    public BackgroundDrawable getBackgroundDrawable() {
        return mBackgroundDrawable;
    }

    @NonNull
    private BackgroundDrawable ensureBackgroundDrawable() {
        if (mBackgroundDrawable == null) {
            mBackgroundDrawable = new BackgroundDrawable();
            if (mContentDrawable != null) {
                mContentDrawable.setBackgroundHolder(mBackgroundDrawable);
            }
            if (mTextDrawable != null) {
                mTextDrawable.setBackgroundHolder(mBackgroundDrawable);
            }
            mHasDrawableEnsured = true;
        }
        return mBackgroundDrawable;
    }

    @Nullable
    public ContentDrawable getContentDrawable() {
        return mContentDrawable;
    }

    @NonNull
    public ContentDrawable ensureContentDrawable() {
        if (mContentDrawable == null) {
            mContentDrawable = new ContentDrawable();
            mContentDrawable.setCallback(this);
            mContentDrawable.setBackgroundHolder(mBackgroundDrawable);
            mHasDrawableEnsured = true;
        }
        return mContentDrawable;
    }

    @Nullable
    public TextDrawable getTextDrawable() {
        return mTextDrawable;
    }

    @NonNull
    public TextDrawable ensureTextDrawable() {
        if (mTextDrawable == null) {
            mTextDrawable = new TextDrawable();
            mTextDrawable.setBackgroundHolder(mBackgroundDrawable);
            mHasDrawableEnsured = true;
        }
        return mTextDrawable;
    }

    @Nullable
    public Layout getTextLayout() {
        return mTextDrawable != null ? mTextDrawable.getTextLayout() : null;
    }

    public void setTextLayout(@NonNull Object layout) {
        ensureTextDrawable().setTextLayout(layout);
    }

    public void setBackgroundColor(@ColorInt int color) {
        ensureBackgroundDrawable().setBackgroundColor(color);
    }

    public void setBorderStyle(BorderStyle style) {
        ensureBackgroundDrawable().setBorderStyle(style);
    }

    public void setBorderRadius(@Px float radius) {
        ensureBackgroundDrawable().setBorderRadius(radius);
    }

    public void setTopLeftBorderRadius(@Px float radius) {
        ensureBackgroundDrawable().setBorderRadius(radius, BorderArc.TOP_LEFT);
    }

    public void setTopRightBorderRadius(@Px float radius) {
        ensureBackgroundDrawable().setBorderRadius(radius, BorderArc.TOP_RIGHT);
    }

    public void setBottomRightBorderRadius(@Px float radius) {
        ensureBackgroundDrawable().setBorderRadius(radius, BorderArc.BOTTOM_RIGHT);
    }

    public void setBottomLeftBorderRadius(@Px float radius) {
        ensureBackgroundDrawable().setBorderRadius(radius, BorderArc.BOTTOM_LEFT);
    }

    public void setBorderWidth(@Px float width) {
        ensureBackgroundDrawable().setBorderWidth(width);
    }

    public void setLeftBorderWidth(@Px float width) {
        ensureBackgroundDrawable().setBorderWidth(width, BorderSide.LEFT);
    }

    public void setTopBorderWidth(@Px float width) {
        ensureBackgroundDrawable().setBorderWidth(width, BorderSide.TOP);
    }

    public void setRightBorderWidth(@Px float width) {
        ensureBackgroundDrawable().setBorderWidth(width, BorderSide.RIGHT);
    }

    public void setBottomBorderWidth(@Px float width) {
        ensureBackgroundDrawable().setBorderWidth(width, BorderSide.BOTTOM);
    }

    public void setBorderColor(@ColorInt int color) {
        ensureBackgroundDrawable().setBorderColor(color);
    }

    public void setLeftBorderColor(@ColorInt int color) {
        ensureBackgroundDrawable().setBorderColor(color, BorderSide.LEFT);
    }

    public void setTopBorderColor(@ColorInt int color) {
        ensureBackgroundDrawable().setBorderColor(color, BorderSide.TOP);
    }

    public void setRightBorderColor(@ColorInt int color) {
        ensureBackgroundDrawable().setBorderColor(color, BorderSide.RIGHT);
    }

    public void setBottomBorderColor(@ColorInt int color) {
        ensureBackgroundDrawable().setBorderColor(color, BorderSide.BOTTOM);
    }

    public void setGradientAngleDesc(@NonNull String angleDesc) {
        ensureBackgroundDrawable().setGradientAngleDesc(angleDesc);
    }

    public void setGradientColors(@NonNull List<Integer> colors) {
        ensureBackgroundDrawable().setGradientColors(colors);
    }

    public void setGradientPositions(@NonNull List<Float> positions) {
        ensureBackgroundDrawable().setGradientPositions(positions);
    }

    public void setShadowOffsetX(@Px float x) {
        ensureBackgroundDrawable().setShadowOffsetX(x);
    }

    public void setShadowOffsetY(@Px float y) {
        ensureBackgroundDrawable().setShadowOffsetY(y);
    }

    public void setShadowOpacity(float opacity) {
        ensureBackgroundDrawable().setShadowOpacity(opacity);
    }

    public void setShadowRadius(@Px float radius) {
        ensureBackgroundDrawable().setShadowRadius(Math.abs(radius));
    }

    public void setShadowColor(@ColorInt int color) {
        ensureBackgroundDrawable().setShadowColor(color);
    }
}
