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

public class ThreadExecutor implements Thread.UncaughtExceptionHandler {

  final HippyHandlerThread bridgeThread;
  final HippyHandlerThread moduleThread;
  final HippyHandlerThread domThread;
  UncaughtExceptionHandler mUncaughtExceptionHandler;
  private final int mGroupId;

  @SuppressWarnings("unused")
  public ThreadExecutor(int groupId) {
    mGroupId = groupId;
    bridgeThread = new HippyHandlerThread("hippy-bridge");
    bridgeThread.setUncaughtExceptionHandler(this);

    moduleThread = new HippyHandlerThread("hippy-module");
    moduleThread.setUncaughtExceptionHandler(this);
    domThread = new HippyHandlerThread("hippy-dom");
    domThread.setUncaughtExceptionHandler(this);
  }

  public void setUncaughtExceptionHandler(UncaughtExceptionHandler exceptionHandler) {
    mUncaughtExceptionHandler = exceptionHandler;
  }

  public void destroy() {
    if (domThread != null && domThread.isThreadAlive()) {
      domThread.quit();

      domThread.setUncaughtExceptionHandler(null);
    }

    if (moduleThread != null && moduleThread.isThreadAlive()) {
      moduleThread.quit();

      moduleThread.setUncaughtExceptionHandler(null);
    }

    if (bridgeThread != null && bridgeThread.isThreadAlive()) {
      bridgeThread.quit();

      bridgeThread.setUncaughtExceptionHandler(null);
    }

    mUncaughtExceptionHandler = null;
  }

  public void postOnDomThread(Runnable runnable) {
    domThread.runOnQueue(runnable);
  }

  public HippyHandlerThread getBridgeThread() {
    return bridgeThread;
  }

  public HippyHandlerThread getModuleThread() {
    return moduleThread;
  }

  public HippyHandlerThread getDomThread() {
    return domThread;
  }

  @Override
  public void uncaughtException(Thread t,
      Throwable e) {
    if (mUncaughtExceptionHandler != null) {
      mUncaughtExceptionHandler.handleThreadUncaughtException(t, e, mGroupId);
    } else {
      throw new RuntimeException(e);
    }

  }

  public interface UncaughtExceptionHandler {

    void handleThreadUncaughtException(Thread t, Throwable e, Integer groupId);
  }
}
