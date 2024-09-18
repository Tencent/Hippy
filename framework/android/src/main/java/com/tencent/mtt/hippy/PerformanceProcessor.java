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

package com.tencent.mtt.hippy;

import androidx.annotation.NonNull;
import com.tencent.vfs.Processor;
import com.tencent.vfs.ResourceDataHolder;
import com.tencent.vfs.ResourceDataHolder.RequestFrom;
import com.tencent.vfs.UrlUtils;
import com.tencent.vfs.VfsManager.ProcessorCallback;
import java.lang.ref.WeakReference;

/**
 * For performance API features, we need to add this processor at the head of the vfs access chain
 * for recording the start and end of resource loading.
 */
public class PerformanceProcessor extends Processor {

    private final WeakReference<HippyEngineContext> mEngineContextRef;

    public PerformanceProcessor(@NonNull HippyEngineContext engineContext) {
        mEngineContextRef = new WeakReference<>(engineContext);
    }

    @Override
    public void handleRequestAsync(@NonNull ResourceDataHolder holder,
            @NonNull ProcessorCallback callback) {
        if (holder.requestFrom == RequestFrom.LOCAL) {
            holder.loadStartTime = System.currentTimeMillis();
        }
        super.handleRequestAsync(holder, callback);
    }

    @Override
    public boolean handleRequestSync(@NonNull ResourceDataHolder holder) {
        if (holder.requestFrom == RequestFrom.LOCAL) {
            holder.loadStartTime = System.currentTimeMillis();
        }
        return super.handleRequestSync(holder);
    }

    @Override
    public void handleResponseAsync(@NonNull ResourceDataHolder holder,
            @NonNull ProcessorCallback callback) {
        HippyEngineContext engineContext = mEngineContextRef.get();
        if (shouldDoRecord(holder) && engineContext != null) {
            engineContext.getJsDriver().doRecordResourceLoadResult(holder.uri, holder.loadStartTime,
                    System.currentTimeMillis(), holder.resultCode, holder.errorMessage);
        }
        super.handleResponseAsync(holder, callback);
    }

    @Override
    public void handleResponseSync(@NonNull ResourceDataHolder holder) {
        HippyEngineContext engineContext = mEngineContextRef.get();
        if (shouldDoRecord(holder) && engineContext != null) {
            engineContext.getJsDriver().doRecordResourceLoadResult(holder.uri, holder.loadStartTime,
                    System.currentTimeMillis(), holder.resultCode, holder.errorMessage);
        }
        super.handleResponseSync(holder);
    }

    private boolean shouldDoRecord(@NonNull ResourceDataHolder holder) {
        return holder.requestFrom != RequestFrom.NATIVE && !UrlUtils.isBase64Url(holder.uri);
    }
}
