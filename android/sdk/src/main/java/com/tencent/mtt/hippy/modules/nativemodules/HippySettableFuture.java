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
package com.tencent.mtt.hippy.modules.nativemodules;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

@SuppressWarnings({"unused"})
public class HippySettableFuture<T> implements Future<T> {

  private final CountDownLatch mReadyLatch = new CountDownLatch(1);
  private T mResult;
  private Exception mException;

  @Override
  public boolean cancel(boolean mayInterruptIfRunning) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean isCancelled() {
    return false;
  }

  @Override
  public boolean isDone() {
    return mReadyLatch.getCount() == 0;
  }

  @Override
  public T get() throws InterruptedException, ExecutionException {
    mReadyLatch.await();
    if (mException != null) {
      throw new ExecutionException(mException);
    }
    return mResult;
  }

  @Override
  public T get(long timeout, TimeUnit unit)
      throws InterruptedException, ExecutionException, TimeoutException {
    if (!mReadyLatch.await(timeout, unit)) {
      throw new TimeoutException("Timed out waiting for result");
    }
    if (mException != null) {
      throw new ExecutionException(mException);
    }
    return mResult;
  }

  public void set(T result) {
    checkNotSet();
    mResult = result;
    mReadyLatch.countDown();
  }

  public void setException(Exception exception) {
    checkNotSet();
    mException = exception;
    mReadyLatch.countDown();
  }

  private void checkNotSet() {
    if (mReadyLatch.getCount() == 0) {
      throw new RuntimeException("Result has already been set!");
    }
  }
}
