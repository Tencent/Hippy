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
#include "devtools_base/logging.h"
#include <regex>
#include "api/devtools_backend_service.h"
#include "devtools_base/domain_propos.h"
#include "module/domain/css_domain.h"
#include "module/domain/dom_domain.h"
#include "module/domain/network_domain.h"
#include "module/domain/page_domain.h"
#include "module/domain/tdf_common_protocol_domain.h"
#include "module/domain/tdf_inspector_domain.h"
#include "module/domain/tdf_memory_domain.h"
#include "module/domain/tdf_performance_domain.h"
#include "module/domain/tdf_runtime_domain.h"
#include "module/inspect_props.h"
#include "nlohmann/json.hpp"
#include "tunnel/tunnel_service.h"

namespace hippy::devtools {

constexpr char kDomainDispatchResult[] = "result";
constexpr char kDomainDispatchError[] = "error";

using json = nlohmann::json;

void DomainDispatch::RegisterJSDebuggerDomainListener() {
  auto dom_domain = std::make_shared<DOMDomain>(shared_from_this());
  auto css_domain = std::make_shared<CSSDomain>(shared_from_this());
  auto page_domain = std::make_shared<PageDomain>(shared_from_this());
  RegisterDomainHandler(dom_domain);
  RegisterDomainHandler(css_domain);
  RegisterDomainHandler(page_domain);
}

void DomainDispatch::RegisterDefaultDomainListener() {
  auto tdf_inspector_domain = std::make_shared<TDFInspectorDomain>(shared_from_this());
  auto tdf_performance_domain = std::make_shared<TDFPerformanceDomain>(shared_from_this());
  auto tdf_memory_domain = std::make_shared<TDFMemoryDomain>(shared_from_this());
  auto tdf_runtime_domain = std::make_shared<TDFRuntimeDomain>(shared_from_this());
  auto tdf_common_protocol_domain = std::make_shared<TDFCommonProtocolDomain>(shared_from_this());
  auto network_domain = std::make_shared<NetworkDomain>(shared_from_this());
  RegisterDomainHandler(tdf_inspector_domain);
  RegisterDomainHandler(tdf_performance_domain);
  RegisterDomainHandler(tdf_memory_domain);
  RegisterDomainHandler(tdf_runtime_domain);
  RegisterDomainHandler(tdf_common_protocol_domain);
  RegisterDomainHandler(network_domain);
}

void DomainDispatch::RegisterDomainHandler(const std::shared_ptr<BaseDomain>& base_domain) {
  domain_register_map_.insert(
      std::map<std::string, std::shared_ptr<BaseDomain>>::value_type(base_domain->GetDomainName(), base_domain));
  base_domain->RegisterMethods();
}

void DomainDispatch::ClearDomainHandler() { domain_register_map_.clear(); }

bool DomainDispatch::ReceiveDataFromFrontend(const std::string& data_string) {
  BACKEND_LOGD(TDF_BACKEND, "DomainDispatch, receive data from frontend :%s", data_string.c_str());

  json data_json = json::object();
  try {
    data_json = json::parse(data_string);
  } catch (json::exception& e) {
    BACKEND_LOGE(TDF_BACKEND, "parse data_string failed, e.what()=%s, e.id=%d, data_string=%s.", e.what(), e.id,
                 data_string.c_str());
  }

  if (data_json.is_null()) {
    return false;
  }

  // 解析 id
  auto id = data_json[kFrontendKeyId];

  // 解析 domain.method
  std::string domain_param_list;
  if (data_json[kFrontendKeyMethod].is_string()) {
    domain_param_list = data_json[kFrontendKeyMethod];
  }

  std::regex split_str("\\.");
  std::vector<std::string> split_params(
      std::sregex_token_iterator(domain_param_list.begin(), domain_param_list.end(), split_str, -1),
      std::sregex_token_iterator());
  if (split_params.size() < 2) {
    BACKEND_LOGE(TDF_BACKEND, "error domain_paramList");
    return false;
  }
  std::string domain = split_params.at(0);
  std::string method = split_params.at(1);
  method[0] = toupper(method[0]);  // 协议里的method首字母都是小写，但是C++方法名要求首字母大写，所以这里需要处理一下

  // 解析 params
  std::string params;
  if (!data_json[kFrontendKeyParams].is_null()) {
    json params_json = json::object();
    params_json.merge_patch(data_json[kFrontendKeyParams]);
    params = params_json.dump();
  }

  auto base_domain = domain_register_map_.find(domain);

  // 找到实现的 domain 处理消费
  if (base_domain != domain_register_map_.end()) {
    if (base_domain->second->HandleDomainSwitchEvent(id, method)) {
      return true;
    }
    auto handler = DomainRegister::Instance()->GetMethod(domain + "Domain", method);
    if (handler) {
      handler(base_domain->second, id, params);
      return true;
    }
  }
  // 未实现的 TDF 协议交给通用协议适配器处理
  auto tdf_common_domain = domain_register_map_.find(kFrontendKeyDomainNameTDF);
  if (domain.find(kFrontendKeyDomainNameTDF) != std::string::npos && tdf_common_domain != domain_register_map_.end()) {
    // 将 domain.method 一起透传
    std::static_pointer_cast<TDFCommonProtocolDomain>(tdf_common_domain->second)
        ->ReceiveFromFrontend(id, domain_param_list, params);
    return true;
  }
  return false;
}

void DomainDispatch::DispatchToV8(const std::string& data) {
#ifdef OS_ANDROID
  BACKEND_LOGD(TDF_BACKEND, "JSDebugger, params=%s.", data.c_str());
  // 非Debug模式，不把消息发给V8
  if (!data_channel_->GetProvider()->runtime_adapter->IsDebug()) {
    BACKEND_LOGD(TDF_BACKEND, "Not debug mode, return.");
    return;
  }
  auto v8_request = data_channel_->GetProvider()->vm_request_adapter;
  if (v8_request) {
    v8_request->SendMsgToVM(data, nullptr);
  }
#endif
}

void DomainDispatch::SendDataToFrontend(int32_t id, const std::string& result, const std::string& error) {
  if (result.length() == 0 && error.length() == 0) {
    BACKEND_LOGE(TDF_BACKEND, "result and error are both null");
    return;
  }
  json rsp_json = json::object();
  rsp_json[kFrontendKeyId] = id;

  if (result.length()) {
    rsp_json[kDomainDispatchResult] = json::parse(result.data());
  } else {
    rsp_json[kDomainDispatchError] = json::parse(error.data());
  }
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
