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

import static com.tencent.renderer.utils.EventUtils.EVENT_IMAGE_LOAD_ERROR;
import static com.tencent.renderer.utils.EventUtils.EVENT_IMAGE_ON_LOAD;

import android.annotation.SuppressLint;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Movie;
import android.graphics.Paint;
import android.graphics.Paint.FontMetricsInt;
import android.graphics.Rect;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.text.TextUtils;
import android.text.style.DynamicDrawableSpan;
import android.text.style.ImageSpan;

import androidx.annotation.MainThread;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.link_supplier.proxy.framework.ImageDataSupplier;
import com.tencent.link_supplier.proxy.framework.ImageLoaderAdapter;
import com.tencent.link_supplier.proxy.framework.ImageRequestListener;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.utils.ContextHolder;
import com.tencent.mtt.hippy.utils.UIThreadUtils;
import com.tencent.mtt.hippy.utils.UrlUtils;

import com.tencent.renderer.NativeRender;
import com.tencent.renderer.component.image.ImageDataHolder;
import com.tencent.renderer.utils.EventUtils;

import java.lang.reflect.Field;

public class TextImageSpan extends ImageSpan {

    private static final int ALIGN_BOTTOM = 0;
    private static final int ALIGN_BASELINE = 1;
    private static final int ALIGN_CENTER = 2;
    private static final int ALIGN_TOP = 3;
    private static final int STATE_UNLOAD = 0;
    private static final int STATE_LOADING = 1;
    private static final int STATE_LOADED = 2;
    private final int mRootId;
    private final int mId;
    private final int mAncestorId;
    private final int mWidth;
    private final int mHeight;
    private final int mLeft;
    private final int mTop;
    private int mImageLoadState = STATE_UNLOAD;
    private int mGifProgress;
    private long mGifLastPlayTime = -1;
    @NonNull
    private final NativeRender mNativeRenderer;
    @Nullable
    private Movie mGifMovie;
    @NonNull
    private IAlignConfig mAlignConfig;

    public TextImageSpan(Drawable drawable, String source, @NonNull ImageVirtualNode node,
            @NonNull NativeRender nativeRenderer) {
        super(drawable, source, node.mVerticalAlignment);
        mNativeRenderer = nativeRenderer;
        mRootId = node.mRootId;
        mId = node.mId;
        mAncestorId = node.getAncestorId();
        mWidth = node.mWidth;
        mHeight = node.mHeight;
        mLeft = node.mLeft;
        mTop = node.mTop;
        setUrl(source);
        mAlignConfig = createAlignConfig(node.mVerticalAlignment);
    }

    public void setVerticalAlignment(int verticalAlignment) {
        mAlignConfig = createAlignConfig(verticalAlignment);
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
        if (mGifMovie != null) {
            return super.getSize(paint, text, start, end, fm);
        }
        Drawable drawable = getDrawable();
        return mAlignConfig.getSize(paint, text, start, end, fm, drawable);
    }

    @Override
    public void draw(Canvas canvas, CharSequence text, int start, int end, float x, int top, int y,
            int bottom, Paint paint) {
        int transY;
        Paint.FontMetricsInt fm = paint.getFontMetricsInt();
        if (mGifMovie != null) {
            int width = (mWidth == 0) ? mGifMovie.width() : mWidth;
            int height = (mHeight == 0) ? mGifMovie.height() : mHeight;
            transY = (y + fm.descent + y + fm.ascent) / 2 - height / 2;
            drawGIF(canvas, x + mLeft, transY + mTop, width, height);
        } else {
            Drawable drawable = getDrawable();
            mAlignConfig.draw(canvas, text, start, end, x, top, y, bottom, paint, drawable);
        }
    }

    @NonNull
    private IAlignConfig createAlignConfig(int verticalAlignment) {
        IAlignConfig alignConfig;
        switch (verticalAlignment) {
            case ALIGN_BASELINE:
                alignConfig = new AlignBaselineConfig();
                break;
            case ALIGN_CENTER:
                alignConfig = new AlignCenterConfig();
                break;
            case ALIGN_TOP:
                alignConfig = new AlignTopConfig();
                break;
            case ALIGN_BOTTOM:
                // fall through
            default:
                alignConfig = new AlignBottomConfig();
                break;
        }
        return alignConfig;
    }

    @SuppressWarnings("unused")
    public void setDesiredSize(int width, int height) {
        mAlignConfig.setDesiredSize(width, height);
    }

    @SuppressWarnings("unused")
    public void setActiveSizeWithRate(float heightRate) {
        mAlignConfig.setActiveSizeWithRate(heightRate);
    }

    @SuppressWarnings("unused")
    public void setMargin(int marginLeft, int marginRight) {
        mAlignConfig.setMargin(marginLeft, marginRight);
    }

    protected boolean shouldUseFetchImageMode(String url) {
        return UrlUtils.isWebUrl(url) || UrlUtils.isFileUrl(url);
    }

    @MainThread
    private void loadImageWithUrl(@Nullable final String url) {
        ImageLoaderAdapter adapter = mNativeRenderer.getImageLoaderAdapter();
        if (TextUtils.isEmpty(url) || mImageLoadState == STATE_LOADING
                || adapter == null) {
            return;
        }
        if (shouldUseFetchImageMode(url)) {
            final HippyMap props = new HippyMap();
            props.pushBoolean(NodeProps.CUSTOM_PROP_ISGIF, false);
            props.pushInt(NodeProps.WIDTH, mWidth);
            props.pushInt(NodeProps.HEIGHT, mHeight);
            doFetchImage(url, props, adapter);
        } else {
            ImageDataSupplier supplier = adapter.getLocalImage(url);
            if (supplier instanceof ImageDataHolder) {
                shouldReplaceDrawable((ImageDataHolder) supplier);
            }
        }
    }

    private void drawGIF(Canvas canvas, float left, float top, int width, int height) {
        if (mGifMovie == null) {
            return;
        }
        int duration = mGifMovie.duration();
        if (duration == 0) {
            duration = 1000;
        }
        long now = System.currentTimeMillis();
        if (mGifLastPlayTime != -1) {
            mGifProgress += now - mGifLastPlayTime;
            if (mGifProgress > duration) {
                mGifProgress = 0;
            }
        }
        mGifLastPlayTime = now;
        final float mGifScaleX = width / (float) mGifMovie.width();
        final float mGifScaleY = height / (float) mGifMovie.height();
        final float x = (mGifScaleX != 0) ? left / mGifScaleX : left;
        final float y = (mGifScaleY != 0) ? top / mGifScaleY : top;
        mGifMovie.setTime(mGifProgress);
        canvas.save();
        canvas.scale(mGifScaleX, mGifScaleY);
        mGifMovie.draw(canvas, x, y);
        canvas.restore();
        postInvalidateDelayed(40);
    }

    @MainThread
    private void postInvalidateDelayed(long delayMilliseconds) {
        mNativeRenderer.postInvalidateDelayed(mAncestorId, delayMilliseconds);
    }

    @SuppressLint("DiscouragedPrivateApi")
    private void shouldReplaceDrawable(ImageDataHolder supplier) {
        if (supplier == null) {
            mImageLoadState = STATE_UNLOAD;
            return;
        }
        Bitmap bitmap = supplier.getBitmap();
        if (bitmap != null) {
            Resources resources = ContextHolder.getAppContext().getResources();
            BitmapDrawable drawable = new BitmapDrawable(resources, bitmap);
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
            mImageLoadState = STATE_LOADED;
        } else if (supplier.isAnimated()) {
            mGifMovie = supplier.getGIF();
            mImageLoadState = STATE_LOADED;
        } else {
            mImageLoadState = STATE_UNLOAD;
        }
        postInvalidateDelayed(0);
    }

    private void handleFetchImageResult(@Nullable final ImageDataSupplier supplier) {
        String eventName;
        if (supplier == null) {
            mImageLoadState = STATE_UNLOAD;
            eventName = EVENT_IMAGE_LOAD_ERROR;
        } else {
            if (supplier instanceof ImageDataHolder) {
                shouldReplaceDrawable((ImageDataHolder) supplier);
            }
            eventName = EVENT_IMAGE_ON_LOAD;
        }
        mNativeRenderer.dispatchEvent(mRootId, mId, eventName, null, false, false);
    }

    private void doFetchImage(String url, HippyMap props, ImageLoaderAdapter adapter) {
        mImageLoadState = STATE_LOADING;
        adapter.fetchImage(url, new ImageRequestListener() {
            @Override
            public void onRequestStart(ImageDataSupplier supplier) {
            }

            @Override
            public void onRequestProgress(float total, float loaded) {
            }

            @Override
            public void onRequestSuccess(final ImageDataSupplier supplier) {
                if (UIThreadUtils.isOnUiThread()) {
                    handleFetchImageResult(supplier);
                } else {
                    UIThreadUtils.runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            handleFetchImageResult(supplier);
                        }
                    });
                }
            }

            @Override
            public void onRequestFail(Throwable throwable, String source) {
                if (UIThreadUtils.isOnUiThread()) {
                    handleFetchImageResult(null);
                } else {
                    UIThreadUtils.runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            handleFetchImageResult(null);
                        }
                    });
                }
            }
        }, props);
    }

    private interface IAlignConfig {

        void setDesiredSize(int desiredDrawableWidth, int desiredDrawableHeight);

        void setActiveSizeWithRate(float heightRate);

        void setMargin(int marginLeft, int marginRight);

        int getSize(@NonNull Paint paint, CharSequence text, int start, int end,
                @Nullable FontMetricsInt fm, Drawable drawable);

        void draw(@NonNull Canvas canvas, CharSequence text, int start, int end, float baseLineX,
                int lineTop, int baselineY, int lintBottom, @NonNull Paint paint,
                Drawable drawable);
    }

    private abstract static class BaseAlignConfig implements IAlignConfig {

        private int mDesiredDrawableWidth;
        private int mDesiredDrawableHeight;
        private float mHeightRate;
        private final int[] mSize = new int[2];
        private int mMarginLeft;
        private int mMarginRight;

        @Override
        public void setDesiredSize(int desiredDrawableWidth, int desiredDrawableHeight) {
            mDesiredDrawableWidth = desiredDrawableWidth;
            mDesiredDrawableHeight = desiredDrawableHeight;
            mHeightRate = 0;
        }

        @Override
        public void setActiveSizeWithRate(float heightRate) {
            mHeightRate = heightRate;
            mDesiredDrawableWidth = 0;
            mDesiredDrawableHeight = 0;
        }

        @Override
        public void setMargin(int marginLeft, int marginRight) {
            mMarginLeft = marginLeft;
            mMarginRight = marginRight;
        }

        private void calDrawableSize(Rect drawableBounds, Paint paint) {
            int dWidth;
            int dHeight;
            if (mHeightRate > 0) {
                int textSize = (int) paint.getTextSize();
                dHeight = (int) (textSize * mHeightRate);
                dWidth = drawableBounds.right * dHeight / drawableBounds.bottom;
            } else {
                dHeight = mDesiredDrawableHeight;
                dWidth = mDesiredDrawableWidth;
            }
            if (dWidth <= 0 || dHeight <= 0) {
                dWidth = drawableBounds.right;
                dHeight = drawableBounds.bottom;
            }
            mSize[0] = dWidth;
            mSize[1] = dHeight;
        }

        @Override
        public int getSize(@NonNull Paint paint, CharSequence text, int start, int end,
                @Nullable FontMetricsInt fm, Drawable drawable) {
            calDrawableSize(drawable.getBounds(), paint);
            int dWidth = mSize[0];
            int dHeight = mSize[1];
            int deltaTop = 0;
            int deltaBottom = 0;
            if (fm != null) {
                deltaTop = fm.top - fm.ascent;
                deltaBottom = fm.bottom - fm.descent;
            }
            int size = getCustomSize(paint,
                    text, start, end,
                    fm, dWidth, dHeight);
            if (fm != null) {
                fm.top = fm.ascent + deltaTop;
                fm.bottom = fm.descent + deltaBottom;
            }
            return mMarginLeft + size + mMarginRight;
        }

        @Override
        public void draw(@NonNull Canvas canvas, CharSequence text, int start, int end,
                float baseLineX, int lineTop, int baselineY, int lineBottom, @NonNull Paint paint,
                Drawable drawable) {
            Rect drawableBounds = drawable.getBounds();
            int dWidth = mSize[0];
            int dHeight = mSize[1];
            FontMetricsInt fontMetricsInt = paint.getFontMetricsInt();
            int transY = getTransY(canvas, text, start, end, baseLineX, lineTop, baselineY,
                    lineBottom, paint, fontMetricsInt, dWidth, dHeight);
            transY = adjustTransY(transY, lineTop, lineBottom, dHeight);
            float scaleX = (float) dWidth / drawableBounds.right;
            float scaleY = (float) dHeight / drawableBounds.bottom;
            canvas.save();
            canvas.translate(baseLineX + mMarginLeft, transY);
            canvas.scale(scaleX, scaleY);
            drawable.draw(canvas);
            canvas.restore();
        }

        private static int adjustTransY(int transY, int lineTop, int lineBottom,
                int drawableHeight) {
            if (drawableHeight + transY > lineBottom) {
                transY = lineBottom - drawableHeight;
            }
            if (transY < lineTop) {
                transY = lineTop;
            }
            return transY;
        }

        abstract int getCustomSize(@NonNull Paint paint, CharSequence text, int start, int end,
                @Nullable FontMetricsInt fm, int drawableWidth, int drawableHeight);

        abstract int getTransY(@NonNull Canvas canvas, CharSequence text, int start, int end,
                float baseLineX, int lineTop, int baselineY, int lineBottom, @NonNull Paint paint,
                FontMetricsInt fontMetricsInt, int drawableWidth, int drawableHeight);
    }

    private static class AlignBaselineConfig extends BaseAlignConfig {

        @Override
        public int getCustomSize(@NonNull Paint paint, CharSequence text, int start, int end,
                @Nullable FontMetricsInt fm, int drawableWidth, int drawableHeight) {
            if (fm != null) {
                fm.ascent = -drawableHeight;
            }
            return drawableWidth;
        }

        @Override
        public int getTransY(@NonNull Canvas canvas, CharSequence text, int start, int end,
                float baseLineX, int lineTop, int baselineY, int lineBottom, @NonNull Paint paint,
                FontMetricsInt fontMetricsInt, int drawableWidth, int drawableHeight) {
            return baselineY - drawableHeight;
        }
    }

    private static class AlignBottomConfig extends AlignBaselineConfig {

        @Override
        public int getCustomSize(@NonNull Paint paint, CharSequence text, int start, int end,
                @Nullable FontMetricsInt fm, int drawableWidth, int drawableHeight) {
            if (fm != null) {
                fm.ascent = fm.descent - drawableHeight;
            }
            return drawableWidth;
        }

        @Override
        public int getTransY(@NonNull Canvas canvas, CharSequence text, int start, int end,
                float baseLineX, int lineTop, int baselineY, int lineBottom, @NonNull Paint paint,
                FontMetricsInt fontMetricsInt, int drawableWidth, int drawableHeight) {
            return super
                    .getTransY(canvas, text, start, end, baseLineX, lineTop, baselineY, lineBottom,
                            paint, fontMetricsInt, drawableWidth, drawableHeight)
                    + fontMetricsInt.descent;
        }
    }

    private static class AlignCenterConfig extends AlignBottomConfig {

        @Override
        public int getCustomSize(@NonNull Paint paint, CharSequence text, int start, int end,
                @Nullable FontMetricsInt fm, int drawableWidth, int drawableHeight) {
            if (fm != null) {
                int textAreaHeight = fm.descent - fm.ascent;
                if (textAreaHeight < drawableHeight) {
                    int oldSumOfAscentAndDescent = fm.ascent + fm.descent;
                    fm.ascent = oldSumOfAscentAndDescent - drawableHeight >> 1;
                    fm.descent = oldSumOfAscentAndDescent + drawableHeight >> 1;
                }

            }
            return drawableWidth;
        }

        @Override
        public int getTransY(@NonNull Canvas canvas, CharSequence text, int start, int end,
                float baseLineX, int lineTop, int baselineY, int lineBottom, @NonNull Paint paint,
                FontMetricsInt fontMetricsInt, int drawableWidth, int drawableHeight) {
            int transY = super
                    .getTransY(canvas, text, start, end, baseLineX, lineTop, baselineY, lineBottom,
                            paint, fontMetricsInt, drawableWidth, drawableHeight);
            int fontHeight = fontMetricsInt.descent - fontMetricsInt.ascent;
            transY = transY - (fontHeight >> 1) + (drawableHeight >> 1);
            return transY;
        }
    }

    private static class AlignTopConfig extends BaseAlignConfig {

        @Override
        public int getCustomSize(@NonNull Paint paint, CharSequence text, int start, int end,
                @Nullable FontMetricsInt fm, int drawableWidth, int drawableHeight) {
            if (fm != null) {
                fm.descent = drawableHeight + fm.ascent;
            }
            return drawableWidth;
        }

        @Override
        public int getTransY(@NonNull Canvas canvas, CharSequence text, int start, int end,
                float baseLineX, int lineTop, int baselineY, int lineBottom, @NonNull Paint paint,
                FontMetricsInt fontMetricsInt, int drawableWidth, int drawableHeight) {
            return baselineY + fontMetricsInt.ascent;
        }
    }
}
