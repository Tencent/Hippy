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

import android.util.SparseArray;
import android.view.View;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public class PreCreateViewPool extends NativeRenderPool<Integer, View> {

    private static final int DEFAULT_PRE_CREATE_POOL_SIZE = 16;
    private final SparseArray<View> mPools;

    public PreCreateViewPool() {
        mPools = new SparseArray<>(DEFAULT_PRE_CREATE_POOL_SIZE);
    }

    public PreCreateViewPool(int size) {
        mPools = new SparseArray<>(Math.max(DEFAULT_PRE_CREATE_POOL_SIZE, size));
    }

    @Override
    @Nullable
    public View acquire(@NonNull Integer key) {
        return mPools.get(key);
    }

    @Override
    public void release(@NonNull View instance) {
        release(instance.getId(), instance);
    }

    @Override
    public void release(@NonNull Integer key, @NonNull View instance) {
        mPools.put(key, instance);
    }

    @Override
    public void clear() {
        mPools.clear();
    }

    @Override
    public void remove(@NonNull Integer key) {
        mPools.remove(key);
    }
}
