#include "core/base/hash.h"
#include "core/base/js_value_wrapper.h"

using JSValueWrapper = hippy::base::JSValueWrapper;

std::size_t std::hash<JSValueWrapper>::operator()(
    const JSValueWrapper& value) const noexcept {
  switch (value.type_) {
    case JSValueWrapper::Type::Undefined:
      return UndefinedHashValue;
    case JSValueWrapper::Type::Null:
      return NullHashValue;
    case JSValueWrapper::Type::Boolean:
      return std::hash<bool>{}(value.bool_value_);
    case JSValueWrapper::Type::Int32:
      return std::hash<int32_t>{}(value.int32_value_);
    case JSValueWrapper::Type::Uint32:
      return std::hash<uint32_t>{}(value.uint32_value_);
    case JSValueWrapper::Type::Double:
      return std::hash<double>{}(value.double_value_);
    case JSValueWrapper::Type::String:
      return std::hash<std::string>{}(value.string_value_);
    case JSValueWrapper::Type::Array:
      return std::hash<JSValueWrapper::JSArrayType>{}(value.array_value_);
    case JSValueWrapper::Type::Object:
      return std::hash<JSValueWrapper::JSObjectType>{}(value.object_value_);
    default:
      break;
  }

  return 0;
}

namespace hippy {
namespace base {

const JSValueWrapper JSValueWrapper::Undefined() {
  JSValueWrapper Undefined;
  Undefined.type_ = Type::Undefined;
  return Undefined;
}
const JSValueWrapper JSValueWrapper::Null() {
  JSValueWrapper Null;
  Null.type_ = Type::Null;
  return Null;
}

JSValueWrapper& JSValueWrapper::operator=(const JSValueWrapper& rhs) noexcept {
  if (this == &rhs) {
    return *this;
  }

  switch (rhs.type_) {
    case Type::Null:
    case Type::Undefined:
      deallocate();
      break;
    case Type::Int32:
      deallocate();
      int32_value_ = rhs.int32_value_;
      break;
    case Type::Uint32:
      deallocate();
      uint32_value_ = rhs.uint32_value_;
      break;
    case Type::Double:
      deallocate();
      double_value_ = rhs.double_value_;
      break;
    case Type::Boolean:
      deallocate();
      bool_value_ = rhs.bool_value_;
      break;
    case Type::Object:
      if (type_ != Type::Object) {
        deallocate();
        new (&object_value_) JSObjectType(rhs.object_value_);
      } else {
        object_value_ = rhs.object_value_;
      }
      break;
    case Type::Array:
      if (type_ != Type::Array) {
        deallocate();
        new (&array_value_) JSArrayType(rhs.array_value_);
      } else {
        array_value_ = rhs.array_value_;
      }
      break;
    case Type::String:
      if (type_ != Type::String) {
        deallocate();
        new (&string_value_) std::string(rhs.string_value_);
      } else {
        string_value_ = rhs.string_value_;
      }
      break;
    default:
      break;
  }
  type_ = rhs.type_;
  return *this;
}
JSValueWrapper& JSValueWrapper::operator=(const int32_t rhs) noexcept {
  deallocate();
  type_ = Type::Int32;
  int32_value_ = rhs;
  return *this;
}
JSValueWrapper& JSValueWrapper::operator=(const uint32_t rhs) noexcept {
  deallocate();
  type_ = Type::Uint32;
  uint32_value_ = rhs;
  return *this;
}
JSValueWrapper& JSValueWrapper::operator=(const double rhs) noexcept {
  deallocate();
  type_ = Type::Double;
  double_value_ = rhs;
  return *this;
}
JSValueWrapper& JSValueWrapper::operator=(const bool rhs) noexcept {
  deallocate();
  type_ = Type::Boolean;
  bool_value_ = rhs;
  return *this;
}
JSValueWrapper& JSValueWrapper::operator=(
    const std::string& rhs) noexcept {
  if (type_ != Type::String) {
    deallocate();
    new (&string_value_) std::string(rhs);
  } else {
    string_value_ = rhs;
  }
  type_ = Type::String;
  return *this;
}
JSValueWrapper& JSValueWrapper::operator=(const char* rhs) noexcept {
  if (type_ != Type::String) {
    deallocate();
    new (&string_value_) std::string(rhs);
  } else {
    string_value_ = rhs;
  }
  type_ = Type::String;
  return *this;
}

JSValueWrapper& JSValueWrapper::operator=(const JSObjectType& rhs) noexcept {
  if (type_ != Type::Object) {
    deallocate();
    new (&object_value_) JSObjectType(rhs);
  } else {
    object_value_ = rhs;
  }
  type_ = Type::Object;
  return *this;
}
JSValueWrapper& JSValueWrapper::operator=(const JSArrayType& rhs) noexcept {
  if (type_ != Type::Array) {
    deallocate();
    new (&array_value_) JSArrayType(rhs);
  } else {
    array_value_ = rhs;
  }
  type_ = Type::Array;
  return *this;
}

bool JSValueWrapper::operator==(const JSValueWrapper& rhs) const noexcept {
  if (type_ != rhs.type_) {
    return false;
  }

  switch (type_) {
    case JSValueWrapper::Type::Undefined:
    case JSValueWrapper::Type::Null:
      return true;
    case JSValueWrapper::Type::Boolean:
      return bool_value_ == rhs.bool_value_;
    case JSValueWrapper::Type::Int32:
      return int32_value_ == rhs.int32_value_;
    case JSValueWrapper::Type::Uint32:
      return uint32_value_ == rhs.uint32_value_;
    case JSValueWrapper::Type::Double:
      return double_value_ == rhs.double_value_;
    case JSValueWrapper::Type::String:
      return string_value_ == rhs.string_value_;
    case JSValueWrapper::Type::Object:
      return object_value_ == rhs.object_value_;
    case JSValueWrapper::Type::Array:
      return array_value_ == rhs.array_value_;
    default:
      break;
  }
  return false;
}
bool JSValueWrapper::operator!=(const JSValueWrapper& rhs) const noexcept {
  return !operator==(rhs);
}
bool JSValueWrapper::operator<(const JSValueWrapper& rhs) const noexcept {
  return type_ < rhs.type_;
}
bool JSValueWrapper::operator>(const JSValueWrapper& rhs) const noexcept {
  return type_ > rhs.type_;
}
bool JSValueWrapper::operator<=(const JSValueWrapper& rhs) const noexcept {
  return !operator>(rhs);
}
bool JSValueWrapper::operator>=(const JSValueWrapper& rhs) const noexcept {
  return !operator<(rhs);
}

JSValueWrapper::JSValueWrapper(const JSValueWrapper& source)
    : type_(source.type_) {
  switch (type_) {
    case Type::Int32:
      int32_value_ = source.int32_value_;
      break;
    case Type::Uint32:
      uint32_value_ = source.uint32_value_;
      break;
    case Type::Double:
      double_value_ = source.double_value_;
      break;
    case Type::Boolean:
      bool_value_ = source.bool_value_;
      break;
    case Type::String:
      new (&string_value_) std::string(source.string_value_);
      break;
    case Type::Object:
      new (&object_value_) JSObjectType(source.object_value_);
      break;
    case Type::Array:
      new (&array_value_) JSArrayType(source.array_value_);
      break;
    default:
      break;
  }
}

inline void JSValueWrapper::deallocate() {
  switch (type_) {
    case Type::String:
      string_value_.~basic_string();
      break;
    case Type::Array:
      array_value_.~vector();
      break;
    case Type::Object:
      object_value_.clear();
      break;
    default:
      break;
  }
}

JSValueWrapper::~JSValueWrapper() {
  deallocate();
}

bool JSValueWrapper::IsUndefined() const noexcept {
  return type_ == Type::Undefined;
}
bool JSValueWrapper::IsNull() const noexcept {
  return type_ == Type::Null;
}
bool JSValueWrapper::IsNullOrUndefined() const noexcept {
  return IsUndefined() || IsNull();
}
bool JSValueWrapper::IsBoolean() const noexcept {
  return type_ == Type::Boolean;
}
bool JSValueWrapper::IsInt32() const noexcept {
  return type_ == Type::Int32;
}
bool JSValueWrapper::IsUInt32() const noexcept {
  return type_ == Type::Uint32;
}
bool JSValueWrapper::IsDouble() const noexcept {
  return type_ == Type::Double;
}
bool JSValueWrapper::IsNumber() const noexcept {
  return IsInt32() || IsUInt32() || IsDouble();
}
bool JSValueWrapper::IsString() const noexcept {
  return type_ == Type::String;
}
bool JSValueWrapper::IsArray() const noexcept {
  return type_ == Type::Array;
}
bool JSValueWrapper::IsObject() const noexcept {
  return type_ == Type::Object;
}
int32_t JSValueWrapper::Int32Value() {
  return int32_value_;
}
int32_t JSValueWrapper::Int32Value() const {
  return int32_value_;
}
uint32_t JSValueWrapper::Uint32Value() {
  return uint32_value_;
}
uint32_t JSValueWrapper::Uint32Value() const {
  return uint32_value_;
}
double JSValueWrapper::DoubleValue() {
  return double_value_;
}
double JSValueWrapper::DoubleValue() const {
  return double_value_;
}
bool JSValueWrapper::BooleanValue() {
  return bool_value_;
}
bool JSValueWrapper::BooleanValue() const {
  return bool_value_;
}
std::string& JSValueWrapper::StringValue() {
  return string_value_;
}
const std::string& JSValueWrapper::StringValue() const {
  return string_value_;
}
JSValueWrapper::JSObjectType& JSValueWrapper::ObjectValue() {
  return object_value_;
}
const JSValueWrapper::JSObjectType& JSValueWrapper::ObjectValue() const {
  return object_value_;
}
JSValueWrapper::JSArrayType& JSValueWrapper::ArrayValue() {
  return array_value_;
}
const JSValueWrapper::JSArrayType& JSValueWrapper::ArrayValue() const {
  return array_value_;
}

}  // namespace base
}  // namespace hippy
