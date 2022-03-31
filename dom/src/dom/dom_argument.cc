#include "dom/dom_argument.h"

#include <vector>

#include "base/logging.h"
#include "dom/deserializer.h"
#include "dom/serializer.h"

namespace hippy {
inline namespace dom {

DomArgument::DomArgument(const DomArgument& source) : data_(source.data_), argument_type_(source.argument_type_) {}

DomArgument::~DomArgument() = default;

bool DomArgument::ToBson(std::vector<uint8_t>& bson) const {
  if (argument_type_ == ArgumentType::OBJECT) {
    auto dom_value = std::any_cast<tdf::base::DomValue>(data_);
    return ConvertObjectToBson(dom_value, bson);
  } else if (argument_type_ == ArgumentType::BSON) {
    bson = std::any_cast<std::vector<uint8_t>>(data_);
    return true;
  }
  return false;
}

bool DomArgument::ToObject(tdf::base::DomValue& dom_value) const {
  if (argument_type_ == ArgumentType::OBJECT) {
    dom_value = std::any_cast<tdf::base::DomValue>(data_);
    return true;
  } else if (argument_type_ == ArgumentType::BSON) {
    auto bson = std::any_cast<std::vector<uint8_t>>(data_);
    std::vector<const uint8_t> bson_copy(bson.begin(), bson.end());
    return ConvertBsonToObject(bson_copy, dom_value);
  }
  return false;
}

bool DomArgument::ConvertObjectToBson(const tdf::base::DomValue& dom_value, std::vector<uint8_t>& bson) {
  tdf::base::Serializer serializer;
  serializer.WriteHeader();

  bool ret = true;
  tdf::base::DomValue::Type type = dom_value.GetType();
  switch (type) {
    case tdf::base::DomValue::Type::kUndefined:
    case tdf::base::DomValue::Type::kNull:
    case tdf::base::DomValue::Type::kBoolean: {
      tdf::base::Oddball oddball = tdf::base::Oddball::kUndefined;
      if (type == tdf::base::DomValue::Type::kNull) {
        oddball = tdf::base::Oddball::kNull;
      } else if (type == tdf::base::DomValue::Type::kBoolean && dom_value.ToBooleanChecked()) {
        oddball = tdf::base::Oddball::kTrue;
      } else if (type == tdf::base::DomValue::Type::kBoolean && !dom_value.ToBooleanChecked()) {
        oddball = tdf::base::Oddball::kFalse;
      }
      serializer.WriteOddball(oddball);
      return true;
    }
    case tdf::base::DomValue::Type::kNumber: {
      tdf::base::DomValue::NumberType number_type = dom_value.GetNumberType();
      if (number_type == tdf::base::DomValue::NumberType::kInt32) {
        serializer.WriteInt32(dom_value.ToInt32Checked());
      } else if (number_type == tdf::base::DomValue::NumberType::kUInt32) {
        serializer.WriteUint32(dom_value.ToUint32Checked());
      } else if (number_type == tdf::base::DomValue::NumberType::kDouble) {
        serializer.WriteDouble(dom_value.ToDoubleChecked());
      } else {
        ret = false;
      }
      return ret;
    }
    case tdf::base::DomValue::Type::kString: {
      serializer.WriteString(dom_value.ToStringChecked());
      break;
    }
    case tdf::base::DomValue::Type::kArray: {
      serializer.WriteDenseJSArray(dom_value.ToArrayChecked());
      break;
    }
    case tdf::base::DomValue::Type::kObject: {
      serializer.WriteJSObject(dom_value.ToObjectChecked());
      break;
    }
    default: {
      return false;
    }
  }

  std::pair<uint8_t*, size_t> pair = serializer.Release();
  bson.resize(pair.second);
  memcpy(&bson[0], pair.first, sizeof(uint8_t) * pair.second);
  return true;
}

bool DomArgument::ConvertBsonToObject(const std::vector<const uint8_t>& bson, tdf::base::DomValue& dom_value) {
  tdf::base::Deserializer deserializer(bson);
  deserializer.ReadHeader();

  bool ret = true;
  tdf::base::SerializationTag tag;
  ret = deserializer.ReadTag(tag);
  if (!ret) return ret;

  switch (tag) {
    case tdf::base::SerializationTag::kUndefined: {
      dom_value = tdf::base::DomValue::Undefined();
      return ret;
    }
    case tdf::base::SerializationTag::kNull: {
      dom_value = tdf::base::DomValue::Null();
      return ret;
    }
    case tdf::base::SerializationTag::kTrue: {
      dom_value = tdf::base::DomValue(true);
      return ret;
    }
    case tdf::base::SerializationTag::kFalse: {
      dom_value = tdf::base::DomValue(false);
      return ret;
    }
    case tdf::base::SerializationTag::kInt32: {
      int32_t i32;
      ret = deserializer.ReadInt32(i32);
      dom_value = tdf::base::DomValue(i32);
      return ret;
    }
    case tdf::base::SerializationTag::kUint32: {
      uint32_t u32;
      ret = deserializer.ReadUInt32(u32);
      dom_value = tdf::base::DomValue(u32);
      return ret;
    }
    case tdf::base::SerializationTag::kDouble: {
      double d;
      ret = deserializer.ReadDouble(d);
      dom_value = tdf::base::DomValue(d);
      return ret;
    }
    case tdf::base::SerializationTag::kUtf8String: {
      std::string str;
      ret = deserializer.ReadUtf8String(str);
      dom_value = tdf::base::DomValue(str);
      return ret;
    }
    case tdf::base::SerializationTag::kOneByteString: {
      std::string str;
      ret = deserializer.ReadOneByteString(str);
      dom_value = tdf::base::DomValue(str);
      return ret;
    }
    case tdf::base::SerializationTag::kTwoByteString: {
      std::string str;
      ret = deserializer.ReadTwoByteString(str);
      dom_value = tdf::base::DomValue(str);
      return ret;
    }
    case tdf::base::SerializationTag::kBeginDenseJSArray: {
      ret = deserializer.ReadDenseJSArray(dom_value);
      return ret;
    }
    case tdf::base::SerializationTag::kBeginJSObject: {
      ret = deserializer.ReadJSObject(dom_value);
      return ret;
    }
    default:
      ret = false;
  }

  return ret;
}

}  // namespace dom
}  // namespace hippy
