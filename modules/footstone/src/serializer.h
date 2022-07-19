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

#pragma once

#include <string>

#include "hippy_value.h"

namespace footstone {
inline namespace value {
// V8 latest version
static const uint32_t kLatestVersion = 13;

enum class Oddball : uint8_t {
  kTheHole,
  kUndefined,
  kNull,
  kTrue,
  kFalse,
};

enum class SerializationTag : uint8_t {
  // version:uint32_t (if at beginning of data, sets version > 0)
  kVersion = 0xFF,
  // ignore
  kPadding = '\0',
  // Oddballs (no data).
  kTheHole = '-',
  kUndefined = '_',
  kNull = '0',
  kTrue = 'T',
  kFalse = 'F',
  // Number represented as 32-bit integer, ZigZag-encoded
  // (like sint32 in protobuf)
  kInt32 = 'I',
  // Number represented as 32-bit unsigned integer, varint-encoded
  // (like uint32 in protobuf)
  kUint32 = 'U',
  // Number represented as a 64-bit double.
  // Host byte order is used (N.B. this makes the format non-portable).
  kDouble = 'N',
  // byteLength:uint32_t, then raw data
  kUtf8String = 'S',
  kOneByteString = '"',
  kTwoByteString = 'c',
  // Beginning of a JS object.
  kBeginJSObject = 'o',
  // End of a JS object. numProperties:uint32_t
  kEndJSObject = '{',
  // Beginning of a dense JS array. length:uint32_t
  // |length| elements, followed by properties as key/value pairs
  kBeginDenseJSArray = 'A',
  // End of a dense JS array. numProperties:uint32_t length:uint32_t
  kEndDenseJSArray = '$',
};

class Serializer {
 public:
  Serializer();
  ~Serializer();
  Serializer(const Serializer&) = delete;
  Serializer& operator=(const Serializer&) = delete;

  void WriteHeader();

  void WriteValue(const HippyValue& dom_value);

  std::pair<uint8_t*, size_t> Release();
 private:

  void WriteOddball(Oddball oddball);

  void WriteUint32(uint32_t value);

  void WriteInt32(int32_t value);

  void WriteDouble(double value);

  void WriteString(const std::string& value);

  void WriteDenseJSArray(const HippyValue::DomValueArrayType& dom_value);

  void WriteJSObject(const HippyValue::HippyValueObjectType& dom_value);

 private:
  void WriteTag(SerializationTag tag);

  template <typename T>
  void WriteVarint(T value);

  template <typename T>
  void WriteZigZag(T value);

  void WriteOneByteString(const char* str, size_t length);

  void WriteTwoByteString(const char16_t* str, size_t length);

  void WriteRawBytes(const void* source, size_t length);

  void WriteObject(const HippyValue& dom_value);

  uint8_t* ReserveRawBytes(size_t bytes);

  void ExpandBuffer(size_t required_capacity);

  uint8_t* buffer_ = nullptr;
  size_t buffer_size_ = 0;
  size_t buffer_capacity_ = 0;
};

}  // namespace base
}  // namespace tdf
