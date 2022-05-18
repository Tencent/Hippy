//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#include "api/devtools_backend_service.h"
#include <sstream>
#include <utility>
#include "api/notification/default/default_log_notification.h"
#include "api/notification/default/default_network_notification.h"
#include "api/notification/default/default_runtime_notification.h"
#include "api/notification/default/default_v8_response_notification.h"
#include "devtools_base/common/worker_pool.h"
#include "devtools_base/logging.h"
#include "module/domain_dispatch.h"
#include "tunnel/channel_factory.h"
#include "tunnel/tunnel_service.h"

namespace tdf {
namespace devtools {

static constexpr const char *kDevtoolsTaskName = "devToolsTask";

DevtoolsBackendService::DevtoolsBackendService(const DevtoolsConfig &devtools_config) {
  BACKEND_LOGI(TDF_BACKEND, "DevtoolsBackendService create framework:%d,tunnel:%d",
               devtools_config.framework, devtools_config.tunnel);
  task_runner_ = worker_pool_->CreateTaskRunner(kDevtoolsTaskName, true);
  auto data_provider = std::make_shared<DataProvider>();
  auto notification_center = std::make_shared<NotificationCenter>();
  data_channel_ = std::make_shared<DataChannel>(data_provider, notification_center);
  domain_dispatch_ = std::make_shared<DomainDispatch>(data_channel_);
  domain_dispatch_->RegisterDefaultDomainListener();
  tunnel_service_ = std::make_shared<TunnelService>(domain_dispatch_, devtools_config);
  notification_center->SetNetworkNotification(std::make_shared<DefaultNetworkNotification>(tunnel_service_));
  notification_center->SetRuntimeNotification(std::make_shared<DefaultRuntimeNotification>(tunnel_service_));

  RegisterLogCallback();
  if (devtools_config.framework == Framework::kHippy) {
    domain_dispatch_->RegisterJSDebuggerDomainListener();
    RegisterJSDebuggerCallback();
  }
}

DevtoolsBackendService::~DevtoolsBackendService() {
  // work_pool里面的线程析构之前，必须先要 Terminate
  worker_pool_->Terminate();
}

void DevtoolsBackendService::Destroy(bool is_reload) {
  tunnel_service_->Close(is_reload);
}

void DevtoolsBackendService::RegisterLogCallback() {
  // 设置 Backend 的日志输出到 RecordLogger
  Logger::RegisterCallback([this](LoggerModel logger_model) {
    record_logger_->RecordLogData(std::move(logger_model));
  });
  // 设置 Adapter 的日志输出到 RecordLogger
  auto log_handler = [this](const LoggerModel &logger_model) {
    task_runner_->PostTask([this, logger_model]() { record_logger_->RecordLogData(logger_model); });
  };
  data_channel_->GetNotificationCenter()->SetLogNotification(std::make_shared<DefaultLogAdapter>(
      log_handler));
  // 设置 RecordLogger 的日志桥接到 Frontend
  record_logger_->SetRecordLogOperateCallback([this](std::string &&log) {
//    InspectEvent inspect_event(kLogEventName, std::move(log));
//    tunnel_service_->SendDataToFrontend(inspect_event.ToJsonString());
  });
}

void DevtoolsBackendService::RegisterJSDebuggerCallback() {
#ifdef OS_ANDROID
  auto response_handler =
      [this](const std::string &data) { tunnel_service_->SendDataToFrontend(data); };
  data_channel_->GetNotificationCenter()->SetV8ResponseNotification(
      std::make_shared<DefaultV8ResponseAdapter>(response_handler));
#endif
}
}  // namespace devtools
}  // namespace tdf
