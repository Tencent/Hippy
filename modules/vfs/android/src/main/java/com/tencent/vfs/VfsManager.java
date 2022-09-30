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

import com.tencent.vfs.ResourceDataHolder.RequestFrom;
import java.util.HashMap;
import java.util.concurrent.CopyOnWriteArrayList;

public class VfsManager {

    private final CopyOnWriteArrayList<Processor> mProcessorChain = new CopyOnWriteArrayList<>();
    private final int mId;

    public VfsManager() {
        mId = onCreateVfs();
    }

    public void Destroy() {
        onDestroyVfs(mId);
    }

    public int getId() {
        return mId;
    }

    public void addProcessor(@NonNull Processor processor) {
        addProcessorAtFirst(processor);
    }

    public void addProcessorAtFirst(@NonNull Processor processor) {
        mProcessorChain.add(0, processor);
    }

    public void addProcessorAtLast(@NonNull Processor processor) {
        mProcessorChain.add(mProcessorChain.size(), processor);
    }

    public void removeProcessor(@NonNull Processor processor) {
        mProcessorChain.remove(processor);
    }

    public void destroy() {
        mProcessorChain.clear();
    }

    public void fetchResourceAsync(@NonNull String uri, @Nullable HashMap<String, Object> params,
            @Nullable FetchResourceCallback callback) {
        onFetchResourceStart();
        fetchResourceAsyncImpl(uri, params, callback, RequestFrom.LOCAL, -1);
    }

    public ResourceDataHolder fetchResourceSync(@NonNull String uri,
            @Nullable HashMap<String, Object> params) {
        onFetchResourceStart();
        ResourceDataHolder holder = fetchResourceSyncImpl(uri, params, RequestFrom.LOCAL);
        onFetchResourceEnd(holder);
        return holder;
    }

    private ResourceDataHolder fetchResourceSyncImpl(@NonNull String uri,
            @Nullable HashMap<String, Object> params, RequestFrom from) {
        ResourceDataHolder holder = new ResourceDataHolder(uri, params, from);
        traverseForward(holder, true);
        return holder;
    }

    private void fetchResourceAsyncImpl(@NonNull String uri, @Nullable HashMap<String, Object> params,
            @Nullable FetchResourceCallback callback, RequestFrom from, int nativeId) {
        ResourceDataHolder holder = new ResourceDataHolder(uri, params, callback, from, nativeId);
        traverseForward(holder, false);
    }

    private void traverseForward(@NonNull final ResourceDataHolder holder, final boolean isSync) {
        int index = holder.index + 1;
        if (index < mProcessorChain.size()) {
            holder.index = index;
            Processor processor = mProcessorChain.get(index);
            if (isSync) {
                boolean goNext = processor.handleRequestSync(holder);
                if(goNext) {
                    traverseForward(holder, true);
                } else {
                    traverseGoBack(holder, true);
                }
            } else {
                processor.handleRequestAsync(holder, new ProcessorCallback() {
                    @Override
                    public void goNext() {
                        traverseForward(holder, false);
                    }

                    @Override
                    public void onHandleCompleted() {
                        traverseGoBack(holder, false);
                    }
                });
            }
        } else if (isSync) {
            if (holder.requestFrom == RequestFrom.LOCAL) {
                doNativeTraversalsSync(mId, holder);
            } else if (holder.requestFrom == RequestFrom.NATIVE) {
                traverseGoBack(holder, true);
            }
        } else {
            if (holder.requestFrom == RequestFrom.LOCAL) {
                performNativeTraversals(holder);
            } else if (holder.requestFrom == RequestFrom.NATIVE) {
                traverseGoBack(holder, false);
            }
        }
    }

    private void traverseGoBack(@NonNull final ResourceDataHolder holder, final boolean isSync) {
        int index = holder.index - 1;
        if (index >= 0 && index < mProcessorChain.size()) {
            holder.index = index;
            Processor processor = mProcessorChain.get(index);
            if (isSync) {
                processor.handleResponseSync(holder);
                traverseGoBack(holder, true);
            } else {
                processor.handleResponseAsync(holder, new ProcessorCallback() {
                    @Override
                    public void goNext() {
                        // It only needs to be processed when traversing forward
                    }

                    @Override
                    public void onHandleCompleted() {
                        traverseGoBack(holder, false);
                    }
                });
            }
        } else if (!isSync) {
            if (holder.requestFrom == RequestFrom.LOCAL) {
                onFetchResourceEnd(holder);
            } else if (holder.requestFrom == RequestFrom.NATIVE) {
                onTraversalsEndAsync(holder);
            }
        }
    }

    private void performNativeTraversals(@NonNull final ResourceDataHolder holder) {
        doNativeTraversalsAsync(mId, holder, new FetchResourceCallback() {
            @Override
            public void onFetchCompleted(ResourceDataHolder dataHolder) {
                traverseGoBack(holder, false);
            }
        });
    }

    private void onFetchResourceStart() {

    }

    private void onFetchResourceEnd(@NonNull final ResourceDataHolder holder) {
        if (holder.callback != null) {
            holder.callback.onFetchCompleted(holder);
        }
    }

    public interface ProcessorCallback {

        /**
         * Should go next processor, only used when processing requests.
         */
        void goNext();

        /**
         * Response or request processing completion callback.
         *
         * <p>
         * If calls back this interface after processing the request, it will not be handed over to
         * the next processor.
         * </p>
         */
        void onHandleCompleted();
    }

    public interface FetchResourceCallback {

        void onFetchCompleted(ResourceDataHolder dataHolder);
    }

    public void doLocalTraversalsAsync(@NonNull String uri, @Nullable HashMap<String, Object> params,
            int nativeId) {
        FetchResourceCallback callback = new FetchResourceCallback() {
            @Override
            public void onFetchCompleted(ResourceDataHolder dataHolder) {
                onTraversalsEndAsync(dataHolder);
            }
        };
        fetchResourceAsyncImpl(uri, params, callback, RequestFrom.NATIVE, nativeId);
    }

    public ResourceDataHolder doLocalTraversalsSync(@NonNull String uri,
            @Nullable HashMap<String, Object> params) {
        return fetchResourceSyncImpl(uri, params, RequestFrom.NATIVE);
    }

    private native int onCreateVfs();

    private native void onDestroyVfs(int id);

    /**
     * Request from JAVA, after java chain traversals end, continue traverse native (C++) chain.
     */
    private native void doNativeTraversalsAsync(int id, ResourceDataHolder holder,
            FetchResourceCallback callback);

    private native void doNativeTraversalsSync(int id, ResourceDataHolder holder);

    /**
     * Request from native (C++), after java chain traversals end, asynchronously return the result
     * to native (C++).
     */
    private native void onTraversalsEndAsync(ResourceDataHolder holder);
}
