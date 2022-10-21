/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

#include "vfs/handler/uri_handler.h"
#ifdef ENABLE_INSPECTOR
#include "api/notification/devtools_network_notification.h"
#endif

#include <list>
#include <mutex>
#include <string>
#include <unordered_map>


namespace hippy {
inline namespace vfs {

class UriLoader: public std::enable_shared_from_this<UriLoader> {
 public:
  using string_view = footstone::string_view;
  using bytes = vfs::UriHandler::bytes;
  using RetCode = vfs::UriHandler::RetCode;
#ifdef ENABLE_INSPECTOR
  using NetworkNotification = hippy::devtools::NetworkNotification;
#endif

  UriLoader() = default;
  virtual ~UriLoader() = default;

  virtual void RegisterUriHandler(const std::string& scheme,
                                  const std::shared_ptr<UriHandler>& handler);

  virtual void RegisterUriInterceptor(const std::shared_ptr<UriHandler>& handler);

  virtual void RequestUntrustedContent(
      const string_view& uri,
      const std::unordered_map<std::string, std::string>& meta,
      std::function<void(RetCode, std::unordered_map<std::string, std::string>, bytes)> cb);

  virtual void RequestUntrustedContent(
      const string_view& uri,
      const std::unordered_map<std::string, std::string>& req_meta,
      RetCode& code,
      std::unordered_map<std::string, std::string>& rsp_meta,
      bytes& content);

  inline void PushDefaultHandler(std::shared_ptr<UriHandler> handler) {
    default_handler_list_.push_back(handler);
  }
  inline std::shared_ptr<UriHandler> GetDefaultHandler() {
    return default_handler_;
  }

#ifdef ENABLE_INSPECTOR
  inline void SetNetworkNotification(std::shared_ptr<NetworkNotification> notification) {
    network_notification_ = notification;
  }
  inline std::shared_ptr<NetworkNotification> GetNetworkNotification() {
    return network_notification_;
  }
#endif

 private:
  std::shared_ptr<UriHandler> GetNextHandler(std::list<std::shared_ptr<UriHandler>>::iterator& cur,
                                             const std::list<std::shared_ptr<UriHandler>>::iterator& end);

  // the return value is encoded in utf8
  static std::string GetScheme(const string_view& uri);

  // key is encoded in utf8
  std::unordered_map<std::string, std::list<std::shared_ptr<UriHandler>>> router_;
  std::list<std::shared_ptr<UriHandler>> default_handler_list_;
  std::list<std::shared_ptr<UriHandler>> interceptor_;
  std::mutex mutex_;
#ifdef ENABLE_INSPECTOR
  std::shared_ptr<NetworkNotification> network_notification_;
#endif
};

}
}
