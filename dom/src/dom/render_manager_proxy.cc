#include "dom/render_manager_proxy.h"

#include <unordered_set>

#include "dom/node_props.h"

namespace hippy {
inline namespace dom {

RenderManagerProxy::RenderManagerProxy(std::shared_ptr<RenderManager> render_manager)
        : render_manager_(render_manager) {}

void RenderManagerProxy::CreateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) {
  std::vector<std::shared_ptr<DomNode>> nodes_to_create;
  for (const auto& node : nodes) {
    node->SetIsJustLayout(ComputeIsLayoutOnly(node));

    if (!node->IsJustLayout() && !node->IsVirtual() && UpdateRenderInfo(node)) {
      nodes_to_create.push_back(node);
    }
  }

  if (!nodes_to_create.empty()) {
    render_manager_->CreateRenderNode(std::move(nodes_to_create));
  }
}

void RenderManagerProxy::UpdateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) {
  std::vector<std::shared_ptr<DomNode>> nodes_to_create;
  std::vector<std::shared_ptr<DomNode>> nodes_to_update;
  for (const auto& node : nodes) {
    bool old_just_layout = node->IsJustLayout();
    node->SetIsJustLayout(ComputeIsLayoutOnly(node));
    if (old_just_layout && !node->IsJustLayout()) {
      if (!node->IsVirtual() && UpdateRenderInfo(node)) {
        nodes_to_create.push_back(node);
      }
    } else if (!node->IsJustLayout() && !node->IsVirtual()) {
      nodes_to_update.push_back(node);
    }
  }

  if (!nodes_to_create.empty()) {
    // step1: create child
    render_manager_->CreateRenderNode(std::vector<std::shared_ptr<DomNode>>(nodes_to_create));
    for (auto node : nodes_to_create) {
      // step2: move child
      std::vector<int32_t> moved_ids;
      FindMoveChildren(node, moved_ids);
      MoveRenderNode(std::move(moved_ids), node->GetRenderInfo().pid, node->GetId());
    }
  }

  if (!nodes_to_update.empty()) {
    render_manager_->UpdateRenderNode(std::move(nodes_to_update));
  }
}

void RenderManagerProxy::DeleteRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) {
  std::vector<std::shared_ptr<DomNode>> nodes_to_delete;
  for (const auto& node : nodes) {
    if (!node->IsJustLayout() && !node->IsVirtual() && node->GetRenderInfo().created) {
      nodes_to_delete.push_back(node);
    }
  }
  if (!nodes_to_delete.empty()) {
    render_manager_->DeleteRenderNode(std::move(nodes_to_delete));
  }
}

void RenderManagerProxy::UpdateLayout(const std::vector<std::shared_ptr<DomNode>>& nodes) {
    std::vector<std::shared_ptr<DomNode>> nodes_to_update;
    for (const auto& node : nodes) {
        if (!node->IsJustLayout() && !node->IsVirtual() && node->GetRenderInfo().created) {
            nodes_to_update.push_back(node);
        }
    }
    render_manager_->UpdateLayout(std::move(nodes_to_update));
}

void RenderManagerProxy::MoveRenderNode(std::vector<int32_t>&& moved_ids,
                                        int32_t from_pid,
                                        int32_t to_pid) {
  render_manager_->MoveRenderNode(std::move(moved_ids), from_pid, to_pid);
}

void RenderManagerProxy::Batch() {
  render_manager_->Batch();
}

void RenderManagerProxy::AddEventListener(std::weak_ptr<DomNode> dom_node, const std::string& name,
                                          const DomValue& param) {
  render_manager_->AddEventListener(dom_node, name, param);
}

void RenderManagerProxy::CallFunction(
    std::weak_ptr<DomNode> dom_node, const std::string &name,
    const DomValue& param,
    CallFunctionCallback cb) {
  render_manager_->CallFunction(dom_node, name, param, cb);
}

bool RenderManagerProxy::ComputeIsLayoutOnly(const std::shared_ptr<DomNode>& node) const {
  return node->GetTagName() == kTagNameView
         && CheckStyleJustLayout(node)
         && !node->HasTouchEventListeners();
}

bool RenderManagerProxy::CheckStyleJustLayout(std::shared_ptr<DomNode> node) const {
  const auto &style_map = node->GetStyleMap();
  for (const auto &entry : style_map) {
    const auto &key = entry.first;
    const auto &value = entry.second;

    if (IsJustLayoutProp(key.c_str())) {
      continue;
    }

    if (key == kOpacity) {
      if (value->IsNull() || (value->IsNumber() && value->ToDouble() == 1)) {
        continue;
      }
    } else if (key == kBorderRadius) {
      const auto &background_color = style_map.find(kBackgroundColor);
      if (background_color != style_map.end() &&
          (*background_color).second->IsNumber() &&
          (*background_color).second->ToInt32() != 0) {
        return false;
      }
      const auto &border_width = style_map.find(kBorderWidth);
      if (border_width != style_map.end() &&
          (*border_width).second->IsNumber() &&
          (*border_width).second->ToDouble() != 0) {
        return false;
      }
    } else if (key == kBorderLeftColor) {
      if (value->IsNumber() && value->ToInt32() == 0) {
        continue;
      }
    } else if (key == kBorderRightColor) {
      if (value->IsNumber() && value->ToInt32() == 0) {
        continue;
      }
    } else if (key == kBorderTopColor) {
      if (value->IsNumber() && value->ToInt32() == 0) {
        continue;
      }
    } else if (key == kBorderBottomColor) {
      if (value->IsNumber() && value->ToInt32() == 0) {
        continue;
      }
    } else if (key == kBorderWidth) {
      if (value->IsNull() || (value->IsNumber() && value->ToDouble() == 0)) {
        continue;
      }
    } else if (key == kBorderLeftWidth) {
      if (value->IsNull() || (value->IsNumber() && value->ToDouble() == 0)) {
        continue;
      }
    } else if (key == kBorderTopWidth) {
      if (value->IsNull() || (value->IsNumber() && value->ToDouble() == 0)) {
        continue;
      }
    } else if (key == kBorderRightWidth) {
      if (value->IsNull() || (value->IsNumber() && value->ToDouble() == 0)) {
        continue;
      }
    } else if (key == kBorderBottomWidth) {
      if (value->IsNull() || (value->IsNumber() && value->ToDouble() == 0)) {
        continue;
      }
    } else {
      return false;
    }
    return false;
  }
  return true;
}

static std::unordered_set<std::string> kJustLayoutProps;

bool RenderManagerProxy::IsJustLayoutProp(const char *prop_name) const {
  if (kJustLayoutProps.empty()) {
    kJustLayoutProps.insert(
        {kAilgnSelf, kAlignItems, kFlex, kFlexDirection, kFlexWrap, kJustifyContent,
         // position
         kPosition, kRight, kTop, kBottom, kLeft,
         // dimensions
         kWidth, kHeight, kMinWidth, kMaxWidth, kMinHeight, kMaxHeight,
         // margins
         kMargin, kMarginVertical, kMarginHorizontal,
         kMarginLeft, kMarginRight, kMarginTop, kMarginBottom,
         // paddings
         kPadding, kPaddingVertical, kPaddingHorizontal,
         kPaddingLeft, kPaddingRight, kPaddingTop, kPaddingBottom});
  }
  return kJustLayoutProps.find(prop_name) != kJustLayoutProps.end();
}

bool RenderManagerProxy::UpdateRenderInfo(const std::shared_ptr<DomNode>& node) {
  DomNode::RenderInfo render_info;
  auto render_parent = GetRenderParent(node);
  if (render_parent) {
    int32_t index = CalculateRenderNodeIndex(render_parent, node);
    render_info.pid = render_parent->GetId();
    render_info.index = index;
  }
  if (!node->IsJustLayout() && !node->IsVirtual()) {
    render_info.created = true;
  } else {
    render_info.created = false;
  }
  node->SetRenderInfo(render_info);
  return render_info.created;
}

std::shared_ptr<DomNode> RenderManagerProxy::GetRenderParent(const std::shared_ptr<DomNode>& node) {
  auto parent = node->GetParent();
  while (parent && parent->IsJustLayout()) {
    parent = parent->GetParent();
  }
  return parent;
}

int32_t RenderManagerProxy::CalculateRenderNodeIndex(const std::shared_ptr<DomNode>& parent,
                                                     const std::shared_ptr<DomNode>& node) {
  assert(parent != nullptr);
  return CalculateRenderNodeIndex(parent, node, 0).second;
}

std::pair<bool, int32_t>
RenderManagerProxy::CalculateRenderNodeIndex(const std::shared_ptr<DomNode>& parent,
                                             const std::shared_ptr<DomNode>& node,
                                             int32_t index) {
  for (int i = 0; i < parent->GetChildCount(); i++) {
    std::shared_ptr<DomNode> child_node = parent->GetChildAt(i);
    if (child_node == node) {
      return std::make_pair(true, index);
    }

    if (child_node->IsJustLayout()) {
      auto view_index = CalculateRenderNodeIndex(child_node, node, index);
      if (view_index.first) {
        return view_index;
      } else {
        index = view_index.second;
      }
    } else {
      index++;
    }
  }
  return std::make_pair(false, index);
}

void RenderManagerProxy::FindMoveChildren(const std::shared_ptr<DomNode>& node,
                                          std::vector<int32_t> &removes) {
  for (int32_t i = 0; i < node->GetChildCount(); i++) {
    auto child_node = node->GetChildAt(i);
    if (child_node->IsJustLayout()) {
      FindMoveChildren(child_node, removes);
    } else {
      removes.push_back(child_node->GetId());
    }
  }
}

void RenderManagerProxy::ApplyLayoutRecursive(const std::shared_ptr<DomNode>& node) {
  // TODO: 处理因为层级优化导致的布局信息变化
}

}  // namespace dom
}  // namespace hippy
