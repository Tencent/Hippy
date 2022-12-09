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

import static com.tencent.vfs.UrlUtils.PREFIX_ASSETS;
import static com.tencent.vfs.UrlUtils.PREFIX_FILE;

import androidx.annotation.NonNull;
import com.tencent.mtt.hippy.adapter.executor.HippyExecutorSupplierAdapter;
import com.tencent.mtt.hippy.adapter.http.HippyHttpAdapter;
import com.tencent.mtt.hippy.utils.ContextHolder;
import com.tencent.vfs.ResourceDataHolder;
import com.tencent.vfs.ResourceLoader;
import com.tencent.vfs.UrlUtils;
import com.tencent.vfs.VfsManager.ProcessorCallback;
import java.io.IOException;
import java.io.InputStream;

public class HippyResourceLoader implements ResourceLoader {

    private static final String TAG = "HippyResourceLoader";
    private final Object mRemoteSyncObject = new Object();
    private final HippyEngineContext mEngineContext;

    public enum FetchResultCode {
        OK,
        ERR_OPEN_LOCAL_FILE,
        ERR_UNKNOWN_SCHEME,
        ERR_REMOTE_REQUEST_FAILED,
    }

    public HippyResourceLoader(@NonNull HippyEngineContext engineContext) {
        mEngineContext = engineContext;
    }

    @Override
    public void fetchResourceAsync(@NonNull final ResourceDataHolder holder,
            @NonNull final ProcessorCallback callback) {
        if (UrlUtils.isWebUrl(holder.uri)) {
            loadRemoteResource(holder, callback);
        } else if (UrlUtils.isLocalUrl(holder.uri)) {
            HippyExecutorSupplierAdapter executorAdapter = mEngineContext.getGlobalConfigs().getExecutorSupplierAdapter();
            executorAdapter.getBackgroundTaskExecutor().execute(new Runnable() {
                @Override
                public void run() {
                    loadLocalFileResource(holder);
                    callback.onHandleCompleted();
                }
            });
        } else {
            holder.resultCode = FetchResultCode.ERR_UNKNOWN_SCHEME.ordinal();
            callback.goNext();
        }
    }

    private void loadRemoteResource(@NonNull final ResourceDataHolder holder,
            @NonNull final ProcessorCallback callback) {
        HippyHttpAdapter httpAdapter = mEngineContext.getGlobalConfigs().getHttpAdapter();
        httpAdapter.fetch(holder, mEngineContext.getNativeParams(), callback);
    }

    private void loadLocalFileResource(@NonNull final ResourceDataHolder holder) {
        String fileName = holder.uri;
        if (holder.uri.startsWith(PREFIX_FILE)) {
            fileName = holder.uri.substring(PREFIX_FILE.length());
        } else if (holder.uri.startsWith(PREFIX_ASSETS)) {
            fileName = holder.uri.substring(PREFIX_ASSETS.length());
        }
        InputStream inputStream = null;
        try {
            inputStream = ContextHolder.getAppContext().getAssets().open(fileName);
            holder.readResourceDataFromStream(inputStream);
            holder.resultCode = FetchResultCode.OK.ordinal();
        } catch (IOException e) {
            holder.resultCode = FetchResultCode.ERR_OPEN_LOCAL_FILE.ordinal();
            holder.errorMessage = "Load " + holder.uri + " failed! " + e.getMessage();
        } finally {
            if (inputStream != null) {
                try {
                    inputStream.close();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }

    @Override
    public boolean fetchResourceSync(@NonNull ResourceDataHolder holder) {
        if (UrlUtils.isLocalUrl(holder.uri)) {
            loadLocalFileResource(holder);
        } else if (UrlUtils.isWebUrl(holder.uri)) {
            loadRemoteResource(holder, new ProcessorCallback() {
                @Override
                public void goNext() {

                }

                @Override
                public void onHandleCompleted() {
                    synchronized (mRemoteSyncObject) {
                        mRemoteSyncObject.notify();
                    }
                }
            });
            try {
                synchronized (mRemoteSyncObject) {
                    mRemoteSyncObject.wait();
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        } else {
            holder.resultCode = FetchResultCode.ERR_UNKNOWN_SCHEME.ordinal();
            return false;
        }
        return true;
    }
}
