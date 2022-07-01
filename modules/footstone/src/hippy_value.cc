#include "footstone/hippy_value.h"
#include "footstone/logging.h"
#include "footstone/hash.h"

using HippyValue = footstone::value::HippyValue;

std::size_t std::hash<HippyValue>::operator()(const HippyValue& value) const noexcept {
  switch (value.type_) {
    case HippyValue::Type::kUndefined:
      return UndefinedHashValue;
    case HippyValue::Type::kNull:
      return NullHashValue;
    case HippyValue::Type::kBoolean:
      return std::hash<bool>{}(value.b_);
    case HippyValue::Type::kNumber: {
      switch (value.number_type_) {
        case HippyValue::NumberType::kInt32:
          return std::hash<int32_t>{}(value.num_.i32_);
        case HippyValue::NumberType::kUInt32:
          return std::hash<uint32_t>{}(value.num_.u32_);
        case HippyValue::NumberType::kDouble:
          return std::hash<double>{}(value.num_.d_);
        case HippyValue::NumberType::kNaN:
          return 0;
        default:
          break;
      }
      return 0;
    }
    case HippyValue::Type::kString:
      return std::hash<std::string>{}(value.str_);
    case HippyValue::Type::kArray:
      return std::hash<HippyValue::DomValueArrayType>{}(value.arr_);
    case HippyValue::Type::kObject:
      return std::hash<HippyValue::HippyValueObjectType>{}(value.obj_);
    default:
      break;
  }
  return 0;
}

namespace footstone {
inline namespace value {

const HippyValue HippyValue::Undefined() {
  HippyValue Undefined;
  Undefined.type_ = Type::kUndefined;
  return Undefined;
}

const HippyValue HippyValue::Null() {
  HippyValue Null;
  Null.type_ = Type::kNull;
  return Null;
}

HippyValue::HippyValue(const HippyValue& source) : type_(source.type_), number_type_(source.number_type_) {
  switch (type_) {
    case HippyValue::Type::kBoolean:
      b_ = source.b_;
      break;
    case HippyValue::Type::kNumber: {
      switch (source.number_type_) {
        case HippyValue::NumberType::kInt32:
          num_.i32_ = source.num_.i32_;
          break;
        case HippyValue::NumberType::kUInt32:
          num_.u32_ = source.num_.u32_;
          break;
        case HippyValue::NumberType::kDouble:
          num_.d_ = source.num_.d_;
          break;
        case HippyValue::NumberType::kNaN:
        default:
          break;
      }
      break;
    }
    case HippyValue::Type::kString:
      new (&str_) std::string(source.str_);
      break;
    case HippyValue::Type::kObject:
      new (&obj_) HippyValueObjectType(source.obj_);
      break;
    case HippyValue::Type::kArray:
      new (&arr_) DomValueArrayType(source.arr_);
      break;
    default:
      break;
  }
}

HippyValue::~HippyValue() { Deallocate(); }

HippyValue& HippyValue::operator=(const HippyValue& rhs) noexcept {
  if (this == &rhs) {
    return *this;
  }

  switch (rhs.type_) {
    case HippyValue::Type::kNull:
    case HippyValue::Type::kUndefined:
      Deallocate();
      break;
    case HippyValue::Type::kNumber:
      Deallocate();
      switch (rhs.number_type_) {
        case HippyValue::NumberType::kInt32:
          num_.i32_ = rhs.num_.i32_;
          break;
        case HippyValue::NumberType::kUInt32:
          num_.u32_ = rhs.num_.u32_;
          break;
        case HippyValue::NumberType::kDouble:
          num_.d_ = rhs.num_.d_;
          break;
        case HippyValue::NumberType::kNaN:
          break;
        default:
          break;
      }
      break;
    case HippyValue::Type::kBoolean:
      Deallocate();
      b_ = rhs.b_;
      break;
    case HippyValue::Type::kString:
      if (type_ != HippyValue::Type::kString) {
        Deallocate();
        new (&str_) std::string(rhs.str_);
      } else {
        str_ = rhs.str_;
      }
      break;
    case HippyValue::Type::kObject:
      if (type_ != HippyValue::Type::kObject) {
        Deallocate();
        new (&obj_) HippyValueObjectType(rhs.obj_);
      } else {
        obj_ = rhs.obj_;
      }
      break;
    case HippyValue::Type::kArray:
      if (type_ != HippyValue::Type::kArray) {
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

HippyValue& HippyValue::operator=(const int32_t rhs) noexcept {
  Deallocate();
  type_ = HippyValue::Type::kNumber;
  number_type_ = HippyValue::NumberType::kInt32;
  num_.i32_ = rhs;
  return *this;
}

HippyValue& HippyValue::operator=(const uint32_t rhs) noexcept {
  Deallocate();
  type_ = HippyValue::Type::kNumber;
  number_type_ = HippyValue::NumberType::kUInt32;
  num_.u32_ = rhs;
  return *this;
}

HippyValue& HippyValue::operator=(const double rhs) noexcept {
  Deallocate();
  type_ = HippyValue::Type::kNumber;
  number_type_ = HippyValue::NumberType::kDouble;
  num_.d_ = rhs;
  return *this;
}

HippyValue& HippyValue::operator=(const bool rhs) noexcept {
  Deallocate();
  type_ = HippyValue::Type::kBoolean;
  number_type_ = HippyValue::NumberType::kNaN;
  b_ = rhs;
  return *this;
}

HippyValue& HippyValue::operator=(const std::string& rhs) noexcept {
  if (type_ != HippyValue::Type::kString) {
    Deallocate();
    new (&str_) std::string(rhs);
  } else {
    str_ = rhs;
  }
  type_ = HippyValue::Type::kString;
  number_type_ = HippyValue::NumberType::kNaN;
  return *this;
}

HippyValue& HippyValue::operator=(const char* rhs) noexcept {
  if (type_ != HippyValue::Type::kString) {
    Deallocate();
    new (&str_) std::string(rhs);
  } else {
    str_ = rhs;
  }

  type_ = HippyValue::Type::kString;
  number_type_ = HippyValue::NumberType::kNaN;
  return *this;
}

HippyValue& HippyValue::operator=(const HippyValueObjectType& rhs) noexcept {
  if (type_ != HippyValue::Type::kObject) {
    Deallocate();
    new (&obj_) HippyValueObjectType(rhs);
  } else {
    obj_ = rhs;
  }

  type_ = HippyValue::Type::kObject;
  number_type_ = HippyValue::NumberType::kNaN;
  return *this;
}

HippyValue& HippyValue::operator=(const DomValueArrayType& rhs) noexcept {
  if (type_ != HippyValue::Type::kArray) {
    Deallocate();
    new (&arr_) DomValueArrayType(rhs);
  } else {
    arr_ = rhs;
  }

  type_ = HippyValue::Type::kArray;
  number_type_ = HippyValue::NumberType::kNaN;
  return *this;
}

bool HippyValue::operator==(const HippyValue& rhs) const noexcept {
  if (type_ != rhs.type_) {
    return false;
  }

  switch (type_) {
    case HippyValue::Type::kUndefined:
    case HippyValue::Type::kNull:
      return true;
    case HippyValue::Type::kBoolean:
      return b_ == rhs.b_;
    case HippyValue::Type::kNumber: {
      switch (number_type_) {
        case HippyValue::NumberType::kInt32:
          return num_.i32_ == rhs.num_.i32_;
        case HippyValue::NumberType::kUInt32:
          return num_.u32_ == rhs.num_.u32_;
        case HippyValue::NumberType::kDouble:
          return num_.d_ == rhs.num_.d_;
        default:
          break;
      }
      return false;
    }
    case HippyValue::Type::kString:
      return str_ == rhs.str_;
    case HippyValue::Type::kObject:
      return obj_ == rhs.obj_;
    case HippyValue::Type::kArray:
      return arr_ == rhs.arr_;
    default:
      break;
  }

  return false;
}

bool HippyValue::operator!=(const HippyValue& rhs) const noexcept { return !operator==(rhs); }

bool HippyValue::operator<(const HippyValue& rhs) const noexcept {
  if (type_ == HippyValue::Type::kNumber && rhs.type_ == HippyValue::Type::kNumber) {
    return number_type_ < rhs.number_type_;
  }
  return type_ < rhs.type_;
}

bool HippyValue::operator>(const HippyValue& rhs) const noexcept {
  if (type_ == HippyValue::Type::kNumber && rhs.type_ == HippyValue::Type::kNumber) {
    return number_type_ > rhs.number_type_;
  }
  return type_ > rhs.type_;
}

bool HippyValue::operator<=(const HippyValue& rhs) const noexcept { return !operator>(rhs); }

bool HippyValue::operator>=(const HippyValue& rhs) const noexcept { return !operator<(rhs); }

std::ostream& operator<<(std::ostream& os, const HippyValue& dom_value) {
  if (dom_value.type_ == HippyValue::Type::kUndefined) {
    os << "undefined";
  } else if (dom_value.type_ == HippyValue::Type::kNull) {
    os << "null";
  } else if (dom_value.type_ == HippyValue::Type::kNumber) {
    if (dom_value.number_type_ == HippyValue::NumberType::kNaN) {
      os << "nan";
    } else {
      os << dom_value.ToDoubleChecked();
    }
  } else if (dom_value.type_ == HippyValue::Type::kBoolean) {
    os << dom_value.ToBooleanChecked();
  } else if (dom_value.type_ == HippyValue::Type::kString) {
    os << dom_value.ToStringChecked();
  } else if (dom_value.type_ == HippyValue::Type::kObject) {
    os << "{";
    auto map = dom_value.ToObjectChecked();
    size_t index = 0;
    for (const auto& kv : map) {
      os << kv.first << ": " << kv.second;
      if (index != map.size() - 1) os << ",";
      index++;
    }
    os << "}";
  } else if (dom_value.type_ == HippyValue::Type::kArray) {
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

bool HippyValue::IsUndefined() const noexcept { return type_ == Type::kUndefined; }

bool HippyValue::IsNull() const noexcept { return type_ == Type::kNull; }

bool HippyValue::IsBoolean() const noexcept { return type_ == Type::kBoolean; }

bool HippyValue::IsNumber() const noexcept { return type_ == Type::kNumber; }

bool HippyValue::IsString() const noexcept { return type_ == Type::kString; }

bool HippyValue::IsArray() const noexcept { return type_ == Type::kArray; }

bool HippyValue::IsObject() const noexcept { return type_ == Type::kObject; }

bool HippyValue::IsInt32() const noexcept { return type_ == Type::kNumber && number_type_ == NumberType::kInt32; }

bool HippyValue::IsUInt32() const noexcept { return type_ == Type::kNumber && number_type_ == NumberType::kUInt32; }

bool HippyValue::IsDouble() const noexcept { return type_ == Type::kNumber && number_type_ == NumberType::kDouble; }

bool HippyValue::ToInt32(int32_t& i32) const {
  bool is_int32 = IsInt32();
  if (is_int32) i32 = num_.i32_;
  return is_int32;
}

int32_t HippyValue::ToInt32Checked() const {
  FOOTSTONE_CHECK(IsInt32());
  return num_.i32_;
}

bool HippyValue::ToUint32(uint32_t& u32) const {
  bool is_uint32 = IsUInt32();
  if (is_uint32) u32 = num_.u32_;
  return is_uint32;
}

uint32_t HippyValue::ToUint32Checked() const {
  FOOTSTONE_CHECK(IsUInt32());
  return num_.u32_;
}

bool HippyValue::ToDouble(double& d) const {
  bool is_number = IsNumber();
  if (number_type_ == HippyValue::NumberType::kDouble) d = num_.d_;
  if (number_type_ == HippyValue::NumberType::kInt32) d = num_.i32_;
  if (number_type_ == HippyValue::NumberType::kUInt32) d = num_.u32_;
  return is_number;
}

double HippyValue::ToDoubleChecked() const {
  FOOTSTONE_CHECK(IsNumber());
  if (number_type_ == HippyValue::NumberType::kDouble) return num_.d_;
  if (number_type_ == HippyValue::NumberType::kInt32) return num_.i32_;
  if (number_type_ == HippyValue::NumberType::kUInt32) return num_.u32_;
  FOOTSTONE_UNREACHABLE();
}

bool HippyValue::ToBoolean(bool& b) const {
  bool is_bool = IsBoolean();
  b = b_;
  return is_bool;
}

bool HippyValue::ToBooleanChecked() const {
  FOOTSTONE_CHECK(IsBoolean());
  return b_;
}

bool HippyValue::ToString(std::string& str) const {
  bool is_string = IsString();
  str = str_;
  return is_string;
}

const std::string& HippyValue::ToStringChecked() const {
  FOOTSTONE_CHECK(IsString());
  return str_;
}

std::string& HippyValue::ToStringChecked() {
  FOOTSTONE_CHECK(IsString());
  return str_;
}

bool HippyValue::ToObject(HippyValue::HippyValueObjectType& obj) const {
  bool is_object = IsObject();
  obj = obj_;
  return is_object;
}

const HippyValue::HippyValueObjectType& HippyValue::ToObjectChecked() const {
  FOOTSTONE_CHECK(IsObject());
  return obj_;
}

HippyValue::HippyValueObjectType& HippyValue::ToObjectChecked() {
  FOOTSTONE_CHECK(IsObject());
  return obj_;
}

bool HippyValue::ToArray(HippyValue::DomValueArrayType& arr) const {
  bool is_array = IsArray();
  arr = arr_;
  return is_array;
}

const HippyValue::DomValueArrayType& HippyValue::ToArrayChecked() const {
  FOOTSTONE_CHECK(IsArray());
  return arr_;
}

HippyValue::DomValueArrayType& HippyValue::ToArrayChecked() {
  FOOTSTONE_CHECK(IsArray());
  return arr_;
}

inline void HippyValue::Deallocate() {
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
