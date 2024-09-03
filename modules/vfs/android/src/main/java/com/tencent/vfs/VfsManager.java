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

import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.vfs.ResourceDataHolder.RequestFrom;
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class VfsManager {

    private static final String TAG = "VfsManager";

    @NonNull
    private final CopyOnWriteArrayList<Processor> mProcessorChain;
    private int mId;

    public VfsManager(@NonNull List<Processor> processors) {
        mProcessorChain = new CopyOnWriteArrayList<>(processors);
    }

    public VfsManager() {
        mProcessorChain = new CopyOnWriteArrayList<>();
    }

    public void setId(int id) {
        mId = id;
    }

    public int getId() {
        return mId;
    }

    public void addProcessor(int index, @NonNull Processor processor) {
        if (index < mProcessorChain.size()) {
            mProcessorChain.add(index, processor);
        }
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

    public void fetchResourceAsync(@NonNull String uri,
            @Nullable HashMap<String, String> requestHeaders,
            @Nullable HashMap<String, String> requestParams,
            @Nullable FetchResourceCallback callback) {
        onFetchResourceStart();
        fetchResourceAsyncImpl(uri, requestHeaders, requestParams, callback,
                RequestFrom.LOCAL, -1);
    }

    public ResourceDataHolder fetchResourceSync(@NonNull String uri,
            @Nullable HashMap<String, String> requestHeaders,
            @Nullable HashMap<String, String> requestParams) {
        onFetchResourceStart();
        ResourceDataHolder holder = fetchResourceSyncImpl(uri, requestHeaders, requestParams,
                RequestFrom.LOCAL);
        onFetchResourceEnd(holder);
        return holder;
    }

    private ResourceDataHolder fetchResourceSyncImpl(@NonNull String uri,
            @Nullable HashMap<String, String> requestHeaders,
            @Nullable HashMap<String, String> requestParams,
            RequestFrom from) {
        ResourceDataHolder holder = ResourceDataHolder.obtain();
        if (holder == null) {
            holder = new ResourceDataHolder(uri, requestHeaders, requestParams, from);
        } else {
            holder.init(uri, requestHeaders, requestParams, null, from, -1);
        }
        traverseForward(holder, true);
        return holder;
    }

    private void fetchResourceAsyncImpl(@NonNull String uri,
            @Nullable HashMap<String, String> requestHeaders,
            @Nullable HashMap<String, String> requestParams,
            @Nullable FetchResourceCallback callback, RequestFrom from, int nativeRequestId) {
        ResourceDataHolder holder = ResourceDataHolder.obtain();
        if (holder == null) {
            holder = new ResourceDataHolder(uri, requestHeaders, requestParams, callback, from, nativeRequestId);
        } else {
            holder.init(uri, requestHeaders, requestParams, callback, from, nativeRequestId);
        }
        traverseForward(holder, false);
    }

    private void traverseForward(@NonNull final ResourceDataHolder holder, final boolean isSync) {
        int index = holder.index + 1;
        if (index < mProcessorChain.size()) {
            holder.index = index;
            Processor processor = null;
            try {
                processor = mProcessorChain.get(index);
            } catch (IndexOutOfBoundsException e) {
                LogUtils.e(TAG, "traverseForward get index " + index + " processor exception: " + e.getMessage());
            }
            if (processor == null) {
                return;
            }
            if (isSync) {
                boolean goBack = processor.handleRequestSync(holder);
                if (goBack) {
                    traverseGoBack(holder, true);
                } else {
                    traverseForward(holder, true);
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
            Processor processor = null;
            try {
                processor = mProcessorChain.get(index);
            } catch (IndexOutOfBoundsException e) {
                LogUtils.e(TAG, "traverseGoBack get index " + index + " processor exception: " + e.getMessage());
            }
            if (processor == null) {
                return;
            }
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
            public void onFetchCompleted(@NonNull ResourceDataHolder dataHolder) {
                traverseGoBack(holder, false);
            }

            @Override
            public void onFetchProgress(long total, long loaded) {
                if (holder.callback != null) {
                    holder.callback.onFetchProgress(total, loaded);
                }
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

        /**
         * After the process chain traversal is completed, we need to call this method to
         * return the processing results to the original request initiator.
         *
         * @param dataHolder holder of resources fetch result
         */
        void onFetchCompleted(@NonNull ResourceDataHolder dataHolder);

        /**
         * Return the current progress when loading resources.
         *
         * @param total the total size of resources
         * @param loaded the current progress has loaded
         */
        void onFetchProgress(long total, long loaded);
    }

    public void doLocalTraversalsAsync(@NonNull String uri,
            @Nullable HashMap<String, String> requestHeaders,
            @Nullable HashMap<String, String> requestParams,
            int nativeRequestId, final int progressCallbackId) {
        FetchResourceCallback callback = new FetchResourceCallback() {
            @Override
            public void onFetchCompleted(@NonNull ResourceDataHolder dataHolder) {
                onTraversalsEndAsync(dataHolder);
            }

            @Override
            public void onFetchProgress(long total, long loaded) {
                if (progressCallbackId >= 0) {
                    onProgress(progressCallbackId, total, loaded);
                }
            }
        };
        fetchResourceAsyncImpl(uri, requestHeaders, requestParams, callback, RequestFrom.NATIVE,
                nativeRequestId);
    }

    public ResourceDataHolder doLocalTraversalsSync(@NonNull String uri,
            @Nullable HashMap<String, String> requestHeaders,
            @Nullable HashMap<String, String> requestParams) {
        return fetchResourceSyncImpl(uri, requestHeaders, requestParams, RequestFrom.NATIVE);
    }

    /**
     * Request from JAVA, after java chain traversals end, continue traverse native (C++) chain.
     */
    @SuppressWarnings("JavaJniMissingFunction")
    private native void doNativeTraversalsAsync(int id, ResourceDataHolder holder,
            FetchResourceCallback callback);

    @SuppressWarnings("JavaJniMissingFunction")
    private native void doNativeTraversalsSync(int id, ResourceDataHolder holder);

    /**
     * Request from native (C++), after java chain traversals end, asynchronously return the result
     * to native (C++).
     */
    @SuppressWarnings("JavaJniMissingFunction")
    private native void onTraversalsEndAsync(ResourceDataHolder holder);

    @SuppressWarnings("JavaJniMissingFunction")
    private native void onProgress(int callbackId, long total, long loaded);
}
