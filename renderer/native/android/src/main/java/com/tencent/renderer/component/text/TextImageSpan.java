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

package com.tencent.renderer.component.text;

import static com.tencent.renderer.utils.EventUtils.EVENT_IMAGE_LOAD_END;
import static com.tencent.renderer.utils.EventUtils.EVENT_IMAGE_LOAD_ERROR;
import static com.tencent.renderer.utils.EventUtils.EVENT_IMAGE_LOAD_PROGRESS;
import static com.tencent.renderer.utils.EventUtils.EVENT_IMAGE_LOAD_START;
import static com.tencent.renderer.utils.EventUtils.EVENT_IMAGE_ON_LOAD;

import android.annotation.SuppressLint;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.ColorFilter;
import android.graphics.Movie;
import android.graphics.Paint;
import android.graphics.Paint.FontMetricsInt;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffColorFilter;
import android.graphics.Rect;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.os.SystemClock;
import android.text.TextUtils;
import android.text.style.DynamicDrawableSpan;
import android.text.style.ImageSpan;
import androidx.annotation.MainThread;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.utils.ContextHolder;
import com.tencent.mtt.hippy.utils.UIThreadUtils;
import com.tencent.renderer.NativeRender;
import com.tencent.renderer.component.image.ImageDataHolder;
import com.tencent.renderer.component.image.ImageDataSupplier;
import com.tencent.renderer.component.image.ImageLoaderAdapter;
import com.tencent.renderer.component.image.ImageRequestListener;
import com.tencent.renderer.node.ImageVirtualNode;
import com.tencent.renderer.node.VirtualNode;
import com.tencent.renderer.utils.EventUtils.EventType;
import java.lang.ref.WeakReference;
import java.lang.reflect.Field;
import java.util.HashMap;

public class TextImageSpan extends ImageSpan {

    private static final int STATE_UNLOAD = 0;
    private static final int STATE_LOADING = 1;
    private static final int STATE_LOADED = 2;
    private final boolean mUseLegacy;
    @Nullable
    private final String mVerticalAlign;
    private final int mRootId;
    private final int mId;
    private final int mAncestorId;
    private final int mWidth;
    private final int mHeight;
    @Deprecated
    private final int mLeft;
    @Deprecated
    private final int mTop;
    private final int mMarginLeft;
    private final int mMarginTop;
    private final int mMarginRight;
    private final int mMarginBottom;
    private int mMeasuredWidth;
    private int mMeasuredHeight;
    private int mImageLoadState = STATE_UNLOAD;
    private long mGifProgress;
    private long mGifLastPlayTime = -1;
    @NonNull
    private final WeakReference<NativeRender> mNativeRendererRef;
    @Nullable
    private Drawable mSrcDrawable;
    @Nullable
    private Movie mGifMovie;
    @Deprecated
    @Nullable
    private final LegacyIAlignConfig mAlignConfig;
    @Nullable
    private Paint mGifPaint;
    private float mHeightRate = 0;
    @Nullable
    private Paint mBackgroundPaint = null;
    private int mTintColor;
    private final int mAlpha;

    public TextImageSpan(Drawable drawable, String source, @NonNull ImageVirtualNode node,
            @NonNull NativeRender nativeRenderer) {
        super(drawable, source, node.getVerticalAlignment());
        mNativeRendererRef = new WeakReference<>(nativeRenderer);
        mRootId = node.getRootId();
        mId = node.getId();
        mAncestorId = node.getAncestorId();
        mWidth = node.getWidth();
        mHeight = node.getHeight();
        mLeft = node.getLeft();
        mTop = node.getTop();
        mMarginLeft = node.getMarginLeft();
        mMarginRight = node.getMarginRight();
        mMarginTop = node.getMarginTop();
        mMarginBottom = node.getMarginBottom();
        mVerticalAlign = node.getVerticalAlign();
        mUseLegacy = mVerticalAlign == null;
        mAlignConfig = mUseLegacy ? LegacyIAlignConfig.fromVerticalAlignment(node.getVerticalAlignment()) : null;
        mTintColor = node.getTintColor();
        int backgroundColor = node.getBackgroundColor();
        if (backgroundColor != Color.TRANSPARENT) {
            mBackgroundPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
            mBackgroundPaint.setColor(node.getBackgroundColor());
        }
        // multiple alpha bits (0xFF) to convert opacity into alpha
        mAlpha = Math.round(node.getFinalOpacity() * 255);
        setUrl(source);
    }

    public void setUrl(@Nullable final String url) {
        if (TextUtils.isEmpty(url)) {
            return;
        }
        if (UIThreadUtils.isOnUiThread()) {
            loadImageWithUrl(url);
        } else {
            UIThreadUtils.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    loadImageWithUrl(url);
                }
            });
        }
    }

    @Override
    public int getSize(@NonNull Paint paint, CharSequence text, int start, int end,
            @Nullable FontMetricsInt fm) {
        if (mUseLegacy) {
            return legacyGetSize(paint, text, start, end, fm);
        }
        if (mHeightRate > 0) {
            if (mHeight == 0) {
                mMeasuredWidth = mMeasuredHeight = 0;
            } else {
                int textSize = (int) paint.getTextSize();
                mMeasuredHeight = (int) (textSize * mHeightRate);
                mMeasuredWidth = mWidth * mMeasuredHeight / mHeight;
            }
        } else {
            mMeasuredWidth = mWidth;
            mMeasuredHeight = mHeight;
        }
        if (fm != null) {
            fm.top = fm.ascent = -(mMeasuredHeight + mMarginTop + mMarginBottom);
            fm.leading = fm.bottom = fm.descent = 0;
        }

        return mMeasuredWidth + mMarginLeft + mMarginRight;
    }

    private int legacyGetSize(@NonNull Paint paint, CharSequence text, int start, int end,
            @Nullable FontMetricsInt fm) {
        if (mGifMovie != null) {
            return super.getSize(paint, text, start, end, fm);
        }
        Drawable drawable = getDrawable();
        assert mAlignConfig != null;
        return mAlignConfig.getSize(paint, text, start, end, fm, drawable);
    }

    public void draw(@NonNull Canvas canvas, CharSequence text, int start, int end, float x, int top, int y,
            int bottom, @NonNull Paint paint) {
        if (mUseLegacy) {
            legacyDraw(canvas, text, start, end, x, top, y, bottom, paint);
            return;
        }
        if (mMeasuredWidth == 0 || mMeasuredHeight == 0) {
            return;
        }
        int count = canvas.save();
        int transY;
        assert mVerticalAlign != null;
        switch (mVerticalAlign) {
            case VirtualNode.V_ALIGN_TOP:
                transY = top + mMarginTop;
                break;
            case VirtualNode.V_ALIGN_MIDDLE:
                transY = top + (bottom - top) / 2 - mMeasuredHeight / 2;
                break;
            case VirtualNode.V_ALIGN_BOTTOM:
                transY = bottom - mMeasuredHeight - mMarginBottom;
                break;
            case VirtualNode.V_ALIGN_BASELINE:
            default:
                transY = y - mMeasuredHeight - mMarginBottom;
                break;
        }

        canvas.translate(x + mMarginLeft, transY);
        if (mAlpha < 255) {
            canvas.saveLayerAlpha(0, 0, mMeasuredWidth, mMeasuredHeight, mAlpha);
        }
        if (mBackgroundPaint != null) {
            canvas.drawRect(0, 0, mMeasuredWidth, mMeasuredHeight, mBackgroundPaint);
        }
        if (mGifMovie != null) {
            updateGifTime();
            float scaleX = mMeasuredWidth / (float) mGifMovie.width();
            float scaleY = mMeasuredHeight / (float) mGifMovie.height();
            canvas.scale(scaleX, scaleY, 0, 0);
            mGifMovie.draw(canvas, 0, 0, mGifPaint);
            postInvalidateDelayed(40);
        } else {
            Drawable drawable = mSrcDrawable == null ? super.getDrawable() : mSrcDrawable;
            Rect rect = drawable.getBounds();
            float scaleX = mMeasuredWidth / (float) rect.right;
            float scaleY = mMeasuredHeight / (float) rect.bottom;
            canvas.scale(scaleX, scaleY, 0, 0);
            drawable.draw(canvas);
        }
        canvas.restoreToCount(count);
    }

    private void legacyDraw(Canvas canvas, CharSequence text, int start, int end, float x, int top, int y,
            int bottom, Paint paint) {
        int transY;
        Paint.FontMetricsInt fm = paint.getFontMetricsInt();
        if (mGifMovie != null) {
            int width = (mWidth == 0) ? mGifMovie.width() : mWidth;
            int height = (mHeight == 0) ? mGifMovie.height() : mHeight;
            transY = (y + fm.descent + y + fm.ascent) / 2 - height / 2;
            legacyDrawGIF(canvas, x + mLeft, transY + mTop, width, height);
        } else {
            Drawable drawable = getDrawable();
            assert mAlignConfig != null;
            mAlignConfig.draw(canvas, text, start, end, x, top, y, bottom, paint, drawable, mBackgroundPaint);
        }
    }

    @Deprecated
    @SuppressWarnings("unused")
    public void setDesiredSize(int width, int height) {
        if (mUseLegacy) {
            assert mAlignConfig != null;
            mAlignConfig.setDesiredSize(width, height);
        }
    }

    @SuppressWarnings("unused")
    public void setActiveSizeWithRate(float heightRate) {
        mHeightRate = heightRate;
        if (mUseLegacy) {
            assert mAlignConfig != null;
            mAlignConfig.setActiveSizeWithRate(heightRate);
        }
    }

    @Deprecated
    @SuppressWarnings("unused")
    public void setMargin(int marginLeft, int marginRight) {
        if (mUseLegacy) {
            assert mAlignConfig != null;
            mAlignConfig.setMargin(marginLeft, marginRight);
        }
    }

    @MainThread
    private void loadImageWithUrl(@NonNull final String url) {
        final NativeRender nativeRenderer = mNativeRendererRef.get();
        final ImageLoaderAdapter imageLoader = nativeRenderer != null ? nativeRenderer.getImageLoader() : null;
        if (mImageLoadState == STATE_LOADING || imageLoader == null) {
            return;
        }
        nativeRenderer.dispatchEvent(mRootId, mId, EVENT_IMAGE_LOAD_START, null, false, false,
                EventType.EVENT_TYPE_COMPONENT);
        mImageLoadState = STATE_LOADING;
        imageLoader.fetchImageAsync(url, new ImageRequestListener() {
            @Override
            public void onRequestStart(ImageDataSupplier imageData) {
                handleFetchImageStart();
            }

            @Override
            public void onRequestProgress(long total, long loaded) {
                handleFetchImageProgress(total, loaded);
            }

            @Override
            public void onRequestSuccess(final ImageDataSupplier imageData) {
                handleFetchImageResult(url, imageData, null);
            }

            @Override
            public void onRequestFail(Throwable throwable) {
                handleFetchImageResult(url, null, throwable);
            }
        }, null, mWidth, mHeight);
    }

    private void updateGifTime() {
        if (mGifMovie == null) {
            return;
        }
        int duration = mGifMovie.duration();
        if (duration == 0) {
            duration = 1000;
        }

        long now = SystemClock.elapsedRealtime();

        if (mGifLastPlayTime != -1) {
            mGifProgress += now - mGifLastPlayTime;
            if (mGifProgress > duration) {
                mGifProgress = 0;
            }
        }
        mGifLastPlayTime = now;

        int progress = mGifProgress > Integer.MAX_VALUE ? 0 : (int) mGifProgress;
        mGifMovie.setTime(progress);
    }

    private void legacyDrawGIF(Canvas canvas, float left, float top, int width, int height) {
        if (mGifMovie == null) {
            return;
        }
        updateGifTime();
        if (mBackgroundPaint != null) {
            canvas.drawRect(left, top, left + width, top + height, mBackgroundPaint);
        }
        final float mGifScaleX = width / (float) mGifMovie.width();
        final float mGifScaleY = height / (float) mGifMovie.height();
        final float x = (mGifScaleX != 0) ? left / mGifScaleX : left;
        final float y = (mGifScaleY != 0) ? top / mGifScaleY : top;
        int progress = mGifProgress > Integer.MAX_VALUE ? 0 : (int) mGifProgress;
        mGifMovie.setTime(progress);
        canvas.save();
        canvas.scale(mGifScaleX, mGifScaleY);
        mGifMovie.draw(canvas, x, y, mGifPaint);
        canvas.restore();
        postInvalidateDelayed(40);
    }

    @MainThread
    private void postInvalidateDelayed(long delayMilliseconds) {
        NativeRender nativeRender = mNativeRendererRef.get();
        if (nativeRender != null) {
            nativeRender.postInvalidateDelayed(mRootId, mAncestorId, delayMilliseconds);
        }
    }

    private void shouldReplaceDrawable(@NonNull ImageDataHolder imageHolder) {
        if (mUseLegacy) {
            legacyShouldReplaceDrawable(imageHolder);
            return;
        }
        mSrcDrawable = null;
        mGifMovie = null;
        mGifPaint = null;
        Drawable imageDrawable = imageHolder.getDrawable();
        Bitmap bitmap = imageHolder.getBitmap();
        if (imageDrawable != null || bitmap != null) {
            Resources resources = ContextHolder.getAppContext().getResources();
            Drawable drawable = imageDrawable != null ? imageDrawable :
                    new BitmapDrawable(resources, bitmap);
            if (mTintColor != Color.TRANSPARENT) {
                drawable.setColorFilter(new PorterDuffColorFilter(mTintColor, PorterDuff.Mode.SRC_ATOP));
            }
            drawable.setBounds(0, 0, mWidth, mHeight);
            mSrcDrawable = drawable;
        } else if (imageHolder.isAnimated()) {
            mGifMovie = imageHolder.getGifMovie();
            if (mTintColor != Color.TRANSPARENT) {
                mGifPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
                mGifPaint.setColorFilter(new PorterDuffColorFilter(mTintColor, PorterDuff.Mode.SRC_ATOP));
            }
        }
        imageHolder.attached();
        postInvalidateDelayed(0);
    }

    @SuppressLint("DiscouragedPrivateApi")
    private void legacyShouldReplaceDrawable(@NonNull ImageDataHolder imageHolder) {
        Drawable imageDrawable = imageHolder.getDrawable();
        Bitmap bitmap = imageHolder.getBitmap();
        if (imageDrawable != null || bitmap != null) {
            Resources resources = ContextHolder.getAppContext().getResources();
            Drawable drawable = imageDrawable != null ? imageDrawable :
                    new BitmapDrawable(resources, bitmap);
            if (mTintColor != Color.TRANSPARENT) {
                drawable.setColorFilter(new PorterDuffColorFilter(mTintColor, PorterDuff.Mode.SRC_ATOP));
            }
            int w = (mWidth == 0) ? drawable.getIntrinsicWidth() : mWidth;
            int h = (mHeight == 0) ? drawable.getIntrinsicHeight() : mHeight;
            drawable.setBounds(0, 0, w, h);
            try {
                //noinspection JavaReflectionMemberAccess
                final Field drawableField = ImageSpan.class.getDeclaredField("mDrawable");
                drawableField.setAccessible(true);
                drawableField.set(TextImageSpan.this, drawable);
                //noinspection JavaReflectionMemberAccess
                final Field drawableRefField = DynamicDrawableSpan.class
                        .getDeclaredField("mDrawableRef");
                drawableRefField.setAccessible(true);
                drawableRefField.set(TextImageSpan.this, null);
            } catch (IllegalAccessException | NoSuchFieldException ignored) {
                // Reflective access likely to remove in future Android releases
            }
        } else if (imageHolder.isAnimated()) {
            mGifMovie = imageHolder.getGifMovie();
            if (mTintColor != Color.TRANSPARENT) {
                mGifPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
                mGifPaint.setColorFilter(new PorterDuffColorFilter(mTintColor, PorterDuff.Mode.SRC_ATOP));
            }
        }
        postInvalidateDelayed(0);
    }

    private void handleFetchImageStart() {
        NativeRender nativeRenderer = mNativeRendererRef.get();
        if (nativeRenderer != null) {
            // send onLoadStart event
            nativeRenderer.dispatchEvent(mRootId, mId, EVENT_IMAGE_LOAD_START, null, false, false,
                    EventType.EVENT_TYPE_COMPONENT);
        }
    }

    private void handleFetchImageProgress(float total, float loaded) {
        NativeRender nativeRenderer = mNativeRendererRef.get();
        if (nativeRenderer != null) {
            // send onProgress event
            HashMap<String, Object> onProgress = new HashMap<>();
            onProgress.put("loaded", loaded);
            onProgress.put("total", total);
            nativeRenderer.dispatchEvent(mRootId, mId, EVENT_IMAGE_LOAD_PROGRESS, onProgress, false, false,
                    EventType.EVENT_TYPE_COMPONENT);
        }
    }

    private void handleFetchImageResult(@NonNull final String url, @Nullable final ImageDataSupplier imageHolder,
            final @Nullable Throwable throwable) {
        NativeRender nativeRenderer = mNativeRendererRef.get();
        if (imageHolder == null || !imageHolder.checkImageData()) {
            mImageLoadState = STATE_UNLOAD;
            if (nativeRenderer != null) {
                // send onError event
                HashMap<String, Object> onError = new HashMap<>();
                onError.put("error", String.valueOf(throwable));
                onError.put("errorCode", -1);
                onError.put("errorURL", url);
                nativeRenderer.dispatchEvent(mRootId, mId, EVENT_IMAGE_LOAD_ERROR, onError, false, false,
                        EventType.EVENT_TYPE_COMPONENT);
                // send onLoadEnd event
                HashMap<String, Object> onLoadEnd = new HashMap<>();
                onLoadEnd.put("url", url);
                onLoadEnd.put("success", 0);
                onLoadEnd.put("error", String.valueOf(throwable));
                onLoadEnd.put("errorCode", -1);
                nativeRenderer.dispatchEvent(mRootId, mId, EVENT_IMAGE_LOAD_END, onLoadEnd, false, false,
                        EventType.EVENT_TYPE_COMPONENT);
            }
        } else {
            if (imageHolder instanceof ImageDataHolder) {
                shouldReplaceDrawable((ImageDataHolder) imageHolder);
            }
            mImageLoadState = STATE_LOADED;
            if (nativeRenderer != null) {
                int width = imageHolder.getImageWidth();
                int height = imageHolder.getImageHeight();
                // send onLoad event
                HashMap<String, Object> onLoad = new HashMap<>();
                onLoad.put("width", width);
                onLoad.put("height", height);
                onLoad.put("url", url);
                nativeRenderer.dispatchEvent(mRootId, mId, EVENT_IMAGE_ON_LOAD, onLoad, false, false,
                        EventType.EVENT_TYPE_COMPONENT);
                // send onLoadEnd event
                HashMap<String, Object> onLoadEnd = new HashMap<>();
                onLoadEnd.put("success", 1);
                onLoadEnd.put("width", width);
                onLoadEnd.put("height", height);
                onLoadEnd.put("url", url);
                nativeRenderer.dispatchEvent(mRootId, mId, EVENT_IMAGE_LOAD_END, onLoadEnd, false, false,
                        EventType.EVENT_TYPE_COMPONENT);
                }
            }
    }

    public void setTintColor(final int tintColor) {
        Runnable action = new Runnable() {
            @Override
            public void run() {
                if (tintColor != mTintColor) {
                    mTintColor = tintColor;
                    ColorFilter colorFilter = tintColor == Color.TRANSPARENT ? null
                            : new PorterDuffColorFilter(tintColor, PorterDuff.Mode.SRC_ATOP);
                    if (mSrcDrawable != null) {
                        mSrcDrawable.setColorFilter(colorFilter);
                    } else if (mGifMovie != null) {
                        mGifPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
                        mGifPaint.setColorFilter(colorFilter);
                    }
                }
            }
        };
        if (UIThreadUtils.isOnUiThread()) {
            action.run();
        } else {
            UIThreadUtils.runOnUiThread(action);
        }
    }

    public void setBackgroundColor(final int color) {
        Runnable action = new Runnable() {
            @Override
            public void run() {
                if (color == Color.TRANSPARENT) {
                    mBackgroundPaint = null;
                } else {
                    if (mBackgroundPaint == null) {
                        mBackgroundPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
                    }
                    mBackgroundPaint.setColor(color);
                }
            }
        };
        if (UIThreadUtils.isOnUiThread()) {
            action.run();
        } else {
            UIThreadUtils.runOnUiThread(action);
        }
    }

}
