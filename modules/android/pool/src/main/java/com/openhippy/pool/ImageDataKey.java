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

package com.openhippy.pool;

import androidx.annotation.NonNull;

public class ImageDataKey {

    private static final int MAX_SOURCE_KEY_LEN = 128;
    @NonNull
    private final String mUri;
    private int mUriKey = 0;

    public ImageDataKey(@NonNull String url) {
        mUri = url;
    }

    public String getUri() {
        return mUri;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof ImageDataKey) {
            return mUri.equals(((ImageDataKey) obj).getUri());
        }
        return false;
    }

    @Override
    public int hashCode() {
        if (mUriKey == 0) {
            String keyUrl = mUri;
            if (mUri.length() > MAX_SOURCE_KEY_LEN) {
                keyUrl = mUri.substring(mUri.length() - MAX_SOURCE_KEY_LEN);
            }
            mUriKey = keyUrl.hashCode();
        }
        return mUriKey;
    }
}
