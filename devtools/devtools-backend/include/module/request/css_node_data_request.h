//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#pragma once

#include <string>
#include "module/request/domain_base_request.h"

namespace tdf {
namespace devtools {
/**
 * @brief 获取 CSS node 数据的请求
 */
class CSSNodeDataRequest : public DomainBaseRequest {
 public:
  CSSNodeDataRequest() : has_set_node_id_(false) {}
  void RefreshParams(const std::string& params) override;

  int32_t GetNodeId() const { return node_id_; }
  bool HasSetNodeId() const { return has_set_node_id_; }

 private:
  int32_t node_id_;
  bool has_set_node_id_;
};
}  // namespace devtools
}  // namespace tdf
