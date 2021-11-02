#pragma once

#include <string>
#include <unordered_map>
#include <vector>

namespace tdf {
namespace base {

class DomValue {
public:
  using DomValueObjectType = typename std::unordered_map<std::string, DomValue>;
  using DomValueArrayType = typename std::vector<DomValue>;
  enum class Type {
    kUndefined,
    kNull,
    kNumber,
    kBoolean,
    kString,
    kObject,
    kArray
  };
  enum class NumberType { kInt32, kUInt32, kInt64, kUInt64, kDouble, kNaN };

  union Number {
    int32_t i32_;
    uint32_t u32_;
    int64_t i64_;
    uint64_t u64_;
    double d_;
    Number(int32_t i32) : i32_(i32){};
    Number(uint32_t u32) : u32_(u32){};
    Number(int64_t i64) : i64_(i64){};
    Number(uint64_t u64) : u64_(u64){};
    Number(float f) : d_(f){};
    Number(double d) : d_(d){};
  };

  static const DomValue Undefined();
  static const DomValue Null();

  DomValue(){};
  DomValue(const DomValue &source);

  explicit DomValue(int32_t i32)
      : type_(Type::kNumber), number_type_(NumberType::kInt32), num_(i32) {}
  explicit DomValue(uint32_t u32)
      : type_(Type::kNumber), number_type_(NumberType::kUInt32), num_(u32) {}
  explicit DomValue(int64_t i64)
      : type_(Type::kNumber), number_type_(NumberType::kInt64), num_(i64) {}
  explicit DomValue(uint64_t u64)
      : type_(Type::kNumber), number_type_(NumberType::kUInt64), num_(u64) {}
  explicit DomValue(float f)
      : type_(Type::kNumber), number_type_(NumberType::kDouble), num_(f) {}
  explicit DomValue(double d)
      : type_(Type::kNumber), number_type_(NumberType::kDouble), num_(d) {}
  explicit DomValue(bool b) : type_(Type::kBoolean), b_(b) {}
  explicit DomValue(std::string &&str)
      : type_(Type::kString), str_(std::move(str)) {}
  explicit DomValue(const std::string &str) : type_(Type::kString), str_(str) {}
  explicit DomValue(const char *string_value)
      : type_(Type::kString), str_(std::string(string_value)) {}
  explicit DomValue(const char *string_value, size_t length)
      : type_(Type::kString), str_(std::string(string_value, length)) {}
  explicit DomValue(DomValueObjectType &&object_value)
      : type_(Type::kObject), obj_(std::move(object_value)) {}
  explicit DomValue(const DomValueObjectType &object_value)
      : type_(Type::kObject), obj_(object_value) {}
  explicit DomValue(DomValueArrayType &&array_value)
      : type_(Type::kArray), arr_(array_value) {}
  explicit DomValue(DomValueArrayType &array_value)
      : type_(Type::kArray), arr_(array_value) {}
  ~DomValue();

  DomValue &operator=(const DomValue &rhs) noexcept;
  DomValue &operator=(const int32_t rhs) noexcept;
  DomValue &operator=(const uint32_t rhs) noexcept;
  DomValue &operator=(const int64_t rhs) noexcept;
  DomValue &operator=(const uint64_t rhs) noexcept;
  DomValue &operator=(const double rhs) noexcept;
  DomValue &operator=(const bool rhs) noexcept;
  DomValue &operator=(const std::string &rhs) noexcept;
  DomValue &operator=(const char *rhs) noexcept;
  DomValue &operator=(const char16_t *rhs) noexcept;
  DomValue &operator=(const DomValueObjectType &rhs) noexcept;
  DomValue &operator=(const DomValueArrayType &rhs) noexcept;

  bool operator==(const DomValue &rhs) const noexcept;
  bool operator!=(const DomValue &rhs) const noexcept;
  bool operator<(const DomValue &rhs) const noexcept;
  bool operator<=(const DomValue &rhs) const noexcept;
  bool operator>(const DomValue &rhs) const noexcept;
  bool operator>=(const DomValue &rhs) const noexcept;

  inline Type GetType() noexcept { return type_; }
  inline Type GetType() const noexcept { return type_; }
  inline NumberType GetNumberType() noexcept { return number_type_; }
  inline NumberType GetNumberType() const noexcept { return number_type_; }

  bool IsUndefined() const noexcept;
  bool IsNull() const noexcept;
  bool IsBoolean() const noexcept;
  bool IsNumber() const noexcept;
  bool IsString() const noexcept;
  bool IsArray() const noexcept;
  bool IsObject() const noexcept;
  bool IsInt32() const noexcept;
  bool IsUInt32() const noexcept;
  bool IsInt64() const noexcept;
  bool IsUInt64() const noexcept;
  bool IsDouble() const noexcept;

  /* 调用所有ToXXX方法之前，请务必调用IsXXX方法确定值是否有效，
   * 否则直接调用ToXXX不清楚结果是异常值强转到对应类型还是实际值 */
  int32_t ToInt32() const;
  uint32_t ToUint32() const;
  int64_t ToInt64() const;
  uint64_t ToUint64() const;
  double ToDouble() const;
  bool ToBoolean() const;
  const std::string &ToString() const;
  const DomValueObjectType &ToObject() const;
  const DomValueArrayType &ToArray() const;

private:
  inline void deallocate();

  friend std::hash<DomValue>;

  Type type_ = Type::kUndefined;
  NumberType = Type::kNaN;
  union {
    bool b_{};
    DomValueObjectType obj_;
    DomValueArrayType arr_;
    std::string str_;
    Number num_;
  };
};

} // namespace base
} // namespace tdf

template <> struct std::hash<tdf::base::DomValue> {
  std::size_t operator()(const tdf::base::DomValue &value) const noexcept;

private:
  const static size_t UndefinedHashValue = 0x79476983;
  const static size_t NullHashValue = 0x7a695478;
};