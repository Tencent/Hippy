#include "render/render_queue.h"
#include "standard_message_codec.h"

namespace voltron {

std::unique_ptr<std::vector<uint8_t>> VoltronRenderQueue::ConsumeRenderOp() {
  auto op_list = EncodableList();
  if (!queue_.empty()) {
    for (const auto& task : queue_) {
      op_list.push_back(task->Encode());
    }
    queue_.clear();
  }

  if (op_list.empty()) {
    return nullptr;
  }
  return std::move(StandardMessageCodec::GetInstance().EncodeMessage(EncodableValue(op_list)));
}

VoltronRenderQueue::~VoltronRenderQueue() { queue_.clear(); }

void VoltronRenderQueue::ProduceRenderOp(const Sp<RenderTask>& task) {
  queue_.push_back(task);
}

}  // namespace voltron
