package com.tencent.mtt.hippy.example.util;

import androidx.annotation.NonNull;
import androidx.lifecycle.Lifecycle;
import androidx.lifecycle.LifecycleEventObserver;
import androidx.lifecycle.LifecycleOwner;

/**
 * Lifecycle 生命周期事件封装，需要处理事件重写即可，使用时需要
 * lifecycle.addObserver(this);
 *
 * @author 793383996
 * Copyright (C) 2023 THL A29 Limited, a Tencent company.
 * All rights reserved.
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
