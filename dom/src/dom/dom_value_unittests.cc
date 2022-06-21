#include "gtest/gtest.h"

#include <cstdlib>
#include <random>

#include "footstone/logging.h"
#include "footstone/hippy_value.h"

namespace hippy {
namespace dom {
namespace testing {

using HippyValue = footstone::value::HippyValue;
using HippyValueObjectType = typename std::unordered_map<std::string, HippyValue>;
using DomValueArrayType = typename std::vector<HippyValue>;

TEST(DomValueTest, Undefined) {
  HippyValue undefined = HippyValue::Undefined();
  EXPECT_EQ(undefined.GetType() == HippyValue::Type::kUndefined, true)
      << "Undefined Value GetType() return is not HippyValue::Type::kUndefined.";
  EXPECT_EQ(undefined.IsUndefined(), true) << "Undefined Value IsUndefined() return is not true.";

  HippyValue copy = HippyValue(undefined);
  EXPECT_EQ(copy.GetType() == HippyValue::Type::kUndefined, true)
      << "Copy constructor Undefined Value GetType() return is not HippyValue::Type::kUndefined.";
  EXPECT_EQ(copy.IsUndefined(), true) << "Copy constructor Undefined Value IsUndefined() return is not true.";
}

TEST(DomValueTest, Null) {
  HippyValue null = HippyValue::Null();
  EXPECT_EQ(null.GetType() == HippyValue::Type::kNull, true) << "Null Value GetType() return is not HippyValue::Type::kNull.";
  EXPECT_EQ(null.IsNull(), true) << "Null Value IsNull() return is not true.";

  HippyValue copy = HippyValue(null);
  EXPECT_EQ(copy.GetType() == HippyValue::Type::kNull, true)
      << "Copy constructor Null Value GetType() return is not HippyValue::Type::kNull.";
  EXPECT_EQ(copy.IsNull(), true) << "Copy constructor Null Value IsNull() return is not true.";
}

TEST(DomValueTest, Int32) {
  HippyValue i32 = HippyValue(0);
  EXPECT_EQ(i32.GetType() == HippyValue::Type::kNumber, true)
      << "Int32 Value GetType() return is not HippyValue::Type::kNumber.";
  EXPECT_EQ(i32.GetNumberType() == HippyValue::NumberType::kInt32, true)
      << "Int32 Value GetNumberType() return is not HippyValue::NumberType::kInt32.";
  EXPECT_EQ(i32.IsNumber(), true) << "Int32 Value IsNumber() return is not true.";
  EXPECT_EQ(i32.IsInt32(), true) << "Int32 Value IsInt32() return is not true.";
  EXPECT_EQ(i32.ToInt32Checked(), 0) << "Int32 Value ToInt32Checked() is not equal to 0.";

  i32 = HippyValue(-1);
  EXPECT_EQ(i32.ToInt32Checked(), -1) << "Int32 Value ToInt32Checked() is not equal to -1.";

  i32 = HippyValue(1);
  EXPECT_EQ(i32.ToInt32Checked(), 1) << "Int32 Value ToInt32Checked() is not equal to 1.";

  i32 = HippyValue(std::numeric_limits<int32_t>::max());
  EXPECT_EQ(i32.ToInt32Checked() == std::numeric_limits<int32_t>::max(), true)
      << "Int32 Value ToInt32Checked() is not equal to " << std::numeric_limits<int32_t>::max() << ".";

  i32 = HippyValue(std::numeric_limits<int32_t>::min());
  EXPECT_EQ(i32.ToInt32Checked() == std::numeric_limits<int32_t>::min(), true)
      << "Int32 Value ToInt32Checked() is not equal to " << std::numeric_limits<int32_t>::min() << ".";

  std::random_device random_device;
  std::mt19937 mt19937(random_device());
  std::uniform_int_distribution<int32_t> distribution(std::numeric_limits<int32_t>::min(),
                                                      std::numeric_limits<int32_t>::max());
  for (int i = 0; i < 300; i++) {
    int32_t r = distribution(mt19937);
    i32 = HippyValue(r);
    EXPECT_EQ(i32.ToInt32Checked() == r, true) << "Int32 Value ToInt32Checked() is not equal to random value " << r << ".";
  }

  HippyValue copy_i32 = HippyValue(i32);
  EXPECT_EQ(copy_i32.GetType() == HippyValue::Type::kNumber, true)
      << "Copy constructor Int32 Value GetType() is return not HippyValue::Type::kNumber.";
  EXPECT_EQ(copy_i32.GetNumberType() == HippyValue::NumberType::kInt32, true)
      << "Copy constructor Int32 Value GetNumberType() is return not HippyValue::NumberType::kInt32.";
  EXPECT_EQ(copy_i32.IsNumber(), true) << "Copy constructor Int32 Value IsNumber() return is not true.";
  EXPECT_EQ(copy_i32.ToInt32Checked(), i32.ToInt32Checked())
      << "Copy constructor Int32 Value ToInt32Checked() is not equal to Int32 Value ToInt32Checked().";
}

TEST(DomValueTest, UInt32) {
  uint32_t zero = 0;
  HippyValue u32 = HippyValue(zero);
  EXPECT_EQ(u32.GetType() == HippyValue::Type::kNumber, true)
      << "Uint32 Value GetType() return is not HippyValue::Type::kNumber.";
  EXPECT_EQ(u32.GetNumberType() == HippyValue::NumberType::kUInt32, true)
      << "Uint32 Value GetNumberType() return is not HippyValue::NumberType::kUInt32.";
  EXPECT_EQ(u32.IsNumber(), true) << "Uint32 Value IsNumber() return is not true.";
  EXPECT_EQ(u32.IsUInt32(), true) << "Uint32 Value IsUInt32() return is not true.";
  EXPECT_EQ(u32.ToUint32Checked(), 0) << "Uint32 Value ToUInt32() is not equal to 0.";

  uint32_t one = 1;
  u32 = HippyValue(one);
  EXPECT_EQ(u32.ToUint32Checked(), one) << "Uint32 Value ToUInt32() is not equal to 1.";

  u32 = HippyValue(std::numeric_limits<uint32_t>::max());
  EXPECT_EQ(u32.ToUint32Checked() == std::numeric_limits<uint32_t>::max(), true)
      << "Uint32 Value ToUint32() is not equal to " << std::numeric_limits<uint32_t>::max() << ".";

  std::random_device random_device;
  std::mt19937 mt19937(random_device());
  std::uniform_int_distribution<uint32_t> distribution(0, std::numeric_limits<uint32_t>::max());
  for (int i = 0; i < 300; i++) {
    uint32_t r = distribution(mt19937);
    u32 = HippyValue(r);
    EXPECT_EQ(u32.ToUint32Checked() == r, true) << "Uint32 Value ToUint32() is not equal to random value " << r << ".";
  }

  HippyValue copy_u32 = HippyValue(u32);
  EXPECT_EQ(copy_u32.GetType() == HippyValue::Type::kNumber, true)
      << "Copy constructor Uint32 Value GetType() return is not HippyValue::Type::kNumber.";
  EXPECT_EQ(copy_u32.GetNumberType() == HippyValue::NumberType::kUInt32, true)
      << "Copy constructor Uint32 Value GetNumberType() return is not HippyValue::NumberType::kUInt32.";
  EXPECT_EQ(copy_u32.IsNumber(), true) << "Copy constructor Uint32 Value IsNumber() return is not true.";
  EXPECT_EQ(copy_u32.ToUint32Checked(), u32.ToUint32Checked())
      << "Copy constructor Uint32 Value ToUint32() is not equal to Uint32 Value ToUint32().";
}

TEST(DomValueTest, Double) {
  HippyValue d = HippyValue(0.f);
  EXPECT_EQ(d.GetType() == HippyValue::Type::kNumber, true)
      << "Double Value GetType() return is not HippyValue::Type::kNumber.";
  EXPECT_EQ(d.GetNumberType() == HippyValue::NumberType::kDouble, true)
      << "Double Value GetNumberType() return is not HippyValue::NumberType::kDouble.";
  EXPECT_EQ(d.IsNumber(), true) << "Double Value IsNumber() return is not true.";
  EXPECT_EQ(d.IsDouble(), true) << "Double Value IsDouble() return is not true.";
  EXPECT_DOUBLE_EQ(d.ToDoubleChecked(), 0) << "Double Value ToDoubleChecked() is not equal to 0.";

  d = HippyValue(1.0f);
  EXPECT_EQ(d.ToDoubleChecked(), 1.0f) << "Double Value ToDoubleChecked() is not equal to 1.";

  d = HippyValue(std::numeric_limits<double>::max());
  EXPECT_EQ(d.ToDoubleChecked(), std::numeric_limits<double>::max())
      << "Double Value ToDoubleChecked() is not equal to " << std::numeric_limits<double>::max() << ".";

  std::random_device random_device;
  std::mt19937 mt19937(random_device());
  std::uniform_int_distribution<double> distribution(0, std::numeric_limits<double>::max());
  for (int i = 0; i < 300; i++) {
    double r = distribution(mt19937);
    d = HippyValue(r);
    EXPECT_EQ(d.ToDoubleChecked() == r, true) << "Double Value ToDoubleChecked() is not equal to random value " << r << ".";
  }

  HippyValue copy_d = HippyValue(d);
  EXPECT_EQ(copy_d.GetType() == HippyValue::Type::kNumber, true)
      << "Copy constructor Double Value GetType() return is not HippyValue::Type::kNumber.";
  EXPECT_EQ(copy_d.GetNumberType() == HippyValue::NumberType::kDouble, true)
      << "Copy constructor Double Value GetNumberType() return is not HippyValue::NumberType::kDouble.";
  EXPECT_EQ(copy_d.IsNumber(), true) << "Copy constructor Double Value IsNumber() return is not true.";
  EXPECT_EQ(copy_d.ToDoubleChecked(), d.ToDoubleChecked())
      << "Copy constructor Double Value ToDoubleChecked() is not equal to Double Value ToDoubleChecked().";
}

TEST(DomValueTest, String) {
  std::string str = "abcdefghijklmnopqrstuvwxyz";
  HippyValue dom_value = HippyValue(str);
  EXPECT_EQ(dom_value.GetType() == HippyValue::Type::kString, true)
      << "String Value GetType() return is not HippyValue::Type::kString.";
  EXPECT_EQ(dom_value.IsString(), true) << "String Value IsString() return is not true.";
  EXPECT_EQ(dom_value.ToStringChecked() == str, true) << "String Value ToStringChecked() is not equal to " << str << ".";

  str = "~!@#$%^&*()-=";
  dom_value = HippyValue(str);
  EXPECT_EQ(dom_value.ToStringChecked() == str, true) << "String Value ToStringChecked() is not equal to " << str << ".";

  str = "1234567890";
  dom_value = HippyValue(str);
  EXPECT_EQ(dom_value.ToStringChecked() == str, true) << "String Value ToStringChecked() is not equal to " << str << ".";

  str = "腾讯";
  dom_value = HippyValue(str);
  EXPECT_EQ(dom_value.ToStringChecked() == str, true) << "String Value ToStringChecked() is not equal to " << str << ".";

  str = "";
  dom_value = HippyValue(str);
  EXPECT_EQ(dom_value.ToStringChecked() == str, true) << "String Value ToStringChecked() is not equal to ''.";

  const char* cstr = "abcdefghijklmnopqrstuvwxyz";
  dom_value = HippyValue(cstr);
  EXPECT_STREQ(dom_value.ToStringChecked().c_str(), cstr) << "String Value ToStringChecked() is not equal to " << cstr << ".";

  cstr = "~!@#$%^&*()-=";
  dom_value = HippyValue(cstr);
  EXPECT_STREQ(dom_value.ToStringChecked().c_str(), cstr) << "String Value ToStringChecked() is not equal to " << cstr << ".";

  cstr = "1234567890";
  dom_value = HippyValue(cstr);
  EXPECT_STREQ(dom_value.ToStringChecked().c_str(), cstr) << "String Value ToStringChecked() is not equal to " << cstr << ".";

  cstr = "腾讯";
  dom_value = HippyValue(cstr);
  EXPECT_STREQ(dom_value.ToStringChecked().c_str(), cstr) << "String Value ToStringChecked() is not equal to " << cstr << ".";

//   cstr = nullptr;
//   dom_value = HippyValue(cstr);
//   EXPECT_STREQ(dom_value.ToStringChecked().c_str(), cstr) << "String Value ToStringChecked() is not equal to " << cstr << ".";
}

TEST(DomValueTest, kObject) {
  HippyValueObjectType object_type;
  object_type["undefined"] = HippyValue::Undefined();
  object_type["null"] = HippyValue::Null();
  object_type["int32"] = HippyValue(static_cast<int32_t>(0));
  object_type["uint32"] = HippyValue(static_cast<uint32_t>(0));
  object_type["double"] = HippyValue(0.);
  object_type["string"] = HippyValue("string");
  object_type["object"] = HippyValueObjectType();
  object_type["array"] = DomValueArrayType();

  HippyValue dom_value(object_type);
  EXPECT_EQ(dom_value.GetType() == HippyValue::Type::kObject, true)
      << "Object Value GetType() return is not HippyValue::Type::kObject.";
  EXPECT_EQ(dom_value.IsObject(), true) << "Object Value IsObject() return is not true.";
  EXPECT_EQ(dom_value.ToObjectChecked().size() == 8, true) << "Object Value size() is not equal to 8.";
}

TEST(DomValueTest, kArray) {
  DomValueArrayType array_type;
  array_type.push_back(HippyValue::Undefined());
  array_type.push_back(HippyValue::Null());
  array_type.push_back(HippyValue(static_cast<int32_t>(0)));
  array_type.push_back(HippyValue(static_cast<uint32_t>(0)));
  array_type.push_back(HippyValue(0.));
  array_type.push_back(HippyValue("string"));
  array_type.push_back(HippyValue(HippyValueObjectType()));
  array_type.push_back(HippyValue(DomValueArrayType()));

  HippyValue dom_value(array_type);
  EXPECT_EQ(dom_value.GetType() == HippyValue::Type::kArray, true)
      << "Array Value GetType() return is not HippyValue::Type::kArray.";
  EXPECT_EQ(dom_value.IsArray(), true) << "Array Value IsArray() return is not true.";
  EXPECT_EQ(dom_value.ToArrayChecked().size() == 8, true) << "Array Value size() is not equal to 8.";
}

}  // namespace testing
}  // namespace dom
}  // namespace hippy
