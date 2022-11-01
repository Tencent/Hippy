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
#include "module/vfs/devtools_handler.h"

#include <utility>

#include "vfs/uri_loader.h"
#include "footstone/string_view_utils.h"
#include "footstone/string_view.h"
#include "module/util/base64.h"

namespace hippy::devtools {
void DevtoolsHandler::RequestUntrustedContent(std::shared_ptr<SyncContext> ctx,
                                          std::function<std::shared_ptr<UriHandler>()> next) {
  auto handle_next = [](std::shared_ptr<SyncContext> ctx, const std::function<std::shared_ptr<UriHandler>()>& next) {
    auto next_handler = next();
    if (next_handler) {
      next_handler->RequestUntrustedContent(std::move(ctx), next);
    }
  };
  if (ctx->req_meta[kCallFromKey] == kCallFromJavaValue) {  // call from java
    handle_next(ctx, next);
    return;
  }
  // call devtools
  auto request_id = std::to_string(static_cast<uint64_t>(std::chrono::time_point_cast<std::chrono::milliseconds>(
      std::chrono::system_clock::now()).time_since_epoch().count()));
  SentRequest(network_notification_, request_id,
              footstone::StringViewUtils::ToStdString(footstone::StringViewUtils::ConvertEncoding(
                  ctx->uri, footstone::string_view::Encoding::Utf8).utf8_value()),
              ctx->req_meta);
  handle_next(ctx, next);
  ReceivedResponse(network_notification_, request_id, static_cast<int>(ctx->code), ctx->content, ctx->rsp_meta, ctx->req_meta);
}

void DevtoolsHandler::RequestUntrustedContent(
    std::shared_ptr<ASyncContext> ctx,
    std::function<std::shared_ptr<UriHandler>()> next) {
  auto handle_next = [](std::shared_ptr<ASyncContext> ctx, const std::function<std::shared_ptr<UriHandler>()>& next) {
    auto next_handler = next();
    if (next_handler) {
      next_handler->RequestUntrustedContent(std::move(ctx), next);
    }
  };
  if (ctx->req_meta[kCallFromKey] == kCallFromJavaValue) {  // call from java
    handle_next(ctx, next);
    return;
  }
  // call devtools
  auto request_id = std::to_string(static_cast<uint64_t>(std::chrono::time_point_cast<std::chrono::milliseconds>(
      std::chrono::system_clock::now()).time_since_epoch().count()));
  SentRequest(network_notification_, request_id,
              footstone::StringViewUtils::ToStdString(footstone::StringViewUtils::ConvertEncoding(
                  ctx->uri, footstone::string_view::Encoding::Utf8).utf8_value()),
              ctx->req_meta);
  std::weak_ptr<NetworkNotification> weak_network_notification = network_notification_;
  auto new_cb = [orig_cb = ctx->cb, weak_network_notification, request_id, req_mata = ctx->req_meta](
      RetCode code, std::unordered_map<std::string, std::string> meta, bytes content) {
    auto network_notification = weak_network_notification.lock();
    ReceivedResponse(network_notification, request_id, static_cast<int>(code), content, meta, req_mata);
    orig_cb(code, std::move(meta), std::move(content));
  };
  ctx->cb = new_cb;
  handle_next(ctx, next);
}

void SentRequest(const std::shared_ptr<hippy::devtools::NetworkNotification>& notification,
                       const std::string& request_id,
                       std::string uri,
                       const std::unordered_map<std::string, std::string> &req_meta){
  if (notification) {
    notification->RequestWillBeSent(request_id, hippy::devtools::DevtoolsHttpRequest(request_id, hippy::devtools::Request(std::move(uri), req_meta)));
  }
}

void ReceivedResponse(const std::shared_ptr<hippy::devtools::NetworkNotification>& notification,
                      const std::string& request_id,
                      int32_t code,
                      UriLoader::bytes content,
                      const std::unordered_map<std::string, std::string> &rsp_meta,
                      const std::unordered_map<std::string, std::string> &req_meta) {
  if (notification) {
    auto data_length = content.length();
    auto devtools_http_response = hippy::devtools::DevtoolsHttpResponse(request_id, hippy::devtools::Response(code, data_length, rsp_meta, req_meta));
    devtools_http_response.SetBodyData(std::move(content));
    notification->ResponseReceived(request_id, devtools_http_response);
    notification->LoadingFinished(request_id, hippy::devtools::DevtoolsLoadingFinished(request_id, data_length));
  }
}

} // namespace hippy::devtools
