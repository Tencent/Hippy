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
  serializer.WriteValue(dom_value);
  std::pair<uint8_t*, size_t> pair = serializer.Release();
  bson.resize(pair.second);
  memcpy(&bson[0], pair.first, sizeof(uint8_t) * pair.second);
  return true;
}

bool DomArgument::ConvertBsonToObject(const std::vector<const uint8_t>& bson, tdf::base::DomValue& dom_value) {
  tdf::base::Deserializer deserializer(bson);
  deserializer.ReadHeader();
  bool ret = deserializer.ReadValue(dom_value);
  return ret;
}

}  // namespace dom
}  // namespace hippy
