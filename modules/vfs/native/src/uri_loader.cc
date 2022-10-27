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

#include "footstone/string_view_utils.h"

using StringViewUtils = footstone::StringViewUtils;
using SyncContext = hippy::UriHandler::SyncContext;
using ASyncContext = hippy::UriHandler::ASyncContext;

namespace hippy {
inline namespace vfs {

void UriLoader::RegisterUriHandler(const std::string& scheme,
                                   const std::shared_ptr<UriHandler>& handler) {
  std::lock_guard<std::mutex> lock(mutex_);
  auto it = router_.find(scheme);
  if (it == router_.end()) {
    router_.insert({scheme, std::list<std::shared_ptr<UriHandler>>{handler}});
  } else {
    it->second.push_back(handler);
  }
}

void UriLoader::RequestUntrustedContent(const string_view& uri,
                                        const std::unordered_map<std::string, std::string>& meta,
                                        std::function<void(RetCode, std::unordered_map<std::string, std::string>, bytes)> cb) {
  auto scheme = GetScheme(uri);
  auto ctx = std::make_shared<ASyncContext>(uri, meta, cb);
  if (scheme.empty()) { // get scheme failed
    FOOTSTONE_CHECK(default_handler_);
    default_handler_->RequestUntrustedContent(ctx, []() -> std::shared_ptr<UriHandler> {
      return nullptr;
    });
    return;
  }

  std::shared_ptr<std::list<std::shared_ptr<UriHandler>>::iterator> cur_it;
  std::shared_ptr<std::list<std::shared_ptr<UriHandler>>::iterator> end_it;
  bytes content;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    const auto& scheme_it = router_.find(scheme);
    if (scheme_it == router_.end()) { // scheme not register
      FOOTSTONE_CHECK(default_handler_);
      default_handler_->RequestUntrustedContent(ctx, []() -> std::shared_ptr<UriHandler> {
        return nullptr;
      });
      return;
    }
    FOOTSTONE_DCHECK(!scheme_it->second.empty());
    cur_it = std::make_shared<std::list<std::shared_ptr<UriHandler>>::iterator>(scheme_it->second.begin());
    end_it = std::make_shared<std::list<std::shared_ptr<UriHandler>>::iterator>(scheme_it->second.end());
  }
  auto weak = weak_from_this();
  std::function<std::shared_ptr<UriHandler>()> next = [weak, cur_it, end_it]() mutable -> std::shared_ptr<UriHandler> {
    auto self = weak.lock();
    if (!self) {
      return nullptr;
    }
    return self->GetNextHandler(*cur_it, *end_it);
  };
  (**cur_it)->RequestUntrustedContent(ctx, next);
}

void UriLoader::RequestUntrustedContent(const string_view& uri,
                                        const std::unordered_map<std::string, std::string>& req_meta,
                                        RetCode& code,
                                        std::unordered_map<std::string, std::string>& rsp_meta,
                                        bytes& content) {
  auto ctx = std::make_shared<SyncContext>(uri, req_meta);
  auto scheme = GetScheme(uri);
  if (scheme.empty()) { // get scheme failed
    FOOTSTONE_CHECK(default_handler_);
    default_handler_->RequestUntrustedContent(ctx, []() -> std::shared_ptr<UriHandler> {
      return nullptr;
    });
    code = ctx->code;
    rsp_meta = std::move(ctx->rsp_meta);
    content = std::move(ctx->content);
    return;
  }

  std::list<std::shared_ptr<UriHandler>>::iterator cur_it;
  std::list<std::shared_ptr<UriHandler>>::iterator end_it;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    const auto& scheme_it = router_.find(scheme);
    if (scheme_it == router_.end()) { // scheme not register
      FOOTSTONE_CHECK(default_handler_);
      default_handler_->RequestUntrustedContent(ctx, []() -> std::shared_ptr<UriHandler> {
        return nullptr;
      });
      code = ctx->code;
      rsp_meta = std::move(ctx->rsp_meta);
      content = std::move(ctx->content);
      return;
    }
    FOOTSTONE_DCHECK(!scheme_it->second.empty());
    cur_it = scheme_it->second.begin();
    end_it = scheme_it->second.end();
  }

  std::function<std::shared_ptr<UriHandler>()> next = [this, &cur_it, end_it]() -> std::shared_ptr<UriHandler> {
    return this->GetNextHandler(cur_it, end_it);
  };
  (*cur_it)->RequestUntrustedContent(ctx, next);

  code = ctx->code;
  rsp_meta = std::move(ctx->rsp_meta);
  content = std::move(ctx->content);
}

std::shared_ptr<UriHandler> UriLoader::GetNextHandler(std::list<std::shared_ptr<UriHandler>>::iterator& cur,
                                                      const std::list<std::shared_ptr<UriHandler>>::iterator& end) {
  std::lock_guard<std::mutex> lock(mutex_);
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

}
}
