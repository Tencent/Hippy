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

package com.tencent.mtt.hippy.bridge.heap;

public class HeapStatistics {
  public long total_heap_size;
  public long total_heap_size_executable;
  public long total_physical_size;
  public long total_available_size;
  public long total_global_handles_size;
  public long used_global_handles_size;
  public long used_heap_size;
  public long heap_size_limit;
  public long malloced_memory;
  public long external_memory;
  public long peak_malloced_memory;
  public long number_of_native_contexts;
  public long number_of_detached_contexts;

  public HeapStatistics(long total_heap_size,
                        long total_heap_size_executable,
                        long total_physical_size,
                        long total_available_size,
                        long total_global_handles_size,
                        long used_global_handles_size,
                        long used_heap_size,
                        long heap_size_limit,
                        long malloced_memory,
                        long external_memory,
                        long peak_malloced_memory,
                        long number_of_native_contexts,
                        long number_of_detached_contexts) {
    this.total_heap_size = total_heap_size;
    this.total_heap_size_executable = total_heap_size_executable;
    this.total_physical_size = total_physical_size;
    this.total_available_size = total_available_size;
    this.total_global_handles_size = total_global_handles_size;
    this.used_global_handles_size = used_global_handles_size;
    this.used_heap_size = used_heap_size;
    this.heap_size_limit = heap_size_limit;
    this.malloced_memory = malloced_memory;
    this.external_memory = external_memory;
    this.peak_malloced_memory = peak_malloced_memory;
    this.number_of_native_contexts = number_of_native_contexts;
    this.number_of_detached_contexts = number_of_detached_contexts;
  }
}
