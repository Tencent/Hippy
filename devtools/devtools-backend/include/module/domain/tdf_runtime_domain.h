//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by Jianguoxie on 18/8/2021.
//

#pragma once

#include <map>
#include <memory>
#include <string>
#include "module/domain/base_domain.h"
#include "module/request/domain_base_request.h"

namespace tdf {
namespace devtools {

class TDFRuntimeDomain : public BaseDomain {
 public:
  explicit TDFRuntimeDomain(std::weak_ptr<DomainDispatch> dispatch) : BaseDomain(dispatch) {}
  std::string_view GetDomainName() override;
  void RegisterMethods() override;

 private:
  void Resume(const DomainBaseRequest& request);
  void IsDebugMode(const DomainBaseRequest& request);
};

}  // namespace devtools
}  // namespace tdf
