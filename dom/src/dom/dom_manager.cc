#include "dom/dom_manager.h"

namespace hippy {
inline namespace dom {

DomManager::DomManager(int32_t root_id) : root_id_(root_id) {}

DomManager::~DomManager() = default;

void DomManager::CreateDomNodes(std::vector<std::shared_ptr<DomNode>> nodes) {
  for (auto it = nodes.begin(); it != nodes.end(); it++) {
    std::shared_ptr<DomNode> node = *it;
    std::shared_ptr<DomNode> parent_node = dom_node_registry_.GetNode(node->GetPid());
    if (parent_node == nullptr) {
      it = nodes.erase(it);
      continue;
    }
    node->SetRenderInfo({node->GetPid(), node->GetIndex(), true});
    // 解析布局属性
    node->ParseLayoutStyleInfo();
    parent_node->AddChildAt(node, node->GetIndex());
    OnDomNodeCreated(node);
  }

  if (!nodes.empty()) {
    batch_operations_.emplace_back([this, moved_nodes = std::move(nodes)]() mutable {
      render_manager_->CreateRenderNode(std::move(moved_nodes));
    });
  }
}

void DomManager::UpdateDomNodes(std::vector<std::shared_ptr<DomNode>> nodes) {
  for (auto it = nodes.begin(); it != nodes.end(); it++) {
    std::shared_ptr<DomNode> node = dom_node_registry_.GetNode((*it)->GetId());
    if (node == nullptr) {
      it = nodes.erase(it);
      continue;
    }
    // TODO: 执行DomNode更新相关的事务
    OnDomNodeUpdated(node);
  }

  if (!nodes.empty()) {
    batch_operations_.emplace_back([this, moved_nodes = std::move(nodes)]() mutable {
      render_manager_->UpdateRenderNode(std::move(moved_nodes));
    });
  }
}

void DomManager::DeleteDomNodes(std::vector<std::shared_ptr<DomNode>> nodes) {
  for (auto it = nodes.begin(); it != nodes.end(); it++) {
    std::shared_ptr<DomNode> node = dom_node_registry_.GetNode((*it)->GetId());
    if (node == nullptr) {
      it = nodes.erase(it);
      continue;
    }
    std::shared_ptr<DomNode> parent_node = node->GetParent();
    if (parent_node != nullptr) {
      parent_node->RemoveChildAt(parent_node->IndexOf(node));
    }
    OnDomNodeDeleted(node);
  }

  if (!nodes.empty()) {
    batch_operations_.emplace_back([this, moved_nodes = std::move(nodes)]() mutable {
      render_manager_->DeleteRenderNode(std::move(moved_nodes));
    });
  }
}

void DomManager::BeginBatch() {
  TDF_BASE_NOTIMPLEMENTED();
}

void DomManager::EndBatch() {
  // 触发布局计算
  root_node_->DoLayout();
  for (auto & batch_operation : batch_operations_) {
    batch_operation();
  }
  batch_operations_.clear();
}

void DomManager::CallFunction(int32_t id, const std::string& name,
                              std::unordered_map<std::string, std::shared_ptr<DomValue>> param,
                              CallFunctionCallback cb) {
  auto node = dom_node_registry_.GetNode(id);
  if (node == nullptr) {
      return;
  }
  node->CallFunction(name, std::move(param), std::move(cb));
}

int32_t DomManager::AddDomTreeEventListener(DomTreeEvent event, OnDomTreeEventListener listener) {
  TDF_BASE_NOTIMPLEMENTED();
  return 0;
}
void DomManager::RemoveDomTreeEventListener(DomTreeEvent event, int32_t listener_id) {
  TDF_BASE_NOTIMPLEMENTED();
}

void DomManager::SetRootSize(int32_t width, int32_t height) {
  if (root_node_ != nullptr) {
    root_node_->SetSize(width, height);
  }
}

void DomManager::OnDomNodeCreated(const std::shared_ptr<DomNode>& node) {
  dom_node_registry_.AddNode(node);
  node->OnDomNodeStateChange(DomEvent::Create);
}

void DomManager::OnDomNodeUpdated(const std::shared_ptr<DomNode>& node) { node->OnDomNodeStateChange(DomEvent::Update); }

void DomManager::OnDomNodeDeleted(const std::shared_ptr<DomNode>& node) {
  dom_node_registry_.RemoveNode(node->GetId());
  node->OnDomNodeStateChange(DomEvent::Delete);
}

void DomManager::DomNodeRegistry::AddNode(const std::shared_ptr<DomNode>& node) {
  nodes_.insert(std::make_pair(node->GetId(), node));
}

std::shared_ptr<DomNode> DomManager::DomNodeRegistry::GetNode(int32_t id) {
  auto found = nodes_.find(id);
  if (found == nodes_.end()) {
    return nullptr;
  }
  return found->second;
}

void DomManager::DomNodeRegistry::RemoveNode(int32_t id) { nodes_.erase(id); }

}  // namespace dom
}  // namespace hippy
