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

package com.tencent.renderer.pool;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.collection.LruCache;
import com.tencent.link_supplier.proxy.framework.ImageDataSupplier;
import com.tencent.renderer.component.image.ImageDataHolder;

public class ImageDataPool extends NativeRenderPool<Integer, ImageDataSupplier> {

    private static final int DEFAULT_IMAGE_POOL_SIZE = 8;
    private LruCache<Integer, ImageDataSupplier> mPools;

    public ImageDataPool() {
        init(DEFAULT_IMAGE_POOL_SIZE);
    }

    public ImageDataPool(int size) {
        init(Math.max(DEFAULT_IMAGE_POOL_SIZE, size));
    }

    private void init(int size) {
        mPools = new LruCache<Integer, ImageDataSupplier>(
                size) {
            @Override
            protected void entryRemoved(boolean evicted, @NonNull Integer key,
                    @NonNull ImageDataSupplier oldValue, @Nullable ImageDataSupplier newValue) {
                if (evicted) {
                    onEntryEvicted(oldValue);
                }
            }
        };
    }

    @Override
    @Nullable
    public ImageDataSupplier acquire(@NonNull Integer key) {
        ImageDataSupplier data = mPools.get(key);
        if (data != null && !data.checkImageData()) {
            // Bitmap may have been recycled, must be removed from the cache and not
            // returned to the component.
            mPools.remove(key);
            data.evicted();
            return null;
        }
        return data;
    }

    @Override
    public void release(@NonNull ImageDataSupplier data) {
        if (!data.checkImageData()) {
            return;
        }
        Integer key = ImageDataHolder.generateSourceKey(data.getSource());
        release(key, data);
    }

    @Override
    public void release(@NonNull Integer key, @NonNull ImageDataSupplier data) {
        mPools.put(key, data);
        data.cached();
    }

    @Override
    public void clear() {
        mPools.evictAll();
    }

    @Override
    public void remove(@NonNull Integer key) {
        mPools.remove(key);
    }

    private void onEntryEvicted(@NonNull ImageDataSupplier data) {
        data.evicted();
        data.clear();
    }
}
