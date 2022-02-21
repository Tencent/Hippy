//
//  Copyright (c) 2021 Tencent Corporation. All rights reserved.
//  Created by thomasyqguo on 2022/1/18.
//

#if TDF_SERVICE_ENABLED

#include "devtools/devtool_data_source.h"
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

using tdf::devtools::DevtoolsBackendService;
void DevtoolDataSource::SetV8RequestHandler(HippyV8RequestAdapter::V8RequestHandler request_handler) {
  auto data_channel = DevtoolsBackendService::GetInstance().GetDataChannel();
  data_channel->GetProvider()->SetV8RequestAdapter(std::make_shared<HippyV8RequestAdapter>(request_handler));
}

void DevtoolDataSource::SendV8Response(std::string data) {
  auto data_channel = DevtoolsBackendService::GetInstance().GetDataChannel();
  data_channel->GetResponse()->GetV8ResponseAdapter()->SendResponseFromV8(data);
}

void DevtoolDataSource::SetNeedNotifyBatchEvent(bool need_notify_batch_event) {
  auto data_channel = DevtoolsBackendService::GetInstance().GetDataChannel();
  data_channel->GetResponse()->GetElementsResponseAdapter()->SetNeedNotifyBatchEvent(need_notify_batch_event);
}

void DevtoolDataSource::NotifyDocumentUpdate() {
  auto data_channel = DevtoolsBackendService::GetInstance().GetDataChannel();
  data_channel->GetResponse()->GetElementsResponseAdapter()->NotifyDocumentUpdate();
}

#ifdef OS_ANDROID
void DevtoolDataSource::OnGlobalTracingControlGenerate(v8::platform::tracing::TracingController *tracingControl) {
  TraceControl::GetInstance().SetGlobalTracingController(tracingControl);
}
#endif

void DevtoolDataSource::Bind(int32_t dom_id, int32_t runtime_id) {
  dom_id_ = dom_id;
  runtime_id_ = runtime_id;
  auto data_channel = DevtoolsBackendService::GetInstance().GetDataChannel();
  std::shared_ptr<HippyDomTreeAdapter> domTreeAdapter = std::make_shared<HippyDomTreeAdapter>(dom_id_);
  data_channel->GetProvider()->SetDomTreeAdapter(domTreeAdapter);
  data_channel->GetProvider()->SetElementsRequestAdapter(std::make_shared<HippyElementsRequestAdapter>(dom_id_));
  data_channel->GetProvider()->SetTracingAdapter(std::make_shared<HippyTracingAdapter>());
  runtime_adapter_ = std::make_shared<HippyRuntimeAdapter>(runtime_id_);
  data_channel->GetProvider()->SetRuntimeAdapter(runtime_adapter_);
  data_channel->GetProvider()->SetScreenAdapter(std::make_shared<HippyScreenAdapter>(dom_id_));
  DevtoolsBackendService::GetInstance().EnableService();
  TDF_BASE_DLOG(INFO) << "DevtoolDataSource data_channel:%p" << &data_channel;
}

void DevtoolDataSource::SetRuntimeAdapterDebugMode(bool debug_mode) {
  if (runtime_adapter_) {
    runtime_adapter_->SetDebugMode(debug_mode);
  }
}

}  // namespace devtools
}  // namespace hippy

#endif
