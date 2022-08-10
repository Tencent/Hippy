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
import android.graphics.drawable.Drawable;

import androidx.annotation.ColorInt;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.Px;

public class ContentDrawable extends Drawable {

    private int mTintColor;
    private int mImagePositionX;
    private int mImagePositionY;
    private ScaleType mScaleType = ScaleType.FIT_XY;
    private PorterDuff.Mode mTintColorBlendMode = Mode.SRC_ATOP;
    @Nullable
    private Paint mPaint;
    @Nullable
    private Bitmap mContentBitmap;
    @Nullable
    private Movie mGifMovie;
    @Nullable
    private GifMovieState mGifMovieState;
    @Nullable
    private BackgroundHolder mBackgroundHolder;

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
    protected void onBoundsChange(Rect bounds) {
        super.onBoundsChange(bounds);
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

    public void reset() {
        mContentBitmap = null;
        mGifMovie = null;
        mGifMovieState = null;
    }

    public void setContentBitmap(@Nullable Bitmap bitmap) {
        mContentBitmap = bitmap;
    }

    public void setGifMovie(@Nullable Movie gifMovie) {
        mGifMovie = gifMovie;
    }

    private RectF getContentRegion() {
        final RectF contentRegion = new RectF(getBounds());
        if (mBackgroundHolder != null) {
            contentRegion.set(mBackgroundHolder.getContentRectF());
            float borderWidth = mBackgroundHolder.getBorderWidth();
            if (borderWidth > 1.0f) {
                contentRegion.inset(borderWidth - 0.5f, borderWidth - 0.5f);
            }
        }
        return contentRegion;
    }

    @Override
    public void draw(@NonNull Canvas canvas) {
        if (getBounds().width() == 0 || getBounds().height() == 0) {
            return;
        }
        final RectF contentRegion = getContentRegion();
        final Path borderRadiusPath =
                (mBackgroundHolder != null) ? mBackgroundHolder.getBorderRadiusPath() : null;
        canvas.save();
        if (borderRadiusPath != null) {
            canvas.clipPath(borderRadiusPath);
        } else {
            canvas.clipRect(contentRegion);
        }
        if (mContentBitmap != null && !mContentBitmap.isRecycled()) {
            if (mPaint == null) {
                mPaint = new Paint();
            }
            mPaint.setAntiAlias(true);
            if (mTintColor != Color.TRANSPARENT) {
                mPaint.setColorFilter(new PorterDuffColorFilter(mTintColor, mTintColorBlendMode));
            }
            RectF dst = calculateDstRect(contentRegion);
            drawBitmap(canvas, makeBitmapDrawMatrix(dst));
        } else if (mGifMovie != null) {
            drawGif(canvas, contentRegion);
        }
        canvas.restore();
    }

    @NonNull
    private RectF calculateDstRect(RectF dst) {
        assert mContentBitmap != null;
        final float bitmapWidth = mContentBitmap.getWidth();
        final float bitmapHeight = mContentBitmap.getHeight();
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
        return dst;
    }

    @NonNull
    private Matrix makeBitmapDrawMatrix(RectF dst) {
        assert mContentBitmap != null;
        Matrix matrix = new Matrix();
        matrix.setRectToRect(new RectF(0, 0, mContentBitmap.getWidth(), mContentBitmap.getHeight()),
                dst, Matrix.ScaleToFit.FILL);
        return matrix;
    }

    private void drawBitmap(@NonNull Canvas canvas, @NonNull Matrix matrix) {
        assert mContentBitmap != null;
        assert mPaint != null;
        if (mScaleType == ScaleType.REPEAT) {
            BitmapShader bitmapShader = new BitmapShader(mContentBitmap, Shader.TileMode.REPEAT,
                    Shader.TileMode.REPEAT);
            mPaint.setShader(bitmapShader);
        }
        mPaint.setFilterBitmap(true);
        canvas.drawBitmap(mContentBitmap, matrix, mPaint);
    }

    private void drawGif(@NonNull Canvas canvas, @NonNull RectF dst) {
        if (mGifMovieState == null) {
            mGifMovieState = new GifMovieState();
        }
        mGifMovieState.update(dst);
        assert mGifMovie != null;
        int duration = mGifMovie.duration();
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
        mGifMovie.setTime(progress);
        canvas.save();
        canvas.scale(mGifMovieState.scaleX, mGifMovieState.scaleY);
        mGifMovie.draw(canvas, mGifMovieState.startX, mGifMovieState.startY + 1.0f);
        canvas.restore();
        scheduleSelf(new Runnable() {
            @Override
            public void run() {

            }
        }, 40);
    }

    public void setScaleType(ScaleType scaleType) {
        mScaleType = scaleType;
    }

    public void setImagePositionX(@Px int positionX) {
        mImagePositionX = positionX;
    }

    public void setImagePositionY(@Px int positionY) {
        mImagePositionY = positionY;
    }

    public void setTintColor(@ColorInt int tintColor) {
        mTintColor = tintColor;
    }

    public void setTintColorBlendMode(int tintColorBlendMode) {
        mTintColorBlendMode = convertToPorterDuffMode(tintColorBlendMode);
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

        public void update(@NonNull RectF dst) {
            if (!updateRequired) {
                return;
            }
            startX = 0;
            startY = 0;
            scaleX = 1;
            scaleY = 1;
            assert mGifMovie != null;
            if (mGifMovie.width() <= 0 || mGifMovie.height() <= 0) {
                return;
            }
            scaleX = dst.width() / mGifMovie.width();
            scaleY = dst.height() / mGifMovie.height();
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
                startX = (dst.width() / scaleX - mGifMovie.width()) / 2.0f;
                startY = (dst.height() / scaleY - mGifMovie.height()) / 2.0f;
            }
            updateRequired = false;
        }
    }
}
