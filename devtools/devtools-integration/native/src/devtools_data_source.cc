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

#include "devtools/adapter/hippy_dom_tree_adapter.h"
#include "devtools/adapter/hippy_screen_adapter.h"
#include "devtools/adapter/hippy_tracing_adapter.h"
#include "devtools/adapter/hippy_vm_request_adapter.h"
#include "devtools/devtools_utils.h"
#include "dom/dom_manager.h"
#include "footstone/macros.h"
#include "footstone/string_view_utils.h"

#if defined(JS_V8) && !defined(V8_WITHOUT_INSPECTOR)
#include "devtools/v8/trace_control.h"
#endif

namespace hippy::devtools {

constexpr char kDomTreeUpdated[] = "DomTreeUpdated";
using string_view = footstone::stringview::string_view;
using StringViewUtils = footstone::stringview::StringViewUtils;

static std::atomic<uint32_t> global_devtools_data_key{1};
footstone::utils::PersistentObjectMap<uint32_t, std::shared_ptr<DevtoolsDataSource>> devtools_data_map;

void DevtoolsDataSource::CreateDevtoolsService(const std::string& ws_url,
                                       std::shared_ptr<footstone::WorkerManager> worker_manager) {
  hippy::devtools::DevtoolsConfig devtools_config;
  devtools_config.framework = hippy::devtools::Framework::kHippy;
  if (!ws_url.empty()) {  // if hava websocket url, then use websocket tunnel first
    devtools_config.tunnel = hippy::devtools::Tunnel::kWebSocket;
    devtools_config.ws_url = ws_url;
  } else {  // empty websocket url, then use tcp tunnel by usb channel
    devtools_config.tunnel = hippy::devtools::Tunnel::kTcp;
  }
  auto reconnect_handler = [WEAK_THIS] {
    DEFINE_AND_CHECK_SELF(DevtoolsDataSource)
    self->SetContextName(self->context_name_);
  };
  devtools_service_ = std::make_shared<hippy::devtools::DevtoolsBackendService>(devtools_config, worker_manager, reconnect_handler);
  devtools_service_->Create();
  hippy_dom_ = std::make_shared<HippyDomData>();
}

void DevtoolsDataSource::Bind(const std::weak_ptr<DomManager>& dom_manager) {
  hippy_dom_->dom_manager = dom_manager;
  auto data_provider = GetDataProvider();
  data_provider->dom_tree_adapter = std::make_shared<HippyDomTreeAdapter>(hippy_dom_);
  data_provider->screen_adapter = std::make_shared<HippyScreenAdapter>(hippy_dom_);
  data_provider->tracing_adapter = std::make_shared<HippyTracingAdapter>();
  FOOTSTONE_DLOG(INFO) << kDevToolsTag << "DevtoolsDataSource Bind dom";
}

void DevtoolsDataSource::Destroy(bool is_reload) {
  devtools_service_->Destroy(is_reload);

  auto func = [WEAK_THIS] {
    DEFINE_AND_CHECK_SELF(DevtoolsDataSource)
    self->RemoveRootNodeListener(self->hippy_dom_->root_node);
  };
  DevToolsUtil::PostDomTask(hippy_dom_->dom_manager, func);
}

void DevtoolsDataSource::SetContextName(const std::string& context_name) {
  context_name_ = context_name;
  GetNotificationCenter()->runtime_notification->UpdateContextName(context_name);
}

void DevtoolsDataSource::SetVmRequestHandler(HippyVmRequestAdapter::VmRequestHandler request_handler) {
  GetDataProvider()->vm_request_adapter = std::make_shared<HippyVmRequestAdapter>(request_handler);
}

void DevtoolsDataSource::SetRootNode(const std::weak_ptr<RootNode>& weak_root_node) {
  hippy_dom_->root_node = weak_root_node;
  auto func = [weak_root_node, WEAK_THIS] {
    DEFINE_AND_CHECK_SELF(DevtoolsDataSource)
    // add root node listen for dom tree update
    self->AddRootNodeListener(weak_root_node);
  };
  DevToolsUtil::PostDomTask(hippy_dom_->dom_manager, func);
}

void DevtoolsDataSource::AddRootNodeListener(const std::weak_ptr<RootNode>& weak_root_node) {
  listener_id_ = hippy::dom::FetchListenerId();
  auto dom_manager = hippy_dom_->dom_manager.lock();
  auto root_node = weak_root_node.lock();
  if (dom_manager && root_node) {
    dom_manager->AddEventListener(
        root_node, root_node->GetId(), kDomTreeUpdated, listener_id_, true,
        [WEAK_THIS](const std::shared_ptr<DomEvent>& event) {
          DEFINE_AND_CHECK_SELF(DevtoolsDataSource)
          self->GetNotificationCenter()->dom_tree_notification->NotifyDocumentUpdate();
        });
  }
}

void DevtoolsDataSource::RemoveRootNodeListener(const std::weak_ptr<RootNode>& weak_root_node) {
  auto dom_manager = hippy_dom_->dom_manager.lock();
  auto root_node = weak_root_node.lock();
  if (dom_manager && root_node) {
    dom_manager->RemoveEventListener(root_node, root_node->GetId(), kDomTreeUpdated, listener_id_);
  }
}

uint32_t DevtoolsDataSource::Insert(const std::shared_ptr<DevtoolsDataSource>& devtools_data_source) {
  auto id = global_devtools_data_key.fetch_add(1);
  devtools_data_map.Insert(id, devtools_data_source);
  return id;
}

std::shared_ptr<DevtoolsDataSource> DevtoolsDataSource::Find(uint32_t id) {
  std::shared_ptr<DevtoolsDataSource> devtools_data_source;
  auto flag = devtools_data_map.Find(id, devtools_data_source);
  FOOTSTONE_CHECK(flag);
  return devtools_data_source;
}

bool DevtoolsDataSource::Erase(uint32_t id) {
  std::shared_ptr<DevtoolsDataSource> devtools_data_source;
  auto flag = devtools_data_map.Find(id, devtools_data_source);
  if (flag && devtools_data_source) {
    devtools_data_map.Erase(id);
  }
  return flag;
}

void DevtoolsDataSource::SetFileCacheDir(const std::string &file_dir) {
#ifdef JS_V8
  TraceControl::GetInstance().SetFileCacheDir(file_dir);
#endif
}

#if defined(JS_V8) && !defined(V8_WITHOUT_INSPECTOR)
void DevtoolsDataSource::OnGlobalTracingControlGenerate(v8::platform::tracing::TracingController* tracingControl) {
  TraceControl::GetInstance().SetGlobalTracingController(tracingControl);
}

void DevtoolsDataSource::SendVmResponse(std::unique_ptr<v8_inspector::StringBuffer> message) {
  // receive vm method response to frontend
  SendVmData(message->string());
}

void DevtoolsDataSource::SendVmNotification(std::unique_ptr<v8_inspector::StringBuffer> message) {
  // receive vm event notification to frontend
  SendVmData(message->string());
}

void DevtoolsDataSource::SendVmData(v8_inspector::StringView string_view) {
  FOOTSTONE_DCHECK(!string_view.is8Bit());
  auto data_chars = reinterpret_cast<const char16_t*>(string_view.characters16());
  auto result = StringViewUtils::ToStdString(
      StringViewUtils::ConvertEncoding(footstone::string_view(data_chars, string_view.length()),
                                       string_view::Encoding::Utf8)
          .utf8_value());
  GetNotificationCenter()->vm_response_notification->ResponseToFrontend(result);
}
#endif
}  // namespace hippy::devtools
