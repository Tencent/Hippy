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

package com.tencent.mtt.hippy.v8.memory;

public class V8HeapStatistics {
  public long totalHeapSize;
  public long totalHeapSizeExecutable;
  public long totalPhysicalSize;
  public long totalAvailableSize;
  public long totalGlobalHandlesSize;
  public long usedGlobalHandlesSize;
  public long usedHeapSize;
  public long heapSizeLimit;
  public long mallocedMemory;
  public long externalMemory;
  public long peakMallocedMemory;
  public long numberOfNativeContexts;
  public long numberOfDetachedContexts;

  public V8HeapStatistics(long totalHeapSize,
                          long totalHeapSizeExecutable,
                          long totalPhysicalSize,
                          long totalAvailableSize,
                          long totalGlobalHandlesSize,
                          long usedGlobalHandlesSize,
                          long usedHeapSize,
                          long heapSizeLimit,
                          long mallocedMemory,
                          long externalMemory,
                          long peakMallocedMemory,
                          long numberOfNativeContexts,
                          long numberOfDetachedContexts) {
    this.totalHeapSize = totalHeapSize;
    this.totalHeapSizeExecutable = totalHeapSizeExecutable;
    this.totalPhysicalSize = totalPhysicalSize;
    this.totalAvailableSize = totalAvailableSize;
    this.totalGlobalHandlesSize = totalGlobalHandlesSize;
    this.usedGlobalHandlesSize = usedGlobalHandlesSize;
    this.usedHeapSize = usedHeapSize;
    this.heapSizeLimit = heapSizeLimit;
    this.mallocedMemory = mallocedMemory;
    this.externalMemory = externalMemory;
    this.peakMallocedMemory = peakMallocedMemory;
    this.numberOfNativeContexts = numberOfNativeContexts;
    this.numberOfDetachedContexts = numberOfDetachedContexts;
  }
}
