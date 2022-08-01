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
  private long mV8RuntimeId;

  public V8(long mV8RuntimeId){
    this.mV8RuntimeId = mV8RuntimeId;
  }

  @Override
  public boolean getHeapStatistics(@NonNull Callback<V8HeapStatistics> callback) {
    return getHeapStatistics(mV8RuntimeId, callback);
  }

  @Override
  public boolean getHeapCodeStatistics(@NonNull Callback<V8HeapCodeStatistics> callback) {
    return getHeapCodeStatistics(mV8RuntimeId, callback);
  }

  @Override
  public boolean getHeapSpaceStatistics(@NonNull Callback<ArrayList<V8HeapSpaceStatistics>> callback) {
    return getHeapSpaceStatistics(mV8RuntimeId, callback);
  }

  @Override
  public boolean writeHeapSnapshot(@NonNull String filePath, @NonNull Callback<Integer> callback) {
    return writeHeapSnapshot(mV8RuntimeId, filePath, callback);
  }

  // [memory]
  private native boolean getHeapStatistics(long runtimeId, Callback<V8HeapStatistics> callback);
  private native boolean getHeapCodeStatistics(long runtimeId, Callback<V8HeapCodeStatistics> callback);
  private native boolean getHeapSpaceStatistics(long runtimeId, Callback<ArrayList<V8HeapSpaceStatistics>> callback);
  private native boolean writeHeapSnapshot(long runtimeId, String filePath, Callback<Integer> callback);

}
