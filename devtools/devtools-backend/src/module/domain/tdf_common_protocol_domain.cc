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
