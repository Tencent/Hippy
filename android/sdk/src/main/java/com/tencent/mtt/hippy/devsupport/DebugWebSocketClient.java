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

import android.text.TextUtils;

import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.websocket.WebSocketClient;
import org.json.JSONObject;

import java.io.IOException;
import java.net.URI;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * A wrapper around WebSocketClient that recognizes debugging message format.
 */
public class DebugWebSocketClient implements WebSocketClient.WebSocketListener
{

	private static final String										TAG			= "JSDebuggerWebSocketClient";
	private final AtomicInteger										mRequestID	= new AtomicInteger();
	private final ConcurrentHashMap<Integer, JSDebuggerCallback>	mCallbacks	= new ConcurrentHashMap<>();
	WebSocketClient													mWebSocket;
	private JSDebuggerCallback										mConnectCallback;

	private DevRemoteDebugProxy.OnReceiveDataListener				mReceiveDataListener;

	public void connect(String url, JSDebuggerCallback callback)
	{
		mConnectCallback = callback;
		mWebSocket = new WebSocketClient(URI.create(url), this, null);
		mWebSocket.connect();
	}

	public void setOnReceiveDataCallback(DevRemoteDebugProxy.OnReceiveDataListener l)
	{
		mReceiveDataListener = l;
	}

	/**
	 * Creates the next JSON message to send to remote JS executor, with request
	 * ID pre-filled in.
	 */
	private JSONObject startMessageObject(int requestID) throws Exception
	{
		JSONObject object = new JSONObject();
		object.put("id", requestID);
		return object;
	}

	/**
	 * Takes in a JsonGenerator created by {@link #startMessageObject} and
	 * returns the stringified
	 * JSON
	 */
	private String endMessageObject(JSONObject object) throws IOException
	{
		String message = object.toString();
		return message;
	}

	public void closeQuietly()
	{
		if (mWebSocket != null)
		{
			mWebSocket.disconnect();
		}
	}

	public void sendMessage(String message)
	{
		if (mWebSocket == null)
		{
			LogUtils.e("sendMessage", "mWebSocket is null");
			return;
		}
		mWebSocket.send(message);
	}

	private void triggerRequestFailure(int requestID, Throwable cause)
	{
		JSDebuggerCallback callback = mCallbacks.get(requestID);
		if (callback != null)
		{
			mCallbacks.remove(requestID);
			callback.onFailure(cause);
		}
	}

	private void triggerRequestSuccess(int requestID, String response)
	{
		JSDebuggerCallback callback = mCallbacks.get(requestID);
		if (callback != null)
		{
			mCallbacks.remove(requestID);
			callback.onSuccess(response);
		}
	}

	private void onJsCallNative(JSONObject object)
	{
		if(mReceiveDataListener == null)
		{
			throw new RuntimeException("No Reciever Set for Debugger Message");
		}

		String moduleName = object.optString("moduleName");
		String moduleFunc = object.optString("methodFun");
		String params = object.optString("params");
		String callId = object.optString("callbackId");

		//mReceiveDataListener.onReceiveData( moduleName, moduleFunc, callId, params);
	}

	private void onReplyMessage(JSONObject reply)
	{
		Integer replyID = null;

		try
		{
			String result = null;
			if (reply.has("replyID"))
			{
				replyID = reply.getInt("replyID");
			}
			if (reply.has("result"))
			{
				result = reply.getString("result");
			}
			if (reply.has("error"))
			{
				String error = reply.getString("error");
				abort(error, new JavascriptException(error));
			}

			if (replyID != null)
			{
				triggerRequestSuccess(replyID, result);
			}
		}
		catch (Exception e)
		{
			if (replyID != null)
			{
				triggerRequestFailure(replyID, e);
			}
			else
			{
				abort("Parsing response message from websocket failed", e);
			}
		}
	}

	@Override
	public void onMessage(String message)
	{
		mReceiveDataListener.onReceiveData(message);
		return;
	}

	@Override
	public void onMessage(byte[] data)
	{

	}

	@Override
	public void onError(Exception e)
	{
		abort("Websocket exception", e);
	}

	@Override
	public void onConnect()
	{
		if (mConnectCallback != null)
		{
			mConnectCallback.onSuccess(null);
		}
		mConnectCallback = null;
	}

	@Override
	public void onDisconnect(int code, String reason)
	{
		mWebSocket = null;
	}

	private void abort(String message, Throwable cause)
	{
		closeQuietly();

		// Trigger failure callbacks
		if (mConnectCallback != null)
		{
			mConnectCallback.onFailure(cause);
			mConnectCallback = null;
		}
		for (JSDebuggerCallback callback : mCallbacks.values())
		{
			callback.onFailure(cause);
		}
		mCallbacks.clear();
	}

	public interface JSDebuggerCallback
	{
		void onSuccess(String response);

		void onFailure(Throwable cause);
	}
}
