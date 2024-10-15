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
import android.graphics.BitmapShader;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.ColorFilter;
import android.graphics.Matrix;
import android.graphics.Movie;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.PixelFormat;
import android.graphics.PorterDuff;
import android.graphics.PorterDuff.Mode;
import android.graphics.PorterDuffColorFilter;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.Shader;
import android.graphics.drawable.Animatable;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.NinePatchDrawable;
import androidx.annotation.ColorInt;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.Px;
import androidx.core.graphics.Insets;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.renderer.component.image.ImageDataSupplier;

public class ContentDrawable extends Drawable {

    private static final Runnable NO_OP = () -> {};
    private int mTintColor;
    private int mImagePositionX;
    private int mImagePositionY;
    private ScaleType mScaleType = ScaleType.FIT_XY;
    private PorterDuff.Mode mTintColorBlendMode = Mode.SRC_ATOP;
    private final RectF mContentRegion = new RectF();
    private final Matrix mBitmapMatrix = new Matrix();
    @Nullable
    private Paint mPaint;
    @Nullable
    private ImageDataSupplier mImageHolder;
    @Nullable
    private GifMovieState mGifMovieState;
    @Nullable
    private BackgroundHolder mBackgroundHolder;
    @Nullable
    private Insets mNinePatchInsets;
    @Nullable
    private NinePatchHelper.DrawFunction<?> mNinePatchDrawFunc;
    @Nullable
    private PorterDuffColorFilter mColorFilter;
    @Nullable
    private Shader mShader;

    public enum ScaleType {
        FIT_XY,
        CENTER,
        CENTER_INSIDE,
        CENTER_CROP,
        ORIGIN,
        REPEAT
    }

    public void setBackgroundHolder(@Nullable BackgroundHolder holder) {
        mBackgroundHolder = holder;
    }

    @Override
    public void setBounds(int left, int top, int right, int bottom) {
        super.setBounds(left, top, right, bottom);
        if (mImageHolder != null && mImageHolder.getDrawable() != null) {
            mImageHolder.getDrawable().setBounds(left, top, right, bottom);
        }
    }

    @Override
    protected void onBoundsChange(Rect bounds) {
        super.onBoundsChange(bounds);
        mContentRegion.set(bounds);
        if (mGifMovieState != null) {
            mGifMovieState.updateRequired = true;
        }
    }

    public void onPathChanged(boolean changed) {
        if (mGifMovieState != null) {
            mGifMovieState.updateRequired |= changed;
        }
    }

    @Override
    public int getOpacity() {
        return PixelFormat.UNKNOWN;
    }

    @Override
    public void setAlpha(int alpha) {
        // Stub method.
    }

    @Override
    public void setColorFilter(ColorFilter colorFilter) {
        // Stub method.
    }

    public void clear() {
        mGifMovieState = null;
        mImageHolder = null;
        mNinePatchDrawFunc = null;
        mShader = null;
    }

    public void setImageData(@NonNull ImageDataSupplier imageHolder) {
        mImageHolder = imageHolder;
        mNinePatchDrawFunc = null;
        mShader = null;
    }

    private void updateContentRegionIfNeeded() {
        if (mBackgroundHolder != null) {
            mContentRegion.set(mBackgroundHolder.getContentRegion());
        }
    }

    @Override
    public void draw(@NonNull Canvas canvas) {
        if (getBounds().width() == 0 || getBounds().height() == 0 || mImageHolder == null) {
            return;
        }
        updateContentRegionIfNeeded();
        final Path contentPath = (mBackgroundHolder != null) ? mBackgroundHolder.getContentPath() : null;
        canvas.save();
        if (contentPath != null) {
            canvas.clipPath(contentPath);
        } else {
            canvas.clipRect(mContentRegion);
        }
        if (mColorFilter == null && mTintColor != Color.TRANSPARENT) {
            mColorFilter = new PorterDuffColorFilter(mTintColor, mTintColorBlendMode);
        }
        if (mImageHolder.getDrawable() != null) {
            drawDrawable(canvas, mImageHolder.getDrawable());
        } else if (mImageHolder.isAnimated()) {
            drawGif(canvas, mImageHolder.getGifMovie());
        } else {
            Bitmap bitmap = mImageHolder.getBitmap();
            if (bitmap != null && !bitmap.isRecycled()) {
                drawBitmap(canvas, bitmap);
            }
        }
        canvas.restore();
    }

    private void drawDrawable(@NonNull Canvas canvas, Drawable drawable) {
        final boolean clearColorFilter;
        if (drawable.getColorFilter() == null && mColorFilter != null) {
            clearColorFilter = true;
            drawable.setColorFilter(mColorFilter);
        } else {
            clearColorFilter = false;
        }
        if (drawable instanceof Animatable && !((Animatable) drawable).isRunning()) {
            ((Animatable) drawable).start();
        }
        if (mNinePatchInsets != null && !mNinePatchInsets.equals(Insets.NONE)
                && !(drawable instanceof NinePatchDrawable)
                && drawable.getIntrinsicWidth() > 0
                && drawable.getIntrinsicHeight() > 0
        ) {
            @SuppressWarnings("unchecked")
            NinePatchHelper.DrawFunction<Drawable> func = (NinePatchHelper.DrawFunction<Drawable>) mNinePatchDrawFunc;
            if (func == null) {
                mNinePatchDrawFunc = func = (c, d) -> d.draw(c);
            }
            drawable.setBounds(0, 0, drawable.getIntrinsicWidth(), drawable.getIntrinsicHeight());
            NinePatchHelper.draw(canvas, func, drawable, drawable.getIntrinsicWidth(), drawable.getIntrinsicHeight(),
                    PixelUtil.getDensity(), mContentRegion, mNinePatchInsets);
        } else {
            drawable.draw(canvas);
        }
        if (clearColorFilter) {
            drawable.setColorFilter(null);
        }
    }

    private void updateBitmapMatrix(@NonNull Bitmap bitmap) {
        final RectF dst = new RectF(mContentRegion);
        final float bitmapWidth = bitmap.getWidth();
        final float bitmapHeight = bitmap.getHeight();
        final float width = dst.width();
        final float height = dst.height();
        final float xScale = width / bitmapWidth;
        final float yScale = height / bitmapHeight;
        ScaleType scaleType = mScaleType;
        if (scaleType == ScaleType.CENTER && (bitmapWidth > width || bitmapHeight > height)) {
            scaleType = ScaleType.CENTER_INSIDE;
        }
        switch (scaleType) {
            case ORIGIN:
                dst.bottom = bitmapHeight;
                dst.right = bitmapWidth;
                break;
            case CENTER:
                dst.top += (height - bitmapHeight) / 2;
                dst.bottom = dst.top + bitmapHeight;
                dst.left += (width - bitmapWidth) / 2;
                dst.right = dst.left + bitmapWidth;
                break;
            case CENTER_INSIDE:
                if (xScale > yScale) {
                    dst.left += ((width - bitmapWidth * yScale) / 2);
                    dst.right = dst.left + (bitmapWidth * yScale);
                } else {
                    dst.top += ((height - bitmapHeight * xScale) / 2);
                    dst.bottom = dst.top + bitmapHeight * xScale;
                }
                break;
            case CENTER_CROP:
                float cropScale = Math.max(xScale, yScale);
                dst.top += ((height - bitmapHeight * cropScale) / 2);
                dst.bottom = dst.top + (bitmapHeight * cropScale);
                dst.left += ((width - bitmapWidth * cropScale) / 2);
                dst.right = dst.left + (bitmapWidth * cropScale);
                break;
        }
        dst.top += mImagePositionY;
        dst.bottom += mImagePositionY;
        dst.left += mImagePositionX;
        dst.right += mImagePositionX;
        mBitmapMatrix.setRectToRect(
                new RectF(0, 0, bitmap.getWidth(), bitmap.getHeight()),
                dst, Matrix.ScaleToFit.FILL);
    }

    private void drawBitmap(@NonNull Canvas canvas, @NonNull Bitmap bitmap) {
        if (mNinePatchInsets != null && !mNinePatchInsets.equals(Insets.NONE)) {
            @SuppressWarnings("unchecked")
            NinePatchHelper.DrawFunction<Bitmap> func = (NinePatchHelper.DrawFunction<Bitmap>) mNinePatchDrawFunc;
            if (func == null) {
                mNinePatchDrawFunc = func = (c, b) -> c.drawBitmap(b, 0, 0, getPaint());
            }
            NinePatchHelper.draw(canvas, func, bitmap, bitmap.getWidth(), bitmap.getHeight(), PixelUtil.getDensity(),
                    mContentRegion, mNinePatchInsets);
        } else {
            Paint paint = getPaint();
            updateBitmapMatrix(bitmap);
            if (mScaleType == ScaleType.REPEAT) {
                if (mShader == null) {
                    mShader = new BitmapShader(bitmap, Shader.TileMode.REPEAT, Shader.TileMode.REPEAT);
                }
                paint.setShader(mShader);
            }
            canvas.drawBitmap(bitmap, mBitmapMatrix, paint);
        }
    }

    private Paint getPaint() {
        if (mPaint == null) {
            mPaint = new Paint();
        } else {
            mPaint.reset();
        }
        mPaint.setAntiAlias(true);
        mPaint.setFilterBitmap(true);
        if (mColorFilter != null) {
            mPaint.setColorFilter(mColorFilter);
        }
        return mPaint;
    }

    private void drawGif(@NonNull Canvas canvas, @Nullable Movie movie) {
        if (movie == null) {
            return;
        }
        if (mGifMovieState == null) {
            mGifMovieState = new GifMovieState();
        }
        mGifMovieState.update(mContentRegion, movie);
        int duration = movie.duration();
        if (duration == 0) {
            duration = 1000;
        }
        long now = System.currentTimeMillis();
        if (mGifMovieState.lastPlayTime != -1) {
            mGifMovieState.progress += now - mGifMovieState.lastPlayTime;
            if (mGifMovieState.progress > duration) {
                mGifMovieState.progress = 0;
            }
        }
        mGifMovieState.lastPlayTime = now;
        int progress =
                mGifMovieState.progress > Integer.MAX_VALUE ? 0 : (int) mGifMovieState.progress;
        movie.setTime(progress);
        if (mNinePatchInsets != null && !mNinePatchInsets.equals(Insets.NONE)) {
            @SuppressWarnings("unchecked")
            NinePatchHelper.DrawFunction<Movie> func = (NinePatchHelper.DrawFunction<Movie>) mNinePatchDrawFunc;
            if (func == null) {
                mNinePatchDrawFunc = func = (c, m) -> m.draw(c, 0, 0, getPaint());
            }
            NinePatchHelper.draw(canvas, func, movie, movie.width(), movie.height(), PixelUtil.getDensity(),
                    mContentRegion, mNinePatchInsets);
        } else {
            Paint paint = getPaint();
            canvas.save();
            canvas.scale(mGifMovieState.scaleX, mGifMovieState.scaleY);
            movie.draw(canvas, mGifMovieState.startX, mGifMovieState.startY + 1.0f, paint);
            canvas.restore();
        }
        scheduleSelf(NO_OP, 40);
    }

    public void setScaleType(ScaleType scaleType) {
        mScaleType = scaleType;
        mShader = null;
    }

    public void setImagePositionX(@Px int positionX) {
        mImagePositionX = positionX;
    }

    public void setImagePositionY(@Px int positionY) {
        mImagePositionY = positionY;
    }

    public void setTintColor(@ColorInt int tintColor) {
        mTintColor = tintColor;
        mColorFilter = null;
    }

    public void setTintColorBlendMode(int tintColorBlendMode) {
        mTintColorBlendMode = convertToPorterDuffMode(tintColorBlendMode);
        mColorFilter = null;
    }

    public void setNinePatchCoordinate(Insets insets) {
        mNinePatchInsets = insets;
        mNinePatchDrawFunc = null;
    }

    private Mode convertToPorterDuffMode(int val) {
        switch (val) {
            case 0:
                return Mode.CLEAR;
            case 1:
                return Mode.SRC;
            case 2:
                return Mode.DST;
            case 3:
                return Mode.SRC_OVER;
            case 4:
                return Mode.DST_OVER;
            case 5:
                return Mode.SRC_IN;
            case 6:
                return Mode.DST_IN;
            case 7:
                return Mode.SRC_OUT;
            case 8:
                return Mode.DST_OUT;
            case 10:
                return Mode.DST_ATOP;
            case 11:
                return Mode.XOR;
            case 16:
                return Mode.DARKEN;
            case 17:
                return Mode.LIGHTEN;
            case 13:
                return Mode.MULTIPLY;
            case 14:
                return Mode.SCREEN;
            case 12:
                return Mode.ADD;
            case 15:
                return Mode.OVERLAY;
            case 9:
                // fall through
            default:
                return Mode.SRC_ATOP;
        }
    }

    private class GifMovieState {

        public float startX;
        public float startY;
        public float scaleX = 1;
        public float scaleY = 1;
        public long progress = 0;
        public long lastPlayTime = -1;
        private boolean updateRequired = true;

        public void update(@NonNull RectF dst, @NonNull Movie movie) {
            if (!updateRequired) {
                return;
            }
            startX = 0;
            startY = 0;
            scaleX = 1;
            scaleY = 1;
            if (movie.width() <= 0 || movie.height() <= 0) {
                return;
            }
            scaleX = dst.width() / movie.width();
            scaleY = dst.height() / movie.height();
            switch (mScaleType) {
                case CENTER:
                    // fall through
                case ORIGIN:
                    scaleX = 1;
                    scaleY = 1;
                    break;
                case CENTER_INSIDE:
                    if (scaleX > scaleY) {
                        scaleX = scaleY;
                    } else {
                        scaleY = scaleX;
                    }
                    break;
                case CENTER_CROP:
                    if (scaleX < scaleY) {
                        scaleX = scaleY;
                    } else {
                        scaleY = scaleX;
                    }
                    break;
                default:
                    break;
            }
            if (mScaleType != ScaleType.ORIGIN) {
                startX = (dst.width() / scaleX - movie.width()) / 2.0f;
                startY = (dst.height() / scaleY - movie.height()) / 2.0f;
            }
            updateRequired = false;
        }
    }
}
