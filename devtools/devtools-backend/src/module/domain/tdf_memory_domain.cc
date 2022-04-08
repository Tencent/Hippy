//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by Jianguoxie on 29/7/2021.
//

#include "module/domain/tdf_memory_domain.h"
#include "api/devtools_backend_service.h"
#include "module/domain_register.h"

namespace tdf {
namespace devtools {

std::string_view TDFMemoryDomain::GetDomainName() { return kFrontendKeyDomainNameTDFMemory; }

void TDFMemoryDomain::RegisterMethods() { REGISTER_DOMAIN(TDFMemoryDomain, GetHeapMeta, DomainBaseRequest); }

void TDFMemoryDomain::GetHeapMeta(const DomainBaseRequest& request) {
  auto memory_adapter = GetDataProvider()->GetMemoryAdapter();
  if (!memory_adapter) {
    ResponseErrorToFrontend(request.GetId(), kErrorNotSupport, "get heap meta failed, no data.");
    return;
  }
  memory_adapter->CollectMemoryUsage([this, request](const MemoryMetas& memoryMetas) {
    ResponseResultToFrontend(request.GetId(), memoryMetas.Serialize());
  });
}

}  // namespace devtools
}  // namespace tdf
