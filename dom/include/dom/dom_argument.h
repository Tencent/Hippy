#pragma once

#include <any>
#include <utility>
#include <vector>

#include "dom/dom_value.h"

namespace hippy {
inline namespace dom {

enum class ArgumentType {
  BSON,
  OBJECT,
};

class DomArgument {
 public:
  DomArgument(){};
  DomArgument(const DomArgument& source);

  DomArgument(const tdf::base::DomValue& dom_value)
      : data_(std::make_any<tdf::base::DomValue>(dom_value)), argument_type_(ArgumentType::OBJECT){};
  DomArgument(const std::vector<uint8_t>& bson_value)
      : data_(std::make_any<std::vector<uint8_t>>(bson_value)), argument_type_(ArgumentType::BSON){};
  DomArgument(const std::pair<uint8_t*, size_t>& bson_value)
      : data_(std::make_any<std::vector<uint8_t>>(bson_value.first, bson_value.first + bson_value.second)),
        argument_type_(ArgumentType::BSON){};

  ~DomArgument();

  DomArgument& operator=(const DomArgument& rhs) noexcept;

  bool ToBson(std::vector<uint8_t>& bson) const;
  bool ToObject(tdf::base::DomValue& dom_value) const;

 private:
  bool ConvertObjectToBson(const tdf::base::DomValue& dom_value, std::vector<uint8_t>& bson) const;

  bool ConvertBsonToObject(const std::vector<const uint8_t>& bson, tdf::base::DomValue& dom_value) const;

  std::any data_;
  ArgumentType argument_type_;
};

}  // namespace dom
}  // namespace hippy