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

#define private public
#define protected public

#include "gtest/gtest.h"

#include <iostream>

#include "footstone/deserializer.h"
#include "footstone/hippy_value.h"
#include "footstone/serializer.h"

namespace hippy {
namespace dom {
namespace testing {

void CheckUint32(uint32_t value) {
  footstone::value::Serializer serializer;
  serializer.WriteHeader();
  serializer.WriteUint32(value);
  std::pair<uint8_t*, size_t> buffer = serializer.Release();

  footstone::value::Deserializer deserializer(buffer.first, buffer.second);
  deserializer.ReadHeader();

  footstone::value::HippyValue hippy_value;
  deserializer.ReadObject(hippy_value);
  EXPECT_TRUE(hippy_value.GetType() == footstone::value::HippyValue::Type::kNumber);
  EXPECT_TRUE(hippy_value.GetNumberType() == footstone::value::HippyValue::NumberType::kUInt32);
  EXPECT_TRUE(hippy_value.ToUint32Checked() == value);
}

void CheckInt32(int32_t value) {
  footstone::value::Serializer serializer;
  serializer.WriteHeader();
  serializer.WriteInt32(value);
  std::pair<uint8_t*, size_t> buffer = serializer.Release();

  footstone::value::Deserializer deserializer(buffer.first, buffer.second);
  deserializer.ReadHeader();

  footstone::value::HippyValue hippy_value;
  deserializer.ReadObject(hippy_value);
  EXPECT_TRUE(hippy_value.GetType() == footstone::value::HippyValue::Type::kNumber);
  EXPECT_TRUE(hippy_value.GetNumberType() == footstone::value::HippyValue::NumberType::kInt32);
  EXPECT_TRUE(hippy_value.ToInt32Checked() == value);
}

void CheckDouble(double value) {
  footstone::value::Serializer serializer;
  serializer.WriteHeader();
  serializer.WriteDouble(value);
  std::pair<uint8_t*, size_t> buffer = serializer.Release();

  footstone::value::Deserializer deserializer(buffer.first, buffer.second);
  deserializer.ReadHeader();

  footstone::value::HippyValue hippy_value;
  deserializer.ReadObject(hippy_value);
  EXPECT_TRUE(hippy_value.GetType() == footstone::value::HippyValue::Type::kNumber);
  EXPECT_TRUE(hippy_value.GetNumberType() == footstone::value::HippyValue::NumberType::kDouble);
  EXPECT_TRUE(hippy_value.ToDoubleChecked() == value);
}

void CheckString(std::string value) {
  footstone::value::Serializer serializer;
  serializer.WriteHeader();
  serializer.WriteString(value);
  std::pair<uint8_t*, size_t> buffer = serializer.Release();

  footstone::value::Deserializer deserializer(buffer.first, buffer.second);
  deserializer.ReadHeader();

  footstone::value::HippyValue hippy_value;
  deserializer.ReadObject(hippy_value);
  EXPECT_TRUE(hippy_value.GetType() == footstone::value::HippyValue::Type::kString);
  EXPECT_TRUE(hippy_value.ToStringChecked() == value);
  EXPECT_TRUE(hippy_value.ToStringChecked().length() == value.length());
}

void CheckMap(footstone::value::HippyValue::HippyValueObjectType value) {
  footstone::value::Serializer serializer;
  serializer.WriteHeader();
  serializer.WriteJSObject(value);
  std::pair<uint8_t*, size_t> buffer = serializer.Release();

  footstone::value::Deserializer deserializer(buffer.first, buffer.second);
  deserializer.ReadHeader();

  footstone::value::HippyValue hippy_value;
  deserializer.ReadObject(hippy_value);
  EXPECT_TRUE(hippy_value.GetType() == footstone::value::HippyValue::Type::kObject);
  EXPECT_TRUE(hippy_value.IsObject());
  EXPECT_TRUE(hippy_value.ToObjectChecked().size() == value.size());

  for (auto& v : hippy_value.ToObjectChecked()) {
    EXPECT_TRUE(value.find(v.first) != value.end());
    auto c = value.find(v.first);
    if (v.second.IsUInt32()) EXPECT_TRUE(v.second.ToUint32Checked() == c->second.ToUint32Checked());
    if (v.second.IsInt32()) EXPECT_TRUE(v.second.ToInt32Checked() == c->second.ToInt32Checked());
    if (v.second.IsDouble()) EXPECT_TRUE(v.second.ToDoubleChecked() == c->second.ToDoubleChecked());
    if (v.second.IsString()) EXPECT_TRUE(v.second.ToStringChecked() == c->second.ToStringChecked());
    if (v.second.IsObject()) CheckMap(c->second.ToObjectChecked());
  }
}

void CheckArray(footstone::value::HippyValue::HippyValueArrayType value) {
  footstone::value::Serializer serializer;
  serializer.WriteHeader();
  serializer.WriteDenseJSArray(value);
  std::pair<uint8_t*, size_t> buffer = serializer.Release();

  footstone::value::Deserializer deserializer(buffer.first, buffer.second);
  deserializer.ReadHeader();

  footstone::value::HippyValue hippy_value;
  deserializer.ReadObject(hippy_value);
  EXPECT_TRUE(hippy_value.GetType() == footstone::value::HippyValue::Type::kArray);
  EXPECT_TRUE(hippy_value.IsArray());
  EXPECT_TRUE(hippy_value.ToArrayChecked().size() == value.size());

  for (size_t i = 0; i < hippy_value.ToArrayChecked().size(); i++) {
    auto v = hippy_value.ToArrayChecked()[i];
    auto c = value[i];
    if (v.IsUInt32()) EXPECT_TRUE(v.ToUint32Checked() == c.ToUint32Checked());
    if (v.IsInt32()) EXPECT_TRUE(v.ToInt32Checked() == c.ToInt32Checked());
    if (v.IsDouble()) EXPECT_TRUE(v.ToDoubleChecked() == c.ToDoubleChecked());
    if (v.IsString()) EXPECT_TRUE(v.ToStringChecked() == c.ToStringChecked());
    if (v.IsArray()) CheckArray(c.ToArrayChecked());
  }
}

TEST(DeserializerTest, ReadHeader) {
  footstone::value::Serializer serializer;
  serializer.WriteHeader();
  std::pair<uint8_t*, size_t> buffer = serializer.Release();

  footstone::value::Deserializer deserializer(buffer.first, buffer.second);
  deserializer.ReadHeader();
  EXPECT_EQ(deserializer.version_, tdf::base::kLatestVersion);
}

TEST(DeserializerTest, Uint32) {
  CheckUint32(0);
  CheckUint32(1);
  CheckUint32(std::numeric_limits<uint32_t>::min());
  CheckUint32(std::numeric_limits<uint32_t>::max());
}

TEST(DeserializerTest, Int32) {
  CheckUint32(0);
  CheckUint32(1);
  CheckUint32(-1);
  CheckUint32(std::numeric_limits<int32_t>::min());
  CheckUint32(std::numeric_limits<int32_t>::max());
}

TEST(DeserializerTest, Double) {
  CheckDouble(0);
  CheckDouble(0.1);
  CheckDouble(0.000000000000001);
  CheckDouble(0.0000000000000001);
  CheckDouble(0.00000000000000001);
  CheckDouble(0.000000000000000001);
  CheckDouble(-0.000000000000001);
  CheckDouble(-0.0000000000000001);
  CheckDouble(-0.00000000000000001);
  CheckDouble(-0.000000000000000001);
  CheckDouble(std::numeric_limits<double>::min());
  CheckDouble(std::numeric_limits<double>::max());
}

TEST(DeserializerTest, String) {
  CheckString("");
  CheckString("a");
  CheckString("abcdefghijklmnopqrstuvwxyz");
  CheckString("~!@#$%^&*()_+");
  CheckString("1234567890");
  CheckString("腾讯");
  CheckString("动态化框架");
}

TEST(DeserializerTest, Map) {
  footstone::value::HippyValue i32(1);
  footstone::value::HippyValue u32(1);
  footstone::value::HippyValue d(1.0);
  footstone::value::HippyValue str("腾讯");
  footstone::value::HippyValue::HippyValueObjectType object1;
  object1["int32"] = i32;
  object1["uint32"] = u32;
  object1["double"] = d;
  object1["string"] = str;
  CheckMap(object1);

  footstone::value::HippyValue::HippyValueObjectType object2;
  object2["int32"] = i32;
  object2["uint32"] = u32;
  object2["double"] = d;
  object2["string"] = str;
  object2["object"] = object1;
  CheckMap(object2);
}

TEST(DeserializerTest, Object) {
  footstone::value::HippyValue i32(1);
  footstone::value::HippyValue u32(1);
  footstone::value::HippyValue d(1.0);
  footstone::value::HippyValue str("腾讯");
  footstone::value::HippyValue::HippyValueArrayType array1;
  array1.push_back(i32);
  array1.push_back(u32);
  array1.push_back(d);
  array1.push_back(str);
  CheckArray(array1);

  footstone::value::HippyValue::HippyValueArrayType array2;
  array2.push_back(i32);
  array2.push_back(u32);
  array2.push_back(d);
  array2.push_back(str);
  array2.push_back(footstone::value::HippyValue(array1));
  CheckArray(array2);
}

}  // namespace testing
}  // namespace dom
}  // namespace hippy
