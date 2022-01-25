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
  EXPECT_TRUE(dom_value.ToUint32() == value);
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
  EXPECT_TRUE(dom_value.ToInt32() == value);
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
  EXPECT_TRUE(dom_value.ToDouble() == value);
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
  EXPECT_TRUE(dom_value.ToString() == value);
  EXPECT_TRUE(dom_value.ToString().length() == value.length());
}

TEST(SerializerTest, ReadHeader) {
  tdf::base::Serializer serializer;
  serializer.WriteHeader();
  std::pair<uint8_t*, size_t> buffer = serializer.Release();

  tdf::base::Deserializer deserializer(buffer.first, buffer.second);
  deserializer.ReadHeader();
  EXPECT_EQ(deserializer.version_, tdf::base::kLatestVersion);
}

TEST(SerializerTest, Uint32) {
  CheckUint32(0);
  CheckUint32(1);
  CheckUint32(std::numeric_limits<uint32_t>::min());
  CheckUint32(std::numeric_limits<uint32_t>::max());
}

TEST(SerializerTest, Int32) {
  CheckUint32(0);
  CheckUint32(1);
  CheckUint32(-1);
  CheckUint32(std::numeric_limits<int32_t>::min());
  CheckUint32(std::numeric_limits<int32_t>::max());
}

TEST(SerializerTest, Double) {
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

TEST(SerializerTest, String) {
  CheckString("");
  CheckString("a");
  CheckString("abcdefghijklmnopqrstuvwxyz");
  CheckString("~!@#$%^&*()_+");
  CheckString("1234567890");
  CheckString("腾讯");
  CheckString("动态化框架");
}

}  // namespace testing
}  // namespace dom
}  // namespace hippy
