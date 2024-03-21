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

package com.tencent.renderer.component.image;

import static com.tencent.renderer.NativeRenderException.ExceptionCode.IMAGE_DATA_DECODE_ERR;

import android.graphics.ImageDecoder;
import android.graphics.drawable.Animatable;
import android.os.Build.VERSION_CODES;

import androidx.annotation.RequiresApi;

import com.openhippy.pool.ImageDataKey;
import com.openhippy.pool.ImageRecycleObject;
import com.openhippy.pool.RecycleObject;
import com.tencent.renderer.NativeRenderException;
import com.tencent.renderer.utils.ImageDataUtils;

import java.io.File;
import java.io.IOException;

import com.tencent.mtt.hippy.utils.ContextHolder;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Movie;
import android.graphics.drawable.Drawable;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import java.nio.ByteBuffer;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

public class ImageDataHolder extends ImageRecycleObject implements ImageDataSupplier {

    /**
     * Mark that the image data has been cached.
     */
    private static final int FLAG_CACHED = 0x00000001;
    /**
     * Mark that the image data has been attached to the view.
     */
    private static final int FLAG_ATTACHED = 0x00000002;
    /**
     * Mark that image data is decoded internally and needs to recycle.
     */
    private static final int FLAG_RECYCLABLE = 0x00000004;
    private int mStateFlags = 0;
    private int mWidth;
    private int mHeight;
    private String mSource;
    @Nullable
    private ImageDataKey mKey;
    @Nullable
    private Drawable mDrawable;
    @Nullable
    private Movie mGifMovie;
    @Nullable
    private Bitmap mBitmap;
    @Nullable
    private BitmapFactory.Options mOptions;

    public ImageDataHolder(@NonNull String source) {
        init(source, null, 0, 0);
    }

    public ImageDataHolder(@NonNull String source, int width, int height) {
        init(source, null, width, height);
    }

    public ImageDataHolder(@NonNull String source, @NonNull ImageDataKey key, int width,
            int height) {
        init(source, key, width, height);
    }

    public void init(@NonNull String source, @Nullable ImageDataKey key, int width, int height) {
        mSource = source;
        mWidth = width;
        mHeight = height;
        mKey = (key == null) ? new ImageDataKey(source) : key;
    }

    @Nullable
    public static ImageDataHolder obtain() {
        RecycleObject recycleObject = RecycleObject.obtain(ImageDataHolder.class.getSimpleName());
        return (recycleObject instanceof ImageDataHolder) ? ((ImageDataHolder) recycleObject)
                : null;
    }

    private boolean checkStateFlag(int flag) {
        return (mStateFlags & flag) == flag;
    }

    private void resetStateFlag(int flag) {
        mStateFlags &= ~flag;
    }

    private void setStateFlag(int flag) {
        mStateFlags |= flag;
    }

    @Override
    @Nullable
    public ImageDataKey getCacheKey() {
        return mKey;
    }

    @Override
    public void recycle() {
        RecycleObject.recycle(this);
    }

    @Override
    public void attached() {

    }

    @Override
    public void detached() {

    }

    @Override
    public void cached() {
        setStateFlag(FLAG_CACHED);
    }

    @Override
    public void evicted() {
        resetStateFlag(FLAG_CACHED);
    }

    @Override
    @Nullable
    public Bitmap getBitmap() {
        return (mBitmap != null && !mBitmap.isRecycled()) ? mBitmap : null;
    }

    @Override
    @NonNull
    public String getSource() {
        return mSource;
    }

    @Override
    @Nullable
    public Drawable getDrawable() {
        return mDrawable;
    }

    @Override
    @Nullable
    public Movie getGifMovie() {
        return mGifMovie;
    }

    @Override
    public boolean isScraped() {
        if (mOptions == null) {
            return true;
        }
        if (mDrawable != null) {
            return false;
        }
        if (ImageDataUtils.isGif(mOptions)) {
            return mGifMovie == null;
        }
        return mBitmap == null || mBitmap.isRecycled();
    }

    @Override
    public boolean checkImageData() {
        return !isScraped();
    }

    @Override
    public boolean isRecyclable() {
        return checkStateFlag(FLAG_RECYCLABLE);
    }

    @Override
    public int getImageWidth() {
        return (mOptions != null) ? mOptions.outWidth : 0;
    }

    @Override
    public int getImageHeight() {
        return (mOptions != null) ? mOptions.outHeight : 0;
    }

    @Override
    public int getLayoutWidth() {
        return mWidth;
    }

    @Override
    public int getLayoutHeight() {
        return mHeight;
    }

    @Override
    public boolean isAnimated() {
        return mOptions != null && ImageDataUtils.isGif(mOptions);
    }

    @Nullable
    public String getImageType() {
        return mOptions != null ? mOptions.outMimeType : null;
    }

    public void setDrawable(Drawable drawable) {
        mDrawable = drawable;
    }

    public void decodeImageData(@NonNull byte[] data, @Nullable Map<String, Object> initProps,
            @Nullable ImageDecoderAdapter imageDecoderAdapter) throws NativeRenderException {
        try {
            mOptions = ImageDataUtils.generateBitmapOptions(data);
            if (imageDecoderAdapter != null) {
                if (imageDecoderAdapter.preDecode(data, initProps, this, mOptions)) {
                    return;
                }
            }
            if (ImageDataUtils.isGif(mOptions)) {
                // Because AnimatedImageDrawable has too many restrictions, Movie is still used
                // as the default GIF playback mode, to avoid the playback problem caused by Movie,
                // we recommend using an external drawable method to play GIF, such as android gif
                // drawable.
                mGifMovie = Movie.decodeByteArray(data, 0, data.length);
            } else if (ImageDataUtils.isJpeg(mOptions) || ImageDataUtils.isPng(mOptions)
                    || ImageDataUtils.isWebp(mOptions)) {
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
                    decodeImageForTarget28(data);
                } else {
                    decodeImage(data);
                }
            } else {
                throw new RuntimeException("Unsupported picture type!");
            }
            if (imageDecoderAdapter != null) {
                imageDecoderAdapter.afterDecode(initProps, this, mOptions);
            }
        } catch (OutOfMemoryError | Exception e) {
            throw new NativeRenderException(IMAGE_DATA_DECODE_ERR, e.getMessage());
        }
    }

    /**
     * Set bitmap to image holder.
     *
     * @param bitmap {@link Bitmap}.
     */
    public void setBitmap(Bitmap bitmap) {
        mBitmap = bitmap;
        resetStateFlag(FLAG_RECYCLABLE);
    }

    /**
     * Decode image data with ImageDecoder.
     *
     * <p>
     * Warning! AnimatedImageDrawable start will cause crash in some android platform when use
     * ImageDecoder createSource API with ByteBuffer. Therefore, AnimatedImageDrawable is not
     * supported at present.
     * <p/>
     */
    @RequiresApi(api = VERSION_CODES.P)
    @NonNull
    private Drawable decodeGifForTarget28(@NonNull byte[] data) throws IOException {
        // There is a CRASH problem, it's caused by an Android framework issue
        // (https://issuetracker.google.com/issues/139371066).
        // You can work around the issue by not using a ByteBuffer.
        // For instance, writing the ByteBuffer to a File then using ImageDecoder.createSource(file)
        // will work around the issue
        ImageDecoder.Source source = ImageDecoder.createSource(ByteBuffer.wrap(data));
        return ImageDecoder.decodeDrawable(source,
                (decoder, info, source1) -> {});
    }

    @RequiresApi(api = VERSION_CODES.P)
    private void decodeBitmapForTarget28(@Nullable ImageDecoder.Source source)
            throws IOException {
        if (source != null) {
            mBitmap = ImageDecoder.decodeBitmap(source);
            mGifMovie = null;
            setStateFlag(FLAG_RECYCLABLE);
        }
    }

    @RequiresApi(api = VERSION_CODES.P)
    private void decodeLocalFileForTarget28(@NonNull File file) throws IOException {
        ImageDecoder.Source source = ImageDecoder.createSource(file);
        decodeBitmapForTarget28(source);
    }

    @RequiresApi(api = VERSION_CODES.P)
    private void decodeLocalFileForTarget28(@NonNull String fileName) throws IOException {
        ImageDecoder.Source source = ImageDecoder.createSource(
                ContextHolder.getAppContext().getAssets(), fileName);
        decodeBitmapForTarget28(source);
    }

    @RequiresApi(api = VERSION_CODES.P)
    private void decodeImageForTarget28(@NonNull byte[] data) throws IOException {
        ImageDecoder.Source source = ImageDecoder.createSource(ByteBuffer.wrap(data));
        decodeBitmapForTarget28(source);
    }

    private int getSampleSize(int outWidth, int outHeight) {
        int sampleSize = 1;
        if (mWidth <= 0 || mHeight <= 0) {
            return sampleSize;
        }
        if (outWidth >= outHeight) {
            sampleSize = outWidth / mWidth;
        } else {
            sampleSize = outHeight / mHeight;
        }
        if (sampleSize < 1) {
            sampleSize = 1;
        } else if (sampleSize > 4) {
            sampleSize = 4;
        }
        return sampleSize;
    }

    private void decodeImage(@Nullable byte[] data) {
        if (data == null || data.length <= 0 || mOptions == null) {
            return;
        }
        // When using the BitmapFactory decoding provided by the old version of Android system,
        // we need to sample the image to scale in order to prevent the decoding memory
        // growth caused by large images.
        mOptions.inSampleSize = getSampleSize(mOptions.outWidth, mOptions.outHeight);
        mOptions.inJustDecodeBounds = false;
        mBitmap = BitmapFactory.decodeByteArray(data, 0, data.length, mOptions);
        mGifMovie = null;
        setStateFlag(FLAG_RECYCLABLE);
    }
}
