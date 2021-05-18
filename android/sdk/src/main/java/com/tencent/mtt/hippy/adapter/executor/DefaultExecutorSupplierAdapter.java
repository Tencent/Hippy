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
package com.tencent.mtt.hippy.adapter.executor;

import java.util.concurrent.Executor;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * FileName: DefaultExecutorSupplierAdapter Description： History：
 */
public class DefaultExecutorSupplierAdapter implements HippyExecutorSupplierAdapter {

  private volatile ExecutorService mDBExecutor;

  private volatile ExecutorService mBackgroundTaskExecutor;

  @Override
  public Executor getDBExecutor() {
    if (mDBExecutor == null) {
      synchronized (DefaultExecutorSupplierAdapter.class) {
        if (mDBExecutor == null) {
          mDBExecutor = Executors.newSingleThreadExecutor();
        }
      }
    }
    return mDBExecutor;
  }

  @Override
  public Executor getBackgroundTaskExecutor() {
    if (mBackgroundTaskExecutor == null) {
      synchronized (DefaultExecutorSupplierAdapter.class) {
        if (mBackgroundTaskExecutor == null) {
          mBackgroundTaskExecutor = Executors.newSingleThreadExecutor();
        }
      }
    }
    return mBackgroundTaskExecutor;
  }

  public void destroyIfNeed() {
    synchronized (DefaultExecutorSupplierAdapter.class) {
      if (mDBExecutor != null && !mDBExecutor.isShutdown()) {
        mDBExecutor.shutdown();
        mDBExecutor = null;
      }

      if (mBackgroundTaskExecutor != null && !mBackgroundTaskExecutor.isShutdown()) {
        mBackgroundTaskExecutor.shutdown();
        mBackgroundTaskExecutor = null;
      }
    }
  }
}
