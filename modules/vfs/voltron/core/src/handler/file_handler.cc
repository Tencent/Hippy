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

#include "handler/file_handler.h"

#include <utility>

#include "footstone/string_view_utils.h"
#include "footstone/task.h"
#include "vfs/file.h"
#include "url.h"

namespace voltron {

void FileHandler::RequestUntrustedContent(std::shared_ptr<hippy::RequestJob> request,
                                          std::shared_ptr<hippy::JobResponse> response,
                                          std::function<std::shared_ptr<UriHandler>()> next) {
  string_view uri = request->GetUri();
  std::shared_ptr<Url> uri_obj =
      std::make_shared<Url>(footstone::StringViewUtils::ToStdString(footstone::StringViewUtils::CovertToUtf8(
          uri,
          uri.encoding()).utf8_value()));
  std::string path = uri_obj->path();
  if (path.empty()) {
    response->SetRetCode(hippy::JobResponse::RetCode::PathError);
    return;
  }
  string_view path_view = string_view::new_from_utf8(path.c_str(), path.size());
  bool ret = hippy::HippyFile::ReadFile(path_view, response->GetContent(), false);
  if (ret) {
    response->SetRetCode(UriHandler::RetCode::Success);
  } else {
    response->SetRetCode(UriHandler::RetCode::Failed);
  }
  auto next_handler = next();
  if (next_handler) {
    next_handler->RequestUntrustedContent(request, response, next);
  }
}

void FileHandler::RequestUntrustedContent(
    std::shared_ptr<hippy::RequestJob> request,
    std::function<void(std::shared_ptr<hippy::JobResponse>)> cb,
    std::function<std::shared_ptr<UriHandler>()> next) {
  string_view uri = request->GetUri();
  std::shared_ptr<Url> uri_obj =
      std::make_shared<Url>(footstone::StringViewUtils::ToStdString(footstone::StringViewUtils::CovertToUtf8(
          uri,
          uri.encoding()).utf8_value()));
  std::string path = uri_obj->path();
  if (path.empty()) {
    cb(std::make_shared<hippy::JobResponse>(UriHandler::RetCode::PathError));
    return;
  }
  auto new_cb = [orig_cb = cb](std::shared_ptr<hippy::JobResponse> response) {
    orig_cb(std::move(response));
  };
  LoadByFile(path, request, new_cb, next);
}

void FileHandler::LoadByFile(const std::string& path,
                             std::shared_ptr<hippy::RequestJob> request,
                             std::function<void(std::shared_ptr<hippy::JobResponse>)> cb,
                             const std::function<std::shared_ptr<UriHandler>()>& next) {
  auto runner = runner_.lock();
  if (!runner) {
    cb(std::make_shared<hippy::JobResponse>(UriHandler::RetCode::DelegateError));
    return;
  }
  runner->PostTask([path, cb, next] {
    UriHandler::bytes content;
    string_view path_view = string_view::new_from_utf8(path.c_str(), path.size());
    bool ret = hippy::HippyFile::ReadFile(path_view, content, false);
    if (ret) {
      cb(std::make_shared<hippy::JobResponse>(hippy::JobResponse::RetCode::Success, "",
                                       std::unordered_map<std::string, std::string>{}, std::move(content)));
    } else {
      cb(std::make_shared<hippy::JobResponse>(hippy::JobResponse::RetCode::Failed));
    }
  });
}

}
