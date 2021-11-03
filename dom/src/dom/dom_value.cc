#include "dom/dom_value.h"
#include "core/base/hash.h"

using DomValue = tdf::base::DomValue;

std::size_t std::hash<DomValue>::operator()(const DomValue &value) const noexcept {
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
        case DomValue::NumberType::kInt64:
          return std::hash<int64_t>{}(value.num_.i64_);
        case DomValue::NumberType::kUInt64:
          return std::hash<uint64_t>{}(value.num_.u64_);
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
};

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

DomValue::DomValue(const DomValue &source)
    : type_(source.type_), number_type_(source.number_type_) {
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
        case DomValue::NumberType::kInt64:
          num_.i64_ = source.num_.i64_;
          break;
        case DomValue::NumberType::kUInt64:
          num_.u64_ = source.num_.u64_;
          break;
        case DomValue::NumberType::kDouble:
          num_.d_ = source.num_.d_;
          break;
        case DomValue::NumberType::kNaN:
          break;
        default:
          break;
      }
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

DomValue::~DomValue() { deallocate(); }

DomValue &DomValue::operator=(const DomValue &rhs) noexcept {
  if (this == &rhs) {
    return *this;
  }

  switch (rhs.type_) {
    case DomValue::Type::kNull:
    case DomValue::Type::kUndefined:
      deallocate();
      break;
    case DomValue::Type::kNumber:
      deallocate();
      switch (rhs.number_type_) {
        case DomValue::NumberType::kInt32:
          num_.i32_ = rhs.num_.i32_;
          break;
        case DomValue::NumberType::kUInt32:
          num_.u32_ = rhs.num_.u32_;
          break;
        case DomValue::NumberType::kInt64:
          num_.i64_ = rhs.num_.i64_;
          break;
        case DomValue::NumberType::kUInt64:
          num_.u64_ = rhs.num_.u64_;
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
      deallocate();
      b_ = rhs.b_;
      break;
    case DomValue::Type::kString:
      if (type_ != DomValue::Type::kString) {
        deallocate();
        new (&str_) std::string(rhs.str_);
      } else {
        str_ = rhs.str_;
      }
      break;
    case DomValue::Type::kObject:
      if (type_ != DomValue::Type::kObject) {
        deallocate();
        new (&obj_) DomValueObjectType(rhs.obj_);
      } else {
        obj_ = rhs.obj_;
      }
      break;
    case DomValue::Type::kArray:
      if (type_ != DomValue::Type::kArray) {
        deallocate();
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

DomValue &DomValue::operator=(const int32_t rhs) noexcept {
  deallocate();
  type_ = DomValue::Type::kNumber;
  number_type_ = DomValue::NumberType::kInt32;
  num_.i32_ = rhs;
  return *this;
}

DomValue &DomValue::operator=(const uint32_t rhs) noexcept {
  deallocate();
  type_ = DomValue::Type::kNumber;
  number_type_ = DomValue::NumberType::kUInt32;
  num_.u32_ = rhs;
  return *this;
}

DomValue &DomValue::operator=(const int64_t rhs) noexcept {
  deallocate();
  type_ = DomValue::Type::kNumber;
  number_type_ = DomValue::NumberType::kInt64;
  num_.i64_ = rhs;
  return *this;
}

DomValue &DomValue::operator=(const uint64_t rhs) noexcept {
  deallocate();
  type_ = DomValue::Type::kNumber;
  number_type_ = DomValue::NumberType::kUInt64;
  num_.u64_ = rhs;
  return *this;
}

DomValue &DomValue::operator=(const double rhs) noexcept {
  deallocate();
  type_ = DomValue::Type::kNumber;
  number_type_ = DomValue::NumberType::kDouble;
  num_.d_ = rhs;
  return *this;
}

DomValue &DomValue::operator=(const bool rhs) noexcept {
  deallocate();
  type_ = DomValue::Type::kBoolean;
  number_type_ = DomValue::NumberType::kNaN;
  b_ = rhs;
  return *this;
}

DomValue &DomValue::operator=(const std::string &rhs) noexcept {
  if (type_ != DomValue::Type::kString) {
    deallocate();
    new (&str_) std::string(rhs);
  } else {
    str_ = rhs;
  }
  type_ = DomValue::Type::kString;
  number_type_ = DomValue::NumberType::kNaN;
  return *this;
}

DomValue &DomValue::operator=(const char *rhs) noexcept {
  if (type_ != DomValue::Type::kString) {
    deallocate();
    new (&str_) std::string(rhs);
  } else {
    str_ = rhs;
  }

  type_ = DomValue::Type::kString;
  number_type_ = DomValue::NumberType::kNaN;
  return *this;
}

DomValue &DomValue::operator=(const DomValueObjectType &rhs) noexcept {
  if (type_ != DomValue::Type::kObject) {
    deallocate();
    new (&obj_) DomValueObjectType(rhs);
  } else {
    obj_ = rhs;
  }

  type_ = DomValue::Type::kObject;
  number_type_ = DomValue::NumberType::kNaN;
  return *this;
}

DomValue &DomValue::operator=(const DomValueArrayType &rhs) noexcept {
  if (type_ != DomValue::Type::kArray) {
    deallocate();
    new (&arr_) DomValueArrayType(rhs);
  } else {
    arr_ = rhs;
  }

  type_ = DomValue::Type::kArray;
  number_type_ = DomValue::NumberType::kNaN;
  return *this;
}

bool DomValue::operator==(const DomValue &rhs) const noexcept {
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
        case DomValue::NumberType::kInt64:
          return num_.i64_ == rhs.num_.i64_;
        case DomValue::NumberType::kUInt64:
          return num_.u64_ == rhs.num_.u64_;
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

bool DomValue::operator!=(const DomValue &rhs) const noexcept { return !operator==(rhs); }

bool DomValue::operator<(const DomValue &rhs) const noexcept {
  if (type_ == DomValue::Type::kNumber && rhs.type_ == DomValue::Type::kNumber) {
    return number_type_ < rhs.number_type_;
  }
  return type_ < rhs.type_;
}

bool DomValue::operator>(const DomValue &rhs) const noexcept {
  if (type_ == DomValue::Type::kNumber && rhs.type_ == DomValue::Type::kNumber) {
    return number_type_ > rhs.number_type_;
  }
  return type_ > rhs.type_;
}

bool DomValue::operator<=(const DomValue &rhs) const noexcept { return !operator>(rhs); }

bool DomValue::operator>=(const DomValue &rhs) const noexcept { return !operator<(rhs); }

bool DomValue::IsUndefined() const noexcept { return type_ == Type::kUndefined; }

bool DomValue::IsNull() const noexcept { return type_ == Type::kNull; }

bool DomValue::IsBoolean() const noexcept { return type_ == Type::kBoolean; }

bool DomValue::IsNumber() const noexcept { return type_ == Type::kNumber; }

bool DomValue::IsString() const noexcept { return type_ == Type::kString; }

bool DomValue::IsArray() const noexcept { return type_ == Type::kArray; }

bool DomValue::IsObject() const noexcept { return type_ == Type::kObject; }

bool DomValue::IsInt32() const noexcept {
  return type_ == Type::kNumber && number_type_ == NumberType::kInt32;
}

bool DomValue::IsUInt32() const noexcept {
  return type_ == Type::kNumber && number_type_ == NumberType::kUInt32;
}

bool DomValue::IsInt64() const noexcept {
  return type_ == Type::kNumber && number_type_ == NumberType::kInt64;
}

bool DomValue::IsUInt64() const noexcept {
  return type_ == Type::kNumber && number_type_ == NumberType::kUInt64;
}

bool DomValue::IsDouble() const noexcept {
  return type_ == Type::kNumber && number_type_ == NumberType::kDouble;
}

int32_t DomValue::ToInt32() const {
  assert(IsInt32());
  return num_.i32_;
}

uint32_t DomValue::ToUint32() const {
  assert(IsUInt32());
  return num_.u32_;
}

int64_t DomValue::ToInt64() const {
  assert(IsInt64());
  return num_.i64_;
}

uint64_t DomValue::ToUint64() const {
  assert(IsUInt64());
  return num_.u64_;
}

double DomValue::ToDouble() const {
  assert(IsNumber());
  if (number_type_ == DomValue::NumberType::kDouble) return num_.d_;
  if (number_type_ == DomValue::NumberType::kInt32) return num_.i32_;
  if (number_type_ == DomValue::NumberType::kUInt32) return num_.u32_;
  if (number_type_ == DomValue::NumberType::kInt64) return static_cast<double>(num_.i64_);
  if (number_type_ == DomValue::NumberType::kUInt64) return static_cast<double>(num_.u64_);
  assert(false);
}

bool DomValue::ToBoolean() const {
  assert(IsBoolean());
  return b_;
}

const std::string &DomValue::ToString() const {
  assert(IsString());
  return str_;
}

std::string &DomValue::ToString() {
  assert(IsString());
  return str_;
}

const DomValue::DomValueObjectType &DomValue::ToObject() const {
  assert(IsObject());
  return obj_;
}

DomValue::DomValueObjectType &DomValue::ToObject() {
  assert(IsObject());
  return obj_;
}

const DomValue::DomValueArrayType &DomValue::ToArray() const {
  assert(IsArray());
  return arr_;
}

DomValue::DomValueArrayType &DomValue::ToArray() {
  assert(IsArray());
  return arr_;
}

inline void DomValue::deallocate() {
  switch (type_) {
    case Type::kString:
      str_.~basic_string();
      break;
    case Type::kArray:
      arr_.~vector();
      break;
    case Type::kObject:
      obj_.clear();
      break;
    default:
      break;
  }
}

}  // namespace base
}  // namespace tdf
