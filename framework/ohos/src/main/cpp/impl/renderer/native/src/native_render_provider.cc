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

#include "renderer/native_render_provider.h"
#include "footstone/logging.h"
#include "footstone/macros.h"
#include "oh_napi/oh_napi_task_runner.h"
#include "renderer/native_render_provider_capi.h"

namespace hippy {
inline namespace render {
inline namespace native {

NativeRenderProvider::NativeRenderProvider(uint32_t instance_id, const std::string &bundle_path, bool is_rawfile, const std::string &res_module_name)
 : instance_id_(instance_id) {
  render_impl_ = std::make_shared<NativeRenderImpl>(instance_id, bundle_path, is_rawfile, res_module_name);
  render_impl_->InitRenderManager();
}

void NativeRenderProvider::SetBundlePath(const std::string &bundle_path) {
  render_impl_->SetBundlePath(bundle_path);
}

void NativeRenderProvider::BindNativeRoot(ArkUI_NodeContentHandle contentHandle, uint32_t root_id, uint32_t node_id) {
  render_impl_->BindNativeRoot(contentHandle, root_id, node_id);
}

void NativeRenderProvider::UnbindNativeRoot(uint32_t root_id, uint32_t node_id) {
  render_impl_->UnbindNativeRoot(root_id, node_id);
}

void NativeRenderProvider::BindNativeRootToParent(ArkUI_NodeHandle parentNodeHandle, uint32_t root_id, uint32_t node_id) {
  render_impl_->BindNativeRootToParent(parentNodeHandle, root_id, node_id);
}

void NativeRenderProvider::UnbindNativeRootFromParent(uint32_t root_id, uint32_t node_id) {
  render_impl_->UnbindNativeRootFromParent(root_id, node_id);
}

void NativeRenderProvider::RegisterCustomTsRenderViews(napi_env ts_env, napi_ref ts_render_provider_ref, std::set<std::string> &custom_views, std::map<std::string, std::string> &mapping_views) {
  render_impl_->RegisterCustomTsRenderViews(ts_env_, ts_render_provider_ref, custom_views, mapping_views);
}

void NativeRenderProvider::DestroyRoot(uint32_t root_id, bool is_c_inteface) {
  render_impl_->DestroyRoot(root_id, is_c_inteface);
}

void NativeRenderProvider::DoCallbackForCallCustomTsView(uint32_t root_id, uint32_t node_id, uint32_t callback_id, const HippyValue &result) {
  render_impl_->DoCallbackForCallCustomTsView(root_id, node_id, callback_id, result);
}

void NativeRenderProvider::CreateNode(uint32_t root_id, const std::vector<std::shared_ptr<HRCreateMutation>> &mutations) {
  OhNapiTaskRunner *taskRunner = OhNapiTaskRunner::Instance(ts_env_);
  taskRunner->RunAsyncTask([render_impl = render_impl_, root_id = root_id, mutations = mutations]() {
    render_impl->CreateNode(root_id, mutations);
  });
}

void NativeRenderProvider::PreCreateNode(uint32_t root_id, const std::vector<std::shared_ptr<HRCreateMutation>> &mutations) {
  OhNapiTaskRunner *taskRunner = OhNapiTaskRunner::Instance(ts_env_);
  taskRunner->RunSyncTask([render_impl = render_impl_, root_id = root_id, mutations = mutations]() {
    render_impl->PreCreateNode(root_id, mutations);
  });
}

void NativeRenderProvider::UpdateNode(uint32_t root_id, const std::vector<std::shared_ptr<HRUpdateMutation>> &mutations) {
  OhNapiTaskRunner *taskRunner = OhNapiTaskRunner::Instance(ts_env_);
  taskRunner->RunAsyncTask([render_impl = render_impl_, root_id = root_id, mutations = mutations]() {
    render_impl->UpdateNode(root_id, mutations);
  });
}

void NativeRenderProvider::PreUpdateNode(uint32_t root_id, const std::vector<std::shared_ptr<HRUpdateMutation>> &mutations) {
  OhNapiTaskRunner *taskRunner = OhNapiTaskRunner::Instance(ts_env_);
  taskRunner->RunSyncTask([render_impl = render_impl_, root_id = root_id, mutations = mutations]() {
    render_impl->PreUpdateNode(root_id, mutations);
  });
}

void NativeRenderProvider::MoveNode(uint32_t root_id, const std::shared_ptr<HRMoveMutation> &mutation) {
  OhNapiTaskRunner *taskRunner = OhNapiTaskRunner::Instance(ts_env_);
  taskRunner->RunAsyncTask([render_impl = render_impl_, root_id = root_id, mutation = mutation]() {
    render_impl->MoveNode(root_id, mutation);
  });
}

void NativeRenderProvider::MoveNode2(uint32_t root_id, const std::shared_ptr<HRMove2Mutation> &mutation) {
  OhNapiTaskRunner *taskRunner = OhNapiTaskRunner::Instance(ts_env_);
  taskRunner->RunAsyncTask([render_impl = render_impl_, root_id = root_id, mutation = mutation]() {
    render_impl->MoveNode2(root_id, mutation);
  });
}

void NativeRenderProvider::DeleteNode(uint32_t root_id, const std::vector<std::shared_ptr<HRDeleteMutation>> &mutations) {
  OhNapiTaskRunner *taskRunner = OhNapiTaskRunner::Instance(ts_env_);
  taskRunner->RunAsyncTask([render_impl = render_impl_, root_id = root_id, mutations = mutations]() {
    render_impl->DeleteNode(root_id, mutations);
  });
}

void NativeRenderProvider::UpdateLayout(uint32_t root_id, const std::vector<std::shared_ptr<HRUpdateLayoutMutation>> &mutations) {
  OhNapiTaskRunner *taskRunner = OhNapiTaskRunner::Instance(ts_env_);
  taskRunner->RunAsyncTask([render_impl = render_impl_, root_id = root_id, mutations = mutations]() {
    render_impl->UpdateLayout(root_id, mutations);
  });
}

void NativeRenderProvider::UpdateEventListener(uint32_t root_id,
                         const std::vector<std::shared_ptr<HRUpdateEventListenerMutation>> &mutations) {
  OhNapiTaskRunner *taskRunner = OhNapiTaskRunner::Instance(ts_env_);
  taskRunner->RunAsyncTask([render_impl = render_impl_, root_id = root_id, mutations = mutations]() {
    render_impl->UpdateEventListener(root_id, mutations);
  });
}

void NativeRenderProvider::EndBatch(uint32_t root_id) {
  OhNapiTaskRunner *taskRunner = OhNapiTaskRunner::Instance(ts_env_);
  taskRunner->RunAsyncTask([render_impl = render_impl_, root_id = root_id]() {
    render_impl->EndBatch(root_id);
  });
}

void NativeRenderProvider::UpdateTextMeasurer(uint32_t root_id, uint32_t node_id, const std::shared_ptr<TextMeasurer> text_measurer, int32_t incCreateCount) {
  OhNapiTaskRunner *taskRunner = OhNapiTaskRunner::Instance(ts_env_);
  taskRunner->RunAsyncTask([render_impl = render_impl_, root_id, node_id, text_measurer, incCreateCount]() {
    auto view_manager = render_impl->GetHRManager()->GetViewManager(root_id);
    if (view_manager) {
      view_manager->GetRenderContext()->GetTextMeasureManager()->SaveNewTextMeasurer(node_id, text_measurer, incCreateCount);
    }
  });
}

void NativeRenderProvider::CallUIFunction(uint32_t root_id, uint32_t node_id, uint32_t cb_id, const std::string &func_name, const std::vector<HippyValue> &params) {
  OhNapiTaskRunner *taskRunner = OhNapiTaskRunner::Instance(ts_env_);
  auto weak_this = weak_from_this();
  taskRunner->RunAsyncTask([render_impl = render_impl_, root_id, node_id, func_name, params, cb_id, weak_this]() {
    std::function<void(const HippyValue &result)> cb = [cb_id, func_name, root_id, node_id, weak_this](const HippyValue &result) {
      auto provider = weak_this.lock();
      if (provider) {
        provider->DoCallBack(1, cb_id, func_name, root_id, node_id, result);
      }
    };
    render_impl->CallUIFunction(root_id, node_id, func_name, params, (cb_id == 0) ? nullptr : cb);
  });
}

LayoutSize NativeRenderProvider::CustomMeasure(uint32_t root_id, uint32_t node_id,
    float width, LayoutMeasureMode width_measure_mode,
    float height, LayoutMeasureMode height_measure_mode) {
  return render_impl_->CustomMeasure(root_id, node_id, width, width_measure_mode, height, height_measure_mode);
}

void NativeRenderProvider::SpanPosition(uint32_t root_id, uint32_t node_id, float x, float y) {
  OhNapiTaskRunner *taskRunner = OhNapiTaskRunner::Instance(ts_env_);
  taskRunner->RunAsyncTask([render_impl = render_impl_, root_id, node_id, x, y]() {
    render_impl->SpanPosition(root_id, node_id, x, y);
  });
}

void NativeRenderProvider::TextEllipsized(uint32_t root_id, uint32_t node_id) {
  OhNapiTaskRunner *taskRunner = OhNapiTaskRunner::Instance(ts_env_);
  taskRunner->RunAsyncTask([render_impl = render_impl_, root_id, node_id]() {
    render_impl->TextEllipsized(root_id, node_id);
  });
}

void NativeRenderProvider::DispatchEvent(uint32_t root_id, uint32_t node_id, const std::string &event_name,
    const std::shared_ptr<HippyValue> &params, bool capture, bool bubble, HREventType event_type) {
  // Because the native(C++) DOM use lowercase names, convert to lowercase here
  std::string lower_case_event_name = event_name;
  std::transform(lower_case_event_name.begin(), lower_case_event_name.end(), lower_case_event_name.begin(), ::tolower);
  // Compatible with events prefixed with on in old version
  std::string prefix(NativeRenderProvider::EVENT_PREFIX);
  if (lower_case_event_name.compare(0, prefix.length(), prefix) == 0) {
    lower_case_event_name = lower_case_event_name.substr(prefix.length());
  }
  if (event_type != HREventType::GESTURE
    && event_type != HREventType::ROOT // "frameUpdate" event is from a sub thread, so no need to check for thread-safe
    && !render_impl_->CheckRegisteredEvent(root_id, node_id, lower_case_event_name)) {
    return;
  }

  if (event_name != "frameUpdate") {
    FOOTSTONE_DLOG(INFO) << "NativeRenderProvider dispatchEvent: id " << node_id << ", eventName " << event_name
      << ", eventType " << static_cast<int32_t>(event_type) << ", params " << params;
  }

  NativeRenderProvider_OnReceivedEvent(instance_id_, root_id, node_id, lower_case_event_name, params, capture, bubble);
}

void NativeRenderProvider::DoCallBack(int32_t result, uint32_t cb_id, const std::string &func_name,
                                      uint32_t root_id, uint32_t node_id, const HippyValue &params) {
  NativeRenderProvider_DoCallBack(instance_id_, result, func_name, root_id, node_id, cb_id, params);
}

bool NativeRenderProvider::GetViewParent(uint32_t root_id, uint32_t node_id, uint32_t &parent_id, std::string &parent_view_type) {
  return render_impl_->GetViewParent(root_id, node_id, parent_id, parent_view_type);
}

bool NativeRenderProvider::GetViewChildren(uint32_t root_id, uint32_t node_id, std::vector<uint32_t> &children_ids, std::vector<std::string> &children_view_types) {
  return render_impl_->GetViewChildren(root_id, node_id, children_ids, children_view_types);
}

void NativeRenderProvider::CallViewMethod(uint32_t root_id, uint32_t node_id, const std::string &method, const std::vector<HippyValue> params, std::function<void(const HippyValue &result)> callback) {
  render_impl_->CallViewMethod(root_id, node_id, method, params, callback);
}

void NativeRenderProvider::SetViewEventListener(uint32_t root_id, uint32_t node_id, napi_ref callback_ref) {
  render_impl_->SetViewEventListener(root_id, node_id, callback_ref);
}

HRRect NativeRenderProvider::GetViewFrameInRoot(uint32_t root_id, uint32_t node_id) {
  return render_impl_->GetViewFrameInRoot(root_id, node_id);
}

void NativeRenderProvider::AddBizViewInRoot(uint32_t root_id, uint32_t biz_view_id, ArkUI_NodeHandle node_handle, const HRPosition &position) {
  render_impl_->AddBizViewInRoot(root_id, biz_view_id, node_handle, position);
}

void NativeRenderProvider::RemoveBizViewInRoot(uint32_t root_id, uint32_t biz_view_id) {
  render_impl_->RemoveBizViewInRoot(root_id, biz_view_id);
}

} // namespace native
} // namespace render
} // namespace hippy
