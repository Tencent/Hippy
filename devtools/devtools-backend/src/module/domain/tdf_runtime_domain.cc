//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#include "module/domain/tdf_runtime_domain.h"
#include "api/devtools_backend_service.h"
#include "module/domain_register.h"

namespace tdf {
namespace devtools {

std::string_view TDFRuntimeDomain::GetDomainName() { return kFrontendKeyDomainNameTDFRuntime; }

void TDFRuntimeDomain::RegisterMethods() {
  REGISTER_DOMAIN(TDFRuntimeDomain, Resume, DomainBaseRequest);
  REGISTER_DOMAIN(TDFRuntimeDomain, IsDebugMode, DomainBaseRequest);
}

void TDFRuntimeDomain::Resume(const DomainBaseRequest& request) {
  // 恢复js debugger的断点调试
#ifdef OS_ANDROID
  std::string data = "chrome_socket_closed";
  // 非Debug模式，不把消息发给V8
  if (!GetDataProvider()->GetRuntimeAdapter()->IsDebug()) {
    BACKEND_LOGD(TDF_BACKEND, "Not debug mode, return.");
    return;
  }
  auto v8_request = GetDataProvider()->GetV8RequestAdapter();
  if (v8_request) {
    v8_request->SendMsgToV8(data, nullptr);
  }
#endif
}

void TDFRuntimeDomain::IsDebugMode(const DomainBaseRequest& request) {
  bool isDebug = GetDataProvider()->GetRuntimeAdapter()->IsDebug();
  nlohmann::json result_json = nlohmann::json::object();
  result_json["isDebugMode"] = isDebug ? 1 : 0;
  ResponseResultToFrontend(request.GetId(), result_json.dump());
}

}  // namespace devtools
}  // namespace tdf
