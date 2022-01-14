//
// Created by longquan on 2021/11/15.
//

#include "render/render_task.h"

#include <utility>
#include "standard_message_codec.h"

namespace voltron {

RenderTask::RenderTask(VoltronRenderOpType type, int32_t node_id) : type_(type), node_id_(node_id) {}

RenderTask::RenderTask(VoltronRenderOpType type, int32_t node_id, EncodableMap args)
    : type_(type), node_id_(node_id), args_(std::move(args)) {}

EncodableValue RenderTask::Encode() {
  auto encode_task = EncodableList();
  encode_task.emplace_back(type_);
  encode_task.emplace_back(node_id_);
  if (!args_.empty()) {
    encode_task.emplace_back(std::move(args_));
  }
  return EncodableValue(std::move(encode_task));
}

}  // namespace voltron
