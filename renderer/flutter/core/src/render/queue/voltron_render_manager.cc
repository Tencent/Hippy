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

#include "render/ffi/bridge_define.h"
#include "render/queue/voltron_render_manager.h"

namespace voltron {

using hippy::TouchEventInfo;

VoltronRenderManager::VoltronRenderManager(int32_t root_id, int32_t engine_id)
    : VoltronRenderTaskRunner(engine_id, root_id), root_id_(root_id) {}

VoltronRenderManager::~VoltronRenderManager() = default;

void voltron::VoltronRenderManager::CreateRenderNode(
    std::vector<std::shared_ptr<DomNode>> &&nodes) {
  for (const auto &node : nodes) {
    RunCreateDomNode(node);
  }
}

void VoltronRenderManager::UpdateRenderNode(
    std::vector<std::shared_ptr<DomNode>> &&nodes) {
  for (const auto& n : nodes) {
    if (n->GetTagName() == "Text") {
      MarkTextDirty(n->GetId());
    }
  }
  for (const auto &node : nodes) {
    RunUpdateDomNode(node);
  }
}

void VoltronRenderManager::MarkTextDirty(uint32_t node_id) {
  auto dom_manager = GetDomManager();
  TDF_BASE_DCHECK(dom_manager);
  if (dom_manager) {
    auto node = dom_manager->GetNode(node_id);
    TDF_BASE_DCHECK(node);
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

void VoltronRenderManager::MarkDirtyProperty(std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<DomValue>>> diff_style,
                                             const char *prop_name,
                                             std::shared_ptr<LayoutNode> layout_node) {
  TDF_BASE_DCHECK(layout_node != nullptr);
  if (diff_style->find(prop_name) != diff_style->end()) {
    layout_node->MarkDirty();
    return;
  }
}


void VoltronRenderManager::DeleteRenderNode(
    std::vector<std::shared_ptr<DomNode>> &&nodes) {
  for (const auto &node : nodes) {
    RunDeleteDomNode(node);
  }
}

void VoltronRenderManager::MoveRenderNode(std::vector<int32_t> &&ids,
                                          int32_t pid, int32_t id) {
  RunMoveDomNode(std::move(ids), pid, id);
}

void VoltronRenderManager::UpdateLayout(
    const std::vector<std::shared_ptr<DomNode>> &nodes) {
  RunUpdateLayout(nodes);
}

void VoltronRenderManager::EndBatch() {
  TDF_BASE_DLOG(INFO) << "RunEndBatch";
  RunBatch();
}

void VoltronRenderManager::BeforeLayout() {
  RunLayoutBefore();
  TDF_BASE_DLOG(INFO) << "RunLayoutBefore";

  // 在dom的css layout开始前，要保证dom
  // op全部执行完成，否则自定义测量的节点测量数据会不准确
  notified_ = false;
  std::unique_lock<std::mutex> lock(mutex_);
  while (!notified_) {
    TDF_BASE_DLOG(INFO) << "RunLayoutWait";
    cv_.wait(lock);
  }
}

void VoltronRenderManager::AfterLayout() {
  RunLayoutFinish();
  TDF_BASE_DLOG(INFO) << "RunLayoutFinish";
}

void VoltronRenderManager::CallFunction(std::weak_ptr<DomNode> dom_node,
                                        const std::string &name,
                                        const DomArgument &param,
                                        uint32_t cb_id) {
  RunCallFunction(dom_node, name, param, cb_id);
}

void VoltronRenderManager::CallEvent(
    std::weak_ptr<DomNode> dom_node, const std::string &name,
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
    TDF_BASE_DLOG(INFO) << "RunLayoutNotify";
  }
}

void VoltronRenderManager::MoveRenderNode(std::vector<std::shared_ptr<DomNode>> &&nodes) {

}

} // namespace voltron
