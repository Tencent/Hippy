/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2021 THL A29 Limited, a Tencent company. All rights reserved.
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
package com.tencent.mtt.hippy.serialization;

public enum ArrayBufferViewTag {
  INT8_ARRAY('b'), // kInt8Array
  UINT8_ARRAY('B'), // kUint8Array
  UINT8_CLAMPED_ARRAY('C'), // kUint8ClampedArray
  INT16_ARRAY('w'), // kInt16Array
  UINT16_ARRAY('W'), // kUint16Array
  INT32_ARRAY('d'), // kInt32Array
  UINT32_ARRAY('D'), // kUint32Array
  FLOAT32_ARRAY('f'), // kFloat32Array
  FLOAT64_ARRAY('F'), // kFloat64Array
  DATA_VIEW('?'); // kDataView

  private final byte tag;

  @SuppressWarnings("unused")
  ArrayBufferViewTag(char tag) {
    this.tag = (byte) tag;
  }

  public byte getTag() {
    return tag;
  }

  public static ArrayBufferViewTag fromTag(byte tag) {
    for (ArrayBufferViewTag t : values()) {
      if (t.tag == tag) {
        return t;
      }
    }
    return null;
  }
}
