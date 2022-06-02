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
package com.tencent.mtt.hippy.common;

import android.os.Build;
import android.os.Handler;
import android.os.HandlerThread;

@SuppressWarnings({"unused"})
public class HippyHandlerThread extends HandlerThread {

  final Handler mHandler;

  public HippyHandlerThread(String name) {
    super(name);
    setPriority(Thread.MAX_PRIORITY);
    start();
    mHandler = new Handler(getLooper());
  }

  public boolean isThreadAlive() {
    return (mHandler != null && getLooper() != null && isAlive());
  }

  @Override
  public boolean quit() {
    if (Build.VERSION.SDK_INT > Build.VERSION_CODES.JELLY_BEAN_MR2) {
      return super.quitSafely();
    } else {
      mHandler.post(new Runnable() {
        @Override
        public void run() {
          HippyHandlerThread.super.quit();
        }
      });
    }
    return true;
  }

  public Handler getHandler() {
    return mHandler;
  }

  public void runOnQueue(Runnable runnable) {
    mHandler.post(runnable);
  }

}
