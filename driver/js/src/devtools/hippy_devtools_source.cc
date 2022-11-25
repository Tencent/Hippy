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
#ifdef ENABLE_INSPECTOR
#include "devtools/hippy_devtools_source.h"

#include <utility>

#include "devtools/adapter/hippy_dom_tree_adapter.h"
#include "devtools/adapter/hippy_screen_adapter.h"
#include "devtools/adapter/hippy_tracing_adapter.h"
#include "devtools/adapter/hippy_vm_request_adapter.h"
#include "devtools/devtools_utils.h"
#include "dom/dom_manager.h"
#include "footstone/macros.h"
#include "footstone/string_view_utils.h"

#if defined(JS_V8) && !defined(V8_WITHOUT_INSPECTOR)
#include "devtools/trace_control.h"
#endif

namespace hippy::devtools {

constexpr char kDomTreeUpdated[] = "DomTreeUpdated";
using string_view = footstone::stringview::string_view;
using StringViewUtils = footstone::stringview::StringViewUtils;

static std::atomic<uint32_t> global_devtools_data_key{1};
footstone::utils::PersistentObjectMap<uint32_t, std::shared_ptr<DevtoolsDataSource>> devtools_data_map;

HippyDevtoolsSource::HippyDevtoolsSource(
    const std::string& ws_url,
    std::shared_ptr<footstone::WorkerManager> worker_manager) {
  hippy::devtools::DevtoolsConfig devtools_config;
  devtools_config.framework = hippy::devtools::Framework::kHippy;
  if (!ws_url.empty()) {  // if hava websocket url, then use websocket tunnel first
    devtools_config.tunnel = hippy::devtools::Tunnel::kWebSocket;
    devtools_config.ws_url = ws_url;
  } else {  // empty websocket url, then use tcp tunnel by usb channel
    devtools_config.tunnel = hippy::devtools::Tunnel::kTcp;
  }
  devtools_service_ = std::make_shared<hippy::devtools::DevtoolsBackendService>(devtools_config, worker_manager);
  devtools_service_->Create();
}

void HippyDevtoolsSource::Bind(int32_t runtime_id, uint32_t dom_id, int32_t render_id) {
  hippy_dom_ = std::make_shared<HippyDomData>();
  hippy_dom_->dom_id = dom_id;
  auto data_provider = devtools_service_->GetDataProvider();
  data_provider->dom_tree_adapter = std::make_shared<HippyDomTreeAdapter>(hippy_dom_);
  data_provider->screen_adapter = std::make_shared<HippyScreenAdapter>(hippy_dom_);
  data_provider->tracing_adapter = std::make_shared<HippyTracingAdapter>();
  FOOTSTONE_DLOG(INFO) << "TDF_Backend DevtoolsDataSource Bind data_provider:" << &devtools_service_;
}

void HippyDevtoolsSource::Destroy(bool is_reload) {
  devtools_service_->Destroy(is_reload);

  auto func = [WEAK_THIS] {
    DEFINE_AND_CHECK_SELF(HippyDevtoolsSource)
    self->RemoveRootNodeListener(self->hippy_dom_->root_node);
  };
  DevToolsUtil::PostDomTask(hippy_dom_->dom_id, func);
}

void HippyDevtoolsSource::SetContextName(const std::string& context_name) {
  devtools_service_->GetNotificationCenter()->runtime_notification->UpdateContextName(context_name);
}

void HippyDevtoolsSource::SetVmRequestHandler(VmRequestHandler request_handler) {
  devtools_service_->GetDataProvider()->vm_request_adapter = std::make_shared<HippyVmRequestAdapter>(request_handler);
}

void HippyDevtoolsSource::SetRootNode(std::weak_ptr<RootNode> weak_root_node) {
  hippy_dom_->root_node = weak_root_node;

  auto func = [weak_root_node, WEAK_THIS] {
    DEFINE_AND_CHECK_SELF(HippyDevtoolsSource)
    self->AddRootNodeListener(weak_root_node);
  };
  DevToolsUtil::PostDomTask(hippy_dom_->dom_id, func);
}

void HippyDevtoolsSource::AddRootNodeListener(std::weak_ptr<RootNode> weak_root_node) {
  listener_id_ = hippy::dom::FetchListenerId();
  auto dom_manager = DomManager::Find(hippy_dom_->dom_id);
  auto root_node = weak_root_node.lock();
  if (dom_manager && root_node) {
    dom_manager->AddEventListener(weak_root_node, hippy_dom_->dom_id, kDomTreeUpdated,
                                  listener_id_, true, [WEAK_THIS](const std::shared_ptr<DomEvent> &event) {
          DEFINE_AND_CHECK_SELF(HippyDevtoolsSource)
          self->devtools_service_->GetNotificationCenter()->dom_tree_notification->NotifyDocumentUpdate();
        });
  }
}

void HippyDevtoolsSource::RemoveRootNodeListener(std::weak_ptr<RootNode> weak_root_node) {
  auto dom_manager = DomManager::Find(hippy_dom_->dom_id);
  auto root_node = weak_root_node.lock();
  if (dom_manager && root_node) {
    dom_manager->RemoveEventListener(root_node, root_node->GetId(), kDomTreeUpdated, listener_id_);
  }
}

uint32_t HippyDevtoolsSource::Insert(const std::shared_ptr<DevtoolsDataSource>& devtools_data_source) {
  auto id = global_devtools_data_key.fetch_add(1);
  devtools_data_map.Insert(id, devtools_data_source);
  return id;
}

std::shared_ptr<DevtoolsDataSource> HippyDevtoolsSource::Find(uint32_t id) {
  std::shared_ptr<DevtoolsDataSource> devtools_data_source;
  auto flag = devtools_data_map.Find(id, devtools_data_source);
  FOOTSTONE_CHECK(flag);
  return devtools_data_source;
}

bool HippyDevtoolsSource::Erase(uint32_t id) {
  std::shared_ptr<DevtoolsDataSource> devtools_data_source;
  auto flag = devtools_data_map.Find(id, devtools_data_source);
  if (flag && devtools_data_source) {
    devtools_data_map.Erase(id);
  }
  return flag;
}

#if defined(JS_V8) && !defined(V8_WITHOUT_INSPECTOR)
void HippyDevtoolsSource::OnGlobalTracingControlGenerate(v8::platform::tracing::TracingController* tracingControl) {
  TraceControl::GetInstance().SetGlobalTracingController(tracingControl);
}

void HippyDevtoolsSource::SetFileCacheDir(const std::string& file_dir) {
  TraceControl::GetInstance().SetFileCacheDir(file_dir);
}

void HippyDevtoolsSource::SendVmResponse(std::unique_ptr<v8_inspector::StringBuffer> message) {
  SendVmData(message->string());
}

void HippyDevtoolsSource::SendVmNotification(std::unique_ptr<v8_inspector::StringBuffer> message) {
  SendVmData(message->string());
}

void HippyDevtoolsSource::SendVmData(v8_inspector::StringView string_view) {
  FOOTSTONE_DCHECK(!string_view.is8Bit());
  auto data_chars = reinterpret_cast<const char16_t*>(string_view.characters16());
  auto result = StringViewUtils::ToStdString(StringViewUtils::ConvertEncoding(
      footstone::string_view(data_chars, string_view.length()), string_view::Encoding::Utf8).utf8_value());
  devtools_service_->GetNotificationCenter()->vm_response_notification->ResponseToFrontend(result);
}
#endif
}  // namespace hippy::devtools
#endif
