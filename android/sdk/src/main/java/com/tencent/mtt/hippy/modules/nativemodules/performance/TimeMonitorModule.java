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

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.adapter.monitor.HippyEngineMonitorEvent;
import com.tencent.mtt.hippy.annotation.HippyMethod;
import com.tencent.mtt.hippy.annotation.HippyNativeModule;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;
import com.tencent.mtt.hippy.runtime.builtins.JSObject;
import com.tencent.mtt.hippy.runtime.builtins.array.JSDenseArray;
import com.tencent.mtt.hippy.uimanager.RenderNode;
import com.tencent.mtt.hippy.utils.TimeMonitor;
import java.util.List;

@HippyNativeModule(name = "PerformanceLogger")
public class TimeMonitorModule extends HippyNativeModuleBase {

    private static final String KEY_ERR_MSG = "errMsg";
    private static final String KEY_RESULT = "result";

    public TimeMonitorModule(HippyEngineContext context) {
        super(context);
    }

    @HippyMethod(name = "markStart")
    public void markStart(final int instanceId, final String eventName, final long timeMillis) {
        HippyRootView rootView = mContext.getInstance(instanceId);
        TimeMonitor monitor = rootView == null ? null : rootView.getTimeMonitor();
        if (monitor != null) {
            monitor.startSeparateEvent(eventName, timeMillis);
        }
    }

    @HippyMethod(name = "markEnd")
    public void markEnd(final int instanceId, final String eventName, final long timeMillis) {
        HippyRootView rootView = mContext.getInstance(instanceId);
        TimeMonitor monitor = rootView == null ? null : rootView.getTimeMonitor();
        if (monitor != null) {
            monitor.endSeparateEvent(eventName, timeMillis);
        }
    }

    @HippyMethod(name = "getAll")
    public void getAll(final int instanceId, final Promise promise) {
        HippyRootView rootView = mContext.getInstance(instanceId);
        TimeMonitor monitor = rootView == null ? null : rootView.getTimeMonitor();
        JSObject result = new JSObject();
        if (monitor == null) {
            result.set(KEY_ERR_MSG, "invalid instanceId");
        } else {
            List<HippyEngineMonitorEvent> list = monitor.getAllSeparateEvents();
            JSDenseArray jsList = new JSDenseArray(list.size());
            for (HippyEngineMonitorEvent event : list) {
                JSObject jsEvent = new JSObject();
                jsEvent.set("eventName", event.eventName);
                jsEvent.set("startTime", event.startTime);
                jsEvent.set("endTime", event.endTime);
                jsList.push(jsEvent);
            }
            result.set(KEY_RESULT, jsList);
        }
        promise.resolve(result);
    }

}
