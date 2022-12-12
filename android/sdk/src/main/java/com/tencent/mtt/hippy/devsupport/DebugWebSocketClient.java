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

import java.net.URI;
import java.util.concurrent.ConcurrentHashMap;

@SuppressWarnings("unused")
public class DebugWebSocketClient implements WebSocketClient.WebSocketListener {

  private final ConcurrentHashMap<Integer, JSDebuggerCallback> mCallbacks = new ConcurrentHashMap<>();
  WebSocketClient mWebSocket;
  private JSDebuggerCallback mConnectCallback;
  private Handler mHandler;
  private DevRemoteDebugProxy.OnReceiveDataListener mReceiveDataListener;
  private static final int RECONNECT_TIME_DELAY = 3000;
  private final Runnable mReconnectRunnable = new Runnable() {
    @Override
    public void run() {
      if (mWebSocket == null || mWebSocket.isConnected()) {
        return;
      }
      mWebSocket.connect();
    }
  };

  public void connect(String url, JSDebuggerCallback callback) {
    mConnectCallback = callback;
    mWebSocket = new WebSocketClient(URI.create(url), this, null);
    mWebSocket.connect();
    mHandler = new Handler(Looper.getMainLooper());
  }

  private void reconnect() {
    mHandler.removeCallbacks(mReconnectRunnable);
    mHandler.postDelayed(mReconnectRunnable, RECONNECT_TIME_DELAY);
  }

  public void setOnReceiveDataCallback(DevRemoteDebugProxy.OnReceiveDataListener l) {
    mReceiveDataListener = l;
  }

  public void closeQuietly() {
    if (mWebSocket != null) {
      mWebSocket.disconnect();
    }
  }

  public void close(int code, String reason) {
    if (mWebSocket != null) {
      mWebSocket.requestClose(code, reason);
    }
  }

  public void sendMessage(String message) {
    if (mWebSocket == null || !mWebSocket.isConnected()) {
      LogUtils.e("sendMessage", "mWebSocket is null");
      return;
    }
    mWebSocket.send(message);
  }

  @Override
  public void onMessage(String message) {
    mReceiveDataListener.onReceiveData(message);
  }

  @Override
  public void onMessage(byte[] data) {

  }

  @Override
  public void onError(Exception e) {
    abort(e);
  }

  @Override
  public void onConnect() {
    if (mConnectCallback != null) {
      mConnectCallback.onSuccess(null);
    }
    mConnectCallback = null;
  }

  @Override
  public void onDisconnect(int code, String reason) {
    LogUtils.d("onDisconnect","code:" + code + ",reason:" + reason);
    if (mConnectCallback != null) {
      mConnectCallback.onFailure(new Exception(reason));
      mConnectCallback = null;
    }
    if (code == 0 && (WebSocketClient.DISCONNECT_REASON_EOF.equals(reason)
            || WebSocketClient.DISCONNECT_REASON_CONNECT.equals(reason))) {
      reconnect();
    } else {
      mWebSocket = null;
      mHandler.removeCallbacks(mReconnectRunnable);
    }
  }

  private void abort(Throwable cause) {
    // Trigger failure callbacks
    if (mConnectCallback != null) {
      mConnectCallback.onFailure(cause);
      mConnectCallback = null;
    }
    for (JSDebuggerCallback callback : mCallbacks.values()) {
      callback.onFailure(cause);
    }
    mCallbacks.clear();

    closeQuietly();
  }

  public interface JSDebuggerCallback {

    @SuppressWarnings("unused")
    void onSuccess(String response);

    @SuppressWarnings("unused")
    void onFailure(Throwable cause);
  }
}
