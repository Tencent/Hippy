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

#include <vector>

#include "footstone/serializer.h"

namespace footstone {
inline namespace value {

class Deserializer {
  using HippyValueObjectType = footstone::HippyValue::HippyValueObjectType;
 public:
  Deserializer(const std::vector<const uint8_t>& data);
  Deserializer(const uint8_t* data, size_t size);
  ~Deserializer();

  Deserializer(const Deserializer&) = delete;
  Deserializer& operator=(const Deserializer&) = delete;

  void ReadHeader();

  bool ReadValue(HippyValue& value);

 private:
  bool ReadObject(HippyValue& value);

  bool PeekTag(SerializationTag& tag);

  bool ReadTag(SerializationTag& tag);

  void ConsumeTag(SerializationTag peek_tag);

  bool ReadInt32(int32_t& value);

  bool ReadInt32(HippyValue& dom_value);

  bool ReadUInt32(uint32_t& value);

  bool ReadUInt32(HippyValue& dom_value);

  bool ReadDouble(double& value);

  bool ReadDouble(HippyValue& dom_value);

  bool ReadUtf8String(std::string& value);

  bool ReadUtf8String(HippyValue& dom_value);

  bool ReadOneByteString(std::string& value);

  bool ReadOneByteString(HippyValue& dom_value);

  bool ReadTwoByteString(std::string& value);

  bool ReadTwoByteString(HippyValue& dom_value);

  bool ReadDenseJSArray(HippyValue& dom_value);

  bool ReadJSObject(HippyValue& dom_value);

 private:
  template <typename T>
  T ReadVarint();

  template <typename T>
  T ReadZigZag();

  uint32_t ReadObjectProperties(HippyValueObjectType& value, SerializationTag end_tag);

  uint32_t ReadObjectProperties(SerializationTag end_tag);

 private:
  const uint8_t* position_;
  const uint8_t* const end_;
  uint32_t version_ = 0;
};
}  // namespace base
}  // namespace tdf
