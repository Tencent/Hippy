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
export class PrimitiveSerializationTag {
  static readonly VOID = 0;
  static readonly VERSION = 0xFF;
  static readonly TRUE = 'T'.charCodeAt(0); // kTrue
  static readonly FALSE = 'F'.charCodeAt(0); // kFalse
  static readonly UNDEFINED = '_'.charCodeAt(0); // kUndefined
  static readonly NULL = '0'.charCodeAt(0); // kNull
  static readonly INT32 = 'I'.charCodeAt(0); // kInt32
  static readonly UINT32 = 'U'.charCodeAt(0); // kUint32
  static readonly DOUBLE = 'N'.charCodeAt(0); // kDouble
  static readonly BIG_INT = 'Z'.charCodeAt(0); // kBigInt
  static readonly UTF8_STRING = 'S'.charCodeAt(0); // kUtf8String
  static readonly ONE_BYTE_STRING = '"'.charCodeAt(0); // kOneByteString
  static readonly TWO_BYTE_STRING =  'c'.charCodeAt(0); // kTwoByteString
  static readonly PADDING = '\0'.charCodeAt(0); // kPadding
  static readonly DATE = 'D'.charCodeAt(0); // kDate
  static readonly THE_HOLE = '-'.charCodeAt(0); // kTheHole
  static readonly OBJECT_REFERENCE = '^'.charCodeAt(0); // kObjectReference
  static readonly HOST_OBJECT = '\\'.charCodeAt(0); // kHostObject
}
