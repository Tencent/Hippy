#include <memory>

#include "dom/dom_value.h"

namespace hippy {
inline namespace dom {

enum class ArgumentType {
  JSON,
  BISON,
  DOMVALUE,
};

class DomArgument {
 public:
  DomArgument(){};
  DomArgument(const DomValue& dom_value) : dom_value_(dom_value), argument_type_(ArgumentType::DOMVALUE){};

  ~DomArgument();

  DomArgument& operator=(const DomArgument& rhs) noexcept;

  std::pair<uint8_t*, size_t> ToJson();
  std::pair<uint8_t*, size_t> ToBison();
  DomValue& ToDomValue();

 private:
  shared_ptr<DomValue> dom_value_;
  ArgumentType argument_type_;
}

}  // namespace dom
}  // namespace hippy