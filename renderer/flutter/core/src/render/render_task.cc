//
// Created by longquan on 2021/11/15.
//

#include "render/render_task.h"
#include "standard_message_codec.h"

namespace voltron {

RenderTask::RenderTask(VoltronRenderOpType type, int32_t node_id) : type_(type), node_id_(node_id) {}

RenderTask::RenderTask(VoltronRenderOpType type, int32_t node_id, std::unique_ptr<EncodableValue> args)
    : type_(type), node_id_(node_id), args_(std::move(args)) {}

std::unique_ptr<EncodableValue> RenderTask::Encode() {
  auto encode_task = EncodableList();
  encode_task.emplace_back(type_);
  encode_task.emplace_back(node_id_);
  if (args_) {
    encode_task.push_back(*args_);
  }
  return std::make_unique<EncodableValue>(encode_task);
}

}  // namespace voltron
