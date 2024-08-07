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

import android.graphics.Bitmap;
import android.graphics.Movie;
import android.graphics.drawable.Drawable;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.openhippy.pool.RecycleObject;

public interface ImageDataSupplier {

    @Nullable
    Drawable getDrawable();

    @Nullable
    Bitmap getBitmap();

    @Nullable
    Movie getGifMovie();

    boolean checkImageData();

    boolean isRecyclable();

    boolean isCacheable();

    boolean isAnimated();

    @NonNull
    String getSource();

    int getImageWidth();

    int getImageHeight();

    int getLayoutWidth();

    int getLayoutHeight();

    void attached();

    void detached();
}
