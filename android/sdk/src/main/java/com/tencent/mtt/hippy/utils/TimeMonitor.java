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
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

public class TimeMonitor {

    private static final long SYS_TIME_DIFF =
        System.currentTimeMillis() - SystemClock.elapsedRealtime();
    private static final Long NOT_SET = 0L;
    private final boolean mEnable;
    private final ConcurrentHashMap<String, HippyEngineMonitorEvent> mSeparateEvents =
        new ConcurrentHashMap<>();
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

    public void startSeparateEvent(String eventName) {
        startSeparateEvent(eventName, currentTimeMillis());
    }

    public void startSeparateEvent(String eventName, long timeMillis) {
        setSeparateEventValue(eventName, timeMillis, NOT_SET);
    }

    public void endSeparateEvent(String eventName) {
        endSeparateEvent(eventName, currentTimeMillis());
    }

    public void endSeparateEvent(String eventName, long timeMillis) {
        setSeparateEventValue(eventName, NOT_SET, timeMillis);
    }

    public List<HippyEngineMonitorEvent> getAllSeparateEvents() {
        List<HippyEngineMonitorEvent> result;
        if (mParent != null) {
            result = mParent.getAllSeparateEvents();
            result.addAll(mSeparateEvents.values());
        } else {
            result = new ArrayList<>(mSeparateEvents.values());
        }
        return result;
    }

    public void clearSeparateEvents() {
        mSeparateEvents.clear();
    }

    /* private */ void setSeparateEventValue(String eventName, long startMillis, long endMillis) {
        HippyEngineMonitorEvent event = mSeparateEvents.get(eventName);
        if (event == null) {
            event = new HippyEngineMonitorEvent();
            event.eventName = eventName;
            event.startTime = NOT_SET;
            event.endTime = NOT_SET;
            setEventTime(event, startMillis, endMillis);
            event = mSeparateEvents.putIfAbsent(eventName, event);
        }
        if (event != null) {
            setEventTime(event, startMillis, endMillis);
        }
    }

    /* private */ void setEventTime(HippyEngineMonitorEvent event, long start, long end) {
        if (start != NOT_SET) {
            event.startTime = start;
        }
        if (end != NOT_SET) {
            event.endTime = end;
        }
    }

    /* private */ long currentTimeMillis() {
        return SystemClock.elapsedRealtime() + SYS_TIME_DIFF;
    }
}
