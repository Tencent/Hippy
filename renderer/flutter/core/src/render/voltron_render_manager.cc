#include "render/voltron_render_manager.h"

namespace voltron {

VoltronRenderManager::VoltronRenderManager(int32_t root_id, int32_t engine_id)
    : VoltronRenderTaskRunner(engine_id), root_id_(root_id) {}

VoltronRenderManager::~VoltronRenderManager() = default;

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

void VoltronRenderManager::Batch() { RunBatch(); }

void VoltronRenderManager::RemoveTouchEventListener(int32_t id, TouchEvent event) {}
void VoltronRenderManager::RemoveClickEventListener(int32_t id) {}
void VoltronRenderManager::CallFunction(std::weak_ptr<DomNode> domNode, const std::string& name,
                                        std::unordered_map<std::string, std::shared_ptr<DomValue>> param,
                                        DispatchFunctionCallback cb) {}
void VoltronRenderManager::SetClickEventListener(int32_t id, OnClickEventListener listener) {}
void VoltronRenderManager::SetLongClickEventListener(int32_t id, OnLongClickEventListener listener) {}
void VoltronRenderManager::RemoveLongClickEventListener(int32_t id) {}
void VoltronRenderManager::SetTouchEventListener(int32_t id, TouchEvent event, OnTouchEventListener listener) {}
void VoltronRenderManager::SetShowEventListener(int32_t id, ShowEvent event, OnShowEventListener listener) {}
void VoltronRenderManager::RemoveShowEventListener(int32_t id, ShowEvent event) {}

}  // namespace voltron
