#include "dom/dom_argument.h"

#include <vector>

#include "base/logging.h"
#include "dom/deserializer.h"
#include "dom/serializer.h"

namespace hippy {
inline namespace dom {

DomArgument::DomArgument(const DomArgument& source) : data_(source.data_), argument_type_(source.argument_type_) {}

DomArgument::~DomArgument() {}

bool ToJson(std::string& json);
bool ToBson(std::vector<uint8_t>& bson);
bool ToObject(tdf::base::DomValue& dom_value);

bool DomArgument::ToJson(std::string& json) {
  if (argument_type_ == ArgumentType::OBJECT) {
    auto dom_value = std::any_cast<tdf::base::DomValue>(data_);
    return ConvertObjectToJson(dom_value, json);
  } else if (argument_type_ == ArgumentType::JSON) {
    json = std::any_cast<std::string>(data_);
    return true;
  } else if (argument_type_ == ArgumentType::BSON) {
    auto bson = std::any_cast<std::vector<const uint8_t>>(data_);
    return ConvertBsonToJson(bson, json);
  }
  return false;
}

bool DomArgument::ToBson(std::vector<uint8_t>& bson) {
  if (argument_type_ == ArgumentType::OBJECT) {
    auto json = std::any_cast<std::string>(data_);
    return ConvertJsonToBson(json, bson);
  } else if (argument_type_ == ArgumentType::JSON) {
    auto dom_value = std::any_cast<tdf::base::DomValue>(data_);
    return ConvertObjectToBson(dom_value, bson);
  } else if (argument_type_ == ArgumentType::BSON) {
    bson = std::any_cast<std::vector<uint8_t>>(data_);
    return true;
  }
  return false;
}

bool DomArgument::ToObject(tdf::base::DomValue& dom_value) {
  if (argument_type_ == ArgumentType::OBJECT) {
    dom_value = std::any_cast<tdf::base::DomValue>(data_);
    return true;
  } else if (argument_type_ == ArgumentType::JSON) {
    auto json = std::any_cast<std::string>(data_);
    return ConvertJsonToObject(json, dom_value);
  } else if (argument_type_ == ArgumentType::BSON) {
    auto bson = std::any_cast<std::vector<const uint8_t>>(data_);
    return ConvertBsonToObject(bson, dom_value);
  }
  return false;
}

bool DomArgument::ConvertObjectToJson(const tdf::base::DomValue& dom_value, std::string& json) { return false; };

bool DomArgument::ConvertBsonToJson(const std::vector<const uint8_t>& bson, std::string& json) { return false; };

bool DomArgument::ConvertJsonToBson(const std::string& json, std::vector<uint8_t>& bson) { return false; };

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
      } else if (type == tdf::base::DomValue::Type::kBoolean && dom_value.ToBoolean()) {
        oddball = tdf::base::Oddball::kTrue;
      } else if (type == tdf::base::DomValue::Type::kBoolean && !dom_value.ToBoolean()) {
        oddball = tdf::base::Oddball::kFalse;
      }
      serializer.WriteOddball(oddball);
      return true;
    }
    case tdf::base::DomValue::Type::kNumber: {
      tdf::base::DomValue::NumberType number_type = dom_value.GetNumberType();
      if (number_type == tdf::base::DomValue::NumberType::kInt32) {
        serializer.WriteInt32(dom_value.ToInt32());
      } else if (number_type == tdf::base::DomValue::NumberType::kUInt32) {
        serializer.WriteUint32(dom_value.ToUint32());
      } else if (number_type == tdf::base::DomValue::NumberType::kUInt64) {
        serializer.WriteUint64(dom_value.ToUint64());
      } else if (number_type == tdf::base::DomValue::NumberType::kDouble) {
        serializer.WriteDouble(dom_value.ToDouble());
      } else {
        ret = false;
      }
      return ret;
    }
    case tdf::base::DomValue::Type::kString: {
      serializer.WriteString(dom_value.ToString());
    }
    case tdf::base::DomValue::Type::kArray: {
      serializer.WriteDenseJSArray(dom_value.ToArray());
    }
    case tdf::base::DomValue::Type::kObject: {
      serializer.WriteJSMap(dom_value.ToObject());
    }
    default: {
      return false;
    }
  }

  std::pair<uint8_t*, size_t> pair = serializer.Release();
  bson.resize(pair.second);
  memcpy(&bson[0], pair.first, sizeof(uint8_t) * pair.second);
  return true;
};

bool DomArgument::ConvertJsonToObject(const std::string& json, tdf::base::DomValue& dom_value) { return false; };

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
    // case tdf::base::SerializationTag::kInt64: {
    // }
    case tdf::base::SerializationTag::kUint32: {
      uint32_t u32;
      ret = deserializer.ReadUInt32(u32);
      dom_value = tdf::base::DomValue(u32);
      return ret;
    }
    // case tdf::base::SerializationTag::kUint64: {
    //   uint64_t u64;
    //   ret = deserializer.ReadUInt64(u64);
    //   dom_value = tdf::base::DomValue(u64);
    //   return ret;
    // }
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
    case tdf::base::SerializationTag::kBeginJSMap: {
      ret = deserializer.ReadJSMap(dom_value);
      return ret;
    }
    default:
      ret = false;
  }

  return ret;
};

}  // namespace dom
}  // namespace hippy