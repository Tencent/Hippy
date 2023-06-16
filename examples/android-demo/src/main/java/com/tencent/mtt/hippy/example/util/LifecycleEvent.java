package com.tencent.mtt.hippy.example.util;

import androidx.annotation.NonNull;
import androidx.lifecycle.Lifecycle;
import androidx.lifecycle.LifecycleEventObserver;
import androidx.lifecycle.LifecycleOwner;

/*
 *  Lifecycle.addObserver(LifecycleEvent)
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
public abstract class LifecycleEvent extends FullLifecycleObserver implements LifecycleEventObserver {
  protected boolean mIsAlive = true;

  @Override
  public void onStateChanged(@NonNull LifecycleOwner source, @NonNull Lifecycle.Event event) {
    switch (event) {
      case ON_CREATE:
        mIsAlive = true;
        onCreate(source);
        break;
      case ON_START:
        onStart(source);
        break;
      case ON_RESUME:
        onResume(source);
        break;
      case ON_PAUSE:
        onPause(source);
        break;
      case ON_STOP:
        onStop(source);
        break;
      case ON_DESTROY:
        mIsAlive = false;
        onDestroy(source);
        break;
      case ON_ANY:
        throw new IllegalArgumentException("ON_ANY must not been send by anybody");
    }
  }
}
