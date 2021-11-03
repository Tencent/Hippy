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
package com.tencent.mtt.hippy.dom;

import android.os.Build;
import android.view.Choreographer;

import java.util.HashMap;
import java.util.Map;

public class ChoreographerCompat {

  private final static boolean IS_JELLY_BEAN = Build.VERSION.SDK_INT >= 16;
  private static ChoreographerCompat sInstance;

  private ChoreographerCompat() {

  }

  public static ChoreographerCompat getInstance() {
    if (sInstance == null) {
      sInstance = new ChoreographerCompat();
    }
    return sInstance;
  }

  private final Map<HippyChoreographer.FrameCallback, Choreographer.FrameCallback> mMapper = new HashMap<>();

  public void postFrameCallback(final HippyChoreographer.FrameCallback callback) {
    if (IS_JELLY_BEAN) {
      Choreographer.FrameCallback frameCallback = new Choreographer.FrameCallback() {
        @Override
        public void doFrame(long frameTimeNanos) {
          if (callback != null) {
            callback.doFrame(frameTimeNanos);
          }
        }
      };
      mMapper.put(callback, frameCallback);
      Choreographer.getInstance().postFrameCallback(frameCallback);
    } else {
      ICSChoreographer.getInstance().postFrameCallback(callback);
    }
  }

  public void removeFrameCallback(HippyChoreographer.FrameCallback callback) {
    if (IS_JELLY_BEAN) {
      Choreographer.FrameCallback frameCallback = mMapper.get(callback);
      if (frameCallback != null) {
        mMapper.remove(callback);
        Choreographer.getInstance().removeFrameCallback(frameCallback);
      }
    } else {
      ICSChoreographer.getInstance().removeFrameCallback(callback);
    }
  }
}
