#include "dom/dom_value.h"

namespace tdf {
namespace base {

inline void DomValue::deallocate() {
  switch (type_) {
    case Type::String:
      str_.~basic_string();
      break;
    case Type::Array:
      arr_.~vector();
      break;
    case Type::Object:
      obj_.clear();
      break;
    default:
      break;
  }
}

DomValue::~DomValue() {
  deallocate();
}

}
}
