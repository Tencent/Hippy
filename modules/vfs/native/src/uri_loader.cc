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

void UriLoader::RegisterUriHandler(const footstone::string_view& scheme,
                                    std::shared_ptr<UriHandler> handler) {
  std::u16string u16_scheme = StringViewUtils::ConvertEncoding(scheme, string_view::Encoding::Utf16).utf16_value();

  std::lock_guard<std::mutex> lock(mutex_);
  auto it = router_.find(u16_scheme);
  if (it == router_.end()) {
    router_.insert({u16_scheme, std::list<std::shared_ptr<UriHandler>>{handler}});
  } else {
    it->second.push_back(handler);
  }
}

void UriLoader::RequestUntrustedContent(const string_view& uri,
                                        std::unordered_map<std::string, std::string> meta,
                                        std::function<void(RetCode, std::unordered_map<std::string, std::string>, bytes)> cb) {
  bytes content;
  auto scheme = GetScheme(uri);
  if (scheme.encoding() == string_view::Encoding::Unknown) {
    cb(RetCode::SchemeError, {}, content);
    return;
  }

  FOOTSTONE_DCHECK(scheme.encoding() == string_view::Encoding::Utf16);
  std::shared_ptr<std::list<std::shared_ptr<UriHandler>>::iterator> cur_it;
  std::shared_ptr<std::list<std::shared_ptr<UriHandler>>::iterator> end_it;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    const auto& scheme_it = router_.find(scheme.utf16_value());
    if (scheme_it == router_.end()) {
      cb(RetCode::SchemeNotRegister, {}, content);
      return;
    }
    FOOTSTONE_DCHECK(!scheme_it->second.empty());
    cur_it = std::make_shared<std::list<std::shared_ptr<UriHandler>>::iterator>(scheme_it->second.begin());
    end_it = std::make_shared<std::list<std::shared_ptr<UriHandler>>::iterator>(scheme_it->second.end());
  }
  auto ctx = std::make_shared<ASyncContext>(uri, meta, cb);
  auto weak = weak_from_this();
  std::function<std::shared_ptr<UriHandler>()> next = [weak, cur_it, end_it]() mutable -> std::shared_ptr<UriHandler> {
    auto self = weak.lock();
    if (!self) {
      return nullptr;
    }
    return self->GetNextDelegate(*cur_it, *end_it);
  };
  (**cur_it)->RequestUntrustedContent(ctx, next);
}

void UriLoader::RequestUntrustedContent(const string_view& uri,
                                        const std::unordered_map<std::string, std::string>& req_meta,
                                        RetCode& code,
                                        std::unordered_map<std::string, std::string>& rsp_meta,
                                        bytes&& content) {
  string_view scheme = GetScheme(uri);
  if (scheme.encoding() == string_view::Encoding::Unknown) {
    code = RetCode::SchemeError;
    return;
  }

  FOOTSTONE_DCHECK(scheme.encoding() == string_view::Encoding::Utf16);

  std::list<std::shared_ptr<UriHandler>>::iterator cur_it;
  std::list<std::shared_ptr<UriHandler>>::iterator end_it;
  {
    std::lock_guard<std::mutex> lock(mutex_);
    const auto& scheme_it = router_.find(scheme.utf16_value());
    if (scheme_it == router_.end()) {
      code = RetCode::SchemeNotRegister;
      return;
    }
    FOOTSTONE_DCHECK(!scheme_it->second.empty());
    cur_it = scheme_it->second.begin();
    end_it = scheme_it->second.end();
  }

  auto ctx = std::make_shared<SyncContext>(uri, req_meta, RetCode::Success, rsp_meta, std::move(content));
  std::function<std::shared_ptr<UriHandler>()> next = [this, &cur_it, end_it]() -> std::shared_ptr<UriHandler> {
    return this->GetNextDelegate(cur_it, end_it);
  };
  (*cur_it)->RequestUntrustedContent(ctx, next);
}
std::shared_ptr<UriHandler> UriLoader::GetNextDelegate(std::list<std::shared_ptr<UriHandler>>::iterator& cur,
                                                       const std::list<std::shared_ptr<UriHandler>>::iterator& end) {
  std::lock_guard<std::mutex> lock(mutex_);
  ++cur;
  if (cur == end) {
    return nullptr;
  }
  return *cur;
}

}
}
