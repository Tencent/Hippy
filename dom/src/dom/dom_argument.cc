#include "dom/dom_argument.h"

#include "base/logging.h"

DomArgument::DomArgument(const DomArgument& source) : argument_type_(source.argument_type_), data_(data) {}

DomArgument::~DomArgument() {}

std::string& DomArgument::ToJson() { TDF_BASE_NOTIMPLEMENTED(); }

std::pair<uint8_t*, size_t> DomArgument::ToBson() { TDF_BASE_NOTIMPLEMENTED(); }

DomValue& DomArgument::ToObject() {
  if (argument_type_ == ArgumentType::DomValue) {
    return std::any_cast<DomValue>(data_);
  } else if (argument_type_ == ArgumentType::JSON) {
    TDF_BASE_NOTIMPLEMENTED();
  } else if (argument_type_ == ArgumentType::BISON) {
    TDF_BASE_NOTIMPLEMENTED();
  } else {
    TDF_BASE_NOTREACHED();
  }
}