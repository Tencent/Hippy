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
package com.tencent.mtt.hippy.modules.nativemodules.network;

import android.text.TextUtils;
import android.util.SparseArray;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.annotation.HippyMethod;
import com.tencent.mtt.hippy.annotation.HippyNativeModule;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.modules.javascriptmodules.EventDispatcher;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.websocket.Header;
import com.tencent.mtt.hippy.websocket.WebSocketClient;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;

@HippyNativeModule(name = "websocket")
public class WebSocketModule extends HippyNativeModuleBase
{
	private static final String				TAG						= "WebSocketModule";

	private static final String				WEB_SOCKET_EVENT_NAME	= "hippyWebsocketEvents";

	private static final String				PARAM_KEY_SOCKET_ID		= "id";
	private static final String				PARAM_KEY_CODE			= "code";
	private static final String				PARAM_KEY_REASON		= "reason";
	private static final String				PARAM_KEY_HEADERS		= "headers";
	private static final String				PARAM_KEY_SOCKET_URL	= "url";
	private static final String				PARAM_KEY_TYPE			= "type";
	private static final String				PARAM_KEY_DATA			= "data";

	private static final AtomicInteger		sWebSocketIds			= new AtomicInteger(0);

	private final SparseArray<WebSocketClient>	mWebSocketConnections;

	public WebSocketModule(HippyEngineContext context)
	{
		super(context);
		mWebSocketConnections = new SparseArray<WebSocketClient>();
	}

	@HippyMethod(name = "connect")
	public void connect(HippyMap request, Promise promise)
	{
		HippyMap returnValue = new HippyMap();

		if (request == null)
		{
			returnValue.pushInt(PARAM_KEY_CODE, -1);
			returnValue.pushString(PARAM_KEY_REASON, "invalid connect param");
			promise.resolve(returnValue);
			return;
		}

		final String url = request.getString(PARAM_KEY_SOCKET_URL);
		if (TextUtils.isEmpty(url))
		{
			returnValue.pushInt(PARAM_KEY_CODE, -1);
			returnValue.pushString(PARAM_KEY_REASON, "no valid url for websocket");
			promise.resolve(returnValue);
			return;
		}

		HippyMap extraHeaders = request.getMap(PARAM_KEY_HEADERS);
		int webSocketId = sWebSocketIds.addAndGet(1);
		WebSocketClient webSocketClient = new WebSocketClient(URI.create(url), new HippyWebSocketListener(webSocketId, mContext, this),
				buildWebSocketHeaders(extraHeaders));
		mWebSocketConnections.put(webSocketId, webSocketClient);

		webSocketClient.connect();
		returnValue.pushInt(PARAM_KEY_CODE, 0);
		returnValue.pushString(PARAM_KEY_REASON, "");
		returnValue.pushInt(PARAM_KEY_SOCKET_ID, webSocketId);
		promise.resolve(returnValue);
	}

	@HippyMethod(name = "send")
	public void send(HippyMap param)
	{
		if (param == null)
		{
			LogUtils.d(TAG, "send: ERROR: request is null");
			return;
		}

		if (!param.containsKey(PARAM_KEY_SOCKET_ID))
		{
			LogUtils.d(TAG, "send: ERROR: no socket id specified");
			return;
		}

		int socketId = param.getInt(PARAM_KEY_SOCKET_ID);
		WebSocketClient socketClient = mWebSocketConnections.get(socketId, null);
		if (socketClient == null || !socketClient.isConnected())
		{
			LogUtils.d(TAG, "send: ERROR: specified socket not found, or not connected yet");
			return;
		}

		String textData = param.getString(PARAM_KEY_DATA);
		if (textData == null)
		{
			LogUtils.d(TAG, "send: ERROR: no data specified to be sent");
			return;
		}

		try
		{
			socketClient.send(textData);
		}
		catch (Throwable e)
		{
			e.printStackTrace();
			LogUtils.d(TAG, "send: ERROR: error occured in sending [" + e.getMessage() + "]");
		}
	}

	@HippyMethod(name = "close")
	public void close(HippyMap param)
	{
		if (param == null)
		{
			LogUtils.d(TAG, "close: ERROR: request is null");
			return;
		}

		if (!param.containsKey(PARAM_KEY_SOCKET_ID))
		{
			LogUtils.d(TAG, "close: ERROR: no socket id specified");
			return;
		}

		int socketId = param.getInt(PARAM_KEY_SOCKET_ID);
		WebSocketClient socketClient = mWebSocketConnections.get(socketId, null);
		if (socketClient == null || !socketClient.isConnected())
		{
			LogUtils.d(TAG, "send: ERROR: specified socket not found, or not connected yet");
			return;
		}

		int code = 0;
		String reason = "";
		if (param.containsKey(PARAM_KEY_CODE))
		{
			code = param.getInt(PARAM_KEY_CODE);
		}
		if (param.containsKey(PARAM_KEY_REASON))
		{
			reason = param.getString(PARAM_KEY_REASON);
		}

		socketClient.requestClose(code, reason == null ? "" : reason);
	}

	private List<Header> buildWebSocketHeaders(HippyMap map)
	{
		if (map == null)
		{
			return null;
		}

		Set<String> keys = map.keySet();
		List<Header> extraHeaders = new ArrayList<Header>();
		for (String oneKey : keys)
		{
			Object oneHeaderValue = map.get(oneKey);
			if (oneHeaderValue instanceof Number)
			{
				Header oneHeader = new Header(oneKey, oneHeaderValue + "");
				extraHeaders.add(oneHeader);
			}
			else if (oneHeaderValue instanceof Boolean)
			{
				Header oneHeader = new Header(oneKey, oneHeaderValue + "");
				extraHeaders.add(oneHeader);
			}
			else if (oneHeaderValue instanceof String)
			{
				Header oneHeader = new Header(oneKey, oneHeaderValue + "");
				extraHeaders.add(oneHeader);
			}
			else
			{
				LogUtils.e(TAG, "Unsupported Request Header List Type");
			}
		}
		return extraHeaders;

	}

	@Override
	public void destroy()
	{
		int size = mWebSocketConnections.size();
		if (size == 0)
		{
			return;
		}

		for (int i = 0; i < size; i++)
		{
			int typeKey = mWebSocketConnections.keyAt(i);
			WebSocketClient temp = mWebSocketConnections.get(typeKey);

			if (temp != null && temp.isConnected())
			{
				temp.disconnect();
			}
		}

		mWebSocketConnections.clear();
	}

	protected void removeSocketConnection(int socketId)
	{
		mWebSocketConnections.remove(socketId);
	}

	private static class HippyWebSocketListener implements WebSocketClient.WebSocketListener
	{
		private static final String	EVENT_TYPE_ON_OPEN		= "onOpen";
		private static final String	EVENT_TYPE_ON_CLOSE		= "onClose";
		private static final String	EVENT_TYPE_ON_ERROR		= "onError";
		private static final String	EVENT_TYPE_ON_MESSAGE	= "onMessage";


		private final int					mWebSocketId;
		private final HippyEngineContext	mContext;
		private final WebSocketModule		mWebSocketModule;
		private boolean				mDisconnected;

		public HippyWebSocketListener(int websocketID, HippyEngineContext context, WebSocketModule socketModule)
		{
			mWebSocketId = websocketID;
			mContext = context;
			mWebSocketModule = socketModule;
			mDisconnected = false;
		}

		private void sendWebSocketEvent(String eventType, HippyMap data)
		{
			if (mDisconnected)
			{
				return;
			}

			HippyMap eventParams = new HippyMap();
			eventParams.pushInt(PARAM_KEY_SOCKET_ID, mWebSocketId);
			eventParams.pushString(PARAM_KEY_TYPE, eventType);
			eventParams.pushObject(PARAM_KEY_DATA, data);
			mContext.getModuleManager().getJavaScriptModule(EventDispatcher.class).receiveNativeEvent(WEB_SOCKET_EVENT_NAME, eventParams);
		}

		@Override
		public void onConnect()
		{
			sendWebSocketEvent(EVENT_TYPE_ON_OPEN, null);
		}

		@Override
		public void onMessage(String message)
		{
			HippyMap params = new HippyMap();
			params.pushString(PARAM_KEY_DATA, message);
			params.pushString(PARAM_KEY_TYPE, "text");
			sendWebSocketEvent(EVENT_TYPE_ON_MESSAGE, params);
		}

		@Override
		public void onMessage(byte[] data)
		{

		}

		@Override
		public void onDisconnect(int code, String reason)
		{
			HippyMap map = new HippyMap();
			map.pushInt(PARAM_KEY_CODE, code);
			map.pushString(PARAM_KEY_REASON, reason);
			sendWebSocketEvent(EVENT_TYPE_ON_CLOSE, map);
			mWebSocketModule.removeSocketConnection(mWebSocketId);
			mDisconnected = true;
		}

		@Override
		public void onError(Exception error)
		{
			HippyMap map = new HippyMap();
			map.pushString(PARAM_KEY_REASON, error.getMessage());
			sendWebSocketEvent(EVENT_TYPE_ON_ERROR, map);
		}
	}
}
