#pragma once

#include "ffi/common_header.h"

namespace voltron {

enum VoltronRenderOpType {
  ADD_NODE,
  DELETE_NODE,
  MOVE_NODE,
  UPDATE_NODE,
  UPDATE_LAYOUT,
  BATCH,
};

}  // namespace voltron
