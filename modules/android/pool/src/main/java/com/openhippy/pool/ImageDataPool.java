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

package com.openhippy.pool;

import android.util.LruCache;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public class ImageDataPool extends BasePool<ImageDataKey, ImageRecycleObject> {

    private static final int DEFAULT_IMAGE_POOL_SIZE = 16;
    private LruCache<ImageDataKey, ImageRecycleObject> mPools;

    public ImageDataPool() {
        init(DEFAULT_IMAGE_POOL_SIZE);
    }

    @SuppressWarnings("unused")
    public ImageDataPool(int size) {
        init(Math.max(DEFAULT_IMAGE_POOL_SIZE, size));
    }

    private void init(int size) {
        mPools = new LruCache<ImageDataKey, ImageRecycleObject>(
                size) {
            @Override
            protected void entryRemoved(boolean evicted, @NonNull ImageDataKey key,
                    @NonNull ImageRecycleObject oldValue, @Nullable ImageRecycleObject newValue) {
                if (evicted) {
                    onEntryEvicted(oldValue);
                }
            }
        };
    }

    @Override
    @Nullable
    public ImageRecycleObject acquire(@NonNull ImageDataKey key) {
        ImageRecycleObject data = mPools.get(key);
        if (data != null && data.isScraped()) {
            // Bitmap may have been recycled, must be removed from the cache and not
            // returned to the component.
            mPools.remove(key);
            data.evicted();
            return null;
        }
        return data;
    }

    @Override
    public void release(@NonNull ImageRecycleObject data) {
        ImageDataKey key = data.getCacheKey();
        if (key != null) {
            release(data.getCacheKey(), data);
        }
    }

    @Override
    public void release(@NonNull ImageDataKey key, @NonNull ImageRecycleObject data) {
        mPools.put(key, data);
        data.cached();
    }

    @Override
    public void clear() {
        mPools.evictAll();
    }

    @Override
    public void remove(@NonNull ImageDataKey key) {
        mPools.remove(key);
    }

    private void onEntryEvicted(@NonNull ImageRecycleObject data) {
        data.evicted();
    }
}
