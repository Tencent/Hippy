/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
