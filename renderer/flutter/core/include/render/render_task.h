#pragma once

#include "dom/dom_value.h"
#include "encodable_value.h"
#include "render/common.h"
#include "render/render_op.h"

namespace voltron {
class RenderTask {
 public:
  RenderTask(VoltronRenderOpType type, int32_t node_id);
  RenderTask(VoltronRenderOpType type, int32_t node_id, EncodableMap args);

  EncodableValue Encode();

 private:
  VoltronRenderOpType type_;
  int32_t node_id_;
  EncodableMap args_;
};
}  // namespace voltron
