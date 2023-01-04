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
#include "devtools/vfs/devtools_handler.h"

#include <utility>

#include "footstone/string_view.h"
#include "footstone/string_view_utils.h"
#include "vfs/uri_loader.h"

namespace hippy::devtools {
using string_view = footstone::stringview::string_view;
using StringViewUtils = footstone::stringview::StringViewUtils;

constexpr char kCallFromKey[] = "__Hippy_call_from";
constexpr char kCallFromJavaValue[] = "java";

// call from c++ request sync
void DevtoolsHandler::RequestUntrustedContent(std::shared_ptr<RequestJob> request,
                                              std::shared_ptr<JobResponse> response,
                                              std::function<std::shared_ptr<UriHandler>()> next) {
  auto handle_next = [](
      std::shared_ptr<RequestJob> request, std::shared_ptr<JobResponse> response,
      const std::function<std::shared_ptr<UriHandler>()>& next) {
    auto next_handler = next();
    if (next_handler) {
      next_handler->RequestUntrustedContent(std::move(request), std::move(response), next);
    }
  };
  auto req_meta = request->GetMeta();
  if (req_meta[kCallFromKey] == kCallFromJavaValue) {  // call from java should return
    handle_next(request, response, next);
    return;
  }
  // call devtools for network request
  auto request_id = std::to_string(static_cast<uint64_t>(std::chrono::time_point_cast<std::chrono::milliseconds>(
      std::chrono::system_clock::now()).time_since_epoch().count()));  // generate request_id for once network request
  auto uri = StringViewUtils::ToStdString(
      StringViewUtils::ConvertEncoding(request->GetUri(), string_view::Encoding::Utf8).utf8_value());
  SentRequest(network_notification_, request_id, uri, req_meta);
  handle_next(request, response, next);
  // sync request, then call devtools for network response
  ReceivedResponse(network_notification_, request_id, static_cast<int>(response->GetRetCode()),
                   std::move(response->GetContent()), std::move(response->GetMeta()),
                   req_meta);
}

// call from c++ request async
void DevtoolsHandler::RequestUntrustedContent(std::shared_ptr<RequestJob> request,
                                              std::function<void(std::shared_ptr<JobResponse>)> cb,
                                              std::function<std::shared_ptr<UriHandler>()> next) {
  auto handle_next = [](
      std::shared_ptr<RequestJob> request,
      std::function<void(std::shared_ptr<JobResponse>)> cb,
      const std::function<std::shared_ptr<UriHandler>()>& next) {
    auto next_handler = next();
    if (next_handler) {
      next_handler->RequestUntrustedContent(std::move(request), std::move(cb), next);
    }
  };
  auto req_meta = request->GetMeta();
  if (req_meta[kCallFromKey] == kCallFromJavaValue) {  // call from java should return
    handle_next(request, cb, next);
    return;
  }
  // call devtools for network request
  auto request_id = std::to_string(static_cast<uint64_t>(std::chrono::time_point_cast<std::chrono::milliseconds>(
      std::chrono::system_clock::now()).time_since_epoch().count()));  // generate request_id for once network request
  auto uri = StringViewUtils::ToStdString(
      StringViewUtils::ConvertEncoding(request->GetUri(), string_view::Encoding::Utf8).utf8_value());
  SentRequest(network_notification_, request_id, uri, req_meta);
  // async request, call devtools for network response in callback
  std::weak_ptr<NetworkNotification> weak_network_notification = network_notification_;
  auto new_cb = [orig_cb = cb, weak_network_notification, request_id, req_meta](
      const std::shared_ptr<JobResponse>& response) {
    auto network_notification = weak_network_notification.lock();
    ReceivedResponse(network_notification, request_id, static_cast<int>(response->GetRetCode()),
                     response->GetContent(), response->GetMeta(), req_meta);
    orig_cb(response);
  };
  handle_next(request, new_cb, next);
}

void SentRequest(const std::shared_ptr<hippy::devtools::NetworkNotification>& notification,
                 const std::string& request_id,
                 std::string uri,
                 const std::unordered_map<std::string, std::string>& req_meta) {
  if (notification) {
    notification->RequestWillBeSent(request_id, hippy::devtools::DevtoolsHttpRequest(
                                                    request_id, hippy::devtools::Request(std::move(uri), req_meta)));
  }
}

void ReceivedResponse(const std::shared_ptr<hippy::devtools::NetworkNotification>& notification,
                      const std::string& request_id,
                      int32_t code,
                      UriLoader::bytes content,
                      const std::unordered_map<std::string, std::string>& rsp_meta,
                      const std::unordered_map<std::string, std::string>& req_meta) {
  if (notification) {
    auto data_length = content.length();
    auto devtools_http_response = hippy::devtools::DevtoolsHttpResponse(
        request_id, hippy::devtools::Response(code, data_length, rsp_meta, req_meta));
    devtools_http_response.SetBodyData(std::move(content));
    notification->ResponseReceived(request_id, devtools_http_response);
    notification->LoadingFinished(request_id, hippy::devtools::DevtoolsLoadingFinished(request_id, data_length));
  }
}
}  // namespace hippy::devtools
