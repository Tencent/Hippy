#include "dom/dom_value.h"
#include "base/logging.h"
#include "core/base/hash.h"

using DomValue = tdf::base::DomValue;

std::size_t std::hash<DomValue>::operator()(const DomValue& value) const noexcept {
  switch (value.type_) {
    case DomValue::Type::kUndefined:
      return UndefinedHashValue;
    case DomValue::Type::kNull:
      return NullHashValue;
    case DomValue::Type::kBoolean:
      return std::hash<bool>{}(value.b_);
    case DomValue::Type::kNumber: {
      switch (value.number_type_) {
        case DomValue::NumberType::kInt32:
          return std::hash<int32_t>{}(value.num_.i32_);
        case DomValue::NumberType::kUInt32:
          return std::hash<uint32_t>{}(value.num_.u32_);
        case DomValue::NumberType::kDouble:
          return std::hash<double>{}(value.num_.d_);
        case DomValue::NumberType::kNaN:
          return 0;
        default:
          break;
      }
      return 0;
    }
    case DomValue::Type::kString:
      return std::hash<std::string>{}(value.str_);
    case DomValue::Type::kArray:
      return std::hash<DomValue::DomValueArrayType>{}(value.arr_);
    case DomValue::Type::kObject:
      return std::hash<DomValue::DomValueObjectType>{}(value.obj_);
    default:
      break;
  }
  return 0;
}

namespace tdf {
namespace base {

const DomValue DomValue::Undefined() {
  DomValue Undefined;
  Undefined.type_ = Type::kUndefined;
  return Undefined;
}

const DomValue DomValue::Null() {
  DomValue Null;
  Null.type_ = Type::kNull;
  return Null;
}

DomValue::DomValue(const DomValue& source) : type_(source.type_), number_type_(source.number_type_) {
  switch (type_) {
    case DomValue::Type::kBoolean:
      b_ = source.b_;
      break;
    case DomValue::Type::kNumber: {
      switch (source.number_type_) {
        case DomValue::NumberType::kInt32:
          num_.i32_ = source.num_.i32_;
          break;
        case DomValue::NumberType::kUInt32:
          num_.u32_ = source.num_.u32_;
          break;
        case DomValue::NumberType::kDouble:
          num_.d_ = source.num_.d_;
          break;
        case DomValue::NumberType::kNaN:
          break;
        default:
          break;
      }
      break;
    }
    case DomValue::Type::kString:
      new (&str_) std::string(source.str_);
      break;
    case DomValue::Type::kObject:
      new (&obj_) DomValueObjectType(source.obj_);
      break;
    case DomValue::Type::kArray:
      new (&arr_) DomValueArrayType(source.arr_);
      break;
    default:
      break;
  }
}

DomValue::~DomValue() { Deallocate(); }

DomValue& DomValue::operator=(const DomValue& rhs) noexcept {
  if (this == &rhs) {
    return *this;
  }

  switch (rhs.type_) {
    case DomValue::Type::kNull:
    case DomValue::Type::kUndefined:
      Deallocate();
      break;
    case DomValue::Type::kNumber:
      Deallocate();
      switch (rhs.number_type_) {
        case DomValue::NumberType::kInt32:
          num_.i32_ = rhs.num_.i32_;
          break;
        case DomValue::NumberType::kUInt32:
          num_.u32_ = rhs.num_.u32_;
          break;
        case DomValue::NumberType::kDouble:
          num_.d_ = rhs.num_.d_;
          break;
        case DomValue::NumberType::kNaN:
          break;
        default:
          break;
      }
      break;
    case DomValue::Type::kBoolean:
      Deallocate();
      b_ = rhs.b_;
      break;
    case DomValue::Type::kString:
      if (type_ != DomValue::Type::kString) {
        Deallocate();
        new (&str_) std::string(rhs.str_);
      } else {
        str_ = rhs.str_;
      }
      break;
    case DomValue::Type::kObject:
      if (type_ != DomValue::Type::kObject) {
        Deallocate();
        new (&obj_) DomValueObjectType(rhs.obj_);
      } else {
        obj_ = rhs.obj_;
      }
      break;
    case DomValue::Type::kArray:
      if (type_ != DomValue::Type::kArray) {
        Deallocate();
        new (&arr_) DomValueArrayType(rhs.arr_);
      } else {
        arr_ = rhs.arr_;
      }
      break;
    default:
      break;
  }

  type_ = rhs.type_;
  number_type_ = rhs.number_type_;
  return *this;
}

DomValue& DomValue::operator=(const int32_t rhs) noexcept {
  Deallocate();
  type_ = DomValue::Type::kNumber;
  number_type_ = DomValue::NumberType::kInt32;
  num_.i32_ = rhs;
  return *this;
}

DomValue& DomValue::operator=(const uint32_t rhs) noexcept {
  Deallocate();
  type_ = DomValue::Type::kNumber;
  number_type_ = DomValue::NumberType::kUInt32;
  num_.u32_ = rhs;
  return *this;
}

DomValue& DomValue::operator=(const double rhs) noexcept {
  Deallocate();
  type_ = DomValue::Type::kNumber;
  number_type_ = DomValue::NumberType::kDouble;
  num_.d_ = rhs;
  return *this;
}

DomValue& DomValue::operator=(const bool rhs) noexcept {
  Deallocate();
  type_ = DomValue::Type::kBoolean;
  number_type_ = DomValue::NumberType::kNaN;
  b_ = rhs;
  return *this;
}

DomValue& DomValue::operator=(const std::string& rhs) noexcept {
  if (type_ != DomValue::Type::kString) {
    Deallocate();
    new (&str_) std::string(rhs);
  } else {
    str_ = rhs;
  }
  type_ = DomValue::Type::kString;
  number_type_ = DomValue::NumberType::kNaN;
  return *this;
}

DomValue& DomValue::operator=(const char* rhs) noexcept {
  if (type_ != DomValue::Type::kString) {
    Deallocate();
    new (&str_) std::string(rhs);
  } else {
    str_ = rhs;
  }

  type_ = DomValue::Type::kString;
  number_type_ = DomValue::NumberType::kNaN;
  return *this;
}

DomValue& DomValue::operator=(const DomValueObjectType& rhs) noexcept {
  if (type_ != DomValue::Type::kObject) {
    Deallocate();
    new (&obj_) DomValueObjectType(rhs);
  } else {
    obj_ = rhs;
  }

  type_ = DomValue::Type::kObject;
  number_type_ = DomValue::NumberType::kNaN;
  return *this;
}

DomValue& DomValue::operator=(const DomValueArrayType& rhs) noexcept {
  if (type_ != DomValue::Type::kArray) {
    Deallocate();
    new (&arr_) DomValueArrayType(rhs);
  } else {
    arr_ = rhs;
  }

  type_ = DomValue::Type::kArray;
  number_type_ = DomValue::NumberType::kNaN;
  return *this;
}

bool DomValue::operator==(const DomValue& rhs) const noexcept {
  if (type_ != rhs.type_) {
    return false;
  }

  switch (type_) {
    case DomValue::Type::kUndefined:
    case DomValue::Type::kNull:
      return true;
    case DomValue::Type::kBoolean:
      return b_ == rhs.b_;
    case DomValue::Type::kNumber: {
      switch (number_type_) {
        case DomValue::NumberType::kInt32:
          return num_.i32_ == rhs.num_.i32_;
        case DomValue::NumberType::kUInt32:
          return num_.u32_ == rhs.num_.u32_;
        case DomValue::NumberType::kDouble:
          return num_.d_ == rhs.num_.d_;
        default:
          break;
      }
      return false;
    }
    case DomValue::Type::kString:
      return str_ == rhs.str_;
    case DomValue::Type::kObject:
      return obj_ == rhs.obj_;
    case DomValue::Type::kArray:
      return arr_ == rhs.arr_;
    default:
      break;
  }

  return false;
}

bool DomValue::operator!=(const DomValue& rhs) const noexcept { return !operator==(rhs); }

bool DomValue::operator<(const DomValue& rhs) const noexcept {
  if (type_ == DomValue::Type::kNumber && rhs.type_ == DomValue::Type::kNumber) {
    return number_type_ < rhs.number_type_;
  }
  return type_ < rhs.type_;
}

bool DomValue::operator>(const DomValue& rhs) const noexcept {
  if (type_ == DomValue::Type::kNumber && rhs.type_ == DomValue::Type::kNumber) {
    return number_type_ > rhs.number_type_;
  }
  return type_ > rhs.type_;
}

bool DomValue::operator<=(const DomValue& rhs) const noexcept { return !operator>(rhs); }

bool DomValue::operator>=(const DomValue& rhs) const noexcept { return !operator<(rhs); }

std::ostream& operator<<(std::ostream& os, const DomValue& dom_value) {
  if (dom_value.type_ == DomValue::Type::kUndefined) {
    os << "undefined";
  } else if (dom_value.type_ == DomValue::Type::kNull) {
    os << "null";
  } else if (dom_value.type_ == DomValue::Type::kNumber) {
    if (dom_value.number_type_ == DomValue::NumberType::kNaN) {
      os << "nan";
    } else {
      os << dom_value.ToDoubleChecked();
    }
  } else if (dom_value.type_ == DomValue::Type::kBoolean) {
    os << dom_value.ToBooleanChecked();
  } else if (dom_value.type_ == DomValue::Type::kString) {
    os << dom_value.ToStringChecked();
  } else if (dom_value.type_ == DomValue::Type::kObject) {
    os << "{";
    auto map = dom_value.ToObjectChecked();
    size_t index = 0;
    for (const auto& kv : map) {
      os << kv.first << ": " << kv.second;
      if (index != map.size() - 1) os << ",";
      index++;
    }
    os << "}";
  } else if (dom_value.type_ == DomValue::Type::kArray) {
    os << "[ ";
    auto arr = dom_value.ToArrayChecked();
    for (size_t i = 0; i < arr.size(); i++) {
      os << arr[i];
      if (i != arr.size() - 1) os << ",";
    }
    os << " ]";
  }
  return os;
}

bool DomValue::IsUndefined() const noexcept { return type_ == Type::kUndefined; }

bool DomValue::IsNull() const noexcept { return type_ == Type::kNull; }

bool DomValue::IsBoolean() const noexcept { return type_ == Type::kBoolean; }

bool DomValue::IsNumber() const noexcept { return type_ == Type::kNumber; }

bool DomValue::IsString() const noexcept { return type_ == Type::kString; }

bool DomValue::IsArray() const noexcept { return type_ == Type::kArray; }

bool DomValue::IsObject() const noexcept { return type_ == Type::kObject; }

bool DomValue::IsInt32() const noexcept { return type_ == Type::kNumber && number_type_ == NumberType::kInt32; }

bool DomValue::IsUInt32() const noexcept { return type_ == Type::kNumber && number_type_ == NumberType::kUInt32; }

bool DomValue::IsDouble() const noexcept { return type_ == Type::kNumber && number_type_ == NumberType::kDouble; }

bool DomValue::ToInt32(int32_t& i32) const {
  bool is_int32 = IsInt32();
  if (is_int32) i32 = num_.i32_;
  return is_int32;
}

int32_t DomValue::ToInt32Checked() const {
  TDF_BASE_CHECK(IsInt32());
  return num_.i32_;
}

bool DomValue::ToUint32(uint32_t& u32) const {
  bool is_uint32 = IsUInt32();
  if (is_uint32) u32 = num_.u32_;
  return is_uint32;
}

uint32_t DomValue::ToUint32Checked() const {
  TDF_BASE_CHECK(IsUInt32());
  return num_.u32_;
}

bool DomValue::ToDouble(double& d) const {
  bool is_number = IsNumber();
  if (number_type_ == DomValue::NumberType::kDouble) d = num_.d_;
  if (number_type_ == DomValue::NumberType::kInt32) d = num_.i32_;
  if (number_type_ == DomValue::NumberType::kUInt32) d = num_.u32_;
  return is_number;
}

double DomValue::ToDoubleChecked() const {
  TDF_BASE_CHECK(IsNumber());
  if (number_type_ == DomValue::NumberType::kDouble) return num_.d_;
  if (number_type_ == DomValue::NumberType::kInt32) return num_.i32_;
  if (number_type_ == DomValue::NumberType::kUInt32) return num_.u32_;
  TDF_BASE_UNREACHABLE();
}

bool DomValue::ToBoolean(bool& b) const {
  bool is_bool = IsBoolean();
  b = b_;
  return is_bool;
}

bool DomValue::ToBooleanChecked() const {
  TDF_BASE_CHECK(IsBoolean());
  return b_;
}

bool DomValue::ToString(std::string& str) const {
  bool is_string = IsString();
  str = str_;
  return is_string;
}

const std::string& DomValue::ToStringChecked() const {
  TDF_BASE_CHECK(IsString());
  return str_;
}

std::string& DomValue::ToStringChecked() {
  TDF_BASE_CHECK(IsString());
  return str_;
}

bool DomValue::ToObject(DomValue::DomValueObjectType& obj) const {
  bool is_object = IsObject();
  obj = obj_;
  return is_object;
}

const DomValue::DomValueObjectType& DomValue::ToObjectChecked() const {
  TDF_BASE_CHECK(IsObject());
  return obj_;
}

DomValue::DomValueObjectType& DomValue::ToObjectChecked() {
  TDF_BASE_CHECK(IsObject());
  return obj_;
}

bool DomValue::ToArray(DomValue::DomValueArrayType& arr) const {
  bool is_array = IsArray();
  arr = arr_;
  return is_array;
}

const DomValue::DomValueArrayType& DomValue::ToArrayChecked() const {
  TDF_BASE_CHECK(IsArray());
  return arr_;
}

DomValue::DomValueArrayType& DomValue::ToArrayChecked() {
  TDF_BASE_CHECK(IsArray());
  return arr_;
}

inline void DomValue::Deallocate() {
  switch (type_) {
    case Type::kString:
      str_.~basic_string();
      break;
    case Type::kArray:
      arr_.~vector();
      break;
    case Type::kObject:
      obj_.~unordered_map();
      break;
    default:
      break;
  }
}

}  // namespace base
}  // namespace tdf
