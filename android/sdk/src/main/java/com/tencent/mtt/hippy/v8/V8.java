/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2022 THL A29 Limited, a Tencent company. All rights reserved.
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

package com.tencent.mtt.hippy.v8;

import androidx.annotation.NonNull;

import com.tencent.mtt.hippy.common.Callback;
import com.tencent.mtt.hippy.v8.memory.V8HeapCodeStatistics;
import com.tencent.mtt.hippy.v8.memory.V8HeapSpaceStatistics;
import com.tencent.mtt.hippy.v8.memory.V8HeapStatistics;
import com.tencent.mtt.hippy.v8.memory.V8Memory;

import java.util.ArrayList;

public class V8 implements V8Memory {

  public interface NearHeapLimitCallback {
    /**
     * This callback is invoked when the heap size is close to the heap limit and
     * V8 is likely to abort with out-of-memory error.
     * The callback can extend the heap limit by returning a value that is greater
     * than the currentHeapLimit. The initial heap limit is the limit that was
     * set after heap setup.
     */
    long callback(long currentHeapLimit, long initialHeapLimit);
  }

  private final long mV8RuntimeId;

  public V8(long mV8RuntimeId) {
    this.mV8RuntimeId = mV8RuntimeId;
  }

  // The method must be called in the js thread
  @Override
  public boolean getHeapStatistics(@NonNull Callback<V8HeapStatistics> callback) throws NoSuchMethodException {
    return getHeapStatistics(mV8RuntimeId, callback);
  }

  // The method must be called in the js thread
  @Override
  public boolean getHeapCodeStatistics(@NonNull Callback<V8HeapCodeStatistics> callback) throws NoSuchMethodException {
    return getHeapCodeStatistics(mV8RuntimeId, callback);
  }

  // The method must be called in the js thread
  @Override
  public boolean getHeapSpaceStatistics(@NonNull Callback<ArrayList<V8HeapSpaceStatistics>> callback) throws NoSuchMethodException {
    return getHeapSpaceStatistics(mV8RuntimeId, callback);
  }

  // The method must be called in the js thread
  @Override
  public boolean writeHeapSnapshot(@NonNull String filePath, @NonNull Callback<Integer> callback) throws NoSuchMethodException {
    return writeHeapSnapshot(mV8RuntimeId, filePath, callback);
  }

  // The method must be called in the js thread
  public void addNearHeapLimitCallback(NearHeapLimitCallback callback) {
    addNearHeapLimitCallback(mV8RuntimeId, callback);
  }

  // The method must be called in the js thread
  public void printCurrentStackTrace(Callback<String> callback) {
    printCurrentStackTrace(mV8RuntimeId, callback);
  }

  // the method can be called from any thread
  public void requestInterrupt(Callback<Void> callback) {
    requestInterrupt(mV8RuntimeId, callback);
  }

  // [memory]
  private native boolean getHeapStatistics(long runtimeId, Callback<V8HeapStatistics> callback) throws NoSuchMethodException;

  private native boolean getHeapCodeStatistics(long runtimeId, Callback<V8HeapCodeStatistics> callback) throws NoSuchMethodException;

  private native boolean getHeapSpaceStatistics(long runtimeId, Callback<ArrayList<V8HeapSpaceStatistics>> callback) throws NoSuchMethodException;

  private native boolean writeHeapSnapshot(long runtimeId, String filePath, Callback<Integer> callback) throws NoSuchMethodException;

  private native void addNearHeapLimitCallback(long runtimeId, NearHeapLimitCallback callback);

  private native void printCurrentStackTrace(long runtimeId, Callback<String> callback);

  private native void requestInterrupt(long runtimeId, Callback<Void> callback);

}
