/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
#pragma once

#include "api/notification/devtools_network_notification.h"
#include "vfs/handler/uri_handler.h"

namespace hippy::devtools {
/**
 * @brief devtools implement vfs handler for network chain, record network request first and response last as the chain
 * head from c++, then send to frontend and debugging network.
 */
class DevtoolsHandler : public UriHandler {
  using NetworkNotification = hippy::devtools::NetworkNotification;

 public:
  DevtoolsHandler() = default;
  virtual ~DevtoolsHandler() = default;

  virtual void RequestUntrustedContent(
      std::shared_ptr<RequestJob> request,
      std::shared_ptr<JobResponse> response,
      std::function<std::shared_ptr<UriHandler>()> next) override;
  virtual void RequestUntrustedContent(
      std::shared_ptr<RequestJob> request,
      std::function<void(std::shared_ptr<JobResponse>)> cb,
      std::function<std::shared_ptr<UriHandler>()> next) override;

  inline void SetNetworkNotification(std::shared_ptr<NetworkNotification> notification) {
    network_notification_ = notification;
  }

 private:
  std::shared_ptr<NetworkNotification> network_notification_;
};

/**
 * @brief call devtools SentRequest when network start request
 */
void SentRequest(const std::shared_ptr<hippy::devtools::NetworkNotification>&,
                 const std::string& request_id,
                 std::string uri,
                 const std::unordered_map<std::string, std::string>& req_meta);

/**
 * @brief call devtools ReceivedResponse when network end response
 */
void ReceivedResponse(const std::shared_ptr<hippy::devtools::NetworkNotification>&,
                      const std::string& request_id,
                      int32_t code,
                      std::string content,
                      const std::unordered_map<std::string, std::string>& rsp_meta,
                      const std::unordered_map<std::string, std::string>& req_meta);
}  // namespace hippy::devtools
