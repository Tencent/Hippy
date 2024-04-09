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

    private static final String TAG = "HippyTimeMonitor";

    public static final String MONITOR_GROUP_INIT_ENGINE = "initEngine";
    public static final String MONITOR_GROUP_RUN_BUNDLE = "runBundle";
    public static final String MONITOR_GROUP_PAINT = "paint";

    public static final String MONITOR_POINT_INIT_NATIVE_ENGINE = "initNativeEngine";
    public static final String MONITOR_POINT_LOAD_VENDOR_JS = "loadVendorJs";
    public static final String MONITOR_POINT_LOAD_MAIN_JS = "loadMainJs";
    public static final String MONITOR_POINT_FIRST_PAINT = "firstPaint";
    public static final String MONITOR_POINT_FIRST_CONTENTFUL_PAINT = "firstContentfulPaint";
    @Nullable
    HashMap<String, MonitorGroup> mMonitorGroups;

    public synchronized void beginGroup(@NonNull String groupName) {
        if (mMonitorGroups == null) {
            mMonitorGroups = new HashMap<>();
        }
        MonitorGroup monitorGroup = mMonitorGroups.get(groupName);
        if (monitorGroup == null) {
            monitorGroup = new MonitorGroup(groupName);
            mMonitorGroups.put(groupName, monitorGroup);
        } else {
            monitorGroup.reset();
        }
    }

    public synchronized void addPoint(@NonNull String groupName, @NonNull String point) {
        if (mMonitorGroups == null) {
            return;
        }
        MonitorGroup monitorGroup = mMonitorGroups.get(groupName);
        if (monitorGroup != null) {
            monitorGroup.addPoint(point);
        }
    }

    public synchronized void endGroup(@NonNull String groupName) {
        if (mMonitorGroups == null) {
            return;
        }
        MonitorGroup monitorGroup = mMonitorGroups.get(groupName);
        if (monitorGroup != null) {
            monitorGroup.end();
        }
    }

    public synchronized void printGroup(@NonNull String groupName) {
        if (mMonitorGroups == null) {
            return;
        }
        MonitorGroup monitorGroup = mMonitorGroups.get(groupName);
        if (monitorGroup != null) {
            monitorGroup.print();
        }
    }

    private static class MonitorGroup {

        public final String name;
        public long beginTime = -1;
        public long totalTime = -1;
        public boolean isActive = true;
        @Nullable
        private ArrayList<MonitorPoint> mMonitorPoints;
        @Nullable
        private MonitorPoint mLastPoint;

        public MonitorGroup(@NonNull String name) {
            this.name = name;
        }

        @Nullable
        private MonitorPoint checkMonitorPoint(@NonNull String pointKey) {
            if (mMonitorPoints != null) {
                for (MonitorPoint monitorPoint : mMonitorPoints) {
                    if (monitorPoint.key.equals(pointKey)) {
                        return monitorPoint;
                    }
                }
            }
            return null;
        }

        void reset() {
            beginTime = -1;
            totalTime = -1;
            isActive = true;
            mLastPoint = null;
            if (mMonitorPoints != null) {
                mMonitorPoints.clear();
            }
        }

        void addPoint(@NonNull String pointKey) {
            if (!isActive) {
                return;
            }
            if (mMonitorPoints == null) {
                mMonitorPoints = new ArrayList<>();
            }
            MonitorPoint monitorPoint = checkMonitorPoint(pointKey);
            if (monitorPoint != null) {
                return;
            }
            monitorPoint = new MonitorPoint(pointKey);
            mMonitorPoints.add(monitorPoint);
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
                print();
            }
        }

        void print() {
            if (mMonitorPoints != null) {
                LogUtils.i(TAG, "group " + name + ", totalTime " + totalTime + "ms");
                for (MonitorPoint monitorPoint : mMonitorPoints) {
                    LogUtils.i(TAG,
                            monitorPoint.key + ": " + (monitorPoint.endTime - monitorPoint.startTime)
                                    + "ms");
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
