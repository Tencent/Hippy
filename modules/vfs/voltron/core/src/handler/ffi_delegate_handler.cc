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

#include "handler/ffi_delegate_handler.h"

#include "footstone/check.h"
#include "footstone/logging.h"
#include "wrapper.h"

namespace voltron {

FfiDelegateHandler::FfiDelegateHandler(uint32_t wrapper_id): wrapper_id_(wrapper_id) {

}

void FfiDelegateHandler::RequestUntrustedContent(std::shared_ptr<hippy::RequestJob> request,
                                                 std::shared_ptr<hippy::JobResponse> response,
                                                 std::function<std::shared_ptr<UriHandler>()> next) {
  bool notified = false;

  FOOTSTONE_DCHECK(!next()) << "ffi delegate must be the last handler";
  auto req_meta = request->GetMeta();
  if (req_meta[kCallFromKey] == kCallFromDart) {
    response->SetRetCode(RetCode::SchemeNotRegister);
    return;
  }

  auto wrapper = voltron::VfsWrapper::GetWrapper(wrapper_id_);
  if (!wrapper) {
    response->SetRetCode(RetCode::Failed);
    return;
  }

  wrapper->InvokeDart(request->GetUri(),
                      req_meta,
                      [this, &response, &notified](RetCode code,
                                              std::unordered_map<std::string, std::string> meta,
                                              bytes content) {
                        response->SetRetCode(code);
                        if (code == RetCode::Success) {
                          response->SetMeta(std::move(meta));
                          response->SetContent(std::move(content));
                        }

                        std::unique_lock<std::mutex> lock(mutex_);
                        notified = true;
                        cv_.notify_all();
                      });
  std::unique_lock<std::mutex> lock(mutex_);
  if (!notified) {
    cv_.wait(lock);
  }
}

void FfiDelegateHandler::RequestUntrustedContent(
    std::shared_ptr<hippy::RequestJob> request,
    std::function<void(std::shared_ptr<hippy::JobResponse>)> cb,
    std::function<std::shared_ptr<UriHandler>()> next) {
  FOOTSTONE_DCHECK(!next()) << "ffi delegate must be the last handler";
  auto req_meta = request->GetMeta();
  if (req_meta[kCallFromKey] == kCallFromDart) {
    cb(std::make_shared<hippy::JobResponse>(hippy::JobResponse::RetCode::SchemeNotRegister));
    return;
  }

  auto wrapper = voltron::VfsWrapper::GetWrapper(wrapper_id_);
  if (!wrapper) {
    cb(std::make_shared<hippy::JobResponse>(hippy::JobResponse::RetCode::Failed));
    return;
  }

  wrapper->InvokeDart(request->GetUri(),
                      req_meta,
                      [cb](RetCode code,
                          std::unordered_map<std::string, std::string> meta,
                          bytes content) {
                        cb(std::make_shared<hippy::JobResponse>(code, "",
                                                         std::move(meta), std::move(content)));
                      });
}

FfiDelegateHandler::~FfiDelegateHandler() {
  cv_.notify_all();
}

}
