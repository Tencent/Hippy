/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#include <variant>

#include "render/bridge/bridge_define.h"
#include "render/queue/voltron_render_manager.h"

namespace voltron {

using hippy::TouchEventInfo;

VoltronRenderManager::VoltronRenderManager(uint32_t id)
    : RenderManager("VoltronRenderManager"), VoltronRenderTaskRunner(id){}

VoltronRenderManager::~VoltronRenderManager() = default;

void voltron::VoltronRenderManager::CreateRenderNode(
    std::weak_ptr<hippy::RootNode> root_node, std::vector<std::shared_ptr<DomNode>> &&nodes) {
  auto root_node_ptr = root_node.lock();
  if (!root_node_ptr) {
    return;
  }
  auto root_id = root_node_ptr->GetId();
  for (const auto &node: nodes) {
    RunCreateDomNode(root_id, node);
  }

}

void VoltronRenderManager::UpdateRenderNode(
    std::weak_ptr<RootNode> root_node, std::vector<std::shared_ptr<DomNode>> &&nodes) {
  auto root_node_ptr = root_node.lock();
  if (!root_node_ptr) {
    return;
  }
  auto root_id = root_node_ptr->GetId();
  for (const auto &n: nodes) {
    if (n->GetViewName() == "Text") {
      MarkTextDirty(root_node, n->GetId());
    }
  }
  for (const auto &node: nodes) {
    RunUpdateDomNode(root_id, node);
  }
}

void VoltronRenderManager::MarkTextDirty(const std::weak_ptr<RootNode> &root_node, uint32_t node_id) {
  auto dom_manager = GetDomManager();
  FOOTSTONE_DCHECK(dom_manager);
  if (dom_manager) {
    auto node = dom_manager->GetNode(root_node, node_id);
    FOOTSTONE_DCHECK(node);
    if (node) {
      auto diff_style = node->GetDiffStyle();
      if (diff_style) {
        MarkDirtyProperty(diff_style, hippy::dom::kFontStyle, node->GetLayoutNode());
        MarkDirtyProperty(diff_style, hippy::dom::kLetterSpacing, node->GetLayoutNode());
        MarkDirtyProperty(diff_style, hippy::dom::kColor, node->GetLayoutNode());
        MarkDirtyProperty(diff_style, hippy::dom::kFontSize, node->GetLayoutNode());
        MarkDirtyProperty(diff_style, hippy::dom::kFontFamily, node->GetLayoutNode());
        MarkDirtyProperty(diff_style, hippy::dom::kFontWeight, node->GetLayoutNode());
        MarkDirtyProperty(diff_style, hippy::dom::kTextDecorationLine, node->GetLayoutNode());
        MarkDirtyProperty(diff_style, hippy::dom::kTextShadowOffset, node->GetLayoutNode());
        MarkDirtyProperty(diff_style, hippy::dom::kTextShadowRadius, node->GetLayoutNode());
        MarkDirtyProperty(diff_style, hippy::dom::kTextShadowColor, node->GetLayoutNode());
        MarkDirtyProperty(diff_style, hippy::dom::kLineHeight, node->GetLayoutNode());
        MarkDirtyProperty(diff_style, hippy::dom::kTextAlign, node->GetLayoutNode());
        MarkDirtyProperty(diff_style, hippy::dom::kText, node->GetLayoutNode());
        MarkDirtyProperty(diff_style, kEnableScale, node->GetLayoutNode());
        MarkDirtyProperty(diff_style, hippy::dom::kNumberOfLines, node->GetLayoutNode());
      }
    }
  }
}

void VoltronRenderManager::MarkDirtyProperty(std::shared_ptr<std::unordered_map<std::string,
                                                                                std::shared_ptr<
                                                                                    HippyValue>>> diff_style,
                                             const char *prop_name,
                                             std::shared_ptr<LayoutNode> layout_node) {
  FOOTSTONE_DCHECK(layout_node != nullptr);
  if (diff_style->find(prop_name) != diff_style->end()) {
    layout_node->MarkDirty();
    return;
  }
}

void VoltronRenderManager::DeleteRenderNode(
    std::weak_ptr<RootNode> root_node, std::vector<std::shared_ptr<DomNode>> &&nodes) {
  auto root_node_ptr = root_node.lock();
  if (!root_node_ptr) {
    return;
  }
  auto root_id = root_node_ptr->GetId();
  for (const auto &node: nodes) {
    RunDeleteDomNode(root_id, node);
  }
}

void VoltronRenderManager::MoveRenderNode(std::weak_ptr<RootNode> root_node,
                                          std::vector<int32_t> &&move_ids,
                                          int32_t from_pid,
                                          int32_t to_pid,
                                          int32_t index) {
  auto root_node_ptr = root_node.lock();
  if (!root_node_ptr) {
    return;
  }
  auto root_id = root_node_ptr->GetId();
  RunRecombineDomNode(root_id, std::move(move_ids), from_pid, to_pid, index);
}

void VoltronRenderManager::UpdateLayout(
    std::weak_ptr<RootNode> root_node, const std::vector<std::shared_ptr<DomNode>> &nodes) {
  auto root_node_ptr = root_node.lock();
  if (!root_node_ptr) {
    return;
  }
  auto root_id = root_node_ptr->GetId();
  RunUpdateLayout(root_id, nodes);
}

void VoltronRenderManager::EndBatch(std::weak_ptr<RootNode> root_node) {
  FOOTSTONE_DLOG(INFO) << "RunEndBatch";
  auto root_node_ptr = root_node.lock();
  if (!root_node_ptr) {
    return;
  }
  auto root_id = root_node_ptr->GetId();
  RunBatch(root_id);
}

void VoltronRenderManager::BeforeLayout(std::weak_ptr<RootNode> root_node) {
  auto root_node_ptr = root_node.lock();
  if (!root_node_ptr) {
    return;
  }
  auto root_id = root_node_ptr->GetId();
  RunLayoutBefore(root_id);
  FOOTSTONE_DLOG(INFO) << "RunLayoutBefore";
}

void VoltronRenderManager::AfterLayout(std::weak_ptr<RootNode> root_node) {}

void VoltronRenderManager::CallFunction(std::weak_ptr<RootNode> root_node,
                                        std::weak_ptr<DomNode> dom_node,
                                        const std::string &name,
                                        const DomArgument &param,
                                        uint32_t cb_id) {
  auto root_node_ptr = root_node.lock();
  if (!root_node_ptr) {
    return;
  }
  auto root_id = root_node_ptr->GetId();
  RunCallFunction(root_id, dom_node, name, param, cb_id);
}

void VoltronRenderManager::CallEvent(
    std::weak_ptr<DomNode> dom_node, const std::string &name,
    bool capture, bool bubble,
    const std::unique_ptr<EncodableValue> &params) {
  RunCallEvent(dom_node, name, capture, bubble, params);
}

void VoltronRenderManager::AddEventListener(std::weak_ptr<RootNode> root_node,
                                            std::weak_ptr<DomNode> dom_node,
                                            const std::string &name) {
  auto root_node_ptr = root_node.lock();
  if (!root_node_ptr) {
    return;
  }
  auto root_id = root_node_ptr->GetId();
  auto dom_node_p = dom_node.lock();
  if (dom_node_p) {
    RunAddEventListener(root_id, dom_node_p->GetId(), name);
  }
}

void VoltronRenderManager::RemoveEventListener(std::weak_ptr<RootNode> root_node,
                                               std::weak_ptr<DomNode> dom_node,
                                               const std::string &name) {
  auto root_node_ptr = root_node.lock();
  if (!root_node_ptr) {
    return;
  }
  auto root_id = root_node_ptr->GetId();
  auto dom_node_p = dom_node.lock();
  if (dom_node_p) {
    RunRemoveEventListener(root_id, dom_node_p->GetId(), name);
  }
}

void VoltronRenderManager::MoveRenderNode(std::weak_ptr<RootNode> root_node,
                                          std::vector<std::shared_ptr<DomNode>> &&nodes) {
  auto root_node_ptr = root_node.lock();
  if (!root_node_ptr) {
    return;
  }
  auto root_id = root_node_ptr->GetId();
  for (const auto &node: nodes) {
    RunMoveDomNode(root_id, node);
  }
}

} // namespace voltron
