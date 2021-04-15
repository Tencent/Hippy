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

/**
 * 1.0 xiandongluo on 2018/1/16
 */
public class TimeMonitor
{

	long								mStartTime;
	int									mTotalTime;
	boolean								mEnable;
	HippyEngineMonitorEvent				mCurrentEvent;
	List<HippyEngineMonitorEvent>		mEvents;

	public TimeMonitor(boolean enable)
	{
		mEnable = enable;
	}

	public void startEvent(String event)
	{
		if (!mEnable)
		{
			return;
		}
		if (mCurrentEvent != null)
		{
			mCurrentEvent.endTime = System.currentTimeMillis();
			mEvents.add(mCurrentEvent);
			LogUtils.d("hippy", "hippy endEvent: " + mCurrentEvent.eventName);
		}

		if (TextUtils.isEmpty(event))
		{
			return;
		}

		mCurrentEvent = new HippyEngineMonitorEvent();
		mCurrentEvent.eventName = event;
		mCurrentEvent.startTime = System.currentTimeMillis();
		LogUtils.d("hippy", "hippy startEvent: " + event);
	}

	public void begine()
	{
		if (!mEnable)
		{
			return;
		}
		mStartTime = SystemClock.elapsedRealtime();
		mCurrentEvent = null;
		if (mEvents == null)
		{
			mEvents =  Collections.synchronizedList(new ArrayList<HippyEngineMonitorEvent>());
		}
		mEvents.clear();
		mTotalTime = 0;
	}

	public void end()
	{
		if (!mEnable)
		{
			return;
		}
		if (mCurrentEvent != null)
		{
			mCurrentEvent.endTime = System.currentTimeMillis();
			mEvents.add(mCurrentEvent);
		}

		mTotalTime = (int) (SystemClock.elapsedRealtime() - mStartTime);
	}

	public int getTotalTime()
	{
		return mTotalTime;
	}

	public List<HippyEngineMonitorEvent> getEvents()
	{
		return mEvents;
	}
}
