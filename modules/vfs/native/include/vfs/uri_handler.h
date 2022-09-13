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

#include <functional>
#include <memory>
#include <string>
#include <unordered_map>

#include "footstone/string_view.h"

namespace hippy {
inline namespace vfs {

class UriHandler {
 public:
  using bytes = std::string;
  enum class RetCode { Success, Failed, DelegateError, UriError, SchemeError, SchemeNotRegister,
      PathNotMatch, PathError, ResourceNotFound, Timeout };
  struct SyncContext {
    footstone::string_view uri;
    std::unordered_map<std::string, std::string> req_meta;
    RetCode code;
    std::unordered_map<std::string, std::string> rsp_meta;
    bytes content;
    SyncContext(const footstone::string_view& uri,
                const std::unordered_map<std::string, std::string>& req_meta,
                RetCode code,
                std::unordered_map<std::string, std::string> rsp_meta,
                bytes&& content) {
      this->uri = uri;
      this->req_meta = req_meta;
      this->code = code;
      this->rsp_meta = std::move(rsp_meta);
      this->content = std::move(content);
    }
  };

  struct ASyncContext {
    footstone::string_view uri;
    std::unordered_map<std::string, std::string> meta;
    std::function<void(RetCode, std::unordered_map<std::string, std::string>, bytes)> cb;

    ASyncContext(const footstone::string_view& uri,
                 std::unordered_map<std::string, std::string> meta,
                 std::function<void(RetCode, std::unordered_map<std::string, std::string>, bytes)> cb) {
      this->uri = uri;
      this->meta = meta;
      this->cb = cb;
    }
  };

  UriHandler() = default;
  virtual ~UriHandler() = default;

  virtual void RequestUntrustedContent(
      std::shared_ptr<SyncContext> ctx,
      std::function<std::shared_ptr<UriHandler>()> next) = 0;
  virtual void RequestUntrustedContent(
      std::shared_ptr<ASyncContext> ctx,
      std::function<std::shared_ptr<UriHandler>()> next) = 0;
};

}
}

