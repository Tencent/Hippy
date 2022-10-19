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
public interface PrimitiveSerializationTag {
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
  byte THE_HOLE = (byte) '-'; // kTheHole
  byte OBJECT_REFERENCE = (byte) '^'; // kObjectReference
  byte HOST_OBJECT = (byte) '\\'; // kHostObject
}
