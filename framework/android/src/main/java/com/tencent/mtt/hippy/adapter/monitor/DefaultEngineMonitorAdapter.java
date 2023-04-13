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

import com.tencent.mtt.hippy.HippyEngine.EngineInitStatus;
import com.tencent.mtt.hippy.HippyEngine.ModuleLoadStatus;
import com.tencent.mtt.hippy.bridge.HippyCallNativeParams;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.TimeMonitor.MonitorGroup;
import com.tencent.mtt.hippy.utils.TimeMonitor.MonitorPoint;
import java.util.ArrayList;

public class DefaultEngineMonitorAdapter implements HippyEngineMonitorAdapter {

    private static final String TAG = "DefaultEngineMonitorAdapter";

    protected void printGroupTime(@NonNull MonitorGroup monitorGroup) {
        ArrayList<MonitorPoint> monitorPoints = monitorGroup.getMonitorPoints();
        if (monitorPoints != null) {
            for (MonitorPoint monitorPoint : monitorPoints) {
                LogUtils.i(TAG,
                        monitorPoint.key + ": " + (monitorPoint.endTime - monitorPoint.startTime)
                                + "ms");
            }
        }
        LogUtils.i(TAG, "total time: " + monitorGroup.totalTime);
    }

    @Override
    public void onEngineInitialized(EngineInitStatus statusCode, @NonNull MonitorGroup monitorGroup) {
        LogUtils.i(TAG, "engine initialization completed with result: " + statusCode);
        printGroupTime(monitorGroup);
    }

    @Override
    public void onLoadModuleCompleted(ModuleLoadStatus statusCode, @NonNull String componentName,
            @NonNull MonitorGroup monitorGroup) {
        LogUtils.i(TAG,
                componentName + " load module completed with result: " + statusCode);
        printGroupTime(monitorGroup);
    }

    @Override
    public void onLoadInstanceCompleted(@NonNull String componentName,
            @NonNull MonitorGroup monitorGroup) {
        LogUtils.i(TAG,
                componentName + " load instance completed with first view added");
        printGroupTime(monitorGroup);
    }

    @Override
    public boolean onInterceptCallNative(@NonNull String componentName,
            @NonNull HippyCallNativeParams params) {
        return false;
    }

    @Override
    public void onCallNativeFinished(@NonNull String componentName,
            @NonNull HippyCallNativeParams params) {
    }

    @Override
    public boolean onInterceptPromiseCallback(@NonNull String componentName,
            @NonNull String moduleName, @NonNull String funcName, @NonNull String callBackId,
            @Nullable Object callbackResult) {
        return false;
    }
}
