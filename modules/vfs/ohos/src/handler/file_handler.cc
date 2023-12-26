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

#include "vfs/handler/file_handler.h"
#include "footstone/task.h"
#include "vfs/file.h"
#include "vfs/uri.h"

constexpr char kRunnerName[] = "file_handler_runner";

namespace hippy {
inline namespace vfs {

void FileHandler::RequestUntrustedContent(std::shared_ptr<RequestJob> request,
                                          std::shared_ptr<JobResponse> response,
                                          std::function<std::shared_ptr<UriHandler>()> next) {
  string_view uri = request->GetUri();
  auto uri_obj = Uri::Create(uri);
  string_view path = uri_obj->GetPath();
  if (path.encoding() == string_view::Encoding::Unknown) {
    response->SetRetCode(hippy::JobResponse::RetCode::PathError);
    return;
  }
  bool ret = HippyFile::ReadFile(path, response->GetContent(), false);
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
    std::shared_ptr<RequestJob> request,
    std::function<void(std::shared_ptr<JobResponse>)> cb,
    std::function<std::shared_ptr<UriHandler>()> next) {
  auto uri_obj = Uri::Create(request->GetUri());
  string_view path = uri_obj->GetPath();
  if (path.encoding() == string_view::Encoding::Unknown) {
    cb(std::make_shared<JobResponse>(UriHandler::RetCode::PathError));
    return;
  }
  auto new_cb = [orig_cb = cb](std::shared_ptr<JobResponse> response) { orig_cb(response); };
  LoadByFile(path, request, new_cb, next);
}

void FileHandler::LoadByFile(
    const string_view& path,
    std::shared_ptr<RequestJob> request,
    std::function<void(std::shared_ptr<JobResponse>)> cb,
    std::function<std::shared_ptr<UriHandler>()> next) {
  {
    std::lock_guard<std::mutex> lock_guard(mutex_);
    if (!runner_) {
        runner_ = request->GetWorkerManager()->CreateTaskRunner(kRunnerName);
    }
  }
  runner_->PostTask([path, cb] {
      UriHandler::bytes content;
      bool ret = HippyFile::ReadFile(path, content, false);
      if (ret) {
          cb(std::make_shared<JobResponse>(hippy::JobResponse::RetCode::Success, "",
                                           std::unordered_map<std::string, std::string>{}, std::move(content)));
      } else {
          cb(std::make_shared<JobResponse>(hippy::JobResponse::RetCode::Failed));
      }
  });
}
}
}
