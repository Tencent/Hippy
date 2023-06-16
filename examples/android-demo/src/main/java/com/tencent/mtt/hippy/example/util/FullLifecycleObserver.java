package com.tencent.mtt.hippy.example.util;

import androidx.lifecycle.LifecycleObserver;
import androidx.lifecycle.LifecycleOwner;

/**
 * FullLifecycleEvent
 *
 * @author 793383996
 * Copyright (C) 2023 THL A29 Limited, a Tencent company.
 * All rights reserved.
*/
public abstract class FullLifecycleObserver implements LifecycleObserver {

  protected void onCreate(LifecycleOwner owner) {}

  protected void onStart(LifecycleOwner owner) {}

  protected void onResume(LifecycleOwner owner) {}

  protected void onPause(LifecycleOwner owner) {}

  protected void onStop(LifecycleOwner owner) {}

  protected void onDestroy(LifecycleOwner owner) {}
}
