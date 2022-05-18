//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by  nolantang on 2022/3/31.
//

#include "api/notification/default/default_runtime_notification.h"
#include <string>

constexpr const char* kRuntimeEventUpdateContextInfo = "TDFRuntime.updateContextInfo";

namespace tdf {
namespace devtools {

void DefaultRuntimeNotification::UpdateContextName(const std::string& context_name) {
  nlohmann::json params = nlohmann::json::object();
  params["contextName"] = context_name;
  InspectEvent inspect_event(kRuntimeEventUpdateContextInfo, params.dump());
  if (tunnel_service_) {
    tunnel_service_->SendDataToFrontend(inspect_event.ToJsonString());
  }
}

}  // namespace devtools
}  // namespace tdf
