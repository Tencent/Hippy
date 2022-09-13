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

#include "android_vfs/file_handler.h"

#include "android_vfs/uri.h"
#include "footstone/task.h"
#include "vfs/file.h"


using Uri = hippy::Uri;

namespace hippy {
inline namespace vfs {

void FileHandler::RequestUntrustedContent(std::shared_ptr<SyncContext> ctx,
                                           std::function<std::shared_ptr<UriHandler>()> next) {
  string_view uri = ctx->uri;
  std::shared_ptr<Uri> uri_obj = Uri::Create(uri);
  string_view path = uri_obj->GetPath();
  if (path.encoding() == string_view::Encoding::Unknown) {
    ctx->code = UriHandler::RetCode::PathError;
    return;
  }
  bool ret = HippyFile::ReadFile(path, ctx->content, false);
  if (ret) {
    ctx->code = UriHandler::RetCode::Success;
  } else {
    ctx->code = UriHandler::RetCode::Failed;
  }
}

void FileHandler::RequestUntrustedContent(
    std::shared_ptr<ASyncContext> ctx,
    std::function<std::shared_ptr<UriHandler>()> next) {
  string_view uri = ctx->uri;
  std::shared_ptr<Uri> uri_obj = Uri::Create(uri);
  string_view path = uri_obj->GetPath();
  if (path.encoding() == string_view::Encoding::Unknown) {
    ctx->cb(UriHandler::RetCode::PathError, {}, UriHandler::bytes());
    return;
  }
  LoadByFile(path, ctx->cb);
}

void FileHandler::LoadByFile(const string_view& path,
                              std::function<void(UriHandler::RetCode,
                                                 std::unordered_map<std::string, std::string>,
                                                 UriHandler::bytes)> cb) {
  auto runner = runner_.lock();
  if (!runner) {
    cb(UriHandler::RetCode::DelegateError, {}, UriHandler::bytes());
    return;
  }
  runner->PostTask([path, cb] {
    UriHandler::bytes content;
    bool ret = HippyFile::ReadFile(path, content, false);
    if (ret) {
      cb(UriHandler::RetCode::Success, {}, std::move(content));
    } else {
      cb(UriHandler::RetCode::Failed, {}, std::move(content));
    }
  });
}

}
}
