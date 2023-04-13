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

package com.tencent.mtt.hippy.utils;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import java.util.ArrayList;
import java.util.HashMap;

public class TimeMonitor {

    public enum MonitorGroupType {
        ENGINE_INITIALIZE,
        RUN_JS_BUNDLE,
        LOAD_INSTANCE,
        VFS_RESOURCE_LOAD
    }

    public static final String MONITOR_POINT_INIT_NATIVE_ENGINE = "initNativeEngine";
    public static final String MONITOR_POINT_INIT_JS_ENGINE = "initJSEngine";
    public static final String MONITOR_POINT_LOAD_COMMON_JS = "loadCommonJs";
    public static final String MONITOR_POINT_NOTIFY_ENGINE_INITIALIZED = "notifyEngineInitialized";
    public static final String MONITOR_POINT_LOAD_BUSINESS_JS = "loadBusinessJs";
    public static final String MONITOR_POINT_LOAD_INSTANCE = "loadInstance";
    public static final String MONITOR_POINT_FIRST_FRAME = "firstFrame";
    @Nullable
    HashMap<MonitorGroupType, MonitorGroup> mMonitorGroups;

    public synchronized void startPoint(@NonNull MonitorGroupType groupType,
            @NonNull String point) {
        if (mMonitorGroups == null) {
            mMonitorGroups = new HashMap<>();
        }
        MonitorGroup monitorGroup = mMonitorGroups.get(groupType);
        if (monitorGroup == null) {
            monitorGroup = new MonitorGroup(groupType);
            mMonitorGroups.put(groupType, monitorGroup);
        }
        monitorGroup.startPoint(point);
    }

    @Nullable
    public synchronized MonitorGroup endGroup(@NonNull MonitorGroupType groupType) {
        if (mMonitorGroups == null) {
            return null;
        }
        MonitorGroup monitorGroup = mMonitorGroups.get(groupType);
        if (monitorGroup != null) {
            monitorGroup.end();
        }
        return monitorGroup;
    }

    @Nullable
    public synchronized MonitorGroup getMonitorGroup (@NonNull MonitorGroupType groupType) {
        if (mMonitorGroups == null) {
            return null;
        }
        return (mMonitorGroups == null) ? null : mMonitorGroups.get(groupType);
    }

    public static class MonitorGroup {

        public final MonitorGroupType type;
        public long beginTime = -1;
        public long totalTime = -1;
        public boolean isActive;
        @Nullable
        private ArrayList<MonitorPoint> mMonitorPoints;
        @Nullable
        private MonitorPoint mLastPoint;

        public MonitorGroup(@NonNull MonitorGroupType type) {
            this.type = type;
            isActive = true;
        }

        @Nullable
        private MonitorPoint checkMonitorPoint(@NonNull String pointKey) {
            for (MonitorPoint monitorPoint : mMonitorPoints) {
                if (monitorPoint.key.equals(pointKey)) {
                    return monitorPoint;
                }
            }
            return null;
        }

        void startPoint(@NonNull String pointKey) {
            if (!isActive) {
                return;
            }
            if (mMonitorPoints == null) {
                mMonitorPoints = new ArrayList<>();
            }
            MonitorPoint monitorPoint = checkMonitorPoint(pointKey);
            if (monitorPoint == null) {
                monitorPoint = new MonitorPoint(pointKey);
                mMonitorPoints.add(monitorPoint);
            }
            long currentTime = System.currentTimeMillis();
            monitorPoint.startTime = currentTime;
            if (mLastPoint != null) {
                mLastPoint.endTime = currentTime;
            }
            mLastPoint = monitorPoint;
            if (beginTime == -1) {
                beginTime = currentTime;
            }
        }

        void end() {
            if (isActive) {
                isActive = false;
                if (mLastPoint != null) {
                    mLastPoint.endTime = System.currentTimeMillis();
                }
                if (beginTime != -1) {
                    totalTime = (int) (System.currentTimeMillis() - beginTime);
                }
            }
        }

        @Nullable
        public ArrayList<MonitorPoint> getMonitorPoints() {
            return mMonitorPoints;
        }
    }

    public static class MonitorPoint {

        @NonNull
        public final String key;
        public long startTime;
        public long endTime;

        public MonitorPoint(@NonNull String key) {
            this.key = key;
        }
    }
}
