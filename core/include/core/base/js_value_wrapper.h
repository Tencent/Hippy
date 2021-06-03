#pragma once
#include <cstdlib>
#include <string>
#include <unordered_map>
#include <vector>

namespace hippy {
namespace base {

class JSValueWrapper final {
 public:
  using JSObjectType = typename std::unordered_map<std::string, JSValueWrapper>;
  using JSArrayType = typename std::vector<JSValueWrapper>;
  enum class Type {
    Undefined,
    Null,
    Boolean,
    Int32,
    Uint32,
    Double,
    String,
    Object,
    Array
  };

 public:
  static const JSValueWrapper Undefined();
  static const JSValueWrapper Null();

 public:
  JSValueWrapper() {}
  JSValueWrapper(const JSValueWrapper& source);

  JSValueWrapper(int32_t int32_value)
      : type_(Type::Int32), int32_value_(int32_value) {}
  JSValueWrapper(uint32_t uint32_value)
      : type_(Type::Uint32), uint32_value_(uint32_value) {}
  JSValueWrapper(double double_value)
      : type_(Type::Double), double_value_(double_value) {}
  JSValueWrapper(bool bool_value)
      : type_(Type::Boolean), bool_value_(bool_value) {}
  explicit JSValueWrapper(std::string&& string_value)
      : type_(Type::String), string_value_(std::move(string_value)) {}
  explicit JSValueWrapper(const std::string& string_value)
      : type_(Type::String), string_value_(string_value) {}
  JSValueWrapper(const char* string_value)
      : type_(Type::String),
        string_value_(std::string(string_value)) {}
  JSValueWrapper(const char* string_value, size_t length)
      : type_(Type::String),
        string_value_(std::string(string_value, length)) {}
  explicit JSValueWrapper(JSObjectType&& object_value)
      : type_(Type::Object), object_value_(std::move(object_value)) {}
  explicit JSValueWrapper(const JSObjectType& object_value)
      : type_(Type::Object), object_value_(object_value) {}
  explicit JSValueWrapper(JSArrayType&& array_value)
      : type_(Type::Array), array_value_(array_value) {}
  explicit JSValueWrapper(JSArrayType& array_value)
      : type_(Type::Array), array_value_(array_value) {}
  ~JSValueWrapper();

 public:
  JSValueWrapper& operator=(const JSValueWrapper& rhs) noexcept;
  JSValueWrapper& operator=(const int32_t rhs) noexcept;
  JSValueWrapper& operator=(const uint32_t rhs) noexcept;
  JSValueWrapper& operator=(const double rhs) noexcept;
  JSValueWrapper& operator=(const bool rhs) noexcept;
  JSValueWrapper& operator=(const std::string& rhs) noexcept;
  JSValueWrapper& operator=(const char* rhs) noexcept;
  JSValueWrapper& operator=(const char16_t* rhs) noexcept;
  JSValueWrapper& operator=(const JSObjectType& rhs) noexcept;
  JSValueWrapper& operator=(const JSArrayType& rhs) noexcept;

 public:
  bool operator==(const JSValueWrapper& rhs) const noexcept;
  bool operator!=(const JSValueWrapper& rhs) const noexcept;
  bool operator<(const JSValueWrapper& rhs) const noexcept;
  bool operator<=(const JSValueWrapper& rhs) const noexcept;
  bool operator>(const JSValueWrapper& rhs) const noexcept;
  bool operator>=(const JSValueWrapper& rhs) const noexcept;

 public:
  inline Type type() noexcept { return type_; }
  inline Type type() const noexcept { return type_; }

 public:
  bool IsUndefined() const noexcept;
  bool IsNull() const noexcept;
  bool IsNullOrUndefined() const noexcept;
  bool IsBoolean() const noexcept;
  bool IsInt32() const noexcept;
  bool IsUInt32() const noexcept;
  bool IsDouble() const noexcept;
  bool IsNumber() const noexcept;
  bool IsString() const noexcept;
  bool IsArray() const noexcept;
  bool IsObject() const noexcept;

 public:
  int32_t Int32Value();
  int32_t Int32Value() const;
  uint32_t Uint32Value();
  uint32_t Uint32Value() const;
  double DoubleValue();
  double DoubleValue() const;
  bool BooleanValue();
  bool BooleanValue() const;
  std::string& StringValue();
  const std::string& StringValue() const;
  JSObjectType& ObjectValue();
  const JSObjectType& ObjectValue() const;
  JSArrayType& ArrayValue();
  const JSArrayType& ArrayValue() const;

 private:
  inline void deallocate();

 private:
  Type type_ = Type::Undefined;
  union {
    uint32_t uint32_value_;
    int32_t int32_value_;
    double double_value_;
    bool bool_value_;
    std::string string_value_;
    JSObjectType object_value_;
    JSArrayType array_value_;
  };

  friend std::hash<JSValueWrapper>;
};

}  // namespace base
}  // namespace hippy

template <>
struct std::hash<hippy::base::JSValueWrapper> {
  std::size_t operator()(
      const hippy::base::JSValueWrapper& value) const noexcept;

 private:
  const static size_t UndefinedHashValue = 0x79476983;
  const static size_t NullHashValue = 0x7a695478;
};
