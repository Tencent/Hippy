#pragma once

#include <mutex>

#include "render/common.h"
#include "render/render_task.h"

namespace voltron {
class VoltronRenderQueue {
 public:
  VoltronRenderQueue() = default;
  ~VoltronRenderQueue();
  void ProduceRenderOp(const Sp<RenderTask>& task);
  std::unique_ptr<std::vector<uint8_t>> ConsumeRenderOp();

 private:
  mutable std::mutex queue_mutex_;
  List<Sp<RenderTask>> queue_;
};
}  // namespace voltron
