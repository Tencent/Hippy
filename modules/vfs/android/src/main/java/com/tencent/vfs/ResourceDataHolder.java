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

import com.tencent.vfs.VfsManager.FetchResourceCallback;
import java.nio.ByteBuffer;
import java.util.HashMap;

public class ResourceDataHolder {

    public enum FetchResultCode {
        OK,
        ERR_OPEN_LOCAL_FILE,
        ERR_UNKNOWN_SCHEME,
        ERR_REMOTE_REQUEST_FAILED,
    }

    public enum RequestFrom {
        NATIVE,
        LOCAL,
    }

    public enum TransferType {
        NORMAL,
        NIO,
    }

    @NonNull
    public String uri;
    @Nullable
    public ByteBuffer buffer;
    @Nullable
    public byte[] bytes;
    @Nullable
    public HashMap<String, String> requestHeader;
    @Nullable
    public HashMap<String, String> responseHeader;
    @Nullable
    public FetchResourceCallback callback;
    public TransferType transferType = TransferType.NORMAL;
    public final RequestFrom requestFrom;
    public String errorMessage;
    public int resultCode = FetchResultCode.OK.ordinal();
    public int nativeId;
    public int index = -1;

    public ResourceDataHolder(@NonNull String uri, @Nullable HashMap<String, String> params,
            RequestFrom from) {
        this.requestFrom = from;
        this.uri = uri;
        init(params, null, -1);
    }

    public ResourceDataHolder(@NonNull String uri, @Nullable HashMap<String, String> params,
            @Nullable FetchResourceCallback callback, RequestFrom from, int nativeId) {
        this.requestFrom = from;
        this.uri = uri;
        init(params, callback, nativeId);
    }

    private void init(@Nullable HashMap<String, String> params,
            @Nullable FetchResourceCallback callback, int nativeId) {
        this.requestHeader = params;
        this.callback = callback;
        this.nativeId = nativeId;
    }
}
