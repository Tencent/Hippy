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

#include "module/domain/network_domain.h"
#include "devtools_base/logging.h"
#include "module/domain_register.h"

namespace hippy::devtools {

std::string NetworkDomain::GetDomainName() { return kFrontendKeyDomainNameNetwork; }

void NetworkDomain::RegisterMethods() { REGISTER_DOMAIN(NetworkDomain, GetResponseBody, NetworkResponseBodyRequest) }

void NetworkDomain::RegisterCallback() {}

void NetworkDomain::GetResponseBody(const NetworkResponseBodyRequest& request) {
  auto network_adapter = GetDataProvider()->network_adapter;
  if (network_adapter) {
    std::string body = network_adapter->GetResponseBody(request.GetRequestId());
    ResponseResultToFrontend(request.GetId(), body);
  } else {
    ResponseErrorToFrontend(request.GetId(), kErrorNotSupport, "not support get network body");
    BACKEND_LOGE(TDF_BACKEND, "NetworkDomain::GetResponseBody not support get network body");
  }
}
}  // namespace hippy::devtools
