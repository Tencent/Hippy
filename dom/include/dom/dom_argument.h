#include <any>
#include <vector>

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

  bool ToJson(std::string& json);
  bool ToBson(std::vector<uint8_t>& bson);
  bool ToObject(tdf::base::DomValue& dom_value);

 private:
  bool ConvertObjectToJson(const tdf::base::DomValue& dom_value, std::string& json);
  bool ConvertBsonToJson(const std::vector<uint8_t>& bson, std::string& json);

  bool ConvertJsonToBson(const std::string& json, std::vector<uint8_t>& bson);
  bool ConvertObjectToBson(const tdf::base::DomValue& dom_value, std::vector<uint8_t>& bson);

  bool ConvertJsonToObject(const std::string& json, tdf::base::DomValue& dom_value);
  bool ConvertBsonToObject(const std::vector<uint8_t>& bson, tdf::base::DomValue& dom_value);

  std::any data_;
  ArgumentType argument_type_;
};

}  // namespace dom
}  // namespace hippy