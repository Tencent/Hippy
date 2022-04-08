//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#include "module/domain/network_domain.h"
#include "devtools_base/logging.h"
#include "module/domain_register.h"

namespace tdf {
namespace devtools {

NetworkDomain::NetworkDomain(std::weak_ptr<DomainDispatch> dispatch) : BaseDomain(dispatch) {}

std::string_view NetworkDomain::GetDomainName() { return kFrontendKeyDomainNameNetwork; }

void NetworkDomain::RegisterMethods() { REGISTER_DOMAIN(NetworkDomain, GetResponseBody, NetworkResponseBodyRequest) }

void NetworkDomain::GetResponseBody(const NetworkResponseBodyRequest& request) {
  BACKEND_LOGD(TDF_BACKEND, "NetworkDomain::GetResponseBody");
  auto network_adapter = GetDataProvider()->GetNetworkAdapter();
  if (network_adapter) {
    std::string body = network_adapter->GetResponseBody(request.GetRequestId());
    ResponseResultToFrontend(request.GetId(), body);
  } else {
    BACKEND_LOGE(TDF_BACKEND, "NetworkDomain::GetResponseBody no NetworkAdapterImp");
  }
}
}  // namespace devtools
}  // namespace tdf
