//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#pragma once

#include <string>
#include "module/request/domain_base_request.h"

namespace tdf {
namespace devtools {
/**
 * @brief 编辑 CSS Style Texts 的请求
 */
class CSSEditStyleTextsRequest : public DomainBaseRequest {
 public:
  CSSEditStyleTextsRequest() : has_set_edits_(false) {}
  void RefreshParams(const std::string& params) override;

  nlohmann::json GetEdits() const { return edits_; }
  bool HasSetEdits() const { return has_set_edits_; }

 private:
  nlohmann::json edits_;
  bool has_set_edits_;
};
}  // namespace devtools
}  // namespace tdf
