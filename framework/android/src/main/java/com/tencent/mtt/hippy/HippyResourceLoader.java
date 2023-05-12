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
import static com.tencent.vfs.UrlUtils.PREFIX_BASE64;
import static com.tencent.vfs.UrlUtils.PREFIX_FILE;

import android.util.Base64;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.adapter.executor.HippyExecutorSupplierAdapter;
import com.tencent.mtt.hippy.adapter.http.HippyHttpAdapter;
import com.tencent.mtt.hippy.utils.ContextHolder;
import com.tencent.vfs.ResourceDataHolder;
import com.tencent.vfs.ResourceLoader;
import com.tencent.vfs.UrlUtils;
import com.tencent.vfs.VfsManager.ProcessorCallback;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

public class HippyResourceLoader implements ResourceLoader {

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
            HippyExecutorSupplierAdapter executorAdapter = mEngineContext.getGlobalConfigs()
                    .getExecutorSupplierAdapter();
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

    private void onLoadLocalResourceFailed(@NonNull final ResourceDataHolder holder,
            @Nullable Throwable throwable) {
        holder.resultCode = FetchResultCode.ERR_OPEN_LOCAL_FILE.ordinal();
        if (throwable != null) {
            holder.errorMessage = throwable.getMessage();
        }
    }

    private void loadBase64Resource(@NonNull final ResourceDataHolder holder) {
        try {
            int base64Index = holder.uri.indexOf(PREFIX_BASE64);
            if (base64Index >= 0) {
                base64Index += PREFIX_BASE64.length();
                String base64String = holder.uri.substring(base64Index);
                holder.bytes = Base64.decode(base64String, Base64.DEFAULT);
                holder.resultCode = FetchResultCode.OK.ordinal();
            }
        } catch (Exception e) {
            onLoadLocalResourceFailed(holder, e);
        }
    }

    private void loadLocalFileResource(@NonNull final ResourceDataHolder holder) {
        if (UrlUtils.isBase64Url(holder.uri)) {
            loadBase64Resource(holder);
            return;
        }
        boolean isAssetsFile = false;
        String fileName;
        if (UrlUtils.isFileUrl(holder.uri)) {
            fileName = holder.uri.substring(PREFIX_FILE.length());
        } else if (UrlUtils.isAssetsUrl(holder.uri)) {
            isAssetsFile = true;
            fileName = holder.uri.substring(PREFIX_ASSETS.length());
        } else {
            holder.resultCode = FetchResultCode.ERR_UNKNOWN_SCHEME.ordinal();
            return;
        }
        InputStream inputStream = null;
        try {
            if (isAssetsFile) {
                inputStream = ContextHolder.getAppContext().getAssets().open(fileName);
            } else {
                inputStream = new FileInputStream(fileName);
            }
            holder.readResourceDataFromStream(inputStream);
            holder.resultCode = FetchResultCode.OK.ordinal();
        } catch (IOException | NullPointerException e) {
            onLoadLocalResourceFailed(holder, e);
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
