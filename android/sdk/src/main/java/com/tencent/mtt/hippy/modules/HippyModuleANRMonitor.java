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
package com.tencent.mtt.hippy.modules;

import android.os.SystemClock;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.adapter.monitor.HippyEngineMonitorAdapter;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.supportui.utils.struct.Pools;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * FileName: HippyModuleANRMonitor
 * Description：
 * History：
 */
public class HippyModuleANRMonitor
{

	static final int							ANR_TIME				= 100;
	static final int							MONITOR_ID_NAN			= 0;
	static int									MONITOR_ID				= 0;
	final HippyEngineContext					mContext;
	boolean										mNeedReportBridgeANR	= false;
	HippyEngineMonitorAdapter					mEngineMonitorAdapter;
	ConcurrentHashMap<Integer, MonitorMessage>	mMonitorMessages;

	public HippyModuleANRMonitor(HippyEngineContext context)
	{
		this.mContext = context;
		if (mContext != null)
		{
			this.mEngineMonitorAdapter = mContext.getGlobalConfigs().getEngineMonitorAdapter();
			this.mNeedReportBridgeANR = mEngineMonitorAdapter.needReportBridgeANR();
			if (mNeedReportBridgeANR)
			{
				//noinspection unchecked,rawtypes
				mMonitorMessages = new ConcurrentHashMap();
			}
		}
	}

	public int startMonitor(String parms1, String parms2)
	{
		if (!mNeedReportBridgeANR)
		{
			return MONITOR_ID_NAN;
		}
		MonitorMessage message = MonitorMessage.obtain(parms1, parms2, SystemClock.elapsedRealtime());
		int id = ++MONITOR_ID;
		if (id == MONITOR_ID_NAN)
		{
			id = ++MONITOR_ID;
		}
		mMonitorMessages.put(id, message);
		return id;
	}

	public void endMonitor(int id)
	{
		if (!mNeedReportBridgeANR)
		{
			return;
		}
		MonitorMessage message = mMonitorMessages.get(id);
		if (message == null)
		{
			return;
		}
		long currentTime = SystemClock.elapsedRealtime();
		if (currentTime - message.startTime > ANR_TIME)
		{
			if (mEngineMonitorAdapter != null)
			{
				mEngineMonitorAdapter.reportBridgeANR(message.param1 + " | " + message.param2);
			}
		}
		mMonitorMessages.remove(id);
		message.onDispose();
	}

	public void checkMonitor()
	{
		if (mMonitorMessages == null)
		{
			return;
		}
		for (Map.Entry<Integer, MonitorMessage> entry : mMonitorMessages.entrySet())
		{
			MonitorMessage monitorMessage = entry.getValue();
			if (monitorMessage != null)
			{
				long currentTime = SystemClock.elapsedRealtime();
				if (currentTime - monitorMessage.startTime > ANR_TIME)
				{
					if (mEngineMonitorAdapter != null)
					{
						mEngineMonitorAdapter.reportBridgeANR(monitorMessage.param1 + " | " + monitorMessage.param2);
					}
					mMonitorMessages.remove(entry.getKey());
					monitorMessage.onDispose();
				}
			}
		}
	}

	@SuppressWarnings({"unused"})
	static class MonitorMessage
	{
		private static final int									POOL_SIZE		= 20;
		private static final Pools.SynchronizedPool<MonitorMessage>	INSTANCE_POOL	= new Pools.SynchronizedPool<>(POOL_SIZE);

		public String												param1;
		public String												param2;
		public long													startTime;

		public static MonitorMessage obtain(String param1, String param2, long startTime)
		{
			MonitorMessage instance = INSTANCE_POOL.acquire();
			if (instance == null)
			{
				instance = new MonitorMessage();
			}
			instance.init(param1, param2, startTime);
			return instance;
		}

		private void init(String param1, String param2, long startTime)
		{
			this.param1 = param1;
			this.param2 = param2;
			this.startTime = startTime;
		}

		public void onDispose()
		{
			try
			{
				INSTANCE_POOL.release(this);
			}
			catch (Throwable e)
			{
				LogUtils.d("MonitorMessage", "onDispose: " + e.getMessage());
			}
		}
	}
}
