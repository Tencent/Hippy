#include "dom/dom_argument.h"

#include "base/logging.h"

namespace hippy {
inline namespace dom {

DomArgument::DomArgument(const DomArgument& source) : data_(source.data_), argument_type_(source.argument_type_) {}

DomArgument::~DomArgument() {}

std::string DomArgument::ToJson() {
    TDF_BASE_NOTIMPLEMENTED();
    return std::any_cast<std::string>(data_);
}

std::pair<uint8_t*, size_t> DomArgument::ToBson() {
  TDF_BASE_NOTIMPLEMENTED();
  std::pair<uint8_t*, size_t> pair;
  return pair;
}

tdf::base::DomValue DomArgument::ToObject() {
  if (argument_type_ == ArgumentType::OBJECT) {
    return std::any_cast<tdf::base::DomValue>(data_);
  } else if (argument_type_ == ArgumentType::JSON) {
    TDF_BASE_NOTIMPLEMENTED();
  } else if (argument_type_ == ArgumentType::BSON) {
    TDF_BASE_NOTIMPLEMENTED();
  } else {
    TDF_BASE_NOTREACHED();
  }
  return tdf::base::DomValue();
}

}  // namespace dom
}  // namespace hippy