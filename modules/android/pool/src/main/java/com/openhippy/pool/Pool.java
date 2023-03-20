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

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public interface Pool<K, V> {

    /**
     * Get an instance from the pool if such, null otherwise.
     *
     * @param key the specified cache key
     * @return the cache instance associated with key
     */
    @Nullable
    V acquire(@NonNull K key);

    /**
     * Release an instance to the pool.
     *
     * @param instance the instance to release
     */
    void release(@NonNull V instance);

    /**
     * Release an instance to the pool.
     *
     * @param key the specified cache key
     * @param instance the instance to release
     */
    void release(@NonNull K key, @NonNull V instance);

    /**
     * Clear the cache pool.
     */
    void clear();

    /**
     * Remove the instance from cache pool.
     */
    void remove(@NonNull K key);
}
