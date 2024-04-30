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

/**
 * A tag that determines the type of the serialized value.
 */
public interface SerializationTag {
  byte VOID = 0;
  byte VERSION = (byte) 0xFF;
  byte TRUE = (byte) 'T'; // kTrue
  byte FALSE = (byte) 'F'; // kFalse
  byte UNDEFINED = (byte) '_'; // kUndefined
  byte NULL = (byte) '0'; // kNull
  byte INT32 = (byte) 'I'; // kInt32
  byte UINT32 = (byte) 'U'; // kUint32
  byte DOUBLE = (byte) 'N'; // kDouble
  byte BIG_INT = (byte) 'Z'; // kBigInt
  byte UTF8_STRING = (byte) 'S'; // kUtf8String
  byte ONE_BYTE_STRING = (byte) '"'; // kOneByteString
  byte TWO_BYTE_STRING = (byte) 'c'; // kTwoByteString
  byte PADDING = (byte) '\0'; // kPadding
  byte DATE = (byte) 'D'; // kDate
  byte TRUE_OBJECT = (byte) 'y'; // kTrueObject
  byte FALSE_OBJECT = (byte) 'x'; // kFalseObject
  byte NUMBER_OBJECT = (byte) 'n'; // kNumberObject
  byte BIG_INT_OBJECT = (byte) 'z'; // kBigIntObject
  byte STRING_OBJECT = (byte) 's'; // kStringObject
  byte REGEXP = (byte) 'R'; // kRegExp
  byte ARRAY_BUFFER = (byte) 'B'; // kArrayBuffer
  byte SHARED_ARRAY_BUFFER = (byte) 'u'; // kSharedArrayBuffer
  byte ARRAY_BUFFER_TRANSFER = (byte) 't'; // kArrayBufferTransfer
  byte ARRAY_BUFFER_VIEW = (byte) 'V'; // kArrayBufferView
  byte BEGIN_JS_MAP = (byte) ';'; // kBeginJSMap
  byte END_JS_MAP = (byte) ':'; // kEndJSMap
  byte BEGIN_JS_SET = (byte) '\''; // kBeginJSSet
  byte END_JS_SET = (byte) ','; // kEndJSSet
  byte BEGIN_JS_OBJECT = (byte) 'o'; // kBeginJSObject
  byte END_JS_OBJECT = (byte) '{'; // kEndJSObject
  byte BEGIN_SPARSE_JS_ARRAY = (byte) 'a'; // kBeginSparseJSArray
  byte END_SPARSE_JS_ARRAY = (byte) '@'; // kEndSparseJSArray
  byte BEGIN_DENSE_JS_ARRAY = (byte) 'A'; // kBeginDenseJSArray
  byte END_DENSE_JS_ARRAY = (byte) '$'; // kEndDenseJSArray
  byte SHARED_OBJECT = (byte) 'p'; // kSharedObject
  byte THE_HOLE = (byte) '-'; // kTheHole
  byte OBJECT_REFERENCE = (byte) '^'; // kObjectReference
  byte WASM_MODULE_TRANSFER = (byte) 'w'; // kWasmModuleTransfer
  byte HOST_OBJECT = (byte) '\\'; // kHostObject
  byte WASM_MEMORY_TRANSFER = (byte) 'm'; // kWasmMemoryTransfer
  byte ERROR = (byte) 'r'; // kError
}
