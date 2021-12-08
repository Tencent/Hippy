#include <any>

#include "dom/dom_value.h"

namespace hippy {
inline namespace dom {

enum class ArgumentType {
  JSON,
  BSON,
  OBJECT,
};

class DomArgument {
 public:
  DomArgument(){};
  DomArgument(const DomArgument& source);

  DomArgument(const tdf::base::DomValue& dom_value)
      : data_(std::make_any<tdf::base::DomValue>(dom_value)), argument_type_(ArgumentType::OBJECT){};
  DomArgument(const std::string& json_value)
      : data_(std::make_any<std::string>(json_value)), argument_type_(ArgumentType::JSON){};
  DomArgument(const std::vector<uint8_t>& bson_value)
      : data_(std::make_any<std::vector<uint8_t>>(bson_value)), argument_type_(ArgumentType::BSON){};

  ~DomArgument();

  DomArgument& operator=(const DomArgument& rhs) noexcept;

  std::string ToJson();
  std::pair<uint8_t*, size_t> ToBson();
  tdf::base::DomValue ToObject();

 private:
  std::any data_;
  ArgumentType argument_type_;
};

}  // namespace dom
}  // namespace hippy