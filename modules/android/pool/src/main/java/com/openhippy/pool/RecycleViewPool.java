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

import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.util.Pools;
import androidx.core.util.Pools.SimplePool;
import com.tencent.mtt.hippy.utils.LogUtils;
import java.util.HashMap;
import java.util.Map;

public class RecycleViewPool extends BasePool<String, View> {

    private static final String TAG = "RecycleViewPool";
    private final Map<String, SimplePool<View>> mPools = new HashMap<>();
    private int mPoolSize = 8;

    public RecycleViewPool() {}

    public RecycleViewPool(int size) {
        if (size > 4) {
            mPoolSize = size;
        }
    }

    @Override
    @Nullable
    public View acquire(@NonNull String key) {
        SimplePool<View> pool = mPools.get(key);
        if (pool == null) {
            return null;
        }
        return pool.acquire();
    }

    @Override
    public void release(@NonNull View instance) {
        if (instance.getParent() instanceof ViewGroup) {
            ViewGroup parent = (ViewGroup) instance.getParent();
            parent.removeView(instance);
        }
        String className = instance.getClass().getName();
        release(className, instance);
    }

    @Override
    public void release(@NonNull String key, @NonNull View instance) {
        SimplePool<View> pool = mPools.get(key);
        if (pool == null) {
            pool = new Pools.SimplePool<>(mPoolSize);
            mPools.put(key, pool);
        }
        try {
            pool.release(instance);
        } catch (IllegalStateException e) {
            LogUtils.w(TAG,
                    "Put recycle item to pool failed: key=" + key + ", msg=" + e.getMessage());
        }
    }

    @Override
    public void clear() {
        mPools.clear();
    }

    @Override
    public void remove(@NonNull String key) {
        acquire(key);
    }
}
