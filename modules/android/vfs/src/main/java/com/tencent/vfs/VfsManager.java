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
import androidx.annotation.Nullable;

import java.nio.ByteBuffer;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

public class VfsManager {

    private final CopyOnWriteArrayList<Processor> mChain = new CopyOnWriteArrayList<>();

    public VfsManager() {
        onCreateVfs();
    }

    public void addProcessorAtFirst(@NonNull Processor processor) {
        mChain.add(0, processor);
    }

    public void addProcessorAtLast(@NonNull Processor processor) {
        mChain.add(mChain.size(), processor);
    }

    public void removeProcessor(@NonNull Processor processor) {
        mChain.remove(processor);
    }

    public void destroy() {
        mChain.clear();
    }

    public void fetchResourceAsync(@NonNull String uri, @Nullable Map<String, Object> params,
            @Nullable FetchResourceCallback callback) {
        fetchResourceAsyncImpl(uri, params, callback, null, -1, true);
    }

    public ResourceDataHolder fetchResourceSync(@NonNull String uri,
            @Nullable Map<String, Object> params) {
        return fetchResourceSyncImpl(uri, params, null, true);
    }

    private ResourceDataHolder fetchResourceSyncImpl(@NonNull String uri,
            @Nullable Map<String, Object> params, @Nullable ByteBuffer data,
            boolean doNativeTraversals) {
        ResourceDataHolder holder = new ResourceDataHolder(uri, params, null, data, -1);
        for (Processor processor : mChain) {
            processor.handle(holder);
            if (!processor.goNext()) {
                return holder;
            }
        }
        if (doNativeTraversals) {
            return doNativeTraversalsSync(holder);
        }
        return holder;
    }

    private void fetchResourceAsyncImpl(@NonNull String uri, @Nullable Map<String, Object> params,
            @Nullable FetchResourceCallback callback, @Nullable ByteBuffer data, int nativeId,
            boolean doNativeTraversals) {
        ResourceDataHolder holder = new ResourceDataHolder(uri, params, callback, data, nativeId);
        performTraversals(holder, doNativeTraversals);
    }

    private void onTraversalsEnd(@NonNull final ResourceDataHolder holder) {
        if (holder.callback != null) {
            holder.callback.onFetchCompleted(holder);
        }
    }

    private void traverseNext(int index, @NonNull final ResourceDataHolder holder,
            final boolean doNativeTraversals) {
        final Processor processor = mChain.get(index);
        holder.index = index;
        if (processor == null) {
            performTraversals(holder, doNativeTraversals);
            return;
        }
        processor.handle(holder, new ProcessorCallback() {
            @Override
            public void onHandleCompleted() {
                if (processor.goNext()) {
                    performTraversals(holder, doNativeTraversals);
                } else {
                    onTraversalsEnd(holder);
                }
            }
        });
    }

    private void performNativeTraversals(@NonNull final ResourceDataHolder holder) {
        doNativeTraversalsAsync(holder, new FetchResourceCallback() {
            @Override
            public void onFetchCompleted(ResourceDataHolder dataHolder) {
                onTraversalsEnd(holder);
            }
        });
    }

    private void performTraversals(@NonNull final ResourceDataHolder holder,
            final boolean doNativeTraversals) {
        if (holder.index < 0) {
            if (mChain.size() > 0) {
                traverseNext(0, holder, doNativeTraversals);
            } else if (doNativeTraversals) {
                performNativeTraversals(holder);
            } else {
                onTraversalsEnd(holder);
            }
        } else {
            int index = holder.index + 1;
            if (index < mChain.size()) {
                traverseNext(index, holder, doNativeTraversals);
            } else if (doNativeTraversals) {
                performNativeTraversals(holder);
            } else {
                onTraversalsEnd(holder);
            }
        }
    }

    public interface ProcessorCallback {

        void onHandleCompleted();
    }

    public interface FetchResourceCallback {

        void onFetchCompleted(ResourceDataHolder dataHolder);
    }

    public void fetchResourceAsync(@NonNull String uri, @Nullable ByteBuffer data,
            @Nullable Map<String, Object> params, int nativeId) {
        FetchResourceCallback callback = new FetchResourceCallback() {
            @Override
            public void onFetchCompleted(ResourceDataHolder dataHolder) {
                onTraversalsEndAsync(dataHolder);
            }
        };
        fetchResourceAsyncImpl(uri, params, callback, data, nativeId, false);
    }

    public ResourceDataHolder fetchResourceSync(@NonNull String uri, @Nullable ByteBuffer data,
            @Nullable Map<String, Object> params) {
        return fetchResourceSyncImpl(uri, params, data, false);
    }

    private native void onCreateVfs();

    /**
     * Request from JAVA, after java chain traversals end, continue traverse native (C++) chain.
     */
    private native void doNativeTraversalsAsync(ResourceDataHolder holder,
            FetchResourceCallback callback);

    private native ResourceDataHolder doNativeTraversalsSync(ResourceDataHolder holder);

    /**
     * Request from native (C++), after java chain traversals end, asynchronously return the result
     * to native (C++).
     */
    private native void onTraversalsEndAsync(ResourceDataHolder holder);
}
