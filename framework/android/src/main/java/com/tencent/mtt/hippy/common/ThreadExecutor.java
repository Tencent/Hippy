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

import androidx.annotation.Nullable;

public class ThreadExecutor implements Thread.UncaughtExceptionHandler {

    private final HippyHandlerThread mBridgeThread;
    private final HippyHandlerThread mModuleThread;
    @Nullable
    private UncaughtExceptionHandler mUncaughtExceptionHandler;
    private final int mGroupId;

    public ThreadExecutor(int groupId) {
        mGroupId = groupId;
        mBridgeThread = new HippyHandlerThread("hippy-bridge-Thread");
        mBridgeThread.setUncaughtExceptionHandler(this);
        mModuleThread = new HippyHandlerThread("hippy-module-Thread");
        mModuleThread.setUncaughtExceptionHandler(this);
    }

    public void setUncaughtExceptionHandler(UncaughtExceptionHandler exceptionHandler) {
        mUncaughtExceptionHandler = exceptionHandler;
    }

    public void destroy() {
        if (mModuleThread != null && mModuleThread.isThreadAlive()) {
            mModuleThread.quit();
            mModuleThread.setUncaughtExceptionHandler(null);
        }
        if (mBridgeThread != null && mBridgeThread.isThreadAlive()) {
            mBridgeThread.quit();
            mBridgeThread.setUncaughtExceptionHandler(null);
        }
        mUncaughtExceptionHandler = null;
    }

    public HippyHandlerThread getModuleThread() {
        return mModuleThread;
    }

    public HippyHandlerThread getBridgeThread() {
        return mBridgeThread;
    }

    @Override
    public void uncaughtException(Thread t, Throwable e) {
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
