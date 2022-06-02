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
@SuppressWarnings({"unused"})
public enum SerializationTag {
  VERSION((char) 0xFF),
  TRUE('T'), // kTrue
  FALSE('F'), // kFalse
  UNDEFINED('_'), // kUndefined
  NULL('0'), // kNull
  INT32('I'), // kInt32
  UINT32('U'), // kUint32
  DOUBLE('N'), // kDouble
  BIG_INT('Z'), // kBigInt
  UTF8_STRING('S'), // kUtf8String
  ONE_BYTE_STRING('"'), // kOneByteString
  TWO_BYTE_STRING('c'), // kTwoByteString
  PADDING('\0'), // kPadding
  DATE('D'), // kDate
  TRUE_OBJECT('y'), // kTrueObject
  FALSE_OBJECT('x'), // kFalseObject
  NUMBER_OBJECT('n'), // kNumberObject
  BIG_INT_OBJECT('z'), // kBigIntObject
  STRING_OBJECT('s'), // kStringObject
  REGEXP('R'), // kRegExp
  ARRAY_BUFFER('B'), // kArrayBuffer
  SHARED_ARRAY_BUFFER('u'), // kSharedArrayBuffer
  ARRAY_BUFFER_TRANSFER('t'), // kArrayBufferTransfer
  ARRAY_BUFFER_VIEW('V'), // kArrayBufferView
  BEGIN_JS_MAP(';'), // kBeginJSMap
  END_JS_MAP(':'), // kEndJSMap
  BEGIN_JS_SET('\''), // kBeginJSSet
  END_JS_SET(','), // kEndJSSet
  BEGIN_JS_OBJECT('o'), // kBeginJSObject
  END_JS_OBJECT('{'), // kEndJSObject
  BEGIN_SPARSE_JS_ARRAY('a'), // kBeginSparseJSArray
  END_SPARSE_JS_ARRAY('@'), // kEndSparseJSArray
  BEGIN_DENSE_JS_ARRAY('A'), // kBeginDenseJSArray
  END_DENSE_JS_ARRAY('$'), // kEndDenseJSArray
  THE_HOLE('-'), // kTheHole
  OBJECT_REFERENCE('^'), // kObjectReference
  WASM_MODULE_TRANSFER('w'), // kWasmModuleTransfer
  HOST_OBJECT('\\'), // kHostObject
  WASM_MEMORY_TRANSFER('m'), // kWasmMemoryTransfer
  ERROR('r'); // kError

  private final byte tag;

  SerializationTag(char tag) {
    this.tag = (byte) tag;
  }

  public byte getTag() {
    return tag;
  }

  public static SerializationTag fromTag(byte tag) {
    for (SerializationTag t : values()) {
      if (t.tag == tag) {
        return t;
      }
    }
    return null;
  }
}
