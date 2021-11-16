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
  void* ConsumeRenderOp();

 private:
  mutable std::mutex queue_mutex_;
  List<Sp<RenderTask>> queue_;
};
}  // namespace voltron
