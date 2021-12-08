#include "dom/dom_argument.h"

#include "base/logging.h"
#include "dom/deserializer.h"

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
    auto bson = std::any_cast<std::vector<uint8_t>>(data_);
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
    auto bson = std::any_cast<std::vector<uint8_t>>(data_);
    return ConvertBsonToObject(bson, dom_value);
  }
  return false;
}

bool DomArgument::ConvertObjectToJson(const tdf::base::DomValue& dom_value, std::string& json) { return false; };

bool DomArgument::ConvertBsonToJson(const std::vector<uint8_t>& bson, std::string& json) { return false; };

bool DomArgument::ConvertJsonToBson(const std::string& json, std::vector<uint8_t>& bson) { return false; };

bool DomArgument::ConvertObjectToBson(const tdf::base::DomValue& dom_value, std::vector<uint8_t>& bson) {
  return false;
};

bool DomArgument::ConvertJsonToObject(const std::string& json, tdf::base::DomValue& dom_value) { return false; };

bool DomArgument::ConvertBsonToObject(const std::vector<uint8_t>& bson, tdf::base::DomValue& dom_value) {
  return false;
};

}  // namespace dom
}  // namespace hippy