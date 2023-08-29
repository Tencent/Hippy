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
#include "renderer/tdf/viewnode/view_node.h"
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
inline namespace render {
inline namespace tdf {

static std::atomic<uint32_t> global_tdf_render_manager_key{1000};
constexpr const char kUpdateFrame[] = "frameupdate";

using RenderInfo = ViewNode::RenderInfo;
using node_creator = ViewNode::node_creator;
using string_view = footstone::stringview::string_view;

void InitNodeCreator() {
  RegisterNodeCreator(hippy::render::tdf::kViewName,
                      [](const std::shared_ptr<hippy::dom::DomNode> &dom_node) {
    return TDF_MAKE_SHARED(hippy::render::tdf::ViewNode, dom_node, dom_node->GetRenderInfo());
  });
  RegisterNodeCreator(hippy::render::tdf::kTextViewName,
                      [](const std::shared_ptr<hippy::dom::DomNode> &dom_node) {
    return TDF_MAKE_SHARED(hippy::render::tdf::TextViewNode, dom_node, dom_node->GetRenderInfo());
  });
  RegisterNodeCreator(hippy::render::tdf::kImageViewName,
                      [](const std::shared_ptr<hippy::dom::DomNode> &dom_node) {
    return TDF_MAKE_SHARED(hippy::render::tdf::ImageViewNode, dom_node, dom_node->GetRenderInfo());
  });
  RegisterNodeCreator(hippy::render::tdf::kListViewName,
                      [](const std::shared_ptr<hippy::dom::DomNode> &dom_node) {
    return TDF_MAKE_SHARED(hippy::render::tdf::ListViewNode, dom_node, dom_node->GetRenderInfo());
  });
  RegisterNodeCreator(hippy::render::tdf::kTextInputViewName,
                      [](const std::shared_ptr<hippy::dom::DomNode> &dom_node) {
    return TDF_MAKE_SHARED(hippy::render::tdf::TextInputNode, dom_node, dom_node->GetRenderInfo());
  });
  RegisterNodeCreator(hippy::render::tdf::kListViewItemName,
                      [](const std::shared_ptr<hippy::dom::DomNode> &dom_node) {
    return TDF_MAKE_SHARED(hippy::render::tdf::ListViewItemNode, dom_node, dom_node->GetRenderInfo());
  });
  RegisterNodeCreator(hippy::render::tdf::kScrollViewName,
                      [](const std::shared_ptr<hippy::dom::DomNode> &dom_node) {
    return TDF_MAKE_SHARED(hippy::render::tdf::ScrollViewNode, dom_node, dom_node->GetRenderInfo());
  });
  RegisterNodeCreator(hippy::render::tdf::kWebViewName,
                      [](const std::shared_ptr<hippy::dom::DomNode> &dom_node) {
    return TDF_MAKE_SHARED(hippy::render::tdf::EmbeddedViewNode, dom_node, dom_node->GetRenderInfo(),
                           hippy::render::tdf::kWebViewName);
  });
  RegisterNodeCreator(hippy::render::tdf::kModaViewName,
                      [](const std::shared_ptr<hippy::dom::DomNode> &dom_node) {
    return TDF_MAKE_SHARED(hippy::render::tdf::ModalViewNode, dom_node, dom_node->GetRenderInfo());
  });
  RegisterNodeCreator(hippy::render::tdf::kViewPagerName,
                      [](const std::shared_ptr<hippy::dom::DomNode> &dom_node) {
    return TDF_MAKE_SHARED(hippy::render::tdf::ViewPagerNode, dom_node, dom_node->GetRenderInfo());
  });
  RegisterNodeCreator(hippy::render::tdf::kViewPagerItemName,
                      [](const std::shared_ptr<hippy::dom::DomNode> &dom_node) {
    return TDF_MAKE_SHARED(hippy::render::tdf::ViewNode, dom_node, dom_node->GetRenderInfo());
  });
  RegisterNodeCreator(hippy::render::tdf::kRefreshWrapperName,
                      [](const std::shared_ptr<hippy::dom::DomNode> &dom_node) {
    return TDF_MAKE_SHARED(hippy::render::tdf::RefreshWrapperNode, dom_node, dom_node->GetRenderInfo());
  });
  RegisterNodeCreator(hippy::render::tdf::kRefreshWrapperItemViewName,
                      [](const std::shared_ptr<hippy::dom::DomNode> &dom_node) {
    return TDF_MAKE_SHARED(hippy::render::tdf::RefreshWrapperItemNode, dom_node, dom_node->GetRenderInfo());
  });

  embedded_node_creator_ = [](const std::shared_ptr<hippy::dom::DomNode> &dom_node) -> std::shared_ptr<ViewNode> {
    return TDF_MAKE_SHARED(hippy::render::tdf::EmbeddedViewNode, dom_node, dom_node->GetRenderInfo(),
                           dom_node->GetViewName());
  };
}

void RegisterNodeCreator(const std::string& view_name, const node_creator& creator) {
  node_creator_tables_.insert(std::make_pair(view_name, creator));
}

node_creator GetNodeCreator(const std::string& view_name) {
  auto result = node_creator_tables_.find(view_name);
  if (result != node_creator_tables_.end()) {
    return result->second;
  }
  return embedded_node_creator_;
}

TDFRenderManager::TDFRenderManager() : RenderManager("TDFRenderManager") {
  id_ = global_tdf_render_manager_key.fetch_add(1);
}

void TDFRenderManager::RegisterShell(uint32_t root_id, const std::shared_ptr<tdfcore::Shell> &shell,
                                     const std::shared_ptr<tdfcore::RenderContext> &render_context) {
  auto uri_data_getter =  [WEAK_THIS](const string_view &uri, const RootViewNode::DataCb& callback) {
    DEFINE_AND_CHECK_SELF(TDFRenderManager);
    auto uri_loader = self->GetUriLoader();
    if (!uri_loader) {
      FOOTSTONE_DLOG(WARNING) << "TDFRenderManager uri_loader is null";
      return;
    }
    auto cb = [callback](
        UriLoader::RetCode ret_code, const std::unordered_map<std::string, std::string>&, UriLoader::bytes content) {

      auto code = static_cast<uint32_t>(ret_code);
      FOOTSTONE_DLOG(INFO) << "TDFRenderManager UriLoader Result ret_code = " << code;

      if (ret_code == UriLoader::RetCode::Success && !content.empty()) {
        FOOTSTONE_DLOG(INFO) << "TDFRenderManager UriLoader Result Success!";
        callback(string_view::new_from_utf8(content.c_str(), content.length()).utf8_value());
      } else {
        callback(string_view::new_from_utf8("", 0).utf8_value());
      }
    };
    uri_loader->RequestUntrustedContent(uri, {}, cb);
  };
  auto root_node = TDF_MAKE_SHARED(RootViewNode,
                                   RenderInfo{root_id, 0, 0},
                                   shell,
                                   render_context,
                                   GetDomManager(),
                                   uri_data_getter);
  root_view_nodes_map_.Insert(root_id, root_node);
}

#define FOR_EACH_TEXT_NODE(ation)                          \
  for (auto const& node : nodes) {                         \
    if (node->GetViewName() != tdf::kTextViewName) { \
      continue;                                            \
    }                                                      \
    ation                                                  \
  }

#define GET_SHELL() \
    std::shared_ptr<tdf::RootViewNode> root_view_node = nullptr; \
    auto result = root_view_nodes_map_.Find(root->GetId(), root_view_node); \
    FOOTSTONE_CHECK(result); \
    auto shell = root_view_node->GetShell()

#define CHECK_ROOT()            \
  auto root = root_node.lock(); \
  if (!root) {                  \
    return;                     \
  }

void TDFRenderManager::CreateRenderNode(std::weak_ptr<RootNode> root_node,
                                      std::vector<std::shared_ptr<hippy::dom::DomNode>>&& nodes) {
  CHECK_ROOT()
  FOR_EACH_TEXT_NODE(
      auto view_node = GetNodeCreator(node->GetViewName())(node);
      auto text_view_node = std::static_pointer_cast<tdf::TextViewNode>(view_node);
      text_view_node->SyncTextAttributes(node);
      tdf::TextViewNode::RegisterMeasureFunction(root_node.lock()->GetId(), node, text_view_node);
  )

  FOOTSTONE_LOG(INFO) << "ModelView: Set LayoutSize";
  for (auto const& node : nodes) {
    if (node->GetViewName() == kModaViewName) {
      auto size = root_node.lock()->GetRootSize();
      node->SetLayoutSize(
          static_cast<float>(std::get<0>(size)),
          static_cast<float>(std::get<1>(size)));
    }
  }

  GET_SHELL();
  auto root_id = root_node.lock()->GetId();
  shell->GetUITaskRunner()->PostTask([root_id, nodes, shell, root_view_node] {
    FOOTSTONE_LOG(INFO) << "CreateNode: BEGIN";
    for (auto const& node : nodes) {
      FOOTSTONE_LOG(INFO) << "CreateNode: id:" << node->GetRenderInfo().id << " |pid:" << node->GetRenderInfo().pid;
      FOOTSTONE_DCHECK(node->GetId() == node->GetRenderInfo().id);
      std::shared_ptr<tdf::ViewNode> view_node;
      if (node->GetViewName() == tdf::kTextViewName) {
        view_node = tdf::TextViewNode::FindLayoutTextViewNode(root_id, node);
      } else {
        view_node = GetNodeCreator(node->GetViewName())(node);
      }
      if (view_node) {
        root_view_node->RegisterViewNode(node->GetId(), view_node);
        view_node->OnCreate();
      }
    }
    FOOTSTONE_LOG(INFO) << "CreateNode: END";
  });
}

void TDFRenderManager::UpdateRenderNode(std::weak_ptr<RootNode> root_node,
                                        std::vector<std::shared_ptr<DomNode>>&& nodes) {
  CHECK_ROOT()
  FOR_EACH_TEXT_NODE(
      auto view_node = tdf::TextViewNode::FindLayoutTextViewNode(root_node.lock()->GetId(), node);
      if (view_node) {
        view_node->SyncTextAttributes(node);
      }
  )
  GET_SHELL();
  shell->GetUITaskRunner()->PostTask([nodes, root_view_node] {
    FOOTSTONE_LOG(INFO) << "UpdateRenderNode: BEGIN";
    for (auto const& node : nodes) {
      FOOTSTONE_DCHECK(node->GetId() == node->GetRenderInfo().id);
      auto view_node = root_view_node->FindViewNode(node->GetId());
      view_node->OnUpdate(node);
    }
    FOOTSTONE_LOG(INFO) << "UpdateRenderNode: END";
  });
}

void TDFRenderManager::MoveRenderNode(std::weak_ptr<RootNode> root_node,
                                      std::vector<std::shared_ptr<DomNode>>&& nodes) {}

void TDFRenderManager::DeleteRenderNode(std::weak_ptr<RootNode> root_node,
                                        std::vector<std::shared_ptr<DomNode>>&& nodes) {
  CHECK_ROOT()
  for (auto const& node : nodes) {
    UnregisterAllMeasureFunctions(root_node.lock()->GetId(), node);
  }

  GET_SHELL();
  shell->GetUITaskRunner()->PostTask([nodes, root_view_node] {
    FOOTSTONE_LOG(INFO) << "DeleteRenderNode: BEGIN";
    for (auto const& node : nodes) {
      FOOTSTONE_DCHECK(node->GetId() == node->GetRenderInfo().id);
      auto id = node->GetRenderInfo().id;
      root_view_node->FindViewNode(id)->OnDelete();
    }
    FOOTSTONE_LOG(INFO) << "DeleteRenderNode: END";
  });
}

void TDFRenderManager::UnregisterAllMeasureFunctions(uint32_t root_id, const std::shared_ptr<hippy::DomNode>& node) {
  for (const auto& child : node->GetChildren()) {
    if (child) {
      UnregisterAllMeasureFunctions(root_id, child);
    }
  }
  if (node->GetViewName() == tdf::kTextViewName) {
    tdf::TextViewNode::UnregisterMeasureFunction(root_id, node);
  }
}

void TDFRenderManager::UpdateLayout(std::weak_ptr<RootNode> root_node,
                                    const std::vector<std::shared_ptr<DomNode>>& nodes) {
  CHECK_ROOT()
  GET_SHELL();
  shell->GetUITaskRunner()->PostTask([nodes, root_view_node] {
    for (auto const& node : nodes) {
      FOOTSTONE_DCHECK(node->GetId() == node->GetRenderInfo().id);
      root_view_node->FindViewNode(node->GetRenderInfo().id)->HandleLayoutUpdate(node->GetRenderLayoutResult());
    }
  });
}

void TDFRenderManager::MoveRenderNode(std::weak_ptr<RootNode> root_node, std::vector<int32_t>&& moved_ids,
                                      int32_t from_pid, int32_t to_pid, int32_t index) {
  FOOTSTONE_DCHECK(false);
}

void TDFRenderManager::EndBatch(std::weak_ptr<RootNode> root_node) {
  auto root = root_node.lock();
  if (!root) {
    return;
  }
  std::shared_ptr<RootViewNode> root_view_node = nullptr;
  auto result = root_view_nodes_map_.Find(root->GetId(), root_view_node);
  FOOTSTONE_CHECK(result);
  auto shell = root_view_node->GetShell();
  shell->GetUITaskRunner()->PostTask([root_view_node] { root_view_node->EndBatch(); });
}

void TDFRenderManager::BeforeLayout(std::weak_ptr<RootNode> root_node) { }

void TDFRenderManager::AfterLayout(std::weak_ptr<RootNode> root_node) { }

void TDFRenderManager::AddEventListener(std::weak_ptr<RootNode> root_node, std::weak_ptr<DomNode> dom_node,
                                        const std::string& name) {
  auto root = root_node.lock();
  if (!root) {
    return;
  }
  std::shared_ptr<RootViewNode> root_view_node = nullptr;
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
  std::shared_ptr<RootViewNode> root_view_node = nullptr;
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
  std::shared_ptr<RootViewNode> root_view_node = nullptr;
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

#undef GET_SHELL
#undef FOR_EACH_TEXT_NODE
}  // namespace tdf
}  // namespace render
}  // namespace hippy
