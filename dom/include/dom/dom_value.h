#pragma once

#include <unordered_map>
#include <vector>
#include <string>

namespace tdf {
namespace base {

class DomValue {
 public:
  using DomValueObjectType = typename std::unordered_map<std::string, DomValue>;
  using DomValueArrayType = typename std::vector<DomValue>;
  enum class Type {
    Undefined,
    Null,
    Bool,
    Object,
    Array,
    String,
    Number
  };

  union Number {
    int32_t i32_;
    uint32_t u32_;
    int64_t i64_;
    uint64_t u64_;
    double d_;
    Number(int32_t i32): i32_(i32) {};
    Number(uint32_t u32): u32_(u32) {};
    Number(int64_t i64): i64_(i64) {};
    Number(uint64_t u64): u64_(u64) {};
    Number(float f): d_(f){};
    Number(double d): d_(d) {};
  };
  
  static const DomValue Undefined();
  static const DomValue Null();

  DomValue() {};
  DomValue(const DomValue& source);
  
  explicit DomValue(int32_t i32)  
      : type_(Type::Number), num_(i32) {}
  explicit DomValue(uint32_t u32)  
      : type_(Type::Number), num_(u32) {}
  explicit DomValue(int64_t i64)  
        : type_(Type::Number), num_(i64) {}
  explicit DomValue(uint64_t u64)  
      : type_(Type::Number), num_(u64) {}
  explicit DomValue(float f)  
      : type_(Type::Number), num_(f) {}
  explicit DomValue(double d)  
      : type_(Type::Number), num_(d) {}
  explicit DomValue(bool b)
      : type_(Type::Bool), b_(b) {}
  explicit DomValue(std::string&& str)
      : type_(Type::String), str_(std::move(str)) {}
  explicit DomValue(const std::string& str)
      : type_(Type::String), str_(str) {}
  explicit DomValue(const char* string_value)  
      : type_(Type::String), str_(std::string(string_value)) {}
  explicit DomValue(const char* string_value, size_t length)
      : type_(Type::String), str_(std::string(string_value, length)) {}
  explicit DomValue(DomValueObjectType&& object_value)
      : type_(Type::Object), obj_(std::move(object_value)) {}
  explicit DomValue(const DomValueObjectType& object_value)
      : type_(Type::Object), obj_(object_value) {}
  explicit DomValue(DomValueArrayType&& array_value)
      : type_(Type::Array), arr_(array_value) {}
  explicit DomValue(DomValueArrayType& array_value)
      : type_(Type::Array), arr_(array_value) {}
  ~DomValue();

  DomValue& operator=(const DomValue& rhs) noexcept;
  DomValue& operator=(const int32_t rhs) noexcept;
  DomValue& operator=(const uint32_t rhs) noexcept;
  DomValue& operator=(const double rhs) noexcept;
  DomValue& operator=(const bool rhs) noexcept;
  DomValue& operator=(const std::string& rhs) noexcept;
  DomValue& operator=(const char* rhs) noexcept;
  DomValue& operator=(const char16_t* rhs) noexcept;
  DomValue& operator=(const DomValueObjectType& rhs) noexcept;
  DomValue& operator=(const DomValueArrayType& rhs) noexcept;
  
  bool operator==(const DomValue& rhs) const noexcept;
  bool operator!=(const DomValue& rhs) const noexcept;
  bool operator<(const DomValue& rhs) const noexcept;
  bool operator<=(const DomValue& rhs) const noexcept;
  bool operator>(const DomValue& rhs) const noexcept;
  bool operator>=(const DomValue& rhs) const noexcept;
  
  inline Type type() noexcept { return type_; }
  inline Type type() const noexcept { return type_; }

  bool IsUndefined() const noexcept;
  bool IsNull() const noexcept;
  bool IsBoolean() const noexcept;
  bool IsNumber() const noexcept;
  bool IsString() const noexcept;
  bool IsArray() const noexcept;
  bool IsObject() const noexcept;

  /* 调用所有ToXXX方法之前，请务必调用IsXXX方法确定值是否有效，
   * 否则直接调用ToXXX不清楚结果是异常值强转到对应类型还是实际值 */
  int32_t ToInt32();
  int32_t ToInt32() const;
  uint32_t ToUint32();
  uint32_t ToUint32() const;
  int64_t ToInt64();
  int64_t ToInt64() const;
  uint64_t ToUint64();
  uint64_t ToUint64() const;
  double ToDouble();
  double ToDouble() const;
  bool ToBoolean();
  bool ToBoolean() const;
  std::string& ToString();
  const std::string& ToString() const;
  DomValueObjectType& ToObject();
  const DomValueObjectType& ToObject() const;
  DomValueArrayType& ToArray();
  const DomValueArrayType& ToArray() const;

 private:
  inline void deallocate();

  friend std::hash<DomValue>;
  
  Type type_ = Type::Undefined;
  union {
    bool b_{};
    DomValueObjectType obj_;
    DomValueArrayType arr_;
    std::string str_;
    Number num_;
  };
};

}
}

template <>
struct std::hash<tdf::base::DomValue> {
  std::size_t operator()(
      const tdf::base::DomValue& value) const noexcept;
};