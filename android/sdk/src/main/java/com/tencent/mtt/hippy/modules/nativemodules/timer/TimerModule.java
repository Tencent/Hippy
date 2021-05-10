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
package com.tencent.mtt.hippy.modules.nativemodules.timer;

import android.os.Handler;
import android.os.Message;
import android.os.SystemClock;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyEngineLifecycleEventListener;
import com.tencent.mtt.hippy.annotation.HippyMethod;
import com.tencent.mtt.hippy.annotation.HippyNativeModule;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

@SuppressWarnings({"unused"})
@HippyNativeModule(name = "TimerModule")
public class TimerModule extends HippyNativeModuleBase implements Handler.Callback, HippyEngineLifecycleEventListener
{

	private static final int		MSG_TIME_CALLBACK	= 100;
	private boolean					mEnginePaused		= false;
	private final HashMap<String, Timer> mTimerInfo		= new HashMap<>();
	private Handler					mHandler;
	private long					mNextTime			= 0;

	public TimerModule(HippyEngineContext context)
	{
		super(context);
		context.addEngineLifecycleEventListener(this);
	}

	@Override
	public void initialize()
	{
		mHandler = new Handler(mContext.getThreadExecutor().getJsBridgeThread().getLooper(), this);
	}

	@Override
	public void destroy()
	{
		mTimerInfo.clear();
		removeHandlerCallback();
		mContext.removeEngineLifecycleEventListener(this);
		super.destroy();
	}

	@SuppressWarnings("unused")
	@HippyMethod(name = "setTimeout")
	public void setTimeout(int timeOut, String callId, Promise promise)
	{
		Timer timer = new Timer(callId, SystemClock.elapsedRealtime(), timeOut, false, promise);
		mTimerInfo.put(callId, timer);
		checkHandlerCallback(timer);
	}

	@SuppressWarnings("unused")
	@HippyMethod(name = "clearTimeout")
	public void clearTimeout(String callId)
	{
		mTimerInfo.remove(callId);
		checkHandlerCallback(null);
	}

	@SuppressWarnings("unused")
	@HippyMethod(name = "setInterval")
	public void setInterval(int interval, String callId, Promise promise)
	{
		Timer timer = new Timer(callId, SystemClock.elapsedRealtime(), interval, true, promise);
		mTimerInfo.put(callId, timer);
		checkHandlerCallback(timer);
	}

	@SuppressWarnings("unused")
	@HippyMethod(name = "clearInterval")
	public void clearInterval(String callId)
	{
		mTimerInfo.remove(callId);
		checkHandlerCallback(null);
	}

	private void checkHandlerCallback(Timer timer)
	{
		if ((mEnginePaused || mTimerInfo.isEmpty()))
		{
			removeHandlerCallback();
		}
		else if (timer != null)
		{
			if (mNextTime == 0 || (timer.mTargetTime + timer.mInterval < mNextTime))
			{
				mNextTime = timer.mTargetTime + timer.mInterval;
				long delay = 0;
				if (mNextTime < 0)
				{
					mNextTime = SystemClock.elapsedRealtime();
				}
				else
				{
					delay = mNextTime - SystemClock.elapsedRealtime();
				}
				mHandler.removeMessages(MSG_TIME_CALLBACK);
				mHandler.sendEmptyMessageDelayed(MSG_TIME_CALLBACK, delay <= 0 ? 0 : delay);
			}
		}
	}

	private void removeHandlerCallback()
	{
		mNextTime = 0;
		mHandler.removeMessages(MSG_TIME_CALLBACK);
	}

	public void doFrame()
	{
		mNextTime = 0;
		mHandler.removeMessages(MSG_TIME_CALLBACK);
		long time = SystemClock.elapsedRealtime();
		Iterator<Map.Entry<String, Timer>> it = mTimerInfo.entrySet().iterator();
		Map.Entry<String, Timer> entry;
		Timer timer;
		Timer nextTimer = null;
		while (it.hasNext())
		{
			entry = it.next();
			if (entry == null)
			{
				continue;
			}
			timer = entry.getValue();
			if (timer == null)
			{
				continue;
			}

			if (timer.mTargetTime + timer.mInterval <= time)
			{
				if (timer.mPromise != null)
				{
					timer.mPromise.resolve(null);
				}
				if (!timer.mRepeat)
				{
					it.remove();
				}
				else
				{
					timer.mTargetTime = time;
					if (nextTimer == null || (timer.mTargetTime + timer.mInterval < nextTimer.mTargetTime + nextTimer.mInterval))
					{
						nextTimer = timer;
					}
				}
			}
			else if (nextTimer == null || (timer.mTargetTime + timer.mInterval < nextTimer.mTargetTime + nextTimer.mInterval))
			{
				nextTimer = timer;
			}
		}
		checkHandlerCallback(nextTimer);
	}

	@Override
	public void onEngineResume()
	{
		if (mHandler != null)
		{
			mHandler.post(new Runnable()
			{
				@Override
				public void run()
				{
					mEnginePaused = false;
					doFrame();
				}
			});
		}
	}

	@Override
	public void onEnginePause()
	{
		if (mHandler != null)
		{
			mHandler.post(new Runnable()
			{
				@Override
				public void run()
				{
					mEnginePaused = true;
					removeHandlerCallback();
				}
			});
		}
	}

	@Override
	public boolean handleMessage(Message message)
	{
		if (message.what == MSG_TIME_CALLBACK) {
			doFrame();
		}
		return false;
	}

	@SuppressWarnings("unused")
	private static class Timer
	{

		final String	mCallbackID;
		final boolean	mRepeat;
		final int		mInterval;
		long			mTargetTime;
		final Promise	mPromise;

		Timer(String callbackID, long initialTargetTime, int duration, boolean repeat, Promise promise)
		{
			mCallbackID = callbackID;
			mTargetTime = initialTargetTime;
			mInterval = duration;
			mRepeat = repeat;
			mPromise = promise;
		}
	}
}
