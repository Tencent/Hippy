//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by ivanfanwu on 2021/11/2.
//

#pragma once

#include <memory>
#include <string>
#include "module/domain/base_domain.h"

namespace tdf {
namespace devtools {

/**
 * @brief 通用协议适配
 */
class TDFCommonProtocolDomain : public BaseDomain {
 public:
  explicit TDFCommonProtocolDomain(std::weak_ptr<DomainDispatch> dispatch) : BaseDomain(dispatch) {}
  std::string_view GetDomainName() override;
  void RegisterMethods() override;

  bool ReceiveFromFrontend(int32_t id, const std::string &method, const std::string &params);
};

}  // namespace devtools
}  // namespace tdf
