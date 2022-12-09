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

import android.graphics.ImageDecoder;
import android.os.Build.VERSION_CODES;
import androidx.annotation.RequiresApi;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

import com.tencent.mtt.hippy.utils.ContextHolder;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Movie;
import android.graphics.drawable.Drawable;
import android.util.Base64;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import java.nio.ByteBuffer;

public class ImageDataHolder implements ImageDataSupplier {

    private static final int MAX_SOURCE_KEY_LEN = 32;
    /** Mark that the image data has been cached. */
    private static final int FLAG_CACHED = 0x00000001;
    /** Mark that the image data has been attached to the view. */
    private static final int FLAG_ATTACHED = 0x00000002;
    /** Mark that image data is decoded internally and needs to recycle. */
    private static final int FLAG_RECYCLABLE = 0x00000004;
    private static final String PREFIX_IMAGE_SOURCE_DATA = "data:";
    private static final String PREFIX_IMAGE_SOURCE_FILE = "file://";
    private static final String PREFIX_IMAGE_SOURCE_ASSETS = "assets://";
    private static final String PREFIX_IMAGE_SOURCE_BASE64 = ";base64,";
    private int mStateFlags = 0;
    private int mWidth;
    private int mHeight;
    @NonNull
    private final String mSource;
    @Nullable
    private Drawable mDrawable;
    @Nullable
    private Movie mGifMovie;
    @Nullable
    private Bitmap mBitmap;
    @Nullable
    private String mImageType;

    public ImageDataHolder(@NonNull String source) {
        mSource = source;
    }

    public ImageDataHolder(@NonNull String source, int width, int height) {
        mSource = source;
        mWidth = width;
        mHeight = height;
    }

    /**
     * Generate image source entry key for cache image data.
     *
     * <p>
     * To prevent the time consuming of hash code for long base64 data, if the source length is
     * greater than 32, the last 32 characters are truncated to calculate the hash code,
     * <p/>
     *
     * @param source image uri
     * @return source hash code
     */
    public static int generateSourceKey(@NonNull String source) {
        if (source.length() > MAX_SOURCE_KEY_LEN) {
            source = source.substring(source.length() - MAX_SOURCE_KEY_LEN);
        }
        return source.hashCode();
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
    public void attached() {
        setStateFlag(FLAG_ATTACHED);
    }

    @Override
    public void detached() {
        resetStateFlag(FLAG_ATTACHED);
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
    public void clear() {
        if (checkStateFlag(FLAG_CACHED) || checkStateFlag(FLAG_ATTACHED)) {
            return;
        }
        if (mBitmap != null) {
            if (checkStateFlag(FLAG_RECYCLABLE)) {
                // If the bitmap is created locally, we need to manage its life cycle ourselves.
                mBitmap.recycle();
            }
            mBitmap = null;
        }
        mGifMovie = null;
        mDrawable = null;
    }

    @Override
    @Nullable
    public Bitmap getBitmap() {
        return mBitmap;
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
    public boolean checkImageData() {
        return (mBitmap != null && !mBitmap.isRecycled()) || mGifMovie != null;
    }

    @Override
    public boolean isRecyclable() {
        return checkStateFlag(FLAG_RECYCLABLE);
    }

    @Override
    public int getImageWidth() {
        if (mBitmap != null) {
            return mBitmap.getWidth();
        }
        if (mGifMovie != null) {
            return mGifMovie.width();
        }
        return 0;
    }

    @Override
    public int getImageHeight() {
        if (mBitmap != null) {
            return mBitmap.getHeight();
        }
        if (mGifMovie != null) {
            return mGifMovie.height();
        }
        return 0;
    }

    public String getImageType() {
        return mImageType;
    }

    public void setImageType(String type) {
        mImageType = type;
    }

    public void setDrawable(Drawable drawable) {
        mDrawable = drawable;
    }

    public void setData(byte[] data) {
        decodeImageData(data);
    }

    public void setData(Bitmap bitmap) {
        mBitmap = bitmap;
        mGifMovie = null;
        resetStateFlag(FLAG_RECYCLABLE);
    }

    public void loadImageResource() {
        if (mSource.startsWith(PREFIX_IMAGE_SOURCE_DATA)) {
            loadBase64Image();
        } else if (mSource.startsWith(PREFIX_IMAGE_SOURCE_FILE)) {
            loadLocalImageFile(mSource.substring(PREFIX_IMAGE_SOURCE_FILE.length()));
        } else if (mSource.startsWith(PREFIX_IMAGE_SOURCE_ASSETS)) {
            loadAssetsImageFile(mSource.substring(PREFIX_IMAGE_SOURCE_ASSETS.length()));
        }
    }

    public boolean isAnimated() {
        return mGifMovie != null;
    }

    @RequiresApi(api = VERSION_CODES.P)
    private void decodeImageSource(@Nullable ImageDecoder.Source source)
            throws IOException {
        if (source != null) {
            mBitmap = ImageDecoder.decodeBitmap(source);
            mGifMovie = null;
            setStateFlag(FLAG_RECYCLABLE);
        }
    }

    @RequiresApi(api = VERSION_CODES.P)
    private void decodeLocalFileForTarget28(@NonNull File file) {
        try {
            ImageDecoder.Source source = ImageDecoder.createSource(file);
            decodeImageSource(source);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @RequiresApi(api = VERSION_CODES.P)
    private void decodeLocalFileForTarget28(@NonNull String fileName) {
        try {
            ImageDecoder.Source source = ImageDecoder.createSource(
                    ContextHolder.getAppContext().getAssets(), fileName);
            decodeImageSource(source);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @RequiresApi(api = VERSION_CODES.P)
    private void decodeLocalFileForTarget28(@NonNull ByteBuffer buffer) {
        try {
            ImageDecoder.Source source = ImageDecoder.createSource(buffer);
            decodeImageSource(source);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private int getSampleSize(int outWidth, int outHeight) {
        int sampleSize = 1;
        if (mWidth <=0 || mHeight <= 0) {
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

    private void decodeImageData(@Nullable byte[] data) {
        if (data == null || data.length <= 0) {
            return;
        }
        try {
            if (isGif(data)) {
                mGifMovie = Movie.decodeByteArray(data, 0, data.length);
                mBitmap = null;
            } else {
                // When using the BitmapFactory decoding provided by the old version of Android system,
                // we need to sample the image to scale in order to prevent the decoding memory
                // growth caused by large images.
                final BitmapFactory.Options options = new BitmapFactory.Options();
                options.inJustDecodeBounds = true;
                BitmapFactory.decodeByteArray(data, 0, data.length, options);
                options.inSampleSize = getSampleSize(options.outWidth, options.outHeight);
                options.inJustDecodeBounds = false;
                mBitmap = BitmapFactory.decodeByteArray(data, 0, data.length, options);
                mGifMovie = null;
                setStateFlag(FLAG_RECYCLABLE);
            }
        } catch (OutOfMemoryError | Exception e) {
            e.printStackTrace();
        }
    }

    private void loadAssetsImageFile(@NonNull String fileName) {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
            decodeLocalFileForTarget28(fileName);
        } else {
            InputStream inputStream = null;
            try {
                inputStream = ContextHolder.getAppContext().getAssets().open(fileName);
                byte[] rawData = new byte[inputStream.available()];
                int total = inputStream.read(rawData);
                if (total > 0) {
                    decodeImageData(rawData);
                }
            } catch (IOException e) {
                e.printStackTrace();
            } finally {
                if (inputStream != null) {
                    try {
                        inputStream.close();
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }
        }
    }

    private void loadLocalImageFile(@NonNull String fileName) {
        File file = new File(fileName);
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
            decodeLocalFileForTarget28(file);
        } else {
            InputStream inputStream = null;
            try {
                inputStream = new FileInputStream(file);
                byte[] rawData = new byte[inputStream.available()];
                int total = inputStream.read(rawData);
                if (total > 0) {
                    decodeImageData(rawData);
                }
            } catch (IOException e) {
                e.printStackTrace();
            } finally {
                if (inputStream != null) {
                    try {
                        inputStream.close();
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }
        }
    }

    private void loadBase64Image() {
        try {
            int base64Index = mSource.indexOf(PREFIX_IMAGE_SOURCE_BASE64);
            if (base64Index >= 0) {
                base64Index += PREFIX_IMAGE_SOURCE_BASE64.length();
                String base64String = mSource.substring(base64Index);
                byte[] rawData = Base64.decode(base64String, Base64.DEFAULT);
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
                    decodeLocalFileForTarget28(ByteBuffer.wrap(rawData));
                } else {
                    decodeImageData(rawData);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private boolean isGif(byte[] bytes) {
        if (bytes == null || bytes.length < 3) {
            return false;
        }
        byte b0 = bytes[0];
        byte b1 = bytes[1];
        byte b2 = bytes[2];
        return b0 == (byte) 'G' && b1 == (byte) 'I' && b2 == (byte) 'F';
    }
}
