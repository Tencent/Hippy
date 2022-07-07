/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
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


#include "devtools/devtools_data_source.h"

#include <utility>
#include <devtools/devtools_utils.h>

#include "devtools/adapter/hippy_dom_tree_adapter.h"
#include "devtools/adapter/hippy_screen_adapter.h"
#include "devtools/adapter/hippy_tracing_adapter.h"
#include "devtools/adapter/hippy_vm_request_adapter.h"
#include "footstone/macros.h"
#include "dom/dom_manager.h"
#include "devtools/devtools_utils.h"

#if defined(JS_V8) && !defined(V8_WITHOUT_INSPECTOR)
#include "footstone/string_view_utils.h"
#include "devtools/trace_control.h"
#endif

namespace hippy::devtools {

constexpr char kDomTreeUpdated[] = "DomTreeUpdated";

DevtoolsDataSource::DevtoolsDataSource(const std::string& ws_url, std::shared_ptr<footstone::WorkerManager> worker_manager) {
  hippy::devtools::DevtoolsConfig devtools_config;
  devtools_config.framework = hippy::devtools::Framework::kHippy;
  devtools_config.tunnel = hippy::devtools::Tunnel::kWebSocket;
  devtools_config.ws_url = ws_url;
  devtools_service_ = std::make_shared<hippy::devtools::DevtoolsBackendService>(devtools_config, worker_manager);
  devtools_service_->Create();
  runtime_adapter_ = std::make_shared<HippyRuntimeAdapter>();
}

void DevtoolsDataSource::Bind(int32_t runtime_id, uint32_t dom_id, int32_t render_id) {
  hippy_dom_ = std::make_shared<HippyDomData>();
  hippy_dom_->dom_id = dom_id;
  auto data_provider = devtools_service_->GetDataProvider();
  data_provider->dom_tree_adapter = std::make_shared<HippyDomTreeAdapter>(hippy_dom_);
  data_provider->screen_adapter = std::make_shared<HippyScreenAdapter>(hippy_dom_);
  data_provider->tracing_adapter = std::make_shared<HippyTracingAdapter>();
  data_provider->runtime_adapter = runtime_adapter_;
  FOOTSTONE_DLOG(INFO) << "TDF_Backend DevtoolsDataSource data_provider:%p" << &devtools_service_;
}

void DevtoolsDataSource::Destroy(bool is_reload) {
  devtools_service_->Destroy(is_reload);

  std::function func = [WEAK_THIS] {
    DEFINE_AND_CHECK_SELF(DevtoolsDataSource)
    self->RemoveRootNodeListener(self->hippy_dom_->root_node);
  };
  DevToolsUtil::PostDomTask(hippy_dom_->dom_id, func);
}

void DevtoolsDataSource::SetRuntimeDebugMode(bool debug_mode) {
  if (runtime_adapter_) {
    runtime_adapter_->SetDebugMode(debug_mode);
  }
}

void DevtoolsDataSource::SetContextName(const std::string& context_name) {
  devtools_service_->GetNotificationCenter()->runtime_notification->UpdateContextName(context_name);
}

void DevtoolsDataSource::SetVmRequestHandler(HippyVmRequestAdapter::VmRequestHandler request_handler) {
  devtools_service_->GetDataProvider()->vm_request_adapter = std::make_shared<HippyVmRequestAdapter>(request_handler);
}

void DevtoolsDataSource::SetRootNode(std::weak_ptr<RootNode> weak_root_node) {
  hippy_dom_->root_node = weak_root_node;

  std::function func = [weak_root_node, WEAK_THIS] {
    DEFINE_AND_CHECK_SELF(DevtoolsDataSource)
    self->AddRootNodeListener(weak_root_node);
  };
  DevToolsUtil::PostDomTask(hippy_dom_->dom_id, func);
}

void DevtoolsDataSource::AddRootNodeListener(std::weak_ptr<RootNode> weak_root_node) {
  listener_id_ = hippy::dom::FetchListenerId();
  auto dom_manager = DomManager::Find(hippy_dom_->dom_id);
  auto root_node = weak_root_node.lock();
  if (dom_manager && root_node) {
    dom_manager->AddEventListener(weak_root_node, hippy_dom_->dom_id, kDomTreeUpdated,
                                  listener_id_, true, [WEAK_THIS](const std::shared_ptr<DomEvent> &event) {
          DEFINE_AND_CHECK_SELF(DevtoolsDataSource)
          self->devtools_service_->GetNotificationCenter()->dom_tree_notification->NotifyDocumentUpdate();
        });
  }
}

void DevtoolsDataSource::RemoveRootNodeListener(std::weak_ptr<RootNode> weak_root_node) {
  auto dom_manager = DomManager::Find(hippy_dom_->dom_id);
  auto root_node = weak_root_node.lock();
  if (dom_manager && root_node) {
    dom_manager->RemoveEventListener(root_node, root_node->GetId(), kDomTreeUpdated, listener_id_);
  }
}

#if defined(JS_V8) && !defined(V8_WITHOUT_INSPECTOR)
void DevtoolsDataSource::OnGlobalTracingControlGenerate(v8::platform::tracing::TracingController* tracingControl) {
  TraceControl::GetInstance().SetGlobalTracingController(tracingControl);
}

void DevtoolsDataSource::SetFileCacheDir(const std::string& file_dir) {
  TraceControl::GetInstance().SetFileCacheDir(file_dir);
}

void DevtoolsDataSource::SendVmResponse(std::unique_ptr<v8_inspector::StringBuffer> message) {
  SendVmData(message->string());
}

void DevtoolsDataSource::SendVmNotification(std::unique_ptr<v8_inspector::StringBuffer> message) {
  SendVmData(message->string());
}

void DevtoolsDataSource::SendVmData(v8_inspector::StringView string_view) {
  FOOTSTONE_DCHECK(!string_view.is8Bit());
  auto data_chars = reinterpret_cast<const char16_t*>(string_view.characters16());
  auto result = base::StringViewUtils::ToU8StdStr(footstone::stringview::unicode_string_view(data_chars, string_view.length()));
  devtools_service_->GetNotificationCenter()->vm_response_notification->ResponseToFrontend(result);
}
#endif
}  // namespace hippy::devtools
