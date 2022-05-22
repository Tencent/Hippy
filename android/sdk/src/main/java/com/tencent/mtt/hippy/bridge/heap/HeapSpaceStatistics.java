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

public class HeapSpaceStatistics {
  public String space_name;
  public long space_size;
  public long space_used_size;
  public long space_available_size;
  public long physical_space_size;

  public HeapSpaceStatistics(String space_name,
                             long space_size,
                             long space_used_size,
                             long space_available_size,
                             long physical_space_size) {
    this.space_name = space_name;
    this.space_size = space_size;
    this.space_used_size = space_used_size;
    this.space_available_size = space_available_size;
    this.physical_space_size = physical_space_size;
  }
}
