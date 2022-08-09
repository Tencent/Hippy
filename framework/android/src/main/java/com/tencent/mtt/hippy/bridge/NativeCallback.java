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

package com.tencent.mtt.hippy.bridge;

import android.os.Handler;
import android.os.Message;

@SuppressWarnings({"unused"})
public abstract class NativeCallback {

  public NativeCallback(Handler handler) {
    mHandler = handler;
  }

  public NativeCallback(Handler handler, Message msg, String action) {
    mHandler = handler;
    mMsg = msg;
    mAction = action;
  }

  public void Callback(long result, String reason) {
    if (mHandler != null) {
      NativeRunnable runnable = new NativeRunnable(this, result, mMsg, mAction, reason);
      mHandler.post(runnable);
    }
  }

  public abstract void Call(long result, Message message, String action, String reason);

  private final Handler mHandler;
  private Message mMsg = null;
  private String mAction = null;

  public static class NativeRunnable implements Runnable {

    private final long result;
    private final NativeCallback callback;
    private final Message message;
    private final String action;
    private final String reason;

    public NativeRunnable(NativeCallback callback, long result, Message message,
        String action, String reason) {
      this.result = result;
      this.callback = callback;
      this.message = message;
      this.action = action;
      this.reason = reason;
    }

    @Override
    public void run() {
      callback.Call(result, message, action, reason);
    }
  }
}
