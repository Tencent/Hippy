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

import android.os.SystemClock;
import android.text.TextUtils;
import com.tencent.mtt.hippy.adapter.monitor.HippyEngineMonitorEvent;
import com.tencent.mtt.hippy.adapter.monitor.HippyEngineMonitorPoint;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class TimeMonitor {

    private static final long SYS_TIME_DIFF = System.currentTimeMillis() - SystemClock.elapsedRealtime();
    private final boolean mEnable;
    private final ConcurrentHashMap<HippyEngineMonitorPoint, Long> mStandardPoints = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> mCustomPoints = new ConcurrentHashMap<>();
    private long mStartTime;
    private int mTotalTime;
    private HippyEngineMonitorEvent mCurrentEvent;
    private List<HippyEngineMonitorEvent> mEvents;
    private TimeMonitor mParent;

    public TimeMonitor(boolean enable) {
        mEnable = enable;
    }

    public void setParent(TimeMonitor parent) {
        mParent = parent;
    }

    public void startEvent(String event) {
        if (!mEnable) {
            return;
        }
        if (mCurrentEvent != null) {
            mCurrentEvent.endTime = currentTimeMillis();
            mEvents.add(mCurrentEvent);
            LogUtils.d("hippy", "hippy endEvent: " + mCurrentEvent.eventName);
        }

        if (TextUtils.isEmpty(event)) {
            return;
        }

        mCurrentEvent = new HippyEngineMonitorEvent();
        mCurrentEvent.eventName = event;
        mCurrentEvent.startTime = currentTimeMillis();
        LogUtils.d("hippy", "hippy startEvent: " + event);
    }

    public void begine() {
        if (!mEnable) {
            return;
        }
        mStartTime = currentTimeMillis();
        mCurrentEvent = null;
        if (mEvents == null) {
            mEvents = Collections.synchronizedList(new ArrayList<HippyEngineMonitorEvent>());
        }
        mEvents.clear();
        mTotalTime = 0;
    }

    public void end() {
        if (!mEnable) {
            return;
        }
        if (mCurrentEvent != null) {
            mCurrentEvent.endTime = currentTimeMillis();
            mEvents.add(mCurrentEvent);
        }

        mTotalTime = (int) (currentTimeMillis() - mStartTime);
    }

    public int getTotalTime() {
        return mTotalTime;
    }

    public List<HippyEngineMonitorEvent> getEvents() {
        return mEvents;
    }

    public void addPoint(HippyEngineMonitorPoint eventName) {
        addPoint(eventName, currentTimeMillis());
    }

    public void addPoint(HippyEngineMonitorPoint eventName, long timeMillis) {
        mStandardPoints.put(eventName, timeMillis);
    }

    public void addCustomPoint(String eventName) {
        addCustomPoint(eventName, currentTimeMillis());
    }

    public void addCustomPoint(String eventName, long timeMillis) {
        mCustomPoints.put(eventName, timeMillis);
    }

    public Map<String, Long> getAllPoints() {
        Map<String, Long> result;
        if (mParent != null) {
            // collect parent
            result = mParent.getAllPoints();
        } else {
            result = new HashMap<>(mStandardPoints.size() + mCustomPoints.size());
        }
        // collect standard
        for (Map.Entry<HippyEngineMonitorPoint, Long> entry : mStandardPoints.entrySet()) {
            result.put(entry.getKey().value(), entry.getValue());
        }
        // collect custom
        result.putAll(mCustomPoints);
        return result;
    }

    public void clearAllPoints() {
        mStandardPoints.clear();
        mCustomPoints.clear();
    }

    /* private */ long currentTimeMillis() {
        return SystemClock.elapsedRealtime() + SYS_TIME_DIFF;
    }
}
