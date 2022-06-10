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

#include <map>
#include <memory>
#include <string>
#include "module/domain/base_domain.h"
#include "module/model/frame_poll_model.h"
#include "module/model/screen_shot_model.h"
#include "module/request/network_response_body_request.h"

namespace hippy::devtools {

/**
 * @brief Network domain
 */
class NetworkDomain : public BaseDomain, public std::enable_shared_from_this<NetworkDomain> {
 public:
  explicit NetworkDomain(std::weak_ptr<DomainDispatch> dispatch) : BaseDomain(std::move(dispatch)) {}
  std::string GetDomainName() override;
  void RegisterMethods() override;
  void RegisterCallback() override;
  void OnResponseReceived(const std::string& request_id, std::string&& body_data);

 private:
  void GetResponseBody(const NetworkResponseBodyRequest& request);
  std::unordered_map<std::string, std::string> response_map_;
};
}  // namespace hippy::devtools
