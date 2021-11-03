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

import android.os.Handler;
import android.os.Looper;

@SuppressWarnings({"unused"})
public class UIThreadUtils {

  private static final Handler sMainHandler = new Handler(Looper.getMainLooper());

  public static void assertOnUiThread() {
    if (Looper.getMainLooper().getThread() != Thread.currentThread()) {
      throw new RuntimeException("must run on ui thread!");
    }
  }

  public static boolean isOnUiThread() {
    return Looper.getMainLooper().getThread() == Thread.currentThread();
  }

  public static void runOnUiThread(Runnable runnable) {
    sMainHandler.post(runnable);
  }
}
