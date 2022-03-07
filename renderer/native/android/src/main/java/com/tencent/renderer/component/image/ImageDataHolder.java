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

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

import com.tencent.link_supplier.proxy.framework.ImageDataSupplier;
import com.tencent.mtt.hippy.utils.ContextHolder;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Movie;
import android.graphics.drawable.Drawable;
import android.util.Base64;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public class ImageDataHolder implements ImageDataSupplier {

    private static final String PREFIX_IMAGE_SOURCE_DATA = "data:";
    private static final String PREFIX_IMAGE_SOURCE_FILE = "file://";
    private static final String PREFIX_IMAGE_SOURCE_ASSETS = "assets://";
    private static final String PREFIX_IMAGE_SOURCE_BASE64 = ";base64,";

    @Nullable
    private String mSource;
    @Nullable
    private Drawable mDrawable;
    @Nullable
    private Movie mGifMovie;
    @Nullable
    private Bitmap mBitmap;
    @Nullable
    private String mImageType;

    @Override
    public Bitmap getBitmap() {
        return mBitmap;
    }

    @Override
    public String getSource() {
        return mSource;
    }

    @Override
    public Drawable getDrawable() {
        return mDrawable;
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

    public void setData(byte[] rawData) {
        try {
            if (isGif(rawData)) {
                mGifMovie = Movie.decodeByteArray(rawData, 0, rawData.length);
                mBitmap = null;
            } else {
                mBitmap = BitmapFactory.decodeByteArray(rawData, 0, rawData.length);
                mGifMovie = null;
            }
        } catch (OutOfMemoryError | Exception e) {
            e.printStackTrace();
        }
    }

    public void setData(File path) {
        FileInputStream inputStream = null;
        try {
            inputStream = new FileInputStream(path);
            byte[] rawData = new byte[inputStream.available()];
            inputStream.read(rawData);
            setData(rawData);
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

    public void setData(Bitmap bitmap) {
        mBitmap = bitmap;
        mGifMovie = null;
    }

    public void setData(@NonNull String source) {
        mSource = source;
        if (mSource.startsWith(PREFIX_IMAGE_SOURCE_DATA)) {
            handleBase64Data(source);
        } else if (mSource.startsWith(PREFIX_IMAGE_SOURCE_FILE)) {
            String filePath = mSource.substring(PREFIX_IMAGE_SOURCE_FILE.length());
            setData(new File(filePath));
        } else if (mSource.startsWith(PREFIX_IMAGE_SOURCE_ASSETS)) {
            handleAssetsFileData(source);
        }
    }

    public Movie getGIF() {
        return mGifMovie;
    }

    public boolean isAnimated() {
        return mGifMovie != null;
    }

    private void handleAssetsFileData(@NonNull String source) {
        InputStream inputStream = null;
        try {
            String fileName = source.substring(PREFIX_IMAGE_SOURCE_ASSETS.length());
            inputStream = ContextHolder.getAppContext().getAssets().open(fileName);
            byte[] rawData = new byte[inputStream.available()];
            inputStream.read(rawData);
            setData(rawData);
        } catch (IOException e) {
            e.printStackTrace();
        }  finally {
            if (inputStream != null) {
                try {
                    inputStream.close();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }

    private void handleBase64Data(@NonNull String source) {
        try {
            int base64Index = source.indexOf(PREFIX_IMAGE_SOURCE_BASE64);
            if (base64Index >= 0) {
                base64Index += PREFIX_IMAGE_SOURCE_BASE64.length();
                String base64String = source.substring(base64Index);
                byte[] decode = Base64.decode(base64String, Base64.DEFAULT);
                if (decode != null) {
                    setData(decode);
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
