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

package com.tencent.renderer.utils;

import android.graphics.BitmapFactory;
import android.text.TextUtils;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public class ImageDataUtils {

    public static final String IMAGE_TYPE_PNG = "image/png";
    public static final String IMAGE_TYPE_JPEG = "image/jpeg";
    public static final String IMAGE_TYPE_GIF = "image/gif";
    public static final String IMAGE_TYPE_WEBP = "image/webp";

    @NonNull
    public static BitmapFactory.Options generateBitmapOptions(@NonNull byte[] data)
            throws IllegalArgumentException {
        BitmapFactory.Options options = new BitmapFactory.Options();
        options.inJustDecodeBounds = true;
        BitmapFactory.decodeByteArray(data, 0, data.length, options);
        return options;
    }

    public static boolean isWebp(@Nullable BitmapFactory.Options options) {
        return options != null && !TextUtils.isEmpty(options.outMimeType) && options.outMimeType.equalsIgnoreCase(
                IMAGE_TYPE_WEBP);
    }

    public static boolean isJpeg(@Nullable BitmapFactory.Options options) {
        return options != null && !TextUtils.isEmpty(options.outMimeType) && options.outMimeType.equalsIgnoreCase(
                IMAGE_TYPE_JPEG);
    }

    public static boolean isPng(@Nullable BitmapFactory.Options options) {
        return options != null && !TextUtils.isEmpty(options.outMimeType) && options.outMimeType.equalsIgnoreCase(
                IMAGE_TYPE_PNG);
    }

    public static boolean isGif(@Nullable BitmapFactory.Options options) {
        return options != null && !TextUtils.isEmpty(options.outMimeType) && options.outMimeType.equalsIgnoreCase(
                IMAGE_TYPE_GIF);
    }

}
