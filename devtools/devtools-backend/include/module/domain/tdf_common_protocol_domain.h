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

#include <memory>
#include <string>
#include "module/domain/base_domain.h"

namespace hippy::devtools {

/**
 * @brief common domain where other domain don't handle
 */
class TdfCommonProtocolDomain : public BaseDomain, public std::enable_shared_from_this<TdfCommonProtocolDomain> {
 public:
  explicit TdfCommonProtocolDomain(std::weak_ptr<DomainDispatch> dispatch) : BaseDomain(dispatch) {}
  std::string GetDomainName() override;
  void RegisterMethods() override;
  void RegisterCallback() override {}

  bool ReceiveFromFrontend(int32_t id, const std::string& method, const std::string& params);
};

}  // namespace hippy::devtools
