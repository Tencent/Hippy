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
import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.adapter.executor.HippyExecutorSupplierAdapter;
import com.tencent.mtt.hippy.adapter.http.HippyHttpAdapter;
import com.tencent.mtt.hippy.adapter.http.HippyHttpRequest;
import com.tencent.mtt.hippy.adapter.http.HippyHttpResponse;
import com.tencent.mtt.hippy.utils.ContextHolder;
import com.tencent.vfs.ResourceDataHolder;
import com.tencent.vfs.ResourceDataHolder.FetchResultCode;
import com.tencent.vfs.ResourceLoader;
import com.tencent.vfs.UrlUtils;
import com.tencent.vfs.VfsManager.ProcessorCallback;
import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.ByteBuffer;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class HippyResourceLoader implements ResourceLoader {

    private static final String PREFIX_FILE = "file://";
    private static final String PREFIX_ASSETS = "assets://";
    private final HippyHttpAdapter mHttpAdapter;
    private final HippyExecutorSupplierAdapter mExecutorAdapter;

    public HippyResourceLoader(@NonNull HippyHttpAdapter httpAdapter,
            @NonNull HippyExecutorSupplierAdapter executorAdapter) {
        mHttpAdapter = httpAdapter;
        mExecutorAdapter = executorAdapter;
    }

    @Override
    public void fetchResourceAsync(@NonNull final ResourceDataHolder holder,
            @Nullable final ProcessorCallback callback) {
        if (UrlUtils.isWebUrl(holder.uri)) {
            loadRemoteResource(holder, callback);
        } else if (holder.uri.startsWith(PREFIX_FILE) || holder.uri.startsWith(PREFIX_ASSETS)) {
            mExecutorAdapter.getBackgroundTaskExecutor().execute(new Runnable() {
                @Override
                public void run() {
                    if (callback != null) {
                        loadLocalFileResource(holder);
                        callback.onHandleCompleted();
                    }
                }
            });
        } else {
            callback.goNext();
        }
    }

    private void loadRemoteResource(@NonNull final ResourceDataHolder holder,
            @Nullable final ProcessorCallback callback) {
        HippyHttpRequest request = new HippyHttpRequest();
        request.setUrl(holder.uri);
        mHttpAdapter.sendRequest(request, new HippyHttpAdapter.HttpTaskCallback() {
            @Override
            public void onTaskSuccess(HippyHttpRequest request, HippyHttpResponse response)
                    throws Exception {
                if (callback == null) {
                    return;
                }
                if (response.getStatusCode() == 200 && response.getInputStream() != null) {
                    readResourceDataFromStream(holder, response.getInputStream());
                    setResponseHeaderToHolder(holder, response);
                } else {
                    String message = "unknown";
                    if (response.getErrorStream() != null) {
                        StringBuilder sb = new StringBuilder();
                        String readLine;
                        //noinspection CharsetObjectCanBeUsed
                        BufferedReader bfReader = new BufferedReader(
                                new InputStreamReader(response.getErrorStream(), "UTF-8"));
                        while ((readLine = bfReader.readLine()) != null) {
                            sb.append(readLine);
                            sb.append("\r\n");
                        }
                        message = sb.toString();
                    }
                    holder.resultCode = response.getStatusCode();
                    holder.errorMessage = (
                            "Could not connect to development server." + "URL: " + holder.uri
                                    + "  try to :adb reverse tcp:38989 tcp:38989 , message : "
                                    + message);
                }
                callback.onHandleCompleted();
            }

            @Override
            public void onTaskFailed(HippyHttpRequest request, Throwable error) {
                if (callback != null) {
                    holder.errorMessage = (
                            "Could not connect to development server." + "URL: " + holder.uri
                                    + "  try to :adb reverse tcp:38989 tcp:38989 , message : "
                                    + error.getMessage());
                    callback.onHandleCompleted();
                }
            }
        });
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
            readResourceDataFromStream(holder, inputStream);
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
        if (holder.uri.startsWith(PREFIX_FILE) || holder.uri.startsWith(PREFIX_ASSETS)) {
            loadLocalFileResource(holder);
            return true;
        }
        if (UrlUtils.isWebUrl(holder.uri)) {
            holder.resultCode = FetchResultCode.ERR_NOT_SUPPORT_SYNC_REMOTE.ordinal();
            holder.errorMessage = "Loading remote resources synchronously is not supported!";
        }
        return false;
    }

    private void setResponseHeaderToHolder(@NonNull final ResourceDataHolder holder,
            @NonNull HippyHttpResponse response) {
        if (holder.responseHeader == null) {
            holder.responseHeader = new HashMap<>();
        }
        holder.responseHeader.put("statusCode", response.getStatusCode().toString());
        Map<String, List<String>> headers = response.getRspHeaderMaps();
        if (headers == null) {
            return;
        }
        for (Map.Entry<String, List<String>> entry : headers.entrySet()) {
            String key = entry.getKey();
            List<String> list = entry.getValue();
            if (list != null) {
                if (list.size() == 1) {
                    holder.responseHeader.put(key, list.get(0));
                } else if (list.size() > 1) {
                    holder.responseHeader.put(key, String.join(";", list));
                }
            }
        }
    }

    private void readResourceDataFromStream(@NonNull final ResourceDataHolder holder,
            @NonNull InputStream inputStream) throws IOException {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        byte[] b = new byte[2048];
        int size;
        while ((size = inputStream.read(b)) > 0) {
            output.write(b, 0, size);
        }
        byte[] resBytes = output.toByteArray();
        holder.data = ByteBuffer.wrap(resBytes);
    }
}
