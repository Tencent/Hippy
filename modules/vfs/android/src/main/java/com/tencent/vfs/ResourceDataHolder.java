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

import android.graphics.Bitmap;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.openhippy.pool.RecycleObject;
import com.tencent.vfs.VfsManager.FetchResourceCallback;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.util.HashMap;

public class ResourceDataHolder extends RecycleObject {

    public enum RequestFrom {
        NATIVE,
        LOCAL,
    }

    public enum TransferType {
        NORMAL,
        NIO,
    }

    public final static int RESOURCE_LOAD_SUCCESS_CODE = 0;

    @NonNull
    public String uri;
    @Nullable
    public ByteBuffer buffer;
    @Nullable
    public byte[] bytes;
    @Nullable
    public Bitmap bitmap;
    @Nullable
    public HashMap<String, String> requestHeaders;
    @Nullable
    public HashMap<String, String> requestParams;
    @Nullable
    public HashMap<String, String> responseHeaders;
    @Nullable
    public FetchResourceCallback callback;
    public TransferType transferType = TransferType.NORMAL;
    public RequestFrom requestFrom;
    public int nativeRequestId;
    public int index = -1;
    public long loadStartTime = 0;
    // The resource loading error code is defined by the processor itself,
    // a value other than 0 indicates failure, and a value of 0 indicates success.
    public int resultCode = -1;
    public String requestId;
    @Nullable
    public String errorMessage;
    @Nullable
    public String processorTag;

    public ResourceDataHolder(@NonNull String uri, @Nullable HashMap<String, String> requestHeaders,
            @Nullable HashMap<String, String> requestParams, RequestFrom from) {
        init(uri, requestHeaders, requestParams, null, from, -1);
    }

    public ResourceDataHolder(@NonNull String uri,
            @Nullable HashMap<String, String> requestHeaders,
            @Nullable HashMap<String, String> requestParams,
            @Nullable FetchResourceCallback callback,
            RequestFrom from, int nativeRequestId) {
        init(uri, requestHeaders, requestParams, callback, from, nativeRequestId);
    }

    public void init(@NonNull String uri, @Nullable HashMap<String, String> requestHeaders,
            @Nullable HashMap<String, String> requestParams, @Nullable FetchResourceCallback callback,
            RequestFrom from, int nativeRequestId) {
        this.uri = uri;
        this.requestHeaders = requestHeaders;
        this.requestParams = requestParams;
        this.callback = callback;
        this.requestFrom = from;
        this.nativeRequestId = nativeRequestId;
    }

    @Nullable
    public static ResourceDataHolder obtain() {
        RecycleObject recycleObject = RecycleObject.obtain(ResourceDataHolder.class.getSimpleName());
        return (recycleObject instanceof ResourceDataHolder) ? ((ResourceDataHolder) recycleObject)
                : null;
    }

    @Override
    public void recycle() {
        buffer = null;
        bytes = null;
        bitmap = null;
        callback = null;
        errorMessage = null;
        processorTag = null;
        loadStartTime = 0;
        index = -1;
        resultCode = -1;
        transferType = TransferType.NORMAL;
        RecycleObject.recycle(this);
    }

    public void addResponseHeaderProperty(@NonNull String key, @NonNull String Property) {
        if (responseHeaders == null) {
            responseHeaders = new HashMap<>();
        }
        responseHeaders.put(key, Property);
    }

    public void readResourceDataFromStream(@NonNull InputStream inputStream) throws IOException {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        byte[] b = new byte[8192];
        int size;
        while ((size = inputStream.read(b)) > 0) {
            output.write(b, 0, size);
        }
        byte[] resBytes = output.toByteArray();
        if (transferType == TransferType.NIO) {
            buffer = ByteBuffer.allocateDirect(resBytes.length);
            buffer.put(resBytes);
        } else {
            bytes = resBytes;
        }
    }

    @Nullable
    public byte[] getBytes() {
        if (transferType == TransferType.NORMAL) {
            return bytes;
        } else if (buffer != null) {
            buffer.flip();
            byte[] bytes = new byte[buffer.remaining()];
            buffer.get(bytes);
            return bytes;
        }
        return null;
    }
}
