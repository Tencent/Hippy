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
#include "api/notification/data/devtools_http_loading_finished.h"
#include "api/notification/data/devtools_http_request.h"
#include "api/notification/data/devtools_http_response.h"

namespace hippy::devtools {
/**
 * Network module debugging data collection
 * Trigger scenario: initiated by the network monitoring of the access framework
 */
class NetworkNotification {
 public:
  virtual ~NetworkNotification() {}
  /**
   * Fired when page is about to send HTTP request.
   * @see https://chromedevtools.github.io/devtools-protocol/tot/Network/#event-requestWillBeSent
   * @param request_id network request id
   * @param request see #DevtoolsHttpRequest
   */
  virtual void RequestWillBeSent(std::string request_id, const DevtoolsHttpRequest& request) = 0;

  /**
   * Fired when HTTP response is available.
   * @see https://chromedevtools.github.io/devtools-protocol/tot/Network/#event-responseReceived
   * @param request_id network request id
   * @param response #DevtoolsHttpResponse
   */
  virtual void ResponseReceived(std::string request_id, const DevtoolsHttpResponse& response) = 0;

  /**
   * Fired when HTTP request has finished loading.
   * @see https://chromedevtools.github.io/devtools-protocol/tot/Network/#event-loadingFinished
   * @param request_id request_id network request id
   * @param loading #DevtoolsLoadingFinished
   */
  virtual void LoadingFinished(std::string request_id, const DevtoolsLoadingFinished& loading) = 0;
};
}  // namespace hippy::devtools
