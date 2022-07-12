#include "dom/dom_argument.h"

#include <vector>

#include "footstone/deserializer.h"
#include "footstone/logging.h"
#include "footstone/serializer.h"

namespace hippy {
inline namespace dom {

DomArgument::DomArgument(const DomArgument& source) : data_(source.data_), argument_type_(source.argument_type_) {}

DomArgument::~DomArgument() = default;

bool DomArgument::ToBson(std::vector<uint8_t>& bson) const {
  if (argument_type_ == ArgumentType::OBJECT) {
    auto dom_value = std::any_cast<footstone::value::HippyValue>(&data_);
    return ConvertObjectToBson(*dom_value, bson);
  } else if (argument_type_ == ArgumentType::BSON) {
    auto vec = std::any_cast<std::vector<uint8_t>>(&data_);
    bson = *vec;
    return true;
  }
  return false;
}

bool DomArgument::ToObject(footstone::value::HippyValue& dom_value) const {
  if (argument_type_ == ArgumentType::OBJECT) {
    auto vec = std::any_cast<footstone::value::HippyValue>(&data_);
    dom_value = *vec;
    return true;
  } else if (argument_type_ == ArgumentType::BSON) {
    auto vec = std::any_cast<std::vector<uint8_t>>(&data_);
    std::vector<const uint8_t> bson(vec->begin(), vec->end());
    return ConvertBsonToObject(bson, dom_value);
  }
  return false;
}

bool DomArgument::ConvertObjectToBson(const footstone::value::HippyValue& dom_value, std::vector<uint8_t>& bson) {
  footstone::value::Serializer serializer;
  serializer.WriteHeader();
  serializer.WriteValue(dom_value);
  std::pair<uint8_t*, size_t> pair = serializer.Release();
  bson.resize(pair.second);
  memcpy(&bson[0], pair.first, sizeof(uint8_t) * pair.second);
  return true;
}

bool DomArgument::ConvertBsonToObject(const std::vector<const uint8_t>& bson, footstone::value::HippyValue& dom_value) {
  footstone::value::Deserializer deserializer(bson);
  deserializer.ReadHeader();
  bool ret = deserializer.ReadValue(dom_value);
  return ret;
}

}  // namespace dom
}  // namespace hippy
