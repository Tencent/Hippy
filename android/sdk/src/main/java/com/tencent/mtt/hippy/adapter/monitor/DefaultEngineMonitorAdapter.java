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
package com.tencent.mtt.hippy.adapter.monitor;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.HippyRootView;

import com.tencent.mtt.hippy.bridge.HippyCallNativeParams;
import java.util.List;

@SuppressWarnings({"unused"})
public class DefaultEngineMonitorAdapter implements HippyEngineMonitorAdapter {

    @Override
    public void reportEngineLoadStart() {

    }

    @Override
    public void reportEngineLoadResult(int code, int loadTime,
            List<HippyEngineMonitorEvent> loadEvents, Throwable e) {

    }

    @Override
    public void reportModuleLoadComplete(HippyRootView rootView, int loadTime,
            List<HippyEngineMonitorEvent> loadEvents) {

    }

    @Override
    public boolean needReportBridgeANR() {
        return false;
    }

    @Override
    public void reportBridgeANR(String message) {

    }

    @Override
    public void reportDoCallNatives(String moduleName, String moduleFunc) {

    }

    @Override
    public void reportGestureEventCallStack(String funcName, String msg) {

    }

    @Override
    public void reportClickEvent(Object object, boolean isCustomEvent) {

    }

    @Override
    public boolean onInterceptCallNative(@NonNull String componentName,
            @NonNull HippyCallNativeParams params) {
        return false;
    }

    @Override
    public void onCallNativeFinished(@NonNull String componentName, @NonNull HippyCallNativeParams params) {
    }

    @Override
    public boolean onInterceptPromiseCallback(@NonNull String componentName,
            @NonNull String moduleName,
            @NonNull String funcName, @NonNull String callBackId, @Nullable Object callbackResult) {
        return false;
    }

}
