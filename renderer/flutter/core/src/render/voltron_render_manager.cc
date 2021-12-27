#include <variant>

#include "ffi/bridge_define.h"
#include "render/voltron_render_manager.h"

namespace voltron {

using hippy::TouchEventInfo;

VoltronRenderManager::VoltronRenderManager(int32_t root_id, int32_t engine_id)
    : VoltronRenderTaskRunner(engine_id, root_id), root_id_(root_id) {}

VoltronRenderManager::~VoltronRenderManager() = default;

void voltron::VoltronRenderManager::CreateRenderNode(std::vector<std::shared_ptr<DomNode>> &&nodes) {
  for (const auto &node : nodes) {
    RunCreateDomNode(node);
  }
}

void VoltronRenderManager::UpdateRenderNode(std::vector<std::shared_ptr<DomNode>> &&nodes) {
  for (const auto &node : nodes) {
    RunUpdateDomNode(node);
  }
}

void VoltronRenderManager::DeleteRenderNode(std::vector<std::shared_ptr<DomNode>> &&nodes) {
  for (const auto &node : nodes) {
    RunDeleteDomNode(node);
  }
}

void VoltronRenderManager::MoveRenderNode(std::vector<int32_t> &&ids, int32_t pid, int32_t id) {
  RunMoveDomNode(std::move(ids), pid, id);
}

void VoltronRenderManager::UpdateLayout(const std::vector<std::shared_ptr<DomNode>> &nodes) {
  RunUpdateLayout(nodes);
}

void VoltronRenderManager::Batch() { RunBatch(); }

void VoltronRenderManager::OnLayoutBefore() {
  RunLayoutBefore();

  // 在dom的css layout开始前，要保证dom op全部执行完成，否则自定义测量的节点测量数据会不准确
  std::unique_lock<std::mutex> lock(mutex_);
  while (!notified_) {
    cv_.wait(lock);
  }
}

void VoltronRenderManager::OnLayoutFinish() { RunLayoutFinish(); }

void VoltronRenderManager::CallFunction(std::weak_ptr<DomNode> dom_node,
                                        const std::string &name,
                                        const DomValue &param,
                                        CallFunctionCallback cb) {
  RunCallFunction(dom_node, name, param, cb);
}

void VoltronRenderManager::CallEvent(std::weak_ptr<DomNode> dom_node,
                                     const std::string &name,
                                     const std::unique_ptr<EncodableValue> &params) {
  RunCallEvent(dom_node, name, params);
}

void VoltronRenderManager::AddEventListener(std::weak_ptr<DomNode> dom_node,
                                            const std::string &name) {
  auto dom_node_p = dom_node.lock();
  if (dom_node_p) {
    RunAddEventListener(dom_node_p->GetId(), name);
  }
}

void VoltronRenderManager::RemoveEventListener(std::weak_ptr<DomNode> dom_node,
                                               const std::string &name) {
  auto dom_node_p = dom_node.lock();
  if (dom_node_p) {
    RunRemoveEventListener(dom_node_p->GetId(), name);
  }
}

void VoltronRenderManager::Notify() {
  if (!notified_) {
    notified_ = true;
    cv_.notify_one();
  }
}

}  // namespace voltron
