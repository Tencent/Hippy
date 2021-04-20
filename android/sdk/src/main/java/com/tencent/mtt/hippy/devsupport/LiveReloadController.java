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
package com.tencent.mtt.hippy.devsupport;

import android.os.Handler;
import android.os.Looper;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.websocket.WebSocketClient;
import org.json.JSONObject;

import java.net.URI;

public class LiveReloadController implements WebSocketClient.WebSocketListener
{
	private WebSocketClient		mLiveReloadSocket;

	private final DevServerHelper mServerHelper;

	private LiveReloadCallback	mCallback;

	private boolean				mEnabled;

	private final Handler		mHandler;

	private final Runnable		mReconnectRunnable	= new Runnable()
													{
														@Override
														public void run()
														{
															if (!mEnabled)
															{
																return;
															}

															if (mLiveReloadSocket != null && mLiveReloadSocket.isConnected())
															{
																return;
															}

															connect();
														}
													};

	public LiveReloadController(DevServerHelper helper)
	{
		mServerHelper = helper;
		mEnabled = false;
		mHandler = new Handler(Looper.getMainLooper());
	}

	public void startLiveReload(LiveReloadCallback callback)
	{
		if (mLiveReloadSocket == null || !mLiveReloadSocket.isConnected())
		{
			connect();
		}

		mCallback = callback;
		mEnabled = true;
	}

	private void connect()
	{
		mLiveReloadSocket = new WebSocketClient(URI.create(mServerHelper.getLiveReloadURL()), this, null);
		mLiveReloadSocket.connect();
	}

	public void stopLiveReload()
	{
		if (mLiveReloadSocket != null)
		{
			mLiveReloadSocket.disconnect();
		}

		mCallback = null;
		mEnabled = false;
	}


	@Override
	public void onConnect()
	{
		mHandler.post(new Runnable()
		{
			@Override
			public void run()
			{
				if (mCallback != null)
				{
					mCallback.onLiveReloadReady();
				}
			}
		});
	}

	@Override
	public void onMessage(String message)
	{
		JSONObject object;
		String actionName;
		try
		{
			object = new JSONObject(message);
			actionName = object.optString("action");
		}
		catch (Exception e)
		{
			LogUtils.e("hippy_console", "revceive invalid live reload msg");
			return;
		}

		if (mCallback == null)
		{
			return;
		}

		if (actionName.equals("compileSuccess"))
		{
			mHandler.post(new Runnable()
			{
				@Override
				public void run()
				{
					if(mCallback != null)
					{
						mCallback.onCompileSuccess();
					}
				}
			});
		}
	}

	@Override
	public void onMessage(byte[] data)
	{

	}

	private void reconnect()
	{
		mHandler.removeCallbacks(mReconnectRunnable);
		mHandler.postDelayed(mReconnectRunnable, 2000);
	}

	@Override
	public void onDisconnect(int code, String reason)
	{
		if (!mEnabled)
		{
			return;
		}

		reconnect();
	}

	@Override
	public void onError(Exception error)
	{
		if (!mEnabled)
		{
			return;
		}

		reconnect();
	}

	public interface LiveReloadCallback
	{
		void onCompileSuccess();

		void onLiveReloadReady();
	}
}
