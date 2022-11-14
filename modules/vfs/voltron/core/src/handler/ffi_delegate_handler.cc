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

void FfiDelegateHandler::RequestUntrustedContent(std::shared_ptr<SyncContext> ctx,
                                          std::function<std::shared_ptr<UriHandler>()> next) {
  bool notified = false;

  FOOTSTONE_DCHECK(!next()) << "ffi delegate must be the last handler";
  if (ctx->req_meta[kCallFromKey] == kCallFromDart) {
    ctx->code = RetCode::SchemeNotRegister;
    return;
  }

  auto wrapper = voltron::VfsWrapper::GetWrapper(wrapper_id_);
  if (!wrapper) {
    ctx->code = RetCode::Failed;
    return;
  }

  wrapper->InvokeDart(ctx->uri,
                      ctx->req_meta,
                      [this, &ctx, &notified](RetCode code,
                                              std::unordered_map<std::string, std::string> meta,
                                              bytes content) {
                        ctx->code = code;
                        if (code == RetCode::Success) {
                          ctx->rsp_meta = std::move(meta);
                          ctx->content = std::move(content);
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
    std::shared_ptr<ASyncContext> ctx,
    std::function<std::shared_ptr<UriHandler>()> next) {
  FOOTSTONE_DCHECK(!next()) << "ffi delegate must be the last handler";
  if (ctx->req_meta[kCallFromKey] == kCallFromDart) {
    ctx->cb(UriHandler::RetCode::SchemeNotRegister, {}, {});
    return;
  }

  auto wrapper = voltron::VfsWrapper::GetWrapper(wrapper_id_);
  if (!wrapper) {
    ctx->cb(UriHandler::RetCode::Failed, {}, {});
    return;
  }

  wrapper->InvokeDart(ctx->uri,
                      ctx->req_meta,
                      [orig_cb = ctx->cb](RetCode code,
                                          std::unordered_map<std::string, std::string> meta,
                                          bytes content) {
                        orig_cb(code, std::move(meta), std::move(content));
                      });
}

FfiDelegateHandler::~FfiDelegateHandler() {
  cv_.notify_all();
}

}
