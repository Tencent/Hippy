/**
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include "renderer/tdf/tdf_render_manager.h"

#include <cstdint>
#include <iostream>
#include <utility>

#include "core/engine/schedule/scheduler.h"
#include "core/engine/schedule/task_runner_checker.h"
#include "dom/root_node.h"
#include "footstone/logging.h"
#include "renderer/tdf/viewnode/embedded_view_node.h"
#include "renderer/tdf/viewnode/image_view_node.h"
#include "renderer/tdf/viewnode/list_view_node.h"
#include "renderer/tdf/viewnode/modal_view_node.h"
#include "renderer/tdf/viewnode/refresh_wrapper_node.h"
#include "renderer/tdf/viewnode/root_view_node.h"
#include "renderer/tdf/viewnode/scroll_view_node.h"
#include "renderer/tdf/viewnode/text_input_node.h"
#include "renderer/tdf/viewnode/text_view_node.h"
#include "renderer/tdf/viewnode/view_names.h"
#include "renderer/tdf/viewnode/view_pager_node.h"

namespace hippy {
inline namespace dom {

// TODO: handle conflict with native render key generator
static std::atomic<int32_t> global_tdf_render_manager_key{1000};
constexpr const char kUpdateFrame[] = "frameupdate";

using RenderInfo = tdfrender::ViewNode::RenderInfo;
using node_creator = tdfrender::ViewNode::node_creator;

void InitNodeCreator() {
  RegisterNodeCreator(tdfrender::kViewName, [](RenderInfo info) { return TDF_MAKE_SHARED(tdfrender::ViewNode, info); });
  RegisterNodeCreator(tdfrender::kTextViewName,
                      [](RenderInfo info) { return TDF_MAKE_SHARED(tdfrender::TextViewNode, info); });
  RegisterNodeCreator(tdfrender::kImageViewName,
                      [](RenderInfo info) { return TDF_MAKE_SHARED(tdfrender::ImageViewNode, info); });
  RegisterNodeCreator(tdfrender::kListViewName,
                      [](RenderInfo info) { return TDF_MAKE_SHARED(tdfrender::ListViewNode, info); });
  RegisterNodeCreator(tdfrender::kTextInputViewName,
                      [](RenderInfo info) { return TDF_MAKE_SHARED(tdfrender::TextInputNode, info); });
  RegisterNodeCreator(tdfrender::kListViewItemName,
                      [](RenderInfo info) { return TDF_MAKE_SHARED(tdfrender::ListViewItemNode, info); });
  RegisterNodeCreator(tdfrender::kScrollViewName,
                      [](RenderInfo info) { return std::make_shared<tdfrender::ScrollViewNode>(info); });
  RegisterNodeCreator(tdfrender::kWebViewName, [](RenderInfo render_info) {
    return std::make_shared<tdfrender::EmbeddedViewNode>(render_info, tdfrender::kWebViewName);
  });
  RegisterNodeCreator(tdfrender::kModaViewName,
                      [](RenderInfo info) { return TDF_MAKE_SHARED(tdfrender::ModalViewNode, info); });
  RegisterNodeCreator(tdfrender::kViewPagerName,
                      [](RenderInfo info) { return TDF_MAKE_SHARED(tdfrender::ViewPagerNode, info); });
  RegisterNodeCreator(tdfrender::kRefreshWrapperName,
                      [](RenderInfo info) { return TDF_MAKE_SHARED(tdfrender::RefreshWrapperNode, info); });
  RegisterNodeCreator(tdfrender::kRefreshWrapperItemViewName,
                      [](RenderInfo info) { return TDF_MAKE_SHARED(tdfrender::RefreshWrapperItemNode, info); });
}

void RegisterNodeCreator(const std::string& view_name, const node_creator& creator) {
  node_creator_tables_.insert(std::make_pair(view_name, creator));
}

node_creator GetNodeCreator(const std::string& view_name) {
  auto result = node_creator_tables_.find(view_name);
  if (result != node_creator_tables_.end()) {
    return result->second;
  }
  return node_creator_tables_.find(tdfrender::kViewName)->second;
}

TDFRenderManager::TDFRenderManager() : RenderManager("TDFRenderManager") {
  id_ = global_tdf_render_manager_key.fetch_add(1);
}

void TDFRenderManager::RegisterShell(uint32_t root_id, const std::shared_ptr<tdfcore::Shell>& shell) {
  auto root_node = TDF_MAKE_SHARED(tdfrender::RootViewNode, hippy::DomNode::RenderInfo{root_id, 0, 0}, shell,
                                   GetDomManager(), GetUriDataGetter());
  root_view_nodes_map_.Insert(root_id, root_node);
}

void TDFRenderManager::CreateRenderNode(std::weak_ptr<RootNode> root_node,
                                        std::vector<std::shared_ptr<hippy::dom::DomNode>>&& nodes) {
  // TODO(vimerzhao): 判断哪些地方需要 & Native的实现
  auto root = root_node.lock();
  if (!root) {
    return;
  }
  std::shared_ptr<tdfrender::RootViewNode> root_view_node = nullptr;
  auto result = root_view_nodes_map_.Find(root->GetId(), root_view_node);
  FOOTSTONE_CHECK(result);
  auto shell = root_view_node->GetShell();

  std::promise<void> view_create;
  shell->GetUITaskRunner()->PostTask([nodes, shell, root_view_node, &view_create] {
    TDF_RUNNER_CHECK_UI;
    FOOTSTONE_LOG(INFO) << "CreateNode: BEGIN";
    for (auto const& node : nodes) {
      FOOTSTONE_LOG(INFO) << "CreateNode: id:" << node->GetRenderInfo().id << " |pid:" << node->GetRenderInfo().pid;
      FOOTSTONE_DCHECK(node->GetId() == node->GetRenderInfo().id);
      auto view_node = GetNodeCreator(node->GetViewName())(node->GetRenderInfo());
      if (view_node->GetViewName() == tdfrender::kModaViewName) {
        auto metrics = shell->GetViewportMetrics();
        auto device_pixel_ratio = metrics.device_pixel_ratio;
        node->SetLayoutSize(
            static_cast<float>(metrics.width / device_pixel_ratio),
            static_cast<float>(metrics.height / device_pixel_ratio));
      }
      root_view_node->RegisterViewNode(node->GetId(), view_node);
      view_node->OnCreate();
    }
    FOOTSTONE_LOG(INFO) << "CreateNode: END";
    view_create.set_value();
  });
  // must block for textview to register measure function form DomNode
  view_create.get_future().wait();
}

void TDFRenderManager::UpdateRenderNode(std::weak_ptr<RootNode> root_node,
                                        std::vector<std::shared_ptr<DomNode>>&& nodes) {
  auto root = root_node.lock();
  if (!root) {
    return;
  }
  std::shared_ptr<tdfrender::RootViewNode> root_view_node = nullptr;
  auto result = root_view_nodes_map_.Find(root->GetId(), root_view_node);
  FOOTSTONE_CHECK(result);
  auto shell = root_view_node->GetShell();
  shell->GetUITaskRunner()->PostTask([nodes, root_view_node] {
    FOOTSTONE_LOG(INFO) << "UpdateRenderNode: BEGIN";
    for (auto const& node : nodes) {
      FOOTSTONE_DCHECK(node->GetId() == node->GetRenderInfo().id);
      auto view_node = root_view_node->FindViewNode(node->GetId());
      view_node->OnUpdate(*node);
    }
    FOOTSTONE_LOG(INFO) << "UpdateRenderNode: END";
  });
}
void TDFRenderManager::MoveRenderNode(std::weak_ptr<RootNode> root_node,
                                      std::vector<std::shared_ptr<DomNode>>&& nodes) {}

void TDFRenderManager::DeleteRenderNode(std::weak_ptr<RootNode> root_node,
                                        std::vector<std::shared_ptr<DomNode>>&& nodes) {
  auto root = root_node.lock();
  if (!root) {
    return;
  }
  std::shared_ptr<tdfrender::RootViewNode> root_view_node = nullptr;
  auto result = root_view_nodes_map_.Find(root->GetId(), root_view_node);
  FOOTSTONE_CHECK(result);
  auto shell = root_view_node->GetShell();
  shell->GetUITaskRunner()->PostTask([nodes, root_view_node] {
    for (auto const& node : nodes) {
      FOOTSTONE_DCHECK(node->GetId() == node->GetRenderInfo().id);
      auto id = node->GetRenderInfo().id;
      root_view_node->FindViewNode(id)->OnDelete();
    }
  });
}

void TDFRenderManager::UpdateLayout(std::weak_ptr<RootNode> root_node,
                                    const std::vector<std::shared_ptr<DomNode>>& nodes) {
  auto root = root_node.lock();
  if (!root) {
    return;
  }
  std::shared_ptr<tdfrender::RootViewNode> root_view_node = nullptr;
  auto result = root_view_nodes_map_.Find(root->GetId(), root_view_node);
  FOOTSTONE_CHECK(result);
  auto shell = root_view_node->GetShell();
  shell->GetUITaskRunner()->PostTask([nodes, root_view_node] {
    FOOTSTONE_LOG(INFO) << "UpdateLayout: BEGIN";
    for (auto const& node : nodes) {
      FOOTSTONE_DCHECK(node->GetId() == node->GetRenderInfo().id);
      root_view_node->FindViewNode(node->GetRenderInfo().id)->HandleLayoutUpdate(node->GetRenderLayoutResult());
    }
    FOOTSTONE_LOG(INFO) << "UpdateLayout: END";
  });
}

void TDFRenderManager::MoveRenderNode(std::weak_ptr<RootNode> root_node, std::vector<int32_t>&& moved_ids,
                                      int32_t from_pid, int32_t to_pid) {
  // TODO 暂不支持
  FOOTSTONE_DCHECK(false);
}

void TDFRenderManager::EndBatch(std::weak_ptr<RootNode> root_node) {
  auto root = root_node.lock();
  if (!root) {
    return;
  }
  std::shared_ptr<tdfrender::RootViewNode> root_view_node = nullptr;
  auto result = root_view_nodes_map_.Find(root->GetId(), root_view_node);
  FOOTSTONE_CHECK(result);
  auto shell = root_view_node->GetShell();
  shell->GetUITaskRunner()->PostTask([root_view_node] { root_view_node->EndBatch(); });
}

void TDFRenderManager::BeforeLayout(std::weak_ptr<RootNode> root_node) {
  // TODO
}

void TDFRenderManager::AfterLayout(std::weak_ptr<RootNode> root_node) {
  // TODO
}

void TDFRenderManager::AddEventListener(std::weak_ptr<RootNode> root_node, std::weak_ptr<DomNode> dom_node,
                                        const std::string& name) {
  auto root = root_node.lock();
  if (!root) {
    return;
  }
  std::shared_ptr<tdfrender::RootViewNode> root_view_node = nullptr;
  auto result = root_view_nodes_map_.Find(root->GetId(), root_view_node);
  FOOTSTONE_CHECK(result);
  auto shell = root_view_node->GetShell();
  if (name == kUpdateFrame) {
    root_view_node->SetEnableUpdateAnimation(true);
  }
  shell->GetUITaskRunner()->PostTask([dom_node, root_view_node, name] {
    if (auto node = dom_node.lock(); node != nullptr) {
      auto id = node->GetId();
      root_view_node->FindViewNode(id)->OnAddEventListener(id, name);
      return;
    }

    FOOTSTONE_DCHECK(false);
  });
}

void TDFRenderManager::RemoveEventListener(std::weak_ptr<RootNode> root_node, std::weak_ptr<DomNode> dom_node,
                                           const std::string& name) {
  FOOTSTONE_LOG(INFO) << "RemoveEventListener: "
                      << " |name: " << dom_node.lock()->GetViewName() << " |id: " << dom_node.lock()->GetId()
                      << " |event: " << name;
  auto root = root_node.lock();
  if (!root) {
    return;
  }
  std::shared_ptr<tdfrender::RootViewNode> root_view_node = nullptr;
  auto result = root_view_nodes_map_.Find(root->GetId(), root_view_node);
  FOOTSTONE_CHECK(result);
  if (name == kUpdateFrame) {
    root_view_node->SetEnableUpdateAnimation(false);
  }
}

void TDFRenderManager::CallFunction(std::weak_ptr<RootNode> root_node, std::weak_ptr<DomNode> dom_node,
                                    const std::string& name, const DomArgument& param, uint32_t cb_id) {
  auto root = root_node.lock();
  if (!root) {
    return;
  }
  std::shared_ptr<tdfrender::RootViewNode> root_view_node = nullptr;
  auto result = root_view_nodes_map_.Find(root->GetId(), root_view_node);
  FOOTSTONE_CHECK(result);
  auto shell = root_view_node->GetShell();
  shell->GetUITaskRunner()->PostTask([dom_node, root_view_node, name, param, cb_id] {
    if (auto dom_node_ptr = dom_node.lock()) {
      auto view_node = root_view_node->FindViewNode(dom_node_ptr->GetId());
      if (view_node) {
        view_node->CallFunction(name, param, cb_id);
      }
    }
  });
}

void TDFRenderManager::SetUriDataGetter(uint32_t render_id, tdfrender::RootViewNode::UriDataGetter uriDataGetter) {
  uri_data_getter_map_[render_id] = std::move(uriDataGetter);
}

tdfrender::RootViewNode::UriDataGetter TDFRenderManager::GetUriDataGetter() {
  auto getter = uri_data_getter_map_[static_cast<uint32_t>(GetId())];
  FOOTSTONE_DCHECK(getter);
  return getter;
}

}  // namespace dom
}  // namespace hippy
