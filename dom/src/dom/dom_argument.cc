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

#include "dom/dom_argument.h"

#include <vector>

#include "footstone/deserializer.h"
#include "footstone/logging.h"
#include "footstone/serializer.h"

namespace hippy {
inline namespace dom {

DomArgument::DomArgument(const DomArgument& source) : data_(source.data_), argument_type_(source.argument_type_) {}

DomArgument::~DomArgument() = default;

bool DomArgument::ToBson(std::vector<uint8_t>& bson) const {
  if (argument_type_ == ArgumentType::OBJECT) {
    auto hippy_value = std::any_cast<footstone::value::HippyValue>(&data_);
    return ConvertObjectToBson(*hippy_value, bson);
  } else if (argument_type_ == ArgumentType::BSON) {
    auto vec = std::any_cast<std::vector<uint8_t>>(&data_);
    bson = *vec;
    return true;
  }
  return false;
}

bool DomArgument::ToObject(footstone::value::HippyValue& hippy_value) const {
  if (argument_type_ == ArgumentType::OBJECT) {
    auto vec = std::any_cast<footstone::value::HippyValue>(&data_);
    hippy_value = *vec;
    return true;
  } else if (argument_type_ == ArgumentType::BSON) {
    auto vec = std::any_cast<std::vector<uint8_t>>(&data_);
    std::vector<const uint8_t> bson(vec->begin(), vec->end());
    return ConvertBsonToObject(bson, hippy_value);
  }
  return false;
}

bool DomArgument::ConvertObjectToBson(const footstone::value::HippyValue& hippy_value, std::vector<uint8_t>& bson) {
  footstone::value::Serializer serializer;
  serializer.WriteHeader();
  serializer.WriteValue(hippy_value);
  std::pair<uint8_t*, size_t> pair = serializer.Release();
  bson.resize(pair.second);
  memcpy(&bson[0], pair.first, sizeof(uint8_t) * pair.second);
  return true;
}

bool DomArgument::ConvertBsonToObject(const std::vector<const uint8_t>& bson, footstone::value::HippyValue& hippy_value) {
  footstone::value::Deserializer deserializer(bson);
  deserializer.ReadHeader();
  bool ret = deserializer.ReadValue(hippy_value);
  return ret;
}

}  // namespace dom
}  // namespace hippy
