#define private public
#define protected public

#include "gtest/gtest.h"

#include <iostream>

#include "dom/deserializer.h"
#include "dom/dom_value.h"
#include "dom/serializer.h"

namespace hippy {
namespace dom {
namespace testing {

void CheckUint32(uint32_t value) {
  tdf::base::Serializer serializer;
  serializer.WriteHeader();
  serializer.WriteUint32(value);
  std::pair<uint8_t*, size_t> buffer = serializer.Release();

  tdf::base::Deserializer deserializer(buffer.first, buffer.second);
  deserializer.ReadHeader();

  tdf::base::DomValue dom_value;
  deserializer.ReadObject(dom_value);
  EXPECT_TRUE(dom_value.GetType() == tdf::base::DomValue::Type::kNumber);
  EXPECT_TRUE(dom_value.GetNumberType() == tdf::base::DomValue::NumberType::kUInt32);
  EXPECT_TRUE(dom_value.ToUint32Checked() == value);
}

void CheckInt32(int32_t value) {
  tdf::base::Serializer serializer;
  serializer.WriteHeader();
  serializer.WriteInt32(value);
  std::pair<uint8_t*, size_t> buffer = serializer.Release();

  tdf::base::Deserializer deserializer(buffer.first, buffer.second);
  deserializer.ReadHeader();

  tdf::base::DomValue dom_value;
  deserializer.ReadObject(dom_value);
  EXPECT_TRUE(dom_value.GetType() == tdf::base::DomValue::Type::kNumber);
  EXPECT_TRUE(dom_value.GetNumberType() == tdf::base::DomValue::NumberType::kInt32);
  EXPECT_TRUE(dom_value.ToInt32Checked() == value);
}

void CheckDouble(double value) {
  tdf::base::Serializer serializer;
  serializer.WriteHeader();
  serializer.WriteDouble(value);
  std::pair<uint8_t*, size_t> buffer = serializer.Release();

  tdf::base::Deserializer deserializer(buffer.first, buffer.second);
  deserializer.ReadHeader();

  tdf::base::DomValue dom_value;
  deserializer.ReadObject(dom_value);
  EXPECT_TRUE(dom_value.GetType() == tdf::base::DomValue::Type::kNumber);
  EXPECT_TRUE(dom_value.GetNumberType() == tdf::base::DomValue::NumberType::kDouble);
  EXPECT_TRUE(dom_value.ToDoubleChecked() == value);
}

void CheckString(std::string value) {
  tdf::base::Serializer serializer;
  serializer.WriteHeader();
  serializer.WriteString(value);
  std::pair<uint8_t*, size_t> buffer = serializer.Release();

  tdf::base::Deserializer deserializer(buffer.first, buffer.second);
  deserializer.ReadHeader();

  tdf::base::DomValue dom_value;
  deserializer.ReadObject(dom_value);
  EXPECT_TRUE(dom_value.GetType() == tdf::base::DomValue::Type::kString);
  EXPECT_TRUE(dom_value.ToStringChecked() == value);
  EXPECT_TRUE(dom_value.ToStringChecked().length() == value.length());
}

void CheckMap(tdf::base::DomValue::DomValueObjectType value) {
  tdf::base::Serializer serializer;
  serializer.WriteHeader();
  serializer.WriteJSObject(value);
  std::pair<uint8_t*, size_t> buffer = serializer.Release();

  tdf::base::Deserializer deserializer(buffer.first, buffer.second);
  deserializer.ReadHeader();

  tdf::base::DomValue dom_value;
  deserializer.ReadObject(dom_value);
  EXPECT_TRUE(dom_value.GetType() == tdf::base::DomValue::Type::kObject);
  EXPECT_TRUE(dom_value.IsObject());
  EXPECT_TRUE(dom_value.ToObjectChecked().size() == value.size());

  for (auto& v : dom_value.ToObjectChecked()) {
    EXPECT_TRUE(value.find(v.first) != value.end());
    auto c = value.find(v.first);
    if (v.second.IsUInt32()) EXPECT_TRUE(v.second.ToUint32Checked() == c->second.ToUint32Checked());
    if (v.second.IsInt32()) EXPECT_TRUE(v.second.ToInt32Checked() == c->second.ToInt32Checked());
    if (v.second.IsDouble()) EXPECT_TRUE(v.second.ToDoubleChecked() == c->second.ToDoubleChecked());
    if (v.second.IsString()) EXPECT_TRUE(v.second.ToStringChecked() == c->second.ToStringChecked());
    if (v.second.IsObject()) CheckMap(c->second.ToObjectChecked());
  }
}

void CheckArray(tdf::base::DomValue::DomValueArrayType value) {
  tdf::base::Serializer serializer;
  serializer.WriteHeader();
  serializer.WriteDenseJSArray(value);
  std::pair<uint8_t*, size_t> buffer = serializer.Release();

  tdf::base::Deserializer deserializer(buffer.first, buffer.second);
  deserializer.ReadHeader();

  tdf::base::DomValue dom_value;
  deserializer.ReadObject(dom_value);
  EXPECT_TRUE(dom_value.GetType() == tdf::base::DomValue::Type::kArray);
  EXPECT_TRUE(dom_value.IsArray());
  EXPECT_TRUE(dom_value.ToArrayChecked().size() == value.size());

  for (size_t i = 0; i < dom_value.ToArrayChecked().size(); i++) {
    auto v = dom_value.ToArrayChecked()[i];
    auto c = value[i];
    if (v.IsUInt32()) EXPECT_TRUE(v.ToUint32Checked() == c.ToUint32Checked());
    if (v.IsInt32()) EXPECT_TRUE(v.ToInt32Checked() == c.ToInt32Checked());
    if (v.IsDouble()) EXPECT_TRUE(v.ToDoubleChecked() == c.ToDoubleChecked());
    if (v.IsString()) EXPECT_TRUE(v.ToStringChecked() == c.ToStringChecked());
    if (v.IsArray()) CheckArray(c.ToArrayChecked());
  }
}

TEST(DeserializerTest, ReadHeader) {
  tdf::base::Serializer serializer;
  serializer.WriteHeader();
  std::pair<uint8_t*, size_t> buffer = serializer.Release();

  tdf::base::Deserializer deserializer(buffer.first, buffer.second);
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
  tdf::base::DomValue i32(1);
  tdf::base::DomValue u32(1);
  tdf::base::DomValue d(1.0);
  tdf::base::DomValue str("腾讯");
  tdf::base::DomValue::DomValueObjectType object1;
  object1["int32"] = i32;
  object1["uint32"] = u32;
  object1["double"] = d;
  object1["string"] = str;
  CheckMap(object1);

  tdf::base::DomValue::DomValueObjectType object2;
  object2["int32"] = i32;
  object2["uint32"] = u32;
  object2["double"] = d;
  object2["string"] = str;
  object2["object"] = object1;
  CheckMap(object2);
}

TEST(DeserializerTest, Object) {
  tdf::base::DomValue i32(1);
  tdf::base::DomValue u32(1);
  tdf::base::DomValue d(1.0);
  tdf::base::DomValue str("腾讯");
  tdf::base::DomValue::DomValueArrayType array1;
  array1.push_back(i32);
  array1.push_back(u32);
  array1.push_back(d);
  array1.push_back(str);
  CheckArray(array1);

  tdf::base::DomValue::DomValueArrayType array2;
  array2.push_back(i32);
  array2.push_back(u32);
  array2.push_back(d);
  array2.push_back(str);
  array2.push_back(tdf::base::DomValue(array1));
  CheckArray(array2);
}

}  // namespace testing
}  // namespace dom
}  // namespace hippy
