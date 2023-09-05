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

#include "vfs/uri_loader.h"

#include <utility>

#include "footstone/string_view_utils.h"

using StringViewUtils = footstone::StringViewUtils;

constexpr uint32_t kPoolSize = 1;

namespace hippy {
inline namespace vfs {

UriLoader::UriLoader() {
  worker_manager_ = std::make_unique<WorkerManager>(kPoolSize);
}

void UriLoader::Terminate() {
  worker_manager_->Terminate();
}

void UriLoader::RegisterUriHandler(const std::string& scheme,
                                   const std::shared_ptr<UriHandler>& handler) {
  std::lock_guard<std::mutex> lock(mutex_);
  auto it = router_.find(scheme);
  if (it == router_.end()) {
    router_[scheme] = interceptor_;
    router_[scheme].push_back(handler);
  } else {
    it->second.push_back(handler);
  }
}

void UriLoader::RegisterUriInterceptor(const std::shared_ptr<UriHandler>& handler) {
  std::lock_guard<std::mutex> lock(mutex_);
  interceptor_.push_front(handler);
  for (auto [name, list]: router_) {
    list.push_front(handler);
  }
}

void UriLoader::RequestUntrustedContent(const string_view& uri,
                                        const std::unordered_map<std::string, std::string>& meta,
                                        std::function<void(RetCode, std::unordered_map<std::string, std::string>, bytes)> cb) {
  auto request = std::make_shared<RequestJob>(uri, meta, worker_manager_);
  std::function<void(std::shared_ptr<JobResponse>)> response_cb = [cb](const std::shared_ptr<JobResponse>& rsp) {
    cb(rsp->GetRetCode(), rsp->GetMeta(), rsp->ReleaseContent());
  };
  RequestUntrustedContent(request, response_cb);
}

void UriLoader::RequestUntrustedContent(const string_view& uri,
                                        const std::unordered_map<std::string, std::string>& req_meta,
                                        RetCode& code,
                                        std::unordered_map<std::string, std::string>& rsp_meta,
                                        bytes& content) {
  auto request = std::make_shared<RequestJob>(uri, req_meta, worker_manager_);
  auto response = std::make_shared<JobResponse>();
  RequestUntrustedContent(request, response);
  code = response->GetRetCode();
  rsp_meta = response->GetMeta();
  content = response->ReleaseContent();
}

void UriLoader::RequestUntrustedContent(const std::shared_ptr<RequestJob>& request, std::shared_ptr<JobResponse> response) {
  // performance start time
  auto start_time = TimePoint::SystemNow();

  auto uri = request->GetUri();
  auto scheme = GetScheme(uri);
  std::list<std::shared_ptr<UriHandler>>::iterator cur_it;
  std::list<std::shared_ptr<UriHandler>>::iterator end_it;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    const auto& scheme_it = router_.find(scheme);
    if (scheme.empty() || scheme_it == router_.end()) { // get scheme failed or scheme not register
      FOOTSTONE_CHECK(!default_handler_list_.empty());
      cur_it = default_handler_list_.begin();
      end_it = default_handler_list_.end();
    } else {
      FOOTSTONE_DCHECK(!scheme_it->second.empty());
      cur_it = scheme_it->second.begin();
      end_it = scheme_it->second.end();
    }
  }

  std::function<std::shared_ptr<UriHandler>()> next = [this, &cur_it, end_it]() -> std::shared_ptr<UriHandler> {
    return this->GetNextHandler(cur_it, end_it);
  };
  (*cur_it)->RequestUntrustedContent(request, response, next);

  // performance end time
  auto end_time = TimePoint::SystemNow();
  DoRequestResultCallback(request->GetUri(), start_time, end_time,
                          static_cast<int32_t>(response->GetRetCode()), response->GetErrorMessage());
}

void UriLoader::RequestUntrustedContent(const std::shared_ptr<RequestJob>& request,
                                        const std::function<void(std::shared_ptr<JobResponse>)>& cb) {
  // performance start time
  auto start_time = TimePoint::SystemNow();

  auto uri = request->GetUri();
  auto scheme = GetScheme(uri);
  std::shared_ptr<std::list<std::shared_ptr<UriHandler>>::iterator> cur_it;
  std::shared_ptr<std::list<std::shared_ptr<UriHandler>>::iterator> end_it;
  bytes content;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    const auto& scheme_it = router_.find(scheme);
    if (scheme.empty() || scheme_it == router_.end()) { // get scheme failed or scheme not register
      FOOTSTONE_CHECK(!default_handler_list_.empty());
      cur_it = std::make_shared<std::list<std::shared_ptr<UriHandler>>::iterator>(default_handler_list_.begin());
      end_it = std::make_shared<std::list<std::shared_ptr<UriHandler>>::iterator>(default_handler_list_.end());
    } else {
      FOOTSTONE_DCHECK(!scheme_it->second.empty());
      cur_it = std::make_shared<std::list<std::shared_ptr<UriHandler>>::iterator>(scheme_it->second.begin());
      end_it = std::make_shared<std::list<std::shared_ptr<UriHandler>>::iterator>(scheme_it->second.end());
    }
  }
  auto weak = weak_from_this();
  std::function<std::shared_ptr<UriHandler>()> next = [weak, cur_it, end_it]() mutable -> std::shared_ptr<UriHandler> {
    auto self = weak.lock();
    if (!self) {
      return nullptr;
    }
    return self->GetNextHandler(*cur_it, *end_it);
  };
  auto new_cb = [WEAK_THIS, request, start_time, orig_cb = cb](std::shared_ptr<JobResponse> response) {
    DEFINE_SELF(UriLoader)
    if (!self) {
      orig_cb(response);
      return;
    }

    // performance end time
    auto end_time = TimePoint::SystemNow();
    self->DoRequestResultCallback(request->GetUri(), start_time, end_time,
                                  static_cast<int32_t>(response->GetRetCode()), response->GetErrorMessage());

    orig_cb(response);
  };
  (**cur_it)->RequestUntrustedContent(request, new_cb, next);
}

std::shared_ptr<UriHandler> UriLoader::GetNextHandler(std::list<std::shared_ptr<UriHandler>>::iterator& cur,
                                                      const std::list<std::shared_ptr<UriHandler>>::iterator& end) {
  std::lock_guard<std::mutex> lock(mutex_);
  FOOTSTONE_CHECK(cur != end);
  ++cur;
  if (cur == end) {
    return nullptr;
  }
  return *cur;
}

std::string UriLoader::GetScheme(const UriLoader::string_view& uri) {
  auto u8_uri = StringViewUtils::ConvertEncoding(uri, string_view::Encoding::Utf8)
      .utf8_value();
  size_t pos = u8_uri.find_first_of(':');
  if (pos != std::string::npos) {
    return {reinterpret_cast<const char*>(u8_uri.c_str()), pos};
  }
  return {};
}

void UriLoader::DoRequestResultCallback(const string_view& uri,
                                        const TimePoint& start, const TimePoint& end,
                                        const int32_t ret_code, const string_view& error_msg) {
  if (on_request_result_ != nullptr) {
    on_request_result_(uri, start, end, ret_code, error_msg);
  }
}

}
}
