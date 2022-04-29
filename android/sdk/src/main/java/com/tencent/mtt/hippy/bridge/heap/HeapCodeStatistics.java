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

public class HeapCodeStatistics {
  public long code_and_metadata_size;
  public long bytecode_and_metadata_size;
  public long external_script_source_size;

  public HeapCodeStatistics(long code_and_metadata_size,
                            long bytecode_and_metadata_size,
                            long external_script_source_size) {
    this.code_and_metadata_size = code_and_metadata_size;
    this.bytecode_and_metadata_size = bytecode_and_metadata_size;
    this.external_script_source_size = external_script_source_size;
  }
}
