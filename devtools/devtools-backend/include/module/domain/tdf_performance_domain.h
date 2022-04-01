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

class TDFPerformanceDomain : public BaseDomain {
 public:
  explicit TDFPerformanceDomain(std::weak_ptr<DomainDispatch> dispatch) : BaseDomain(dispatch) {}
  std::string_view GetDomainName() override;
  void RegisterMethods() override;

 private:
  void Start(const DomainBaseRequest& request);
  void End(const DomainBaseRequest& request);
  void V8Tracing(const DomainBaseRequest& request);
  void FrameTimings(const DomainBaseRequest& request);
  void Timeline(const DomainBaseRequest& request);
  void ResponseError(int32_t id, const std::string& method);
};

}  // namespace devtools
}  // namespace tdf
