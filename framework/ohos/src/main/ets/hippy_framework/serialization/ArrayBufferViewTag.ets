/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
export class ArrayBufferViewTag {
  static readonly UNKNOWN_TAG = -1;

  static readonly INT8_ARRAY = 'b'.charCodeAt(0); // kInt8Array
  static readonly UINT8_ARRAY = 'B'.charCodeAt(0); // kUint8Array
  static readonly UINT8_CLAMPED_ARRAY = 'C'.charCodeAt(0); // kUint8ClampedArray
  static readonly INT16_ARRAY = 'w'.charCodeAt(0); // kInt16Array
  static readonly UINT16_ARRAY = 'W'.charCodeAt(0); // kUint16Array
  static readonly INT32_ARRAY = 'd'.charCodeAt(0); // kInt32Array
  static readonly UINT32_ARRAY = 'D'.charCodeAt(0); // kUint32Array
  static readonly FLOAT32_ARRAY = 'f'.charCodeAt(0); // kFloat32Array
  static readonly FLOAT64_ARRAY = 'F'.charCodeAt(0); // kFloat64Array
  static readonly BIGINT64_ARRAY = 'q'.charCodeAt(0); // kBigInt64Array
  static readonly BIGUINT64_ARRAY = 'Q'.charCodeAt(0); // kBigUint64Array
  static readonly DATA_VIEW = '?'.charCodeAt(0); // kDataView

  static fromTag(tag: number): number {
    if (tag != ArrayBufferViewTag.INT8_ARRAY &&
      tag != ArrayBufferViewTag.UINT8_ARRAY &&
      tag != ArrayBufferViewTag.UINT8_CLAMPED_ARRAY &&
      tag != ArrayBufferViewTag.INT16_ARRAY &&
      tag != ArrayBufferViewTag.UINT16_ARRAY &&
      tag != ArrayBufferViewTag.INT32_ARRAY &&
      tag != ArrayBufferViewTag.UINT32_ARRAY &&
      tag != ArrayBufferViewTag.FLOAT32_ARRAY &&
      tag != ArrayBufferViewTag.FLOAT64_ARRAY &&
      tag != ArrayBufferViewTag.BIGINT64_ARRAY &&
      tag != ArrayBufferViewTag.BIGUINT64_ARRAY &&
      tag != ArrayBufferViewTag.DATA_VIEW) {
      return ArrayBufferViewTag.UNKNOWN_TAG
    }
    return tag
  }
}
