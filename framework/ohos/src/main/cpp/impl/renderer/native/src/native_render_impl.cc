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

#include "renderer/native_render_impl.h"
#include "renderer/native_render_provider_capi.h"
#include "oh_napi/oh_napi_task_runner.h"
#include "renderer/utils/hr_pixel_utils.h"

namespace hippy {
inline namespace render {
inline namespace native {

NativeRenderImpl::NativeRenderImpl(uint32_t instance_id, const std::string &bundle_path, bool is_rawfile, const std::string &res_module_name)
 : instance_id_(instance_id), bundle_path_(bundle_path), is_rawfile_(is_rawfile), res_module_name_(res_module_name) {}

void NativeRenderImpl::InitRenderManager() {
  auto native_render = std::static_pointer_cast<NativeRender>(shared_from_this());
  hr_manager_ = std::make_shared<HRManager>(instance_id_, native_render, is_rawfile_, res_module_name_);
}

void NativeRenderImpl::SetBundlePath(const std::string &bundle_path) {
  bundle_path_ = bundle_path;
}

void NativeRenderImpl::BindNativeRoot(ArkUI_NodeContentHandle contentHandle, uint32_t root_id, uint32_t node_id) {
  auto view_manager = hr_manager_->GetViewManager(root_id);
  if (!view_manager) {
    return;
  }

  view_manager->BindNativeRoot(contentHandle, node_id);
}

void NativeRenderImpl::UnbindNativeRoot(uint32_t root_id, uint32_t node_id) {
  auto view_manager = hr_manager_->GetViewManager(root_id);
  if (!view_manager) {
    return;
  }

  view_manager->UnbindNativeRoot(node_id);
}

void NativeRenderImpl::RegisterCustomTsRenderViews(napi_env ts_env, napi_ref ts_render_provider_ref, std::set<std::string> &custom_views, std::map<std::string, std::string> &mapping_views) {
  hr_manager_->RegisterCustomTsRenderViews(ts_env, ts_render_provider_ref, custom_views, mapping_views);
}

void NativeRenderImpl::DestroyRoot(uint32_t root_id) {
  hr_manager_->RemoveViewManager(root_id);
  hr_manager_->RemoveVirtualNodeManager(root_id);
}

void NativeRenderImpl::DoCallbackForCallCustomTsView(uint32_t root_id, uint32_t node_id, uint32_t callback_id, const HippyValue &result) {
  auto view_manager = hr_manager_->GetViewManager(root_id);
  if (!view_manager) {
    return;
  }
  view_manager->DoCallbackForCallCustomTsView(node_id, callback_id, result);
}

void NativeRenderImpl::CreateNode(uint32_t root_id, const std::vector<std::shared_ptr<HRCreateMutation>> &mutations) {
  auto view_manager = hr_manager_->GetViewManager(root_id);
  if (!view_manager) {
    return;
  }

  for (uint32_t i = 0; i < mutations.size(); i++) {
    auto &m = mutations[i];
    auto tm = std::static_pointer_cast<HRMutation>(m);
    view_manager->AddMutations(tm);
  }
}

void NativeRenderImpl::PreCreateNode(uint32_t root_id, const std::vector<std::shared_ptr<HRCreateMutation>> &mutations) {
  auto view_manager = hr_manager_->GetViewManager(root_id);
  if (!view_manager) {
    return;
  }

  for (uint32_t i = 0; i < mutations.size(); i++) {
    auto &m = mutations[i];
    view_manager->PreCreateRenderView(m->tag_, m->view_name_, m->is_parent_text_);
    view_manager->PreUpdateProps(m->tag_, m->props_);
  }
}

void NativeRenderImpl::UpdateNode(uint32_t root_id, const std::vector<std::shared_ptr<HRUpdateMutation>> &mutations) {
  auto view_manager = hr_manager_->GetViewManager(root_id);
  if (!view_manager) {
    return;
  }

  for (uint32_t i = 0; i < mutations.size(); i++) {
    auto &m = mutations[i];
    auto tm = std::static_pointer_cast<HRMutation>(m);
    view_manager->AddMutations(tm);
  }
}

void NativeRenderImpl::PreUpdateNode(uint32_t root_id, const std::vector<std::shared_ptr<HRUpdateMutation>> &mutations) {
  auto view_manager = hr_manager_->GetViewManager(root_id);
  if (!view_manager) {
    return;
  }

  for (uint32_t i = 0; i < mutations.size(); i++) {
    auto &m = mutations[i];
    view_manager->PreUpdateProps(m->tag_, m->props_, m->delete_props_);
  }
}

void NativeRenderImpl::MoveNode(uint32_t root_id, const std::shared_ptr<HRMoveMutation> &mutation) {
  auto view_manager = hr_manager_->GetViewManager(root_id);
  if (!view_manager) {
    return;
  }

  auto tm = std::static_pointer_cast<HRMutation>(mutation);
  view_manager->AddMutations(tm);
}

void NativeRenderImpl::MoveNode2(uint32_t root_id, const std::shared_ptr<HRMove2Mutation> &mutation) {
  auto view_manager = hr_manager_->GetViewManager(root_id);
  if (!view_manager) {
    return;
  }

  auto tm = std::static_pointer_cast<HRMutation>(mutation);
  view_manager->AddMutations(tm);
}

void NativeRenderImpl::DeleteNode(uint32_t root_id, const std::vector<std::shared_ptr<HRDeleteMutation>> &mutations) {
  auto view_manager = hr_manager_->GetViewManager(root_id);
  if (!view_manager) {
    return;
  }

  for (uint32_t i = 0; i < mutations.size(); i++) {
    auto &m = mutations[i];
    auto tm = std::static_pointer_cast<HRMutation>(m);
    view_manager->AddMutations(tm);
  }
}

void NativeRenderImpl::UpdateLayout(uint32_t root_id, const std::vector<std::shared_ptr<HRUpdateLayoutMutation>> &mutations) {
  auto view_manager = hr_manager_->GetViewManager(root_id);
  if (!view_manager) {
    return;
  }

  for (uint32_t i = 0; i < mutations.size(); i++) {
    auto &m = mutations[i];
    auto tm = std::static_pointer_cast<HRMutation>(m);
    view_manager->AddMutations(tm);
  }
}

void NativeRenderImpl::UpdateEventListener(uint32_t root_id,
                         const std::vector<std::shared_ptr<HRUpdateEventListenerMutation>> &mutations) {
  auto view_manager = hr_manager_->GetViewManager(root_id);
  if (!view_manager) {
    return;
  }

  for (uint32_t i = 0; i < mutations.size(); i++) {
    auto &m = mutations[i];
    auto tm = std::static_pointer_cast<HRMutation>(m);
    view_manager->AddMutations(tm);
  }
}

void NativeRenderImpl::EndBatch(uint32_t root_id) {
  auto view_manager = hr_manager_->GetViewManager(root_id);
  if (!view_manager) {
    return;
  }

  view_manager->ApplyMutations();
  view_manager->NotifyEndBatchCallbacks();
}

bool NativeRenderImpl::CheckRegisteredEvent(uint32_t root_id, uint32_t node_id, std::string &event_name) {
  auto view_manager = hr_manager_->GetViewManager(root_id);
  if (!view_manager) {
    return false;
  }
  return view_manager->CheckRegisteredEvent(node_id, event_name);
}

void NativeRenderImpl::CallUIFunction(uint32_t root_id, uint32_t node_id, const std::string &functionName,
                                      const std::vector<HippyValue> params, std::function<void(const HippyValue &result)> callback) {
  auto view_manager = hr_manager_->GetViewManager(root_id);
  if (!view_manager) {
    return;
  }

  FOOTSTONE_DLOG(INFO) << "callUIFunction: rootId " << root_id << ", id " << node_id << ", functionName "
                       << functionName << ", params" << params.size();
  view_manager->CallViewMethod(node_id, functionName, params, callback);
}

LayoutSize NativeRenderImpl::CustomMeasure(uint32_t root_id, uint32_t node_id,
    float width, LayoutMeasureMode width_measure_mode,
    float height, LayoutMeasureMode height_measure_mode) {
    auto view_manager = hr_manager_->GetViewManager(root_id);
  if (!view_manager) {
    return {0, 0};
  }
  return view_manager->CallCustomMeasure(node_id, width, width_measure_mode, height, height_measure_mode);
}

void NativeRenderImpl::SpanPosition(uint32_t root_id, uint32_t node_id, float x, float y) {
  auto view_manager = hr_manager_->GetViewManager(root_id);
  if (!view_manager) {
    return;
  }

  std::shared_ptr<HRUpdateLayoutMutation> m = std::make_shared<HRUpdateLayoutMutation>();
  m->tag_ = node_id;
  m->left_ = x;
  m->top_ = y;
  auto tm = std::static_pointer_cast<HRMutation>(m);
  view_manager->AddMutations(tm);
}

void NativeRenderImpl::TextEllipsized(uint32_t root_id, uint32_t node_id) {
  auto view_manager = hr_manager_->GetViewManager(root_id);
  if (!view_manager) {
    return;
  }
  
  std::shared_ptr<HRTextEllipsizedEventMutation> m = std::make_shared<HRTextEllipsizedEventMutation>();
  m->tag_ = node_id;
  auto tm = std::static_pointer_cast<HRMutation>(m);
  view_manager->AddMutations(tm);
}

std::string NativeRenderImpl::GetBundlePath() {
  return bundle_path_;
}

void NativeRenderImpl::OnSizeChanged(uint32_t root_id, float width, float height) {
  NativeRenderProvider_UpdateRootSize(instance_id_, root_id, HRPixelUtils::VpToDp(width), HRPixelUtils::VpToDp(height));
}

void NativeRenderImpl::OnSizeChanged2(uint32_t root_id, uint32_t node_id, float width, float height, bool isSync) {
  NativeRenderProvider_UpdateNodeSize(instance_id_, root_id, node_id, HRPixelUtils::VpToDp(width), HRPixelUtils::VpToDp(height));
}

HRPosition NativeRenderImpl::GetRootViewtPositionInWindow(uint32_t root_id) {
  auto view_manager = hr_manager_->GetViewManager(root_id);
  if (!view_manager) {
    return HRPosition{0, 0};
  }
  auto rootView = view_manager->GetRootView();
  if (!rootView) {
    return HRPosition{0, 0};
  }
  return rootView->GetLocalRootArkUINode()->GetLayoutPositionInWindow();
}

uint64_t NativeRenderImpl::AddEndBatchCallback(uint32_t root_id, const EndBatchCallback &cb) {
  auto view_manager = hr_manager_->GetViewManager(root_id);
  if (!view_manager) {
    return 0;
  }
  return view_manager->AddEndBatchCallback(cb);
}

void NativeRenderImpl::RemoveEndBatchCallback(uint32_t root_id, uint64_t cbId) {
  auto view_manager = hr_manager_->GetViewManager(root_id);
  if (!view_manager) {
    return;
  }
  view_manager->RemoveEndBatchCallback(cbId);
}

bool NativeRenderImpl::GetViewParent(uint32_t root_id, uint32_t node_id, uint32_t &parent_id, std::string &parent_view_type) {
  auto view_manager = hr_manager_->GetViewManager(root_id);
  if (!view_manager) {
    return false;
  }
  return view_manager->GetViewParent(node_id, parent_id, parent_view_type);
}

bool NativeRenderImpl::GetViewChildren(uint32_t root_id, uint32_t node_id, std::vector<uint32_t> &children_ids, std::vector<std::string> &children_view_types) {
  auto view_manager = hr_manager_->GetViewManager(root_id);
  if (!view_manager) {
    return false;
  }
  return view_manager->GetViewChildren(node_id, children_ids, children_view_types);
}

void NativeRenderImpl::CallViewMethod(uint32_t root_id, uint32_t node_id, const std::string &method, const std::vector<HippyValue> params, std::function<void(const HippyValue &result)> callback) {
  auto view_manager = hr_manager_->GetViewManager(root_id);
  if (!view_manager) {
    return;
  }
  view_manager->CallViewMethod(node_id, method, params, callback);
}

void NativeRenderImpl::SetViewEventListener(uint32_t root_id, uint32_t node_id, napi_ref callback_ref) {
  auto view_manager = hr_manager_->GetViewManager(root_id);
  if (!view_manager) {
    return;
  }
  view_manager->SetViewEventListener(node_id, callback_ref);
}

HRRect NativeRenderImpl::GetViewFrameInRoot(uint32_t root_id, uint32_t node_id) {
  auto view_manager = hr_manager_->GetViewManager(root_id);
  if (!view_manager) {
    return {0, 0, 0, 0};
  }
  return view_manager->GetViewFrameInRoot(node_id);
}

void NativeRenderImpl::AddBizViewInRoot(uint32_t root_id, uint32_t biz_view_id, ArkUI_NodeHandle node_handle, const HRPosition &position) {
  auto view_manager = hr_manager_->GetViewManager(root_id);
  if (!view_manager) {
    return;
  }
  view_manager->AddBizViewInRoot(biz_view_id, node_handle, position);
}

void NativeRenderImpl::RemoveBizViewInRoot(uint32_t root_id, uint32_t biz_view_id) {
  auto view_manager = hr_manager_->GetViewManager(root_id);
  if (!view_manager) {
    return;
  }
  view_manager->RemoveBizViewInRoot(biz_view_id);
}

} // namespace native
} // namespace render
} // namespace hippy
