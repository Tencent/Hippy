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

#include "module/domain/tdf_runtime_domain.h"
#include "api/devtools_backend_service.h"
#include "module/domain_register.h"

namespace hippy::devtools {
constexpr const char kCmdChromeSocketClose[] = "chrome_socket_closed";

std::string TdfRuntimeDomain::GetDomainName() { return kFrontendKeyDomainNameTDFRuntime; }

void TdfRuntimeDomain::RegisterMethods() {
  REGISTER_DOMAIN(TdfRuntimeDomain, Resume, BaseRequest)
  REGISTER_DOMAIN(TdfRuntimeDomain, IsDebugMode, BaseRequest)
}

void TdfRuntimeDomain::RegisterCallback() {}

void TdfRuntimeDomain::Resume(const BaseRequest& request) {
#if defined(JS_V8) && !defined(V8_WITHOUT_INSPECTOR)
  if (!GetDataProvider()->runtime_adapter->IsDebug()) {
    BACKEND_LOGD(TDF_BACKEND, "not in debug mode, return.");
    return;  // don't send msg to v8 if not debug mode
  }
  auto vm_request = GetDataProvider()->vm_request_adapter;
  if (vm_request) {
    vm_request->SendMsgToVm(kCmdChromeSocketClose);
  }
#endif
}

void TdfRuntimeDomain::IsDebugMode(const BaseRequest& request) {
  bool is_debug = GetDataProvider()->runtime_adapter->IsDebug();
  nlohmann::json result_json = nlohmann::json::object();
  result_json["isDebugMode"] = is_debug ? 1 : 0;
  ResponseResultToFrontend(request.GetId(), result_json.dump());
}
}  // namespace hippy::devtools
