#include "dom/dom_manager.h"

namespace hippy {
inline namespace dom {

DomManager::DomManager(int32_t root_id): root_id_(root_id) {
  dom_event_listener_map_[DomEvent::Create].push_back([this](std::any node) {
    dom_node_registry_.AddNode(std::any_cast<std::shared_ptr<DomNode>>(node));
  });
  dom_event_listener_map_[DomEvent::Delete].push_back([this](std::any node) {
    dom_node_registry_.RemoveNode(std::any_cast<std::shared_ptr<DomNode>>(node)->GetId());
  });
}

void DomManager::CreateDomNodes(std::vector<std::shared_ptr<DomNode>> nodes) {
  for (auto it = nodes.begin(); it != nodes.end(); it++) {
    std::shared_ptr<DomNode> node = *it;
    std::shared_ptr<DomNode> parent_node = dom_node_registry_.GetNode(node->GetPid());
    if (parent_node == nullptr) {
      it = nodes.erase(it);
      continue;
    }
    node->SetRenderInfo({node->GetPid(), node->GetIndex(), true});

    parent_node->AddChildAt(node, node->GetIndex());
    OnDomNodeCreated(node);
  }

  if (!nodes.empty()) {
    batch_operations_.push_back([this, moved_nodes = std::move(nodes)]() mutable {
      render_manager_->CreateRenderNode(std::move(moved_nodes));
    });
  }
}

void DomManager::UpdateDomNode(std::vector<std::shared_ptr<DomNode>> nodes) {
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
    batch_operations_.push_back([this, moved_nodes = std::move(nodes)]() mutable {
      render_manager_->UpdateRenderNode(std::move(moved_nodes));
    });
  }
}

void DomManager::DeleteDomNode(std::vector<std::shared_ptr<DomNode>> nodes) {
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
    batch_operations_.push_back([this, moved_nodes = std::move(nodes)]() mutable {
      render_manager_->DeleteRenderNode(std::move(moved_nodes));
    });
  }
}

void DomManager::EndBatch() {
  for (auto it = batch_operations_.begin(); it != batch_operations_.end(); it++) {
    (*it)();
  }
  batch_operations_.clear();
}

void DomManager::OnDomNodeCreated(std::shared_ptr<DomNode> node) {
  for (const auto& listener : dom_event_listener_map_[DomEvent::Create]) {
    listener(node);
  }
}

void DomManager::OnDomNodeUpdated(std::shared_ptr<DomNode> node) {
  for (const auto& listener : dom_event_listener_map_[DomEvent::Update]) {
    listener(node);
  }
}

void DomManager::OnDomNodeDeleted(std::shared_ptr<DomNode> node) {
  for (const auto& listener : dom_event_listener_map_[DomEvent::Delete]) {
    listener(node);
  }
}

void DomManager::DomNodeRegistry::AddNode(std::shared_ptr<DomNode> node) {
  nodes_.insert(std::make_pair(node->GetId(), node));
}

std::shared_ptr<DomNode> DomManager::DomNodeRegistry::GetNode(int32_t id) {
  auto found = nodes_.find(id);
  if (found == nodes_.end()) {
    return nullptr;
  }
  return found->second;
}

void DomManager::DomNodeRegistry::RemoveNode(int32_t id) {
  nodes_.erase(id);
}

}  // namespace dom
}  // namespace hippy
