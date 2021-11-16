#pragma once

#include "ffi/common_header.h"

namespace voltron {

enum VoltronRenderOpType {
  ADD_NODE,
  DELETE_NODE,
  MOVE_NODE,
  UPDATE_STYLE,
  UPDATE_PROP,
  UPDATE_LAYOUT,
  DISPATCH_UI_FUNCTION,
};

}  // namespace voltron
