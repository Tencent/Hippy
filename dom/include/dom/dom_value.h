#pragma once

#include <string>
#include <unordered_map>
#include <vector>

namespace tdf {
namespace base {

class DomValue final {
 public:
  using DomValueObjectType = typename std::unordered_map<std::string, DomValue>;
  using DomValueArrayType = typename std::vector<DomValue>;
  enum class Type { kUndefined, kNull, kNumber, kBoolean, kString, kObject, kArray };
  enum class NumberType { kInt32, kUInt32, kDouble, kNaN };

  union Number {
    int32_t i32_;
    uint32_t u32_;
    double d_;
    Number(int32_t i32) : i32_(i32){};
    Number(uint32_t u32) : u32_(u32){};
    Number(float f) : d_(f){};
    Number(double d) : d_(d){};
  };

  static const DomValue Undefined();
  static const DomValue Null();

  DomValue(){};
  DomValue(const DomValue& source);

  /**
   * @brief 构造 int32_t 类型的 dom value
   * @param i32 int32_t 的值
   */
  explicit DomValue(int32_t i32) : type_(Type::kNumber), number_type_(NumberType::kInt32), num_(i32) {}

  /**
   * @brief 构造 uint32_t 类型的 dom value
   * @param u32 uint32_t 的值
   */
  explicit DomValue(uint32_t u32) : type_(Type::kNumber), number_type_(NumberType::kUInt32), num_(u32) {}

  /**
   * @brief 构造 double 类型的 dom value
   * @param f float 的值
   */
  explicit DomValue(float f) : type_(Type::kNumber), number_type_(NumberType::kDouble), num_(f) {}

  /**
   * @brief 构造 double 类型的 dom value
   * @param d double 值
   */
  explicit DomValue(double d) : type_(Type::kNumber), number_type_(NumberType::kDouble), num_(d) {}

  /**
   * @brief 构造 bool 类型的 dom value
   * @param b bool 值
   */
  explicit DomValue(bool b) : type_(Type::kBoolean), b_(b) {}

  /**
   * @brief 移动构造 string 类型的  dom value
   * @param str string 的值
   */
  explicit DomValue(std::string&& str) : type_(Type::kString), str_(std::move(str)) {}

  /**
   * @brief 构造 string 类型的  dom value
   * @param str string
   */
  explicit DomValue(const std::string& str) : type_(Type::kString), str_(str) {}

  /**
   * @brief 构造 string 类型的 dom value
   * @param string_value const char* 的指针
   */
  explicit DomValue(const char* string_value) : type_(Type::kString), str_(std::string(string_value)) {}

  /**
   * @brief 构造 string 类型的 dom value
   * @param string_value const char * 的指针
   * @param length 字符串长度
   */
  explicit DomValue(const char* string_value, size_t length)
      : type_(Type::kString), str_(std::string(string_value, length)) {}

  /**
   * @brief 移动构造 object 类型的 dom value
   * @param object_value DomValueObjectType 的对象
   */
  explicit DomValue(DomValueObjectType&& object_value) : type_(Type::kObject), obj_(std::move(object_value)) {}

  /**
   * @brief 构造 object 类型的 dom value
   * @param object_value DomValueObjectType 的对象
   * @param length 字符串长度
   */
  explicit DomValue(const DomValueObjectType& object_value) : type_(Type::kObject), obj_(object_value) {}

  /**
   * @brief 移动构造 array 类型的 dom value
   * @param array_value DomValueArrayType 的对象
   */
  explicit DomValue(DomValueArrayType&& array_value) : type_(Type::kArray), arr_(array_value) {}

  /**
   * @brief 移动构造 array 类型的 dom value
   * @param array_value DomValueArrayType 的对象
   */
  explicit DomValue(DomValueArrayType& array_value) : type_(Type::kArray), arr_(array_value) {}
  ~DomValue();

  DomValue& operator=(const DomValue& rhs) noexcept;
  DomValue& operator=(const int32_t rhs) noexcept;
  DomValue& operator=(const uint32_t rhs) noexcept;
  DomValue& operator=(const double rhs) noexcept;
  DomValue& operator=(const bool rhs) noexcept;
  DomValue& operator=(const std::string& rhs) noexcept;
  DomValue& operator=(const char* rhs) noexcept;
  DomValue& operator=(const DomValueObjectType& rhs) noexcept;
  DomValue& operator=(const DomValueArrayType& rhs) noexcept;

  bool operator==(const DomValue& rhs) const noexcept;
  bool operator!=(const DomValue& rhs) const noexcept;
  bool operator<(const DomValue& rhs) const noexcept;
  bool operator<=(const DomValue& rhs) const noexcept;
  bool operator>(const DomValue& rhs) const noexcept;
  bool operator>=(const DomValue& rhs) const noexcept;

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
   */
  int32_t ToInt32() const;

  /**
   * @brief 转化成 uint32_t
   */
  uint32_t ToUint32() const;

  /**
   * @brief 转化成 double 类型， int32_t\uint32_t\double 可以无损转化
   */
  double ToDouble() const;

  /**
   * @brief 转化成 bool 类型
   */
  bool ToBoolean() const;

  /**
   * @brief 转化成 string 类型
   */
  const std::string& ToString() const;

  /**
   * @brief 转化成 string 类型
   */
  std::string& ToString();

  /**
   * @brief 转化成 DomValueObjectType 类型
   */
  const DomValueObjectType& ToObject() const;

  /**
   * @brief 转化成 DomValueObjectType 类型
   */
  DomValueObjectType& ToObject();

  /**
   * @brief 转化成 DomValueArrayType 类型
   */
  const DomValueArrayType& ToArray() const;

  /**
   * @brief 转化成 DomValueArrayType 类型
   */
  DomValueArrayType& ToArray();

 private:
  inline void Deallocate();

  friend std::hash<DomValue>;

  Type type_ = Type::kUndefined;
  NumberType number_type_ = NumberType::kNaN;
  union {
    bool b_{};
    DomValueObjectType obj_;
    DomValueArrayType arr_;
    std::string str_;
    Number num_;
  };
};

}  // namespace base
}  // namespace tdf

template <>
struct std::hash<tdf::base::DomValue> {
  std::size_t operator()(const tdf::base::DomValue& value) const noexcept;

 private:
  const static size_t UndefinedHashValue = 0x79476983;
  const static size_t NullHashValue = 0x7a695478;
};
