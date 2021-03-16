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
package com.tencent.mtt.hippy.modules.nativemodules.netinfo;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.annotation.HippyMethod;
import com.tencent.mtt.hippy.annotation.HippyNativeModule;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.modules.javascriptmodules.EventDispatcher;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;
import com.tencent.mtt.hippy.utils.LogUtils;

@HippyNativeModule(name = "NetInfo")
public class NetInfoModule extends HippyNativeModuleBase
{
	private static final String					CONNECTION_TYPE_NONE		= "NONE";
	private static final String					CONNECTION_TYPE_UNKNOWN		= "UNKNOWN";
	private static final String					MISSING_PERMISSION_MESSAGE	= "To use NetInfo on Android, add the following to your AndroidManifest.xml:\n"
																					+ "<uses-permission android:name=\"android.permission.ACCESS_NETWORK_STATE\" />";

	private ConnectivityReceiver mConnectivityReceiver;

	private final ConnectivityManager			mConnectivityManager;

	private boolean								mNoNetworkPermission		= false;

	public NetInfoModule(HippyEngineContext context)
	{
		super(context);
		mConnectivityManager = (ConnectivityManager) context.getGlobalConfigs().getContext().getSystemService(Context.CONNECTIVITY_SERVICE);
	}

	@Override
	public void destroy() {
		super.destroy();
		unregisterReceiver();
	}

	@HippyMethod(name = "getCurrentConnectivity")
	public void getCurrentConnectivity(Promise promise)
	{
		if (mNoNetworkPermission)
		{
			promise.reject(MISSING_PERMISSION_MESSAGE);
			return;
		}
		String currentConnectivity = getCurrentConnectionType();
		HippyMap data = new HippyMap();
		data.pushString("network_info", currentConnectivity);
		promise.resolve(data);
	}

	@Override
	public void handleAddListener(String name) {
		registerReceiver();
	}

	@Override
	public void handleRemoveListener(String name) {
		unregisterReceiver();
	}

	private String getCurrentConnectionType()
	{
		try
		{
			NetworkInfo networkInfo = mConnectivityManager.getActiveNetworkInfo();
			if (networkInfo == null || !networkInfo.isConnected())
			{
				return CONNECTION_TYPE_NONE;
			}
			else if (ConnectivityManager.isNetworkTypeValid(networkInfo.getType()))
			{
				return networkInfo.getTypeName().toUpperCase();
			}
			else
			{
				return CONNECTION_TYPE_UNKNOWN;
			}
		}
		catch (Exception e)
		{
			mNoNetworkPermission = true;
			return CONNECTION_TYPE_UNKNOWN;
		}
	}

	private void registerReceiver()
	{
		if (mConnectivityReceiver == null)
			mConnectivityReceiver = new ConnectivityReceiver();

		if (!mConnectivityReceiver.isRegistered())
		{
			try
			{
				IntentFilter filter = new IntentFilter();
				filter.addAction(ConnectivityManager.CONNECTIVITY_ACTION);
				mContext.getGlobalConfigs().getContext().registerReceiver(mConnectivityReceiver, filter);
				mConnectivityReceiver.setRegistered(true);
			}
			catch (Throwable e)
			{
				LogUtils.d("NetInfoModule", "registerReceiver: " + e.getMessage());
			}
		}
	}

	private void unregisterReceiver()
	{
		try
		{
			if (mConnectivityReceiver != null && mConnectivityReceiver.isRegistered())
			{
				mContext.getGlobalConfigs().getContext().unregisterReceiver(mConnectivityReceiver);
				mConnectivityReceiver.setRegistered(false);
				mConnectivityReceiver = null;
			}
		}
		catch (Throwable e)
		{
			LogUtils.d("NetInfoModule", "unregisterReceiver: " + e.getMessage());
		}
	}

	private class ConnectivityReceiver extends BroadcastReceiver
	{
		private final String	EVENT_NAME		= "networkStatusDidChange";
		private boolean			isRegistered	= false;
		private String			mCurrentConnectivity;

		public boolean isRegistered()
		{
			return isRegistered;
		}

		public void setRegistered(boolean registered)
		{
			isRegistered = registered;
		}

		@Override
		public void onReceive(Context context, Intent intent)
		{
			if (intent.getAction().equals(ConnectivityManager.CONNECTIVITY_ACTION))
			{
				mContext.getGlobalConfigs().getExecutorSupplierAdapter().getBackgroundTaskExecutor().execute(new Runnable()
				{
					@Override
					public void run()
					{
						String currentConnectivity = getCurrentConnectionType();
						if (!currentConnectivity.equalsIgnoreCase(mCurrentConnectivity))
						{
							try
							{
								mCurrentConnectivity = currentConnectivity;
								HippyMap data = new HippyMap();
								data.pushString("network_info", mCurrentConnectivity);
								mContext.getModuleManager().getJavaScriptModule(EventDispatcher.class).receiveNativeEvent(EVENT_NAME, data);
							}
							catch (Throwable e)
							{
								LogUtils.d("ConnectivityReceiver", "onReceive: " + e.getMessage());
							}
						}
					}
				});
			}
		}
	}
}
