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
#include <unordered_map>
#include <vector>
#include <ostream>

namespace footstone {
inline namespace value {

class HippyValue final {
 public:
  using HippyValueObjectType = typename std::unordered_map<std::string, HippyValue>;
  using DomValueArrayType = typename std::vector<HippyValue>;
  enum class Type { kUndefined, kNull, kNumber, kBoolean, kString, kObject, kArray };
  enum class NumberType { kInt32, kUInt32, kDouble, kNaN };

  union Number {
    int32_t i32_;
    uint32_t u32_;
    double d_;
    Number(int32_t i32) : i32_(i32) {}
    Number(uint32_t u32) : u32_(u32) {}
    Number(float f) : d_(f) {}
    Number(double d) : d_(d) {}
  };

  static const HippyValue Undefined();
  static const HippyValue Null();

  HippyValue() {}
  HippyValue(const HippyValue& source);

  /**
   * @brief 构造 int32_t 类型的 dom value
   * @param i32 int32_t 的值
   */
  explicit HippyValue(int32_t i32) : type_(Type::kNumber), number_type_(NumberType::kInt32), num_(i32) {}

  /**
   * @brief 构造 uint32_t 类型的 dom value
   * @param u32 uint32_t 的值
   */
  explicit HippyValue(uint32_t u32) : type_(Type::kNumber), number_type_(NumberType::kUInt32), num_(u32) {}

  /**
   * @brief 构造 double 类型的 dom value
   * @param f float 的值
   */
  explicit HippyValue(float f) : type_(Type::kNumber), number_type_(NumberType::kDouble), num_(f) {}

  /**
   * @brief 构造 double 类型的 dom value
   * @param d double 值
   */
  explicit HippyValue(double d) : type_(Type::kNumber), number_type_(NumberType::kDouble), num_(d) {}

  /**
   * @brief 构造 bool 类型的 dom value
   * @param b bool 值
   */
  explicit HippyValue(bool b) : type_(Type::kBoolean), b_(b) {}

  /**
   * @brief 移动构造 string 类型的  dom value
   * @param str string 的值
   */
  explicit HippyValue(std::string&& str) : type_(Type::kString), str_(std::move(str)) {}

  /**
   * @brief 构造 string 类型的  dom value
   * @param str string
   */
  explicit HippyValue(const std::string& str) : type_(Type::kString), str_(str) {}

  /**
   * @brief 构造 string 类型的 dom value
   * @param string_value const char* 的指针
   */
  explicit HippyValue(const char* string_value) : type_(Type::kString), str_(std::string(string_value)) {}

  /**
   * @brief 构造 string 类型的 dom value
   * @param string_value const char * 的指针
   * @param length 字符串长度
   */
  explicit HippyValue(const char* string_value, size_t length)
      : type_(Type::kString), str_(std::string(string_value, length)) {}

  /**
   * @brief 移动构造 object 类型的 dom value
   * @param object_value HippyValueObjectType 的对象
   */
  explicit HippyValue(HippyValueObjectType&& object_value) : type_(Type::kObject), obj_(std::move(object_value)) {}

  /**
   * @brief 构造 object 类型的 dom value
   * @param object_value HippyValueObjectType 的对象
   */
  explicit HippyValue(const HippyValueObjectType& object_value) : type_(Type::kObject), obj_(object_value) {}

  /**
   * @brief 移动构造 array 类型的 dom value
   * @param array_value DomValueArrayType 的对象
   */
  explicit HippyValue(DomValueArrayType&& array_value) : type_(Type::kArray), arr_(array_value) {}

  /**
   * @brief 移动构造 array 类型的 dom value
   * @param array_value DomValueArrayType 的对象
   */
  explicit HippyValue(DomValueArrayType& array_value) : type_(Type::kArray), arr_(array_value) {}
  ~HippyValue();

  HippyValue& operator=(const HippyValue& rhs) noexcept;
  HippyValue& operator=(const int32_t rhs) noexcept;
  HippyValue& operator=(const uint32_t rhs) noexcept;
  HippyValue& operator=(const double rhs) noexcept;
  HippyValue& operator=(const bool rhs) noexcept;
  HippyValue& operator=(const std::string& rhs) noexcept;
  HippyValue& operator=(const char* rhs) noexcept;
  HippyValue& operator=(const HippyValueObjectType& rhs) noexcept;
  HippyValue& operator=(const DomValueArrayType& rhs) noexcept;

  bool operator==(const HippyValue& rhs) const noexcept;
  bool operator!=(const HippyValue& rhs) const noexcept;
  bool operator<(const HippyValue& rhs) const noexcept;
  bool operator<=(const HippyValue& rhs) const noexcept;
  bool operator>(const HippyValue& rhs) const noexcept;
  bool operator>=(const HippyValue& rhs) const noexcept;

  /**
   * @brief 获取 dom value 的类型
   */
  inline Type GetType() noexcept { return type_; }

  /**
   * @brief 获取 dom value 的类型
   */
  inline Type GetType() const noexcept { return type_; }

  /**
   * @brief 获取 dom value number 类型的具体类型
   */
  inline NumberType GetNumberType() noexcept { return number_type_; }

  /**
   * @brief 获取 dom value number 类型的具体类型
   */
  inline NumberType GetNumberType() const noexcept { return number_type_; }

  /**
   * @brief dom value 是否是 undefined 类型
   */
  bool IsUndefined() const noexcept;

  /**
   * @brief dom value 是否是 null 类型
   */
  bool IsNull() const noexcept;

  /**
   * @brief dom value 是否是 boolean 类型
   */
  bool IsBoolean() const noexcept;

  /**
   * @brief dom value 是否是 number 类型
   */
  bool IsNumber() const noexcept;

  /**
   * @brief dom value 是否是 string 类型
   */
  bool IsString() const noexcept;

  /**
   * @brief dom value 是否是 array 类型
   */
  bool IsArray() const noexcept;

  /**
   * @brief dom value 是否是 object 类型
   */
  bool IsObject() const noexcept;

  /**
   * @brief dom value 是否是 int32_t 类型
   */
  bool IsInt32() const noexcept;

  /**
   * @brief dom value 是否是 uint32_t 类型
   */
  bool IsUInt32() const noexcept;

  /**
   * @brief dom value 是否是 double 类型
   */
  bool IsDouble() const noexcept;

  /**
   * @brief 转化成 int32_t
   * @param i32 get int32_t value
   * @return return true if success else return false
   */
  bool ToInt32(int32_t& i32) const;

  /**
   * @brief 转化成 int32_t, crash if failed
   * @return return int32_t value
   */
  int32_t ToInt32Checked() const;

  /**
   * @brief 转化成 uint32_t
   * @param u32 get value
   * @return return true if success else return false
   */
  bool ToUint32(uint32_t& u32) const;

  /**
   * @brief 转化成 uint32_t, crash if failed
   * @return return uint32_t value
   */
  uint32_t ToUint32Checked() const;

  /**
   * @brief 转化成 double 类型， int32_t\uint32_t\double 可以无损转化
   * @param d get double value
   * @return return true if success else return false
   */
  bool ToDouble(double& d) const;

  /**
   * @brief 转化成 double 类型， int32_t\uint32_t\double 可以无损转化, crash if failed
   * @return return double value
   */
  double ToDoubleChecked() const;

  /**
   * @brief 转化成 bool 类型
   * @param b get bool value
   * @return return true if success else return false
   */
  bool ToBoolean(bool& b) const;

  /**
   * @brief 转化成 bool 类型, crash if failed
   * @return return bool value
   */
  bool ToBooleanChecked() const;

  /**
   * @brief 转化成 string 类型
   * @param str get string value
   * @return return true if success else return false
   */
  bool ToString(std::string& str) const;

  /**
   * @brief 转化成 string 类型, crash if failed
   * @return return string value
   */
  const std::string& ToStringChecked() const;

  /**
   * @brief 转化成 string 类型, crash if failed
   * @return return string value
   */
  std::string& ToStringChecked();

  /**
   * @brief 转化成 HippyValueObjectType 类型, crash if failed
   * @param obj get HippyValueObjectType value
   * @return return true if success else return false
   */
  bool ToObject(HippyValueObjectType& obj) const;

  /**
   * @brief 转化成 HippyValueObjectType 类型, crash if failed
   * @return return HippyValueObjectType value
   */
  const HippyValueObjectType& ToObjectChecked() const;

  /**
   * @brief 转化成 HippyValueObjectType 类型, crash if failed
   * @return return HippyValueObjectType value
   */
  HippyValueObjectType& ToObjectChecked();

  /**
   * @brief 转化成 DomValueArrayType 类型, crash if failed
   * @param arr get DomValueArrayType value
   * @return return true if success else return false
   */
  bool ToArray(DomValueArrayType& arr) const;

  /**
   * @brief 转化成 DomValueArrayType 类型, crash if failed
   * @return return DomValueArrayType value
   */
  const DomValueArrayType& ToArrayChecked() const;

  /**
   * @brief 转化成 DomValueArrayType 类型, crash if failed
   * @return return DomValueArrayType value
   */
  DomValueArrayType& ToArrayChecked();

 private:
  inline void Deallocate();

  friend std::hash<HippyValue>;
  friend std::ostream& operator<<(std::ostream& os, const HippyValue& dom_value);


  Type type_ = Type::kUndefined;
  NumberType number_type_ = NumberType::kNaN;
  union {
    bool b_{};
    HippyValueObjectType obj_;
    DomValueArrayType arr_;
    std::string str_;
    Number num_;
  };
};

}  // namespace base
}  // namespace tdf

template <>
struct std::hash<footstone::value::HippyValue> {
  std::size_t operator()(const footstone::value::HippyValue& value) const noexcept;

 private:
  const static size_t UndefinedHashValue = 0x79476983;
  const static size_t NullHashValue = 0x7a695478;
};
