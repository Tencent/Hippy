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

package com.tencent.link_supplier.proxy.framework;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public interface ImageLoaderAdapter {

    void fetchImage(@NonNull String url, @NonNull ImageRequestListener listener,
            @Nullable Object params);

    void getLocalImage(@NonNull String source, @NonNull ImageRequestListener listener, int width,
            int height);

    @Nullable
    ImageDataSupplier getLocalImage(@NonNull String source, int width, int height);

    void saveImageToCache(@NonNull ImageDataSupplier data);

    @Nullable
    ImageDataSupplier getImageFromCache(@NonNull String source);

    void destroyIfNeed();

    void clear();
}
