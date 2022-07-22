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

void InitNodeCreator() {
    RegisterNodeCreator(tdfrender::kViewName, tdfrender::ViewNode::GetViewNodeCreator());
    RegisterNodeCreator(tdfrender::kTextViewName, tdfrender::TextViewNode::GetTextViewNodeCreator());
    RegisterNodeCreator(tdfrender::kImageViewName, tdfrender::ImageViewNode::GetImageViewNodeCreator());
    RegisterNodeCreator(tdfrender::kListViewName, tdfrender::ListViewNode::GetCreator());
    RegisterNodeCreator(tdfrender::kTextInputViewName, tdfrender::TextInputNode::GetCreator());
    RegisterNodeCreator(tdfrender::kListViewItemName, tdfrender::ListViewItemNode::GetCreator());
    RegisterNodeCreator(tdfrender::kScrollViewName, tdfrender::ScrollViewNode::GetCreator());
    RegisterNodeCreator(tdfrender::kWebViewName, tdfrender::EmbeddedViewNode::GetCreator(tdfrender::kWebViewName));
    RegisterNodeCreator(tdfrender::kModaViewName, tdfrender::ModalViewNode::GetCreator());
    RegisterNodeCreator(tdfrender::kViewPagerName, tdfrender::ViewPagerNode::GetCreator());
    RegisterNodeCreator(tdfrender::kRefreshWrapperName, tdfrender::RefreshWrapperNode::GetCreator());
    RegisterNodeCreator(tdfrender::kRefreshWrapperItemViewName, tdfrender::RefreshWrapperItemNode::GetCreator());
}

void RegisterNodeCreator(const std::string &view_name, const tdfrender::node_creator &creator) {
    node_creator_tables_.insert(std::make_pair(view_name, creator));
}

tdfrender::node_creator GetNodeCreator(const std::string &view_name) {
    auto result = node_creator_tables_.find(view_name);
    if (result != node_creator_tables_.end()) {
        return result->second;
    }
    return tdfrender::ViewNode::GetViewNodeCreator();
    // TODO return EmbeddedNode::GetNodeCreator(class_name);
}

TDFRenderManager::TDFRenderManager() { id_ = global_tdf_render_manager_key.fetch_add(1); }

void TDFRenderManager::RegisterShell(uint32_t root_id, const std::shared_ptr<tdfcore::Shell>& shell) {
  auto render_context =
      TDF_MAKE_SHARED(tdfrender::TDFRenderContext, root_id, shell, GetDomManager(), GetUriDataGetter());
  render_context_repo_.Insert(root_id, render_context);
}

void TDFRenderManager::CreateRenderNode(std::weak_ptr<RootNode> root_node,
                                        std::vector<std::shared_ptr<hippy::dom::DomNode>>&& nodes) {
  // TODO(vimerzhao): 判断哪些地方需要 & Native的实现
  auto root = root_node.lock();
  if (!root) {
    return;
  }
  std::shared_ptr<tdfrender::TDFRenderContext> render_context = nullptr;
  auto result = render_context_repo_.Find(static_cast<uint32_t>(root->GetId()), render_context);
  FOOTSTONE_CHECK(result);
  auto shell = render_context->GetShell();

  std::promise<void> view_create;
  shell->GetUITaskRunner()->PostTask([nodes, shell, render_context, &view_create] {
    TDF_RUNNER_CHECK_UI;
    FOOTSTONE_LOG(INFO) << "CreateNode: BEGIN";
    for (auto const& node : nodes) {
      FOOTSTONE_LOG(INFO) << "CreateNode: id:" << node->GetRenderInfo().id << " |pid:" << node->GetRenderInfo().pid;
      FOOTSTONE_DCHECK(node->GetId() == node->GetRenderInfo().id);
      auto view_node = GetNodeCreator(node->GetViewName())(node->GetRenderInfo());
      if (view_node->GetViewName() == tdfrender::kModaViewName) {
        auto metrics = shell->GetViewportMetrics();
        auto device_pixel_ratio = metrics.device_pixel_ratio;
        node->SetLayoutSize(metrics.width / device_pixel_ratio, metrics.height / device_pixel_ratio);
      }
      // 可以移进去，但是要注意赋值顺序
      render_context->Register(node->GetId(), view_node);
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
  std::shared_ptr<tdfrender::TDFRenderContext> render_context = nullptr;
  auto result = render_context_repo_.Find(static_cast<uint32_t>(root->GetId()), render_context);
  FOOTSTONE_CHECK(result);
  auto shell = render_context->GetShell();
  shell->GetUITaskRunner()->PostTask([nodes, render_context] {
    FOOTSTONE_LOG(INFO) << "UpdateRenderNode: BEGIN";
    for (auto const& node : nodes) {
      FOOTSTONE_DCHECK(node->GetId() == node->GetRenderInfo().id);
      auto view_node = render_context->Find(node->GetId());
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
  std::shared_ptr<tdfrender::TDFRenderContext> render_context = nullptr;
  auto result = render_context_repo_.Find(static_cast<uint32_t>(root->GetId()), render_context);
  FOOTSTONE_CHECK(result);
  auto shell = render_context->GetShell();
  shell->GetUITaskRunner()->PostTask([nodes, render_context] {
    for (auto const& node : nodes) {
      // 目前Hippy自身还有Bug，无法保证RenderInfo的100%可用(RenderInfo的id在这里为0)无法通过断言，临时屏蔽，直接使用DomNode的
      FOOTSTONE_DCHECK(node->GetId() == node->GetRenderInfo().id);
      auto id = node->GetRenderInfo().id;
      render_context->Find(id)->OnDelete();
    }
  });
}

void TDFRenderManager::UpdateLayout(std::weak_ptr<RootNode> root_node,
                                    const std::vector<std::shared_ptr<DomNode>>& nodes) {
  auto root = root_node.lock();
  if (!root) {
    return;
  }
  std::shared_ptr<tdfrender::TDFRenderContext> render_context = nullptr;
  auto result = render_context_repo_.Find(static_cast<uint32_t>(root->GetId()), render_context);
  FOOTSTONE_CHECK(result);
  auto shell = render_context->GetShell();
  shell->GetUITaskRunner()->PostTask([nodes, render_context] {
    FOOTSTONE_LOG(INFO) << "UpdateLayout: BEGIN";
    for (auto const& node : nodes) {
      //      FOOTSTONE_DCHECK(node->GetId() == node->GetRenderInfo().id);
      render_context->Find(node->GetRenderInfo().id)->HandleLayoutUpdate(node->GetRenderLayoutResult());
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
  std::shared_ptr<tdfrender::TDFRenderContext> render_context = nullptr;
  auto result = render_context_repo_.Find(static_cast<uint32_t>(root->GetId()), render_context);
  FOOTSTONE_CHECK(result);
  auto shell = render_context->GetShell();
  shell->GetUITaskRunner()->PostTask([render_context] { render_context->NotifyEndBatch(); });
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
  std::shared_ptr<tdfrender::TDFRenderContext> render_context = nullptr;
  auto result = render_context_repo_.Find(static_cast<uint32_t>(root->GetId()), render_context);
  FOOTSTONE_CHECK(result);
  auto shell = render_context->GetShell();
  if (name == kUpdateFrame) {
    render_context->SetEnableUpdateAnimation(true);
  }
  shell->GetUITaskRunner()->PostTask([dom_node, render_context, name] {
    if (auto node = dom_node.lock(); node != nullptr) {
      auto id = node->GetId();
      render_context->Find(id)->OnAddEventListener(id, name);
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
  std::shared_ptr<tdfrender::TDFRenderContext> render_context = nullptr;
  auto result = render_context_repo_.Find(static_cast<uint32_t>(root->GetId()), render_context);
  FOOTSTONE_CHECK(result);
  if (name == kUpdateFrame) {
    render_context->SetEnableUpdateAnimation(false);
  }
}

void TDFRenderManager::CallFunction(std::weak_ptr<RootNode> root_node, std::weak_ptr<DomNode> dom_node,
                                    const std::string& name, const DomArgument& param, uint32_t cb_id) {
  auto root = root_node.lock();
  if (!root) {
    return;
  }
  std::shared_ptr<tdfrender::TDFRenderContext> render_context = nullptr;
  auto result = render_context_repo_.Find(static_cast<uint32_t>(root->GetId()), render_context);
  FOOTSTONE_CHECK(result);
  auto shell = render_context->GetShell();
  shell->GetUITaskRunner()->PostTask([dom_node, render_context, name, param, cb_id] {
    if (auto dom_node_ptr = dom_node.lock()) {
      auto view_node = render_context->Find(dom_node_ptr->GetId());
      if (view_node) {
        view_node->CallFunction(name, param, cb_id);
      }
    }
  });
}

void TDFRenderManager::SetUriDataGetter(uint32_t render_id, tdfrender::UriDataGetter uriDataGetter) {
  uri_data_getter_map_[render_id] = std::move(uriDataGetter);
}

tdfrender::UriDataGetter TDFRenderManager::GetUriDataGetter() {
  auto getter = uri_data_getter_map_[static_cast<uint32_t>(GetId())];
  FOOTSTONE_DCHECK(getter);
  return getter;
}

}  // namespace dom
}  // namespace hippy
