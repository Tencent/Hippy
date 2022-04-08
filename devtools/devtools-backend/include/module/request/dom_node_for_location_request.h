//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#pragma once

#include <string>
#include "module/request/domain_base_request.h"

namespace tdf {
namespace devtools {
/**
 * @brief 根据定位获取 domTree 节点的请求
 */
class DomNodeForLocationRequest : public DomainBaseRequest {
 public:
  DomNodeForLocationRequest() : has_set_xy_(false) {}
  void RefreshParams(const std::string& params) override;

  int32_t GetX() const { return x_; }
  int32_t GetY() const { return y_; }
  bool HasSetXY() const { return has_set_xy_; }

 private:
  int32_t x_;
  int32_t y_;
  bool has_set_xy_;
};
}  // namespace devtools
}  // namespace tdf
