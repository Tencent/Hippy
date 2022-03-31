//
//  Copyright (c) 2021 Tencent Corporation. All rights reserved.
//  Created by thomasyqguo on 2022/1/18.
//

#if TDF_SERVICE_ENABLED

#include "devtools/devtool_data_source.h"

#include <utility>
#ifdef OS_ANDROID
#include "core/runtime/v8/runtime.h"
#endif
#include "devtools/adapter/hippy_dom_tree_adapter.h"
#include "devtools/adapter/hippy_elements_request_adapter.h"
#include "devtools/adapter/hippy_screen_adapter.h"
#include "devtools/adapter/hippy_tracing_adapter.h"
#include "devtools/adapter/hippy_v8_request_adapter.h"
#include "devtools/trace_control.h"
#include "dom/dom_manager.h"

namespace hippy {
namespace devtools {
std::vector<std::weak_ptr<tdf::devtools::DevtoolsBackendService>> DevtoolDataSource::all_services{};
using tdf::devtools::DevtoolsBackendService;

DevtoolDataSource::DevtoolDataSource(std::string ws_url) {
  tdf::devtools::DevtoolsConfig devtools_config;
  devtools_config.framework = tdf::devtools::Framework::kHippy;
  devtools_config.tunnel = tdf::devtools::Tunnel::kWebSocket;
  devtools_config.ws_url = std::move(ws_url); //"ws://localhost:38989/debugger-proxy?role=android_client&clientId=1&contextName=Demo";
  devtools_service_ = std::make_shared<tdf::devtools::DevtoolsBackendService>(devtools_config);
  all_services.push_back(devtools_service_);
}

void DevtoolDataSource::Bind(int32_t runtime_id, int32_t dom_id, int32_t render_id) {
  dom_id_ = dom_id;
  runtime_id_ = runtime_id;
  auto data_provider = devtools_service_->GetDataProvider();
  std::shared_ptr<HippyDomTreeAdapter> domTreeAdapter = std::make_shared<HippyDomTreeAdapter>(dom_id_);
  data_provider->SetDomTreeAdapter(domTreeAdapter);
  data_provider->SetElementsRequestAdapter(std::make_shared<HippyElementsRequestAdapter>(dom_id_));
  data_provider->SetTracingAdapter(std::make_shared<HippyTracingAdapter>());
  runtime_adapter_ = std::make_shared<HippyRuntimeAdapter>(runtime_id_);
  data_provider->SetRuntimeAdapter(runtime_adapter_);
  data_provider->SetScreenAdapter(std::make_shared<HippyScreenAdapter>(dom_id_));
  TDF_BASE_DLOG(INFO) << "DevtoolDataSource data_provider:%p" << &devtools_service_;
}

void DevtoolDataSource::Destroy(bool is_reload) {
  devtools_service_->Destroy(is_reload);
}

void DevtoolDataSource::SetContextName(const std::string &context_name) {
  devtools_service_->GetNotificationCenter()->GetRuntimeNotification()->UpdateContextName(context_name);
}

void DevtoolDataSource::SetV8RequestHandler(HippyV8RequestAdapter::V8RequestHandler request_handler) {
  devtools_service_->GetDataProvider()->SetV8RequestAdapter(std::make_shared<HippyV8RequestAdapter>(request_handler));
}

void DevtoolDataSource::SendV8Response(std::string data) {
  for (auto& devtools_service : all_services) {
    auto service = devtools_service.lock();
    if (service) {
      service->GetNotificationCenter()->GetV8ResponseAdapter()->SendResponseFromV8(data);
    }
  }
}

#ifdef OS_ANDROID
void DevtoolDataSource::OnGlobalTracingControlGenerate(v8::platform::tracing::TracingController *tracingControl) {
  TraceControl::GetInstance().SetGlobalTracingController(tracingControl);
}

void DevtoolDataSource::SetFileCacheDir(std::string file_dir) {
  TraceControl::GetInstance().SetFileCacheDir(file_dir);
}
#endif

void DevtoolDataSource::SetRuntimeAdapterDebugMode(bool debug_mode) {
  if (runtime_adapter_) {
    runtime_adapter_->SetDebugMode(debug_mode);
  }
}

}  // namespace devtools
}  // namespace hippy

#endif
