#include "dom/root_node.h"

#include "dom/diff_utils.h"
#include "dom/render_manager.h"

namespace hippy {
inline namespace dom {

RootNode::RootNode(uint32_t id)
        : DomNode(id, 0, 0, "", "",
                  std::unordered_map<std::string, std::shared_ptr<DomValue>>(),
                  std::unordered_map<std::string, std::shared_ptr<DomValue>>(),
                  nullptr) {}

void RootNode::CreateDomNodes(std::vector<std::shared_ptr<DomNode>>&& nodes) {
  std::vector<std::shared_ptr<DomNode>> nodes_to_create;
  for (const auto& node : nodes) {
    std::shared_ptr<DomNode> parent_node = GetNode(node->GetPid());
    if (parent_node == nullptr) {
      continue;
    }
    nodes_to_create.push_back(node);
    node->SetRenderInfo({node->GetId(), node->GetPid(), node->GetIndex()});
    // 解析布局属性
    node->ParseLayoutStyleInfo();
    parent_node->AddChildAt(node, node->GetIndex());

    OnDomNodeCreated(node);
  }


  if (!nodes_to_create.empty()) {
    dom_operations_.push_back({DomOperation::kOpCreate, nodes_to_create});
  }
}

void RootNode::UpdateDomNodes(std::vector<std::shared_ptr<DomNode>>&& nodes) {
  std::vector<std::shared_ptr<DomNode>> nodes_to_update;
  for (const auto& it : nodes) {
    std::shared_ptr<DomNode> node = GetNode(it->GetId());
    if (node == nullptr) {
      continue;
    }
    nodes_to_update.push_back(node);
    // diff props
    auto style_diff_value = DiffUtils::DiffProps(*node->GetStyleMap(), *it->GetStyleMap());
    auto ext_diff_value = DiffUtils::DiffProps(*node->GetExtStyle(), *it->GetExtStyle());
    auto style_update = std::get<0>(style_diff_value);
    auto ext_update = std::get<0>(ext_diff_value);
    std::shared_ptr<DomValueMap> diff_value = std::make_shared<DomValueMap>();
    if (style_update) {
      diff_value->insert(style_update->begin(), style_update->end());
    }
    if (ext_update) {
      diff_value->insert(ext_update->begin(), ext_update->end());
    }
    node->SetStyleMap(it->GetStyleMap());
    node->SetExtStyleMap(it->GetExtStyle());
    node->SetDiffStyle(diff_value);
    auto style_delete = std::get<1>(style_diff_value);
    auto ext_delete = std::get<1>(ext_diff_value);
    std::shared_ptr<std::vector<std::string>> delete_value = std::make_shared<std::vector<std::string>>();
    if (style_delete) {
      delete_value->insert(delete_value->end(), style_delete->begin(), style_delete->end());
    }
    if (ext_delete) {
      delete_value->insert(delete_value->end(), ext_delete->begin(), ext_delete->end());
    }
    node->SetDeleteProps(delete_value);
    it->SetDiffStyle(diff_value);
    it->SetDeleteProps(delete_value);
    node->ParseLayoutStyleInfo();

  }

  if (!nodes_to_update.empty()) {
    dom_operations_.push_back({DomOperation::kOpUpdate, nodes_to_update});
  }
}

void RootNode::DeleteDomNodes(std::vector<std::shared_ptr<DomNode>>&& nodes) {
  std::vector<std::shared_ptr<DomNode>> nodes_to_delete;
  for (const auto & it : nodes) {
    std::shared_ptr<DomNode> node = GetNode(it->GetId());
    if (node == nullptr) {
      continue;
    }
    nodes_to_delete.push_back(node);
    std::shared_ptr<DomNode> parent_node = node->GetParent();
    if (parent_node != nullptr) {
      parent_node->RemoveChildAt(parent_node->IndexOf(node));
    }
    OnDomNodeDeleted(node);
  }

  if (!nodes_to_delete.empty()) {
    dom_operations_.push_back({DomOperation::kOpDelete, nodes_to_delete});
  }
}

void RootNode::SyncWithRenderManager(std::shared_ptr<RenderManager> render_manager) {
  FlushDomOperations(render_manager);
  FlushEventOperations(render_manager);
  DoAndFlushLayout(render_manager);
  render_manager->EndBatch();
}

void RootNode::AddEvent(uint32_t id, const std::string& event_name) {
  event_operations_.push_back({EventOperation::kOpAdd, id, event_name});
}

void RootNode::RemoveEvent(uint32_t id, const std::string& event_name) {
  event_operations_.push_back({EventOperation::kOpRemove, id, event_name});
}

std::shared_ptr<DomNode> RootNode::GetNode(uint32_t id) {
  if (id == GetId()) {
    return shared_from_this();
  }
  auto found = nodes_.find(id);
  if (found == nodes_.end()) {
    return nullptr;
  }
  return found->second.lock();
}

void RootNode::DoAndFlushLayout(std::shared_ptr<RenderManager> render_manager) {
  // Before Layout
  render_manager->BeforeLayout();
  // 触发布局计算
  std::vector<std::shared_ptr<DomNode>> layout_changed_nodes;
  DoLayout(layout_changed_nodes);
  // After Layout
  render_manager->AfterLayout();

  if (!layout_changed_nodes.empty()) {
    render_manager->UpdateLayout(layout_changed_nodes);
  }
}

void RootNode::FlushDomOperations(std::shared_ptr<RenderManager> render_manager) {
  for (auto& dom_operation : dom_operations_) {
    switch (dom_operation.op) {
      case DomOperation::kOpCreate:
        render_manager->CreateRenderNode(std::move(dom_operation.nodes));
        break;
      case DomOperation::kOpUpdate:
        render_manager->UpdateRenderNode(std::move(dom_operation.nodes));
        break;
      case DomOperation::kOpDelete:
        render_manager->DeleteRenderNode(std::move(dom_operation.nodes));
        break;
      default:
        break;
    }
  }
  dom_operations_.clear();
}

void RootNode::FlushEventOperations(std::shared_ptr<RenderManager> render_manager) {
  for (auto& event_operation : event_operations_) {
    const auto& node = GetNode(event_operation.id);
    if (node == nullptr) {
      continue;
    }

    switch (event_operation.op) {
      case EventOperation::kOpAdd:
        render_manager->AddEventListener(node, event_operation.name);
        break;
      case EventOperation::kOpRemove:
        render_manager->RemoveEventListener(node, event_operation.name);
        break;
      default:
        break;
    }
  }
  event_operations_.clear();
}

void RootNode::OnDomNodeCreated(const std::shared_ptr<DomNode>& node) {
  nodes_.insert(std::make_pair(node->GetId(), node));
}

void RootNode::OnDomNodeDeleted(const std::shared_ptr<DomNode> &node) {
  if (node) {
    for (const auto &child : node->GetChildren()) {
      if (child) {
        OnDomNodeDeleted(child);
      }
    }
    nodes_.erase(node->GetId());
  }
}

}  // namespace dom
}  // namespace hippy
