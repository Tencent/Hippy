//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by ivanfanwu on 2021/11/2.
//

#include "module/domain/tdf_common_protocol_domain.h"
#include "api/devtools_backend_service.h"
#include "devtools_base/error.h"

namespace tdf {
namespace devtools {

std::string_view TDFCommonProtocolDomain::GetDomainName() { return kFrontendKeyDomainNameTDF; }

void TDFCommonProtocolDomain::RegisterMethods() {}

bool TDFCommonProtocolDomain::ReceiveFromFrontend(int32_t id, const std::string &method, const std::string &params) {
  // 全部进行消费
  auto common_protocol_adapter = GetDataProvider()->GetCommonProtocolAdapter();
  if (common_protocol_adapter) {
    common_protocol_adapter->HandleCommonProtocol(id, method, params,
                                                  [this, id](bool is_success, const nlohmann::json &data) {
                                                    if (is_success) {
                                                      ResponseResultToFrontend(id, data);
                                                    } else {
                                                      ResponseErrorToFrontend(id, kErrorImpl, "adapter impl error");
                                                    }
                                                  });
  } else {
    ResponseErrorToFrontend(id, kErrorNotSupport, "method not support");
  }
  return true;
}

}  // namespace devtools
}  // namespace tdf
