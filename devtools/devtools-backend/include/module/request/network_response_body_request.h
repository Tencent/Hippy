//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#pragma once

#include <string>
#include "module/request/domain_base_request.h"

namespace tdf {
namespace devtools {
/**
 * network 模块调试，getResponseBody的请求数据体
 */
class NetworkResponseBodyRequest : public DomainBaseRequest {
 public:
  NetworkResponseBodyRequest() = default;
  void RefreshParams(const std::string& params) override;
  std::string GetRequestId() const;

 private:
  std::string request_id_;
};
}  // namespace devtools
}  // namespace tdf
