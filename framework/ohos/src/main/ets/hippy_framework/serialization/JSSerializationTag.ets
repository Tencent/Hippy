/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").charCodeAt(0);
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
export class JSSerializationTag {
  static readonly TRUE_OBJECT = 'y'.charCodeAt(0); // kTrueObject
  static readonly FALSE_OBJECT = 'x'.charCodeAt(0); // kFalseObject
  static readonly NUMBER_OBJECT = 'n'.charCodeAt(0); // kNumberObject
  static readonly BIG_INT_OBJECT = 'z'.charCodeAt(0); // kBigIntObject
  static readonly STRING_OBJECT = 's'.charCodeAt(0); // kStringObject
  static readonly REGEXP = 'R'.charCodeAt(0); // kRegExp
  static readonly ARRAY_BUFFER = 'B'.charCodeAt(0); // kArrayBuffer
  static readonly SHARED_ARRAY_BUFFER = 'u'.charCodeAt(0); // kSharedArrayBuffer
  static readonly ARRAY_BUFFER_TRANSFER = 't'.charCodeAt(0); // kArrayBufferTransfer
  static readonly ARRAY_BUFFER_VIEW = 'V'.charCodeAt(0); // kArrayBufferView
  static readonly BEGIN_JS_MAP = ';'.charCodeAt(0); // kBeginJSMap
  static readonly END_JS_MAP = ':'.charCodeAt(0); // kEndJSMap
  static readonly BEGIN_JS_SET = '\''.charCodeAt(0); // kBeginJSSet
  static readonly END_JS_SET = ','.charCodeAt(0); // kEndJSSet
  static readonly BEGIN_JS_OBJECT = 'o'.charCodeAt(0); // kBeginJSObject
  static readonly END_JS_OBJECT = '{'.charCodeAt(0); // kEndJSObject
  static readonly BEGIN_SPARSE_JS_ARRAY = 'a'.charCodeAt(0); // kBeginSparseJSArray
  static readonly END_SPARSE_JS_ARRAY = '@'.charCodeAt(0); // kEndSparseJSArray
  static readonly BEGIN_DENSE_JS_ARRAY = 'A'.charCodeAt(0); // kBeginDenseJSArray
  static readonly END_DENSE_JS_ARRAY = '$'.charCodeAt(0); // kEndDenseJSArray
  static readonly SHARED_OBJECT = 'p'.charCodeAt(0); // kSharedObject
  static readonly WASM_MODULE_TRANSFER = 'w'.charCodeAt(0); // kWasmModuleTransfer
  static readonly HOST_OBJECT = '\\'.charCodeAt(0); // kHostObject
  static readonly WASM_MEMORY_TRANSFER = 'm'.charCodeAt(0); // kWasmMemoryTransfer
  static readonly ERROR = 'r'.charCodeAt(0); // kError
}
