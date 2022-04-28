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

std::string_view TDFRuntimeDomain::GetDomainName() { return kFrontendKeyDomainNameTDFRuntime; }

void TDFRuntimeDomain::RegisterMethods() {
  REGISTER_DOMAIN(TDFRuntimeDomain, Resume, Deserializer);
  REGISTER_DOMAIN(TDFRuntimeDomain, IsDebugMode, Deserializer);
}

void TDFRuntimeDomain::Resume(const Deserializer& request) {
  // 恢复js debugger的断点调试
#ifdef OS_ANDROID
  std::string data = "chrome_socket_closed";
  // 非Debug模式，不把消息发给V8
  if (!GetDataProvider()->runtime_adapter->IsDebug()) {
    BACKEND_LOGD(TDF_BACKEND, "Not debug mode, return.");
    return;
  }
  auto v8_request = GetDataProvider()->vm_request_adapter;
  if (v8_request) {
    v8_request->SendMsgToVM(data, nullptr);
  }
#endif
}

void TDFRuntimeDomain::IsDebugMode(const Deserializer& request) {
  bool isDebug = GetDataProvider()->runtime_adapter->IsDebug();
  nlohmann::json result_json = nlohmann::json::object();
  result_json["isDebugMode"] = isDebug ? 1 : 0;
  ResponseResultToFrontend(request.GetId(), result_json.dump());
}

}  // namespace hippy::devtools
