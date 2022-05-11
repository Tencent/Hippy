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

#include "module/domain/base_domain.h"
#include <sstream>
#include "module/domain_dispatch.h"

namespace hippy::devtools {

constexpr char kErrorCode[] = "code";
constexpr char kErrorMessage[] = "message";
constexpr char kMethodEnable[] = "Enable";
constexpr char kMethodDisable[] = "Disable";

bool BaseDomain::HandleDomainSwitchEvent(int32_t id, const std::string& method) {
  // handle Domain.disable and Domain.disable, then others will be handled by child domain
  if (method == kMethodEnable || method == kMethodDisable) {
    ResponseResultToFrontend(id, "{}");
    return true;
  }
  return false;
}

void BaseDomain::ResponseResultToFrontend(int32_t id, const std::string& result) {
  auto dispatch = dispatch_.lock();
  if (!dispatch) {
    return;
  }
  dispatch->SendDataToFrontend(id, result, {});
}

void BaseDomain::ResponseErrorToFrontend(int32_t id, const int32_t error_code, const std::string& error_msg) {
  auto dispatch = dispatch_.lock();
  if (!dispatch) {
    return;
  }
  std::string msg_string = "{\"";
  msg_string += kErrorCode;
  msg_string += "\":";
  msg_string += std::to_string(error_code);
  msg_string += ",\"";
  msg_string += kErrorMessage;
  msg_string += "\":\"";
  msg_string += error_msg;
  msg_string += "\"}";
  dispatch->SendDataToFrontend(id, "", msg_string);
}

void BaseDomain::SendEventToFrontend(InspectEvent&& event) {
  auto dispatch = dispatch_.lock();
  if (!dispatch) {
    return;
  }
  dispatch->SendEventToFrontend(std::move(event));
}

std::shared_ptr<DataProvider> BaseDomain::GetDataProvider() {
  auto domain_dispatch = dispatch_.lock();
  if (!domain_dispatch) {
    return nullptr;
  }
  return domain_dispatch->GetDataChannel()->GetProvider();
}

std::shared_ptr<NotificationCenter> BaseDomain::GetNotificationCenter() {
  auto domain_dispatch = dispatch_.lock();
  if (!domain_dispatch) {
    return nullptr;
  }
  return domain_dispatch->GetDataChannel()->GetNotificationCenter();
}

}  // namespace hippy::devtools
