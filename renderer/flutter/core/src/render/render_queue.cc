#include "render/render_queue.h"
#include "standard_message_codec.h"

namespace voltron {

std::unique_ptr<std::vector<uint8_t>> VoltronRenderQueue::ConsumeRenderOp() {
  if (!queue_.empty()) {
    auto op_list = EncodableList();
    for (const auto& task : queue_) {
      op_list.push_back(*(task->Encode()));
    }
    queue_.clear();
    return StandardMessageCodec::GetInstance().EncodeMessage(EncodableValue(op_list));
  }
  return nullptr;
}

VoltronRenderQueue::~VoltronRenderQueue() { queue_.clear(); }
void VoltronRenderQueue::ProduceRenderOp(const Sp<RenderTask>& task) { queue_.push_back(task); }

}  // namespace voltron
