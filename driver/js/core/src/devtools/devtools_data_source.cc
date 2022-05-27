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
#include "devtools/adapter/hippy_elements_request_adapter.h"
#include "devtools/adapter/hippy_screen_adapter.h"
#include "devtools/adapter/hippy_tracing_adapter.h"
#include "devtools/adapter/hippy_vm_request_adapter.h"
#include "dom/dom_manager.h"

#ifdef JS_V8
#include "core/base/string_view_utils.h"
#include "devtools/trace_control.h"
#endif

namespace hippy::devtools {

DevtoolsDataSource::DevtoolsDataSource(const std::string& ws_url) {
  hippy::devtools::DevtoolsConfig devtools_config;
  devtools_config.framework = hippy::devtools::Framework::kHippy;
  devtools_config.tunnel = hippy::devtools::Tunnel::kWebSocket;
  devtools_config.ws_url = ws_url;
  devtools_service_ = std::make_shared<hippy::devtools::DevtoolsBackendService>(devtools_config);
  devtools_service_->Create();
  runtime_adapter_ = std::make_shared<HippyRuntimeAdapter>();
}

void DevtoolsDataSource::Bind(int32_t runtime_id, int32_t dom_id, int32_t render_id) {
  dom_id_ = dom_id;
  runtime_id_ = runtime_id;
  auto data_provider = devtools_service_->GetDataProvider();
  std::shared_ptr<HippyDomTreeAdapter> dom_tree_adapter = std::make_shared<HippyDomTreeAdapter>(dom_id_);
  data_provider->dom_tree_adapter = dom_tree_adapter;
  data_provider->elements_request_adapter = std::make_shared<HippyElementsRequestAdapter>(dom_id_);
  data_provider->tracing_adapter = std::make_shared<HippyTracingAdapter>();
  data_provider->screen_adapter = std::make_shared<HippyScreenAdapter>(dom_id_);
  data_provider->runtime_adapter = runtime_adapter_;
  TDF_BASE_DLOG(INFO) << "DevtoolsDataSource data_provider:%p" << &devtools_service_;
}

void DevtoolsDataSource::Destroy(bool is_reload) {
  devtools_service_->Destroy(is_reload);
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

#ifdef JS_V8
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
  TDF_BASE_DCHECK(!string_view.is8Bit());
  auto data_chars = reinterpret_cast<const char16_t*>(string_view.characters16());
  auto result = base::StringViewUtils::ToU8StdStr(tdf::base::unicode_string_view(data_chars, string_view.length()));
  devtools_service_->GetNotificationCenter()->vm_response_notification->ResponseToFrontend(result);
}
#endif
}  // namespace hippy::devtools
