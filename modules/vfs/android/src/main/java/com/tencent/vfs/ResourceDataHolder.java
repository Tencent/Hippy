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
import java.util.Map;

public class ResourceDataHolder {

    public enum FetchResultCode {
        OK,
        ERR_OPEN_LOCAL_FILE,
        ERR_NOT_SUPPORT_SYNC_REMOTE,
    }

    public enum RequestFrom {
        NATIVE,
        LOCAL,
    }

    @NonNull
    public String uri;
    @Nullable
    public ByteBuffer data;
    @Nullable
    public Map<String, Object> requestHeader;
    @Nullable
    public Map<String, String> responseHeader;
    @Nullable
    public FetchResourceCallback callback;
    public final RequestFrom requestFrom;
    public String errorMessage;
    public int resultCode = FetchResultCode.OK.ordinal();
    public int nativeId;
    public int index = -1;

    public ResourceDataHolder(@NonNull String uri, @Nullable Map<String, Object> params,
            RequestFrom from) {
        this.requestFrom = from;
        init(uri, params, null, -1);
    }

    public ResourceDataHolder(@NonNull String uri, @Nullable Map<String, Object> params,
            @Nullable FetchResourceCallback callback, RequestFrom from, int nativeId) {
        this.requestFrom = from;
        init(uri, params, callback, nativeId);
    }

    private void init(@NonNull String uri, @Nullable Map<String, Object> params,
            @Nullable FetchResourceCallback callback, int nativeId) {
        this.uri = uri;
        this.requestHeader = params;
        this.callback = callback;
        this.nativeId = nativeId;
    }
}
