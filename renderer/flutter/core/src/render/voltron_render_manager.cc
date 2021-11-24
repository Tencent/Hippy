#include "render/voltron_render_manager.h"
#include "bridge/bridge_manager.h"

namespace voltron {

VoltronRenderManager::VoltronRenderManager(int32_t root_id) : root_id_(root_id) {
}

VoltronRenderManager::~VoltronRenderManager() {

}

void voltron::VoltronRenderManager::CreateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) {
  for (const auto& node : nodes) {
    RunCreateDomNode(node);
  }
}

void VoltronRenderManager::UpdateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) {
  for (const auto& node : nodes) {
    RunUpdateDomNode(node);
  }
}

void VoltronRenderManager::DeleteRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) {
  for (const auto& node : nodes) {
    RunDeleteDomNode(node);
  }
}

void VoltronRenderManager::MoveRenderNode(std::vector<int32_t>&& ids, int32_t pid, int32_t id) {
  RunMoveDomNode(std::move(ids), pid, id);
}

void VoltronRenderManager::Batch() {
  RunBatch();
}

void VoltronRenderManager::DispatchFunction(int32_t id, const std::string& name,
                                            std::unordered_map<std::string, std::shared_ptr<DomValue>> param,
                                            DispatchFunctionCallback cb) {
  RunDispatchFunction(id, name, param, cb);
}

void VoltronRenderManager::AddTouchEventListener(int32_t id, TouchEvent event, OnTouchEventListener listener) {

}

void VoltronRenderManager::RemoveTouchEventListener(int32_t id, TouchEvent event) {}

}  // namespace voltron
