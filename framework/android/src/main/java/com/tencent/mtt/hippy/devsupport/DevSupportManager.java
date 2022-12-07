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
package com.tencent.mtt.hippy.devsupport;

import android.content.Context;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.HippyGlobalConfigs;
import java.util.UUID;

@SuppressWarnings({"unused"})
public class DevSupportManager {

    final DevServerInterface mDevImp;
    final boolean mSupportDev;
    private UUID mInstanceUUID = UUID.randomUUID();

    public DevSupportManager(HippyGlobalConfigs configs, boolean debugMode, String serverHost,
            String bundleName, String remoteServerUrl) {
        mDevImp = new DevServerImpl(configs, serverHost, bundleName, remoteServerUrl, debugMode);
        mSupportDev = debugMode;
    }

    public DevServerInterface getDevImp() {
        return this.mDevImp;
    }

    public void setDevCallback(DevServerCallBack devCallback) {
        mDevImp.setDevServerCallback(devCallback);
    }

    public void attachToHost(Context context, int rootId) {
        mDevImp.attachToHost(context, rootId);
    }

    public void detachFromHost(Context context, int rootId) {
        mDevImp.detachFromHost(context, rootId);
    }

    public String createResourceUrl(String resName) {
        return mDevImp.createResourceUrl(resName);
    }

    public String createDebugUrl(String host) {
        return mDevImp.createDebugUrl(host, null, mInstanceUUID.toString());
    }

    public void handleException(Throwable throwable) {
        mDevImp.handleException(throwable);
    }

    public void onLoadResourceFailed(@NonNull String url, @Nullable String errorMessage) {
        mDevImp.onLoadResourceFailed(url, errorMessage);
    }

    public String getDevInstanceUUID() {
        return mInstanceUUID.toString();
    }

    public boolean isSupportDev() {
        return mSupportDev;
    }
}
