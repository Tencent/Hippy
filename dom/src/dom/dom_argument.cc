#include "dom/dom_argument.h"

#include "base/logging.h"

DomArgument::~DomArgument() {}

std::pair<uint8_t*, size_t> DomArgument::ToJson() { TDF_BASE_NOTIMPLEMENTED(); }

std::pair<uint8_t*, size_t> DomArgument::ToBison() { TDF_BASE_NOTIMPLEMENTED(); }

DomValue& DomArgument::ToDomValue() {
  if (argument_type_ == ArgumentType::DomValue) {
    return dom_value_;
  } else if (argument_type_ == ArgumentType::JSON) {
    TDF_BASE_NOTIMPLEMENTED();
  } else if (argument_type_ == ArgumentType::BISON) {
    TDF_BASE_NOTIMPLEMENTED();
  } else {
    TDF_BASE_NOTREACHED();
  }
}

