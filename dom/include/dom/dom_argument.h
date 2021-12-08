#include <any>
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

  ~DomArgument();

  DomArgument& operator=(const DomArgument& rhs) noexcept;

  bool ToBson(std::vector<uint8_t>& bson);
  bool ToObject(tdf::base::DomValue& dom_value);

 private:
  bool ConvertObjectToBson(const tdf::base::DomValue& dom_value, std::vector<uint8_t>& bson);

  bool ConvertBsonToObject(const std::vector<const uint8_t>& bson, tdf::base::DomValue& dom_value);

  std::any data_;
  ArgumentType argument_type_;
};

}  // namespace dom
}  // namespace hippy