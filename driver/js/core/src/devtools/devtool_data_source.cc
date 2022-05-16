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

#if TDF_SERVICE_ENABLED

#include "devtools/devtools_data_source.h"

#include <utility>
#ifdef JS_ENGINE_V8
#include "core/runtime/v8/runtime.h"
#include "devtools/trace_control.h"
#endif
#include "devtools/adapter/hippy_dom_tree_adapter.h"
#include "devtools/adapter/hippy_elements_request_adapter.h"
#include "devtools/adapter/hippy_screen_adapter.h"
#include "devtools/adapter/hippy_tracing_adapter.h"
#include "devtools/adapter/hippy_vm_request_adapter.h"
#include "dom/dom_manager.h"

namespace hippy {
namespace devtools {
std::vector<std::weak_ptr<hippy::devtools::DevtoolsBackendService>> DevtoolDataSource::all_services{};
using hippy::devtools::DevtoolsBackendService;

DevtoolDataSource::DevtoolDataSource(const std::string& ws_url) {
  hippy::devtools::DevtoolsConfig devtools_config;
  devtools_config.framework = hippy::devtools::Framework::kHippy;
  devtools_config.tunnel = hippy::devtools::Tunnel::kTcp;
  devtools_config.ws_url = ws_url;
  devtools_service_ = std::make_shared<hippy::devtools::DevtoolsBackendService>(devtools_config);
  all_services.push_back(devtools_service_);
  runtime_adapter_ = std::make_shared<HippyRuntimeAdapter>();
}

void DevtoolDataSource::Bind(int32_t runtime_id, int32_t dom_id, int32_t render_id) {
  dom_id_ = dom_id;
  runtime_id_ = runtime_id;
  auto data_provider = devtools_service_->GetDataProvider();
  std::shared_ptr<HippyDomTreeAdapter> domTreeAdapter = std::make_shared<HippyDomTreeAdapter>(dom_id_);
  data_provider->dom_tree_adapter = domTreeAdapter;
  data_provider->elements_request_adapter = std::make_shared<HippyElementsRequestAdapter>(dom_id_);
  data_provider->tracing_adapter = std::make_shared<HippyTracingAdapter>();
  data_provider->screen_adapter = std::make_shared<HippyScreenAdapter>(dom_id_);
  data_provider->runtime_adapter = runtime_adapter_;
  TDF_BASE_DLOG(INFO) << "DevtoolDataSource data_provider:%p" << &devtools_service_;
}

void DevtoolDataSource::Destroy(bool is_reload) {
  devtools_service_->Destroy(is_reload);
}

void DevtoolDataSource::SetContextName(const std::string &context_name) {
  devtools_service_->GetNotificationCenter()->runtime_notification->UpdateContextName(context_name);
}

void DevtoolDataSource::SetVmRequestHandler(HippyVmRequestAdapter::VmRequestHandler request_handler) {
  devtools_service_->GetDataProvider()->vm_request_adapter = std::make_shared<HippyVmRequestAdapter>(request_handler);
}

void DevtoolDataSource::SendVmResponse(const std::string& data) {
  for (auto& devtools_service : all_services) {
    auto service = devtools_service.lock();
    if (service) {
      service->GetNotificationCenter()->vm_response_notification->ResponseToFrontend(data);
    }
  }
}

#ifdef JS_ENGINE_V8
void DevtoolDataSource::OnGlobalTracingControlGenerate(v8::platform::tracing::TracingController *tracingControl) {
  TraceControl::GetInstance().SetGlobalTracingController(tracingControl);
}

void DevtoolDataSource::SetFileCacheDir(const std::string& file_dir) {
  TraceControl::GetInstance().SetFileCacheDir(file_dir);
}
#endif

void DevtoolDataSource::SetRuntimeDebugMode(bool debug_mode) {
  if (runtime_adapter_) {
    runtime_adapter_->SetDebugMode(debug_mode);
  }
}
}  // namespace devtools
}  // namespace hippy

#endif
