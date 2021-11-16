

#include "render/render_queue.h"

namespace voltron {

void* VoltronRenderQueue::ConsumeRenderOp() { return nullptr; }

VoltronRenderQueue::~VoltronRenderQueue() { queue_.clear(); }
void VoltronRenderQueue::ProduceRenderOp(const Sp<RenderTask>& task) { queue_.push_back(task); }

}  // namespace voltron
