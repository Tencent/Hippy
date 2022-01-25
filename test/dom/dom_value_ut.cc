#include "gtest/gtest.h"

#include <cstdlib>
#include <random>

#include "base/logging.h"
#include "dom/dom_value.h"

namespace hippy {
namespace dom {
namespace testing {

using DomValue = tdf::base::DomValue;
using DomValueObjectType = typename std::unordered_map<std::string, DomValue>;
using DomValueArrayType = typename std::vector<DomValue>;

TEST(DomValueTest, Undefined) {
  DomValue undefined = DomValue::Undefined();
  EXPECT_EQ(undefined.GetType() == DomValue::Type::kUndefined, true)
      << "Undefined Value GetType() return is not DomValue::Type::kUndefined.";
  EXPECT_EQ(undefined.IsUndefined(), true) << "Undefined Value IsUndefined() return is not true.";

  DomValue copy = DomValue(undefined);
  EXPECT_EQ(copy.GetType() == DomValue::Type::kUndefined, true)
      << "Copy constructor Undefined Value GetType() return is not DomValue::Type::kUndefined.";
  EXPECT_EQ(copy.IsUndefined(), true) << "Copy constructor Undefined Value IsUndefined() return is not true.";
}

TEST(DomValueTest, Null) {
  DomValue null = DomValue::Null();
  EXPECT_EQ(null.GetType() == DomValue::Type::kNull, true) << "Null Value GetType() return is not DomValue::Type::kNull.";
  EXPECT_EQ(null.IsNull(), true) << "Null Value IsNull() return is not true.";

  DomValue copy = DomValue(null);
  EXPECT_EQ(copy.GetType() == DomValue::Type::kNull, true)
      << "Copy constructor Null Value GetType() return is not DomValue::Type::kNull.";
  EXPECT_EQ(copy.IsNull(), true) << "Copy constructor Null Value IsNull() return is not true.";
}

TEST(DomValueTest, Int32) {
  DomValue i32 = DomValue(0);
  EXPECT_EQ(i32.GetType() == DomValue::Type::kNumber, true)
      << "Int32 Value GetType() return is not DomValue::Type::kNumber.";
  EXPECT_EQ(i32.GetNumberType() == DomValue::NumberType::kInt32, true)
      << "Int32 Value GetNumberType() return is not DomValue::NumberType::kInt32.";
  EXPECT_EQ(i32.IsNumber(), true) << "Int32 Value IsNumber() return is not true.";
  EXPECT_EQ(i32.IsInt32(), true) << "Int32 Value IsInt32() return is not true.";
  EXPECT_EQ(i32.ToInt32(), 0) << "Int32 Value ToInt32() is not equal to 0.";

  i32 = DomValue(-1);
  EXPECT_EQ(i32.ToInt32(), -1) << "Int32 Value ToInt32() is not equal to -1.";

  i32 = DomValue(1);
  EXPECT_EQ(i32.ToInt32(), 1) << "Int32 Value ToInt32() is not equal to 1.";

  i32 = DomValue(std::numeric_limits<int32_t>::max());
  EXPECT_EQ(i32.ToInt32() == std::numeric_limits<int32_t>::max(), true)
      << "Int32 Value ToInt32() is not equal to " << std::numeric_limits<int32_t>::max() << ".";

  i32 = DomValue(std::numeric_limits<int32_t>::min());
  EXPECT_EQ(i32.ToInt32() == std::numeric_limits<int32_t>::min(), true)
      << "Int32 Value ToInt32() is not equal to " << std::numeric_limits<int32_t>::min() << ".";

  std::random_device random_device;
  std::mt19937 mt19937(random_device());
  std::uniform_int_distribution<int32_t> distribution(std::numeric_limits<int32_t>::min(),
                                                      std::numeric_limits<int32_t>::max());
  for (int i = 0; i < 300; i++) {
    int32_t r = distribution(mt19937);
    i32 = DomValue(r);
    EXPECT_EQ(i32.ToInt32() == r, true) << "Int32 Value ToInt32() is not equal to random value " << r << ".";
  }

  DomValue copy_i32 = DomValue(i32);
  EXPECT_EQ(copy_i32.GetType() == DomValue::Type::kNumber, true)
      << "Copy constructor Int32 Value GetType() is return not DomValue::Type::kNumber.";
  EXPECT_EQ(copy_i32.GetNumberType() == DomValue::NumberType::kInt32, true)
      << "Copy constructor Int32 Value GetNumberType() is return not DomValue::NumberType::kInt32.";
  EXPECT_EQ(copy_i32.IsNumber(), true) << "Copy constructor Int32 Value IsNumber() return is not true.";
  EXPECT_EQ(copy_i32.ToInt32(), i32.ToInt32())
      << "Copy constructor Int32 Value ToInt32() is not equal to Int32 Value ToInt32().";
}

TEST(DomValueTest, UInt32) {
  uint32_t zero = 0;
  DomValue u32 = DomValue(zero);
  EXPECT_EQ(u32.GetType() == DomValue::Type::kNumber, true)
      << "Uint32 Value GetType() return is not DomValue::Type::kNumber.";
  EXPECT_EQ(u32.GetNumberType() == DomValue::NumberType::kUInt32, true)
      << "Uint32 Value GetNumberType() return is not DomValue::NumberType::kUInt32.";
  EXPECT_EQ(u32.IsNumber(), true) << "Uint32 Value IsNumber() return is not true.";
  EXPECT_EQ(u32.IsUInt32(), true) << "Uint32 Value IsUInt32() return is not true.";
  EXPECT_EQ(u32.ToUint32(), 0) << "Uint32 Value ToUInt32() is not equal to 0.";

  uint32_t one = 1;
  u32 = DomValue(one);
  EXPECT_EQ(u32.ToUint32(), one) << "Uint32 Value ToUInt32() is not equal to 1.";

  u32 = DomValue(std::numeric_limits<uint32_t>::max());
  EXPECT_EQ(u32.ToUint32() == std::numeric_limits<uint32_t>::max(), true)
      << "Uint32 Value ToUint32() is not equal to " << std::numeric_limits<uint32_t>::max() << ".";

  std::random_device random_device;
  std::mt19937 mt19937(random_device());
  std::uniform_int_distribution<uint32_t> distribution(0, std::numeric_limits<uint32_t>::max());
  for (int i = 0; i < 300; i++) {
    uint32_t r = distribution(mt19937);
    u32 = DomValue(r);
    EXPECT_EQ(u32.ToUint32() == r, true) << "Uint32 Value ToUint32() is not equal to random value " << r << ".";
  }

  DomValue copy_u32 = DomValue(u32);
  EXPECT_EQ(copy_u32.GetType() == DomValue::Type::kNumber, true)
      << "Copy constructor Uint32 Value GetType() return is not DomValue::Type::kNumber.";
  EXPECT_EQ(copy_u32.GetNumberType() == DomValue::NumberType::kUInt32, true)
      << "Copy constructor Uint32 Value GetNumberType() return is not DomValue::NumberType::kUInt32.";
  EXPECT_EQ(copy_u32.IsNumber(), true) << "Copy constructor Uint32 Value IsNumber() return is not true.";
  EXPECT_EQ(copy_u32.ToUint32(), u32.ToUint32())
      << "Copy constructor Uint32 Value ToUint32() is not equal to Uint32 Value ToUint32().";
}

TEST(DomValueTest, Double) {
  DomValue d = DomValue(0.f);
  EXPECT_EQ(d.GetType() == DomValue::Type::kNumber, true)
      << "Double Value GetType() return is not DomValue::Type::kNumber.";
  EXPECT_EQ(d.GetNumberType() == DomValue::NumberType::kDouble, true)
      << "Double Value GetNumberType() return is not DomValue::NumberType::kDouble.";
  EXPECT_EQ(d.IsNumber(), true) << "Double Value IsNumber() return is not true.";
  EXPECT_EQ(d.IsDouble(), true) << "Double Value IsDouble() return is not true.";
  EXPECT_DOUBLE_EQ(d.ToDouble(), 0) << "Double Value ToDouble() is not equal to 0.";

  d = DomValue(1.0f);
  EXPECT_EQ(d.ToDouble(), 1.0f) << "Double Value ToDouble() is not equal to 1.";

  d = DomValue(std::numeric_limits<double>::max());
  EXPECT_EQ(d.ToDouble(), std::numeric_limits<double>::max())
      << "Double Value ToDouble() is not equal to " << std::numeric_limits<double>::max() << ".";

  std::random_device random_device;
  std::mt19937 mt19937(random_device());
  std::uniform_int_distribution<double> distribution(0, std::numeric_limits<double>::max());
  for (int i = 0; i < 300; i++) {
    double r = distribution(mt19937);
    d = DomValue(r);
    EXPECT_EQ(d.ToDouble() == r, true) << "Double Value ToDouble() is not equal to random value " << r << ".";
  }

  DomValue copy_d = DomValue(d);
  EXPECT_EQ(copy_d.GetType() == DomValue::Type::kNumber, true)
      << "Copy constructor Double Value GetType() return is not DomValue::Type::kNumber.";
  EXPECT_EQ(copy_d.GetNumberType() == DomValue::NumberType::kDouble, true)
      << "Copy constructor Double Value GetNumberType() return is not DomValue::NumberType::kDouble.";
  EXPECT_EQ(copy_d.IsNumber(), true) << "Copy constructor Double Value IsNumber() return is not true.";
  EXPECT_EQ(copy_d.ToDouble(), d.ToDouble())
      << "Copy constructor Double Value ToDouble() is not equal to Double Value ToDouble().";
}

TEST(DomValueTest, String) {
  std::string str = "abcdefghijklmnopqrstuvwxyz";
  DomValue dom_value = DomValue(str);
  EXPECT_EQ(dom_value.GetType() == DomValue::Type::kString, true)
      << "String Value GetType() return is not DomValue::Type::kString.";
  EXPECT_EQ(dom_value.IsString(), true) << "String Value IsString() return is not true.";
  EXPECT_EQ(dom_value.ToString() == str, true) << "String Value ToString() is not equal to " << str << ".";

  str = "~!@#$%^&*()-=";
  dom_value = DomValue(str);
  EXPECT_EQ(dom_value.ToString() == str, true) << "String Value ToString() is not equal to " << str << ".";

  str = "1234567890";
  dom_value = DomValue(str);
  EXPECT_EQ(dom_value.ToString() == str, true) << "String Value ToString() is not equal to " << str << ".";

  str = "腾讯";
  dom_value = DomValue(str);
  EXPECT_EQ(dom_value.ToString() == str, true) << "String Value ToString() is not equal to " << str << ".";

  str = "";
  dom_value = DomValue(str);
  EXPECT_EQ(dom_value.ToString() == str, true) << "String Value ToString() is not equal to ''.";

  const char* cstr = "abcdefghijklmnopqrstuvwxyz";
  dom_value = DomValue(cstr);
  EXPECT_STREQ(dom_value.ToString().c_str(), cstr) << "String Value ToString() is not equal to " << cstr << ".";

  cstr = "~!@#$%^&*()-=";
  dom_value = DomValue(cstr);
  EXPECT_STREQ(dom_value.ToString().c_str(), cstr) << "String Value ToString() is not equal to " << cstr << ".";

  cstr = "1234567890";
  dom_value = DomValue(cstr);
  EXPECT_STREQ(dom_value.ToString().c_str(), cstr) << "String Value ToString() is not equal to " << cstr << ".";

  cstr = "腾讯";
  dom_value = DomValue(cstr);
  EXPECT_STREQ(dom_value.ToString().c_str(), cstr) << "String Value ToString() is not equal to " << cstr << ".";

//   cstr = nullptr;
//   dom_value = DomValue(cstr);
//   EXPECT_STREQ(dom_value.ToString().c_str(), cstr) << "String Value ToString() is not equal to " << cstr << ".";
}

TEST(DomValueTest, kObject) {
  DomValueObjectType object_type;
  object_type["undefined"] = DomValue::Undefined();
  object_type["null"] = DomValue::Null();
  object_type["int32"] = DomValue(static_cast<int32_t>(0));
  object_type["uint32"] = DomValue(static_cast<uint32_t>(0));
  object_type["double"] = DomValue(0.);
  object_type["string"] = DomValue("string");
  object_type["object"] = DomValueObjectType();
  object_type["array"] = DomValueArrayType();

  DomValue dom_value(object_type);
  EXPECT_EQ(dom_value.GetType() == DomValue::Type::kObject, true)
      << "Object Value GetType() return is not DomValue::Type::kObject.";
  EXPECT_EQ(dom_value.IsObject(), true) << "Object Value IsObject() return is not true.";
  EXPECT_EQ(dom_value.ToObject().size() == 8, true) << "Object Value size() is not equal to 8.";
}

TEST(DomValueTest, kArray) {
  DomValueArrayType array_type;
  array_type.push_back(DomValue::Undefined());
  array_type.push_back(DomValue::Null());
  array_type.push_back(DomValue(static_cast<int32_t>(0)));
  array_type.push_back(DomValue(static_cast<uint32_t>(0)));
  array_type.push_back(DomValue(0.));
  array_type.push_back(DomValue("string"));
  array_type.push_back(DomValue(DomValueObjectType()));
  array_type.push_back(DomValue(DomValueArrayType()));

  DomValue dom_value(array_type);
  EXPECT_EQ(dom_value.GetType() == DomValue::Type::kArray, true)
      << "Array Value GetType() return is not DomValue::Type::kArray.";
  EXPECT_EQ(dom_value.IsArray(), true) << "Array Value IsArray() return is not true.";
  EXPECT_EQ(dom_value.ToArray().size() == 8, true) << "Array Value size() is not equal to 8.";
}

}  // namespace testing
}  // namespace dom
}  // namespace hippy
