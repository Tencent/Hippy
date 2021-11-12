#include "render/voltron_render_manager.h"

namespace voltron {

void voltron::VoltronRenderManager::CreateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) {

}

void VoltronRenderManager::UpdateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) {}

void VoltronRenderManager::DeleteRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) {}

void VoltronRenderManager::MoveRenderNode(std::vector<int32_t>&& ids, int32_t pid, int32_t id) {}

void VoltronRenderManager::Batch() {}

void VoltronRenderManager::UpdateLayout(std::shared_ptr<LayoutResult> result) {}

void VoltronRenderManager::UpdateLayout(std::unordered_map<LayoutDiffMapKey, float> diff) {}

void VoltronRenderManager::DispatchFunction(int32_t id, const std::string& name,
                                            std::unordered_map<std::string, std::shared_ptr<DomValue>> param,
                                            DispatchFunctionCallback cb) {}

void VoltronRenderManager::AddTouchEventListener(int32_t id, TouchEvent event, OnTouchEventListener listener) {}

void VoltronRenderManager::RemoveTouchEventListener(int32_t id, TouchEvent event) {}

}  // namespace voltron
