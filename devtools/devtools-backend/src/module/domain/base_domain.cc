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

namespace tdf {
namespace devtools {

constexpr const char* ERROR_CODE = "code";
constexpr const char* ERROR_MESSAGE = "message";
constexpr const char* METHOD_ENABLE = "Enable";
constexpr const char* METHOD_DISABLE = "Disable";

bool BaseDomain::HandleDomainSwitchEvent(int32_t id, const std::string& method) {
  // 由具体的 domain 子类处理
  if (method == METHOD_ENABLE) {
    ResponseResultToFrontend(id, "{}");
    return true;
  } else if (method == METHOD_DISABLE) {
    ResponseResultToFrontend(id, "{}");
    return true;
  }
  return false;
}

void BaseDomain::ResponseResultToFrontend(int32_t id, const std::string& result) {
  auto dispatch = dispatch_.lock();
  if (dispatch) {
    dispatch->SendDataToFrontend(id, result, {});
  }
}

void BaseDomain::ResponseErrorToFrontend(int32_t id, const int32_t error_code, const std::string& error_msg) {
  std::stringstream sstream;
  sstream << "{\"" << ERROR_CODE << "\":" << error_code << ",\"" << ERROR_MESSAGE << "\":\"" << error_msg << "\"}";
  auto dispatch = dispatch_.lock();
  if (dispatch) {
    dispatch->SendDataToFrontend(id, "", sstream.str());
  }
}

void BaseDomain::SendEventToFrontend(const InspectEvent&& event) {
  auto dispatch = dispatch_.lock();
  if (dispatch) {
    dispatch->SendEventToFrontend(std::move(event));
  }
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

}  // namespace devtools
}  // namespace tdf
