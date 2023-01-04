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

#include <unordered_map>

#include "footstone/string_view.h"

namespace hippy {
inline namespace vfs {

class JobResponse {
 public:
  using string_view = footstone::string_view;
  using bytes = std::string;

  enum class RetCode { Success, Failed, DelegateError, UriError, SchemeError, SchemeNotRegister,
    PathNotMatch, PathError, ResourceNotFound, Timeout };

  JobResponse(RetCode code, const string_view& err_msg, std::unordered_map<std::string, std::string> meta, bytes&& content);
  JobResponse(RetCode code);
  JobResponse();
  virtual ~JobResponse() = default;

  inline auto GetRetCode() {
    return code_;
  }

  inline void SetRetCode(RetCode code) {
    code_ = code;
  }

  inline auto GetErrorMessage() {
    return err_msg_;
  }

  inline void SetErrorMessage(const string_view& err_msg) {
    err_msg_ = err_msg;
  }

  inline auto GetMeta() {
    return meta_;
  }

  inline void SetMeta(std::unordered_map<std::string, std::string> meta) {
    meta_ = meta;
  }

  inline auto& GetContent() {
    return content_;
  }

  inline void SetContent(bytes&& content) {
    content_ = std::move(content);
  }

  bytes ReleaseContent();

 private:
  RetCode code_;
  string_view err_msg_;
  std::unordered_map<std::string, std::string> meta_;
  bytes content_;
};

}
}
