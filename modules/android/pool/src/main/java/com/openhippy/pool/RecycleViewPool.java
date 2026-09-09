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
        View view = pool.acquire();
        if (isAttached(view)) {
            LogUtils.w(TAG, "Discard pooled view still attached: key=" + key + ", parent="
                    + view.getParent().getClass().getName());
            return null;
        }
        return view;
    }

    @Override
    public void release(@NonNull View instance) {
        release(instance.getClass().getName(), instance);
    }

    @Override
    public void release(@NonNull String key, @NonNull View instance) {
        if (isAttached(instance)) {
            LogUtils.w(TAG, "Skip recycling view still attached: key=" + key + ", parent="
                    + instance.getParent().getClass().getName());
            return;
        }
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

    /**
     * 仍挂在树上的view一律不进出本池：这里拿不到parent的类型，而RecyclerView这类自带子view簿记的
     * 容器一旦被直接removeView就会内部状态错乱，代价比少一次复用大得多。残留parent说明调用方漏了
     * 摘除，交给日志暴露。
     */
    private static boolean isAttached(@Nullable View view) {
        return view != null && view.getParent() != null;
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
