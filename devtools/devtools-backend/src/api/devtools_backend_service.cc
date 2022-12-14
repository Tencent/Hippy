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

#include "api/devtools_backend_service.h"
#include "api/notification/default/default_network_notification.h"
#include "api/notification/default/default_runtime_notification.h"
#include "api/notification/default/default_vm_response_notification.h"
#include "footstone/logging.h"
#include "footstone/macros.h"
#include "module/domain_dispatch.h"
#include "tunnel/tunnel_service.h"

namespace hippy::devtools {
DevtoolsBackendService::DevtoolsBackendService(const DevtoolsConfig& devtools_config,
                                               std::shared_ptr<footstone::WorkerManager> worker_manager) {
  FOOTSTONE_DLOG(INFO) << kDevToolsTag << "DevtoolsBackendService create framework:" << devtools_config.framework
                       << ",tunnel:" << devtools_config.tunnel;
  auto data_provider = std::make_shared<DataProvider>();
  auto notification_center = std::make_shared<NotificationCenter>();
  data_channel_ = std::make_shared<DataChannel>(data_provider, notification_center);
  domain_dispatch_ = std::make_shared<DomainDispatch>(data_channel_, worker_manager);
  domain_dispatch_->RegisterDefaultDomainListener();
  tunnel_service_ = std::make_shared<TunnelService>(domain_dispatch_, devtools_config);
  tunnel_service_->Connect();
  notification_center->runtime_notification = std::make_shared<DefaultRuntimeNotification>(tunnel_service_);

  if (devtools_config.framework == Framework::kHippy) {
    domain_dispatch_->RegisterJSDebuggerDomainListener();
  }
}

DevtoolsBackendService::~DevtoolsBackendService() { FOOTSTONE_DLOG(INFO) << kDevToolsTag << "~DevtoolsBackendService"; }

void DevtoolsBackendService::Create() {
#if defined(JS_V8) && !defined(V8_WITHOUT_INSPECTOR)
  data_channel_->GetNotificationCenter()->vm_response_notification =
      std::make_shared<DefaultVmResponseAdapter>([WEAK_THIS](const std::string& data) {
        DEFINE_AND_CHECK_SELF(DevtoolsBackendService)
        self->tunnel_service_->SendDataToFrontend(data);
      });
#endif
}

void DevtoolsBackendService::Destroy(bool is_reload) {
  FOOTSTONE_DLOG(INFO) << kDevToolsTag << "Destroy is_reload: %d" << is_reload;
  tunnel_service_->Close(is_reload);
  domain_dispatch_->ClearDomainHandler();
}
}  // namespace hippy::devtools
