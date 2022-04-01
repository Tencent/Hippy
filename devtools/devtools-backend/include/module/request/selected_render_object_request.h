//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#pragma once

#include <string>
#include "module/request/domain_base_request.h"

namespace tdf {
namespace devtools {
/**
 * @brief 获取 renderTree 选中节点的请求
 */
class SelectedRenderObjectRequest : public DomainBaseRequest {
 public:
  void RefreshParams(const std::string& params) override;

  int32_t GetRenderId() const { return render_id_; }

 private:
  int32_t render_id_;
};
}  // namespace devtools
}  // namespace tdf
