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

import com.tencent.mtt.hippy.HippyEngine;
import com.tencent.mtt.hippy.utils.LogUtils;
import java.util.ArrayList;
import java.util.HashMap;

public class ThreadExecutorManager implements ThreadExecutor.UncaughtExceptionHandler {

  private static ThreadExecutorManager sInstance;
  private final HashMap<Integer, ThreadExecutor> mThreadExecutorMap = new HashMap<>();
  private final HashMap<Integer, ArrayList<Integer>> mEngineMap = new HashMap<>();

  private ThreadExecutorManager() {

  }

  public static ThreadExecutorManager getInstance() {
    if (sInstance == null) {
      synchronized (ThreadExecutorManager.class) {
        if (sInstance == null) {
          sInstance = new ThreadExecutorManager();
        }
      }
    }

    return sInstance;
  }

  public synchronized void add(HippyEngine engine) {
    Integer groupId = engine.getGroupId();
    if (groupId < 0) {
      return;
    }

    try {
      ThreadExecutor threadExecutor = mThreadExecutorMap.get(groupId);
      if (threadExecutor == null) {
        threadExecutor = new ThreadExecutor(groupId);
        threadExecutor.setUncaughtExceptionHandler(this);
        mThreadExecutorMap.put(groupId, threadExecutor);
      }

      Integer engineId = engine.getEngineId();
      ArrayList<Integer> engineList = mEngineMap.get(groupId);
      if (engineList == null) {
        engineList = new ArrayList<>();
        engineList.add(engineId);
        mEngineMap.put(groupId, engineList);
      } else if (!engineList.contains(engineId)) {
        engineList.add(engineId);
      } else {
        LogUtils.e("Hippy", "add same engine twice");
      }
    } catch (Exception e) {
      LogUtils.d("ThreadExecutorManager", "add: " + e.getMessage());
    }
  }

  public synchronized ThreadExecutor getThreadExecutor(int groupId) {
    return mThreadExecutorMap.get(groupId);
  }

  private void destroyThreadExecutor(Integer groupId) {
    if (mThreadExecutorMap.containsKey(groupId)) {
      ThreadExecutor threadExecutor = mThreadExecutorMap.get(groupId);
      if (threadExecutor != null) {
        threadExecutor.destroy();
      }
      mThreadExecutorMap.remove(groupId);
    }
  }

  public synchronized void remove(HippyEngine engine) {
    Integer groupId = engine.getGroupId();
    if (groupId < 0) {
      return;
    }
    try {
      ArrayList<Integer> engineList = mEngineMap.get(groupId);
      if (engineList == null) {
        destroyThreadExecutor(groupId);
        return;
      }

      Integer engineId = engine.getEngineId();
      engineList.remove(engineId);

      if (engineList.size() <= 0) {
        mEngineMap.remove(groupId);
        destroyThreadExecutor(groupId);
      }
    } catch (Exception e) {
      LogUtils.d("ThreadExecutorManager", "remove: " + e.getMessage());
    }
  }

  @SuppressWarnings("unused")
  private synchronized void handleExceptionImpl(Thread t, Throwable e, Integer groupId) {
    if (groupId < 0) {
      return;
    }

    destroyThreadExecutor(groupId);
    mEngineMap.remove(groupId);
  }

  @Override
  public void handleThreadUncaughtException(Thread t, Throwable e, Integer groupId) {
    handleExceptionImpl(t, e, groupId);
  }
}
