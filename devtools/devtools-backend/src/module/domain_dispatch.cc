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

#include "module/domain_dispatch.h"
#include "api/devtools_backend_service.h"
#include "api/notification/default/default_network_notification.h"
#include "devtools_base/domain_propos.h"
#include "devtools_base/logging.h"
#include "devtools_base/tdf_string_util.h"
#include "module/domain/css_domain.h"
#include "module/domain/dom_domain.h"
#include "module/domain/network_domain.h"
#include "module/domain/page_domain.h"
#include "module/domain/tdf_common_protocol_domain.h"
#include "module/domain/tdf_inspector_domain.h"
#include "module/domain/tdf_memory_domain.h"
#include "module/domain/tdf_performance_domain.h"
#include "module/domain/tdf_runtime_domain.h"
#include "module/domain_register.h"
#include "module/inspect_props.h"
#include "nlohmann/json.hpp"
#include "tunnel/tunnel_service.h"

namespace hippy::devtools {
constexpr char kDomainDispatchResult[] = "result";
constexpr char kDomainDispatchError[] = "error";
constexpr char kDomainClassSuffix[] = "Domain";

void DomainDispatch::RegisterJSDebuggerDomainListener() {
  auto dom_domain = std::make_shared<DomDomain>(shared_from_this());
  auto css_domain = std::make_shared<CssDomain>(shared_from_this());
  auto page_domain = std::make_shared<PageDomain>(shared_from_this());
  RegisterDomainHandler(dom_domain);
  RegisterDomainHandler(css_domain);
  RegisterDomainHandler(page_domain);
}

void DomainDispatch::RegisterDefaultDomainListener() {
  auto tdf_inspector_domain = std::make_shared<TdfInspectorDomain>(shared_from_this());
  auto tdf_performance_domain = std::make_shared<TdfPerformanceDomain>(shared_from_this());
  auto tdf_memory_domain = std::make_shared<TdfMemoryDomain>(shared_from_this());
  auto tdf_runtime_domain = std::make_shared<TdfRuntimeDomain>(shared_from_this());
  auto tdf_common_protocol_domain = std::make_shared<TdfCommonProtocolDomain>(shared_from_this());
  auto network_domain = std::make_shared<NetworkDomain>(shared_from_this());
  RegisterDomainHandler(tdf_inspector_domain);
  RegisterDomainHandler(tdf_performance_domain);
  RegisterDomainHandler(tdf_memory_domain);
  RegisterDomainHandler(tdf_runtime_domain);
  RegisterDomainHandler(tdf_common_protocol_domain);
  RegisterDomainHandler(network_domain);
  data_channel_->GetNotificationCenter()->network_notification = std::make_shared<DefaultNetworkNotification>(network_domain);
}

void DomainDispatch::RegisterDomainHandler(const std::shared_ptr<BaseDomain>& base_domain) {
  domain_register_map_.insert(
      std::map<std::string, std::shared_ptr<BaseDomain>>::value_type(base_domain->GetDomainName(), base_domain));
  base_domain->RegisterCallback();
  base_domain->RegisterMethods();
}

void DomainDispatch::ClearDomainHandler() { domain_register_map_.clear(); }

bool DomainDispatch::ReceiveDataFromFrontend(const std::string& data_string) {
  BACKEND_LOGD(TDF_BACKEND, "DomainDispatch, receive data from frontend :%s", data_string.c_str());
  nlohmann::json data_json = nlohmann::json::parse(data_string, nullptr, false);
  if (data_json.is_discarded()) {
    BACKEND_LOGE(TDF_BACKEND, "DomainDispatch, parse input json is invalid");
    return false;
  }
  // parse id
  if (!data_json.contains(kFrontendKeyId)) {
    return false;
  }
  auto id = data_json[kFrontendKeyId];

  // parse domain.method
  if (!data_json.contains(kFrontendKeyMethod)) {
    return false;
  }
  std::string domain_param_list = data_json[kFrontendKeyMethod];
  auto index = domain_param_list.find('.');
  if (index == std::string::npos) {
    return false;
  }
  std::string domain = domain_param_list.substr(0, index);
  std::string method = domain_param_list.substr(index + 1);

  // The initial letter of method in the protocol is lowercase, but the initial letter of C + + method name is required
  // to be capitalized, so it needs to be handled here
  std::transform(method.begin(), method.begin() + 1, method.begin(), ::toupper);

  // parse params
  std::string params;
  if (data_json.contains(kFrontendKeyParams)) {
    params = data_json[kFrontendKeyParams].dump();
  }

  auto base_domain = domain_register_map_.find(domain);

  // find domain to handle
  if (base_domain != domain_register_map_.end()) {
    if (base_domain->second->HandleDomainSwitchEvent(id, method)) {
      return true;
    }
    domain = TdfStringUtil::AdaptProtocolName(domain);
    auto handler = DomainRegister::Instance()->GetMethod(domain + kDomainClassSuffix, method);
    if (handler) {
      handler(base_domain->second, id, params);
      return true;
    }
  }
  // if no domain to handle, then find common domain
  auto tdf_common_domain = domain_register_map_.find(kFrontendKeyDomainNameTDF);
  if (domain.find(kFrontendKeyDomainNameTDF) != std::string::npos && tdf_common_domain != domain_register_map_.end()) {
    // put domain.method to pass
    std::static_pointer_cast<TdfCommonProtocolDomain>(tdf_common_domain->second)
        ->ReceiveFromFrontend(id, domain_param_list, params);
    return true;
  }
  return false;
}

void DomainDispatch::DispatchToVm(const std::string& data) {
#ifdef JS_V8
  BACKEND_LOGD(TDF_BACKEND, "JSDebugger, params=%s.", data.c_str());
  // if not in debug mode, then not send msg to v8
  if (!data_channel_->GetProvider()->runtime_adapter->IsDebug()) {
    BACKEND_LOGD(TDF_BACKEND, "not in debug mode, return.");
    return;
  }
  auto vm_request = data_channel_->GetProvider()->vm_request_adapter;
  if (vm_request) {
    vm_request->SendMsgToVm(data);
  }
#endif
}

void DomainDispatch::SendDataToFrontend(int32_t id, bool is_success, const std::string& result) {
  if (result.empty()) {
    BACKEND_LOGE(TDF_BACKEND, "send data to frontend, but msg is empty");
    return;
  }
  nlohmann::json rsp_json = nlohmann::json::object();
  rsp_json[kFrontendKeyId] = id;

  rsp_json[is_success ? kDomainDispatchResult : kDomainDispatchError] = nlohmann::json::parse(result, nullptr, false);
  if (rsp_handler_) {
    rsp_handler_(rsp_json.dump());
  }
}

void DomainDispatch::SendEventToFrontend(InspectEvent&& event) {
  if (rsp_handler_) {
    rsp_handler_(event.ToJsonString());
  }
}
}  // namespace hippy::devtools
