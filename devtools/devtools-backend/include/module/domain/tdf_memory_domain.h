//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by Jianguoxie on 29/7/2021.
//

#pragma once

#include <map>
#include <memory>
#include <string>
#include "module/domain/base_domain.h"
#include "module/request/domain_base_request.h"

namespace tdf {
namespace devtools {

class TDFMemoryDomain : public BaseDomain, public std::enable_shared_from_this<TDFMemoryDomain> {
 public:
  explicit TDFMemoryDomain(std::weak_ptr<DomainDispatch> dispatch) : BaseDomain(dispatch) {}
  std::string_view GetDomainName() override;
  void RegisterMethods() override;

 private:
  void GetHeapMeta(const DomainBaseRequest& request);
};

}  // namespace devtools
}  // namespace tdf
