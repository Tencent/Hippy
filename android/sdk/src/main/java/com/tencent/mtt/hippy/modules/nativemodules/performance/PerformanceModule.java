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

package com.tencent.mtt.hippy.modules.nativemodules.performance;

import android.os.Handler;
import android.os.Looper;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.adapter.monitor.HippyEngineMonitorAdapter;
import com.tencent.mtt.hippy.annotation.HippyMethod;
import com.tencent.mtt.hippy.annotation.HippyNativeModule;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;
import com.tencent.mtt.hippy.utils.TimeMonitor;
import java.util.Iterator;
import java.util.Map;

@HippyNativeModule(name = "PerformanceModule")
public class PerformanceModule extends HippyNativeModuleBase {

    private final Handler mHandler;

    public PerformanceModule(HippyEngineContext context) {
        super(context);
        mHandler = new Handler(Looper.getMainLooper());
    }

    @HippyMethod(isSync = true)
    public void mark(final String eventName, final long timeMillis) {
        HippyRootView rootView = mContext.getInstance();
        TimeMonitor monitor = rootView.getTimeMonitor();
        if (monitor != null) {
            monitor.addCustomPoint(eventName, timeMillis);
        }
        HippyEngineMonitorAdapter adapter = mContext.getGlobalConfigs().getEngineMonitorAdapter();
        if (adapter != null) {
            mHandler.post(() -> adapter.reportCustomMonitorPoint(rootView, eventName, timeMillis));
        }
    }

    @HippyMethod(isSync = true)
    public HippyArray getEntries() {
        HippyArray result = new HippyArray();
        HippyRootView rootView = mContext.getInstance();
        TimeMonitor monitor = rootView.getTimeMonitor();
        if (monitor == null) {
            return result;
        }
        HippyMap entry = new HippyMap();
        entry.pushString("name", rootView.getName());
        entry.pushString("entryType", "navigation");
        Map<String, Long> points = monitor.getAllPoints();
        for (Map.Entry<String, Long> point : points.entrySet()) {
            entry.pushLong(point.getKey(), point.getValue());
        }
        result.pushMap(entry);
        return result;
    }

}
