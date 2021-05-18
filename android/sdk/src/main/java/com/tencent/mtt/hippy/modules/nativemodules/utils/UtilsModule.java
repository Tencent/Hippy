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
package com.tencent.mtt.hippy.modules.nativemodules.utils;

import android.content.Context;
import android.os.Vibrator;

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.annotation.HippyMethod;
import com.tencent.mtt.hippy.annotation.HippyNativeModule;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;
import com.tencent.mtt.hippy.utils.LogUtils;

@SuppressWarnings({"unused"})
@HippyNativeModule(name = "UtilsModule")
public class UtilsModule extends HippyNativeModuleBase {

  private Vibrator mVibrator;

  public UtilsModule(HippyEngineContext context) {
    super(context);
  }

  @HippyMethod(name = "vibrate")
  public void vibrate(HippyArray patternHippy, int repeat) {
    if (mVibrator == null) {
      mVibrator = (Vibrator) mContext.getGlobalConfigs().getContext()
          .getSystemService(Context.VIBRATOR_SERVICE);
    }
    if (mVibrator != null) {
      long[] pattern = null;
      if (patternHippy != null && patternHippy.size() > 0) {
        pattern = new long[patternHippy.size()];
        try {
          for (int i = 0; i < patternHippy.size(); i++) {
            pattern[i] = (Integer) patternHippy.get(i);
          }
        } catch (Exception e) {
          LogUtils.d("UtilsModule", "vibrate: " + e.getMessage());
        }
      }
      // 默认一秒
      if (pattern == null || pattern.length == 0) {
        pattern = new long[]{1000};
      }
      mVibrator.vibrate(pattern, repeat);
    }
  }

  @HippyMethod(name = "cancel")
  public void cancel() {
    if (mVibrator == null) {
      mVibrator = (Vibrator) mContext.getGlobalConfigs().getContext()
          .getSystemService(Context.VIBRATOR_SERVICE);
    }
    if (mVibrator != null) {
      mVibrator.cancel();
    }
  }
}
