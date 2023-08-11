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

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import java.util.Map;

public interface ImageLoaderAdapter {

    /**
     * Asynchronous fetch image data.
     *
     * @param url the url of image resource
     * @param listener the image request callback
     * @param initProps initial attributes of the image node
     * @param width the layout width of image node
     * @param height the layout height of image node
     *
     */
    void fetchImageAsync(@NonNull String url, @NonNull ImageRequestListener listener,
            @Nullable Map<String, Object> initProps, int width, int height);

    /**
     * Synchronous fetch image data.
     *
     * @param url the url of image resource
     * @param initProps initial attributes of the image node
     * @param width the layout width of image node
     * @param height the layout height of image node
     * @return The fetch result holder {@link ImageDataHolder}.
     */
    @Nullable
    ImageDataSupplier fetchImageSync(@NonNull String url, @Nullable Map<String, Object> initProps,
            int width, int height);

    /**
     * Get image data from cache.
     *
     * @param url the url of image resource
     * @return The fetch result holder {@link ImageDataHolder}.
     */
    @Nullable
    ImageDataSupplier getImageFromCache(@NonNull String url);

    /**
     * Save image data to cache.
     *
     * @param data the image data holder
     */
    void saveImageToCache(@NonNull ImageDataSupplier data);

    /**
     * Clear image cache pool.
     */
    void clear();

    /**
     * Clear image cache pool and request listeners map.
     */
    void destroy();
}
