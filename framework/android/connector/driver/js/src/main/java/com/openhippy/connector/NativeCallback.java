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

package com.openhippy.connector;

import android.os.Handler;
import android.os.Message;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public abstract class NativeCallback {

    private final Handler mHandler;

    public NativeCallback(@NonNull Handler handler) {
        mHandler = handler;
    }

    public final void nativeCallback(final long result, final String reason, @Nullable final String payload) {
        mHandler.post(new Runnable() {
            @Override
            public void run() {
                NativeCallback.this.callback(result, reason, payload);
            }
        });
    }

    public Handler getHandler() {
        return mHandler;
    }

    public abstract void callback(long result, String reason, @Nullable String payload);
}
