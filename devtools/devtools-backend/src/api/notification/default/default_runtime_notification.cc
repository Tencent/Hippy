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

#include "api/notification/default/default_runtime_notification.h"
#include <string>

constexpr char kRuntimeEventUpdateContextInfo[] = "TDFRuntime.updateContextInfo";

namespace hippy::devtools {

void DefaultRuntimeNotification::UpdateContextName(const std::string& context_name) {
  nlohmann::json params = nlohmann::json::object();
  params["contextName"] = context_name;
  InspectEvent inspect_event(kRuntimeEventUpdateContextInfo, params.dump());
  if (tunnel_service_) {
    tunnel_service_->SendDataToFrontend(inspect_event.ToJsonString());
  }
}

}  // namespace devtools::devtools
