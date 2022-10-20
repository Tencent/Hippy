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

package com.tencent.vfs;

import androidx.annotation.NonNull;

import com.tencent.vfs.VfsManager.ProcessorCallback;

public class Processor {

    /**
     * Handle request asynchronous
     *
     * @param holder {@link ResourceDataHolder}
     * @param callback {@link ProcessorCallback}
     */
    public void handleRequestAsync(@NonNull ResourceDataHolder holder,
            @NonNull ProcessorCallback callback) {
        // Pass to the next processor by default
        callback.goNext();
    }

    /**
     * Handle request synchronous
     *
     * @param holder {@link ResourceDataHolder}
     * @return the handle result
     *         {@code true} Can handle this request, will traverse go back for handle response
     *         {@code false} Can not handle this request, will hand over to next processor
     */
    public boolean handleRequestSync(@NonNull ResourceDataHolder holder) {
        return false;
    }

    /**
     * Handle response asynchronous
     *
     * @param holder {@link ResourceDataHolder}
     * @param callback {@link ProcessorCallback}
     */
    public void handleResponseAsync(@NonNull ResourceDataHolder holder,
            @NonNull ProcessorCallback callback) {
        // The callback must be called after the response is processed
        callback.onHandleCompleted();
    }

    /**
     * Handle response synchronous
     *
     * @param holder {@link ResourceDataHolder}
     */
    public void handleResponseSync(@NonNull ResourceDataHolder holder) {
        // Need do nothing by default
    }
}
