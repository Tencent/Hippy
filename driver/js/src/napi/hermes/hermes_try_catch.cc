/*
 *
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
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#include "driver/napi/hermes/hermes_try_catch.h"

namespace hippy {
inline namespace driver {
inline namespace napi {

using string_view = footstone::string_view;

std::shared_ptr<TryCatch> CreateTryCatchScope(bool enable, std::shared_ptr<Ctx> ctx) {
  return std::make_shared<HermesTryCatch>(enable, ctx);
}

HermesTryCatch::HermesTryCatch(bool enable, std::shared_ptr<Ctx>& ctx) : TryCatch(enable, ctx) { is_verbose_ = false; }

HermesTryCatch::~HermesTryCatch() {
  if (HasCaught()) {
    std::shared_ptr<HermesCtx> ctx = std::static_pointer_cast<HermesCtx>(ctx_);
    if (is_rethrow_ || is_verbose_) {
      ctx->SetException(exception_);
      if (is_rethrow_) {
        ctx->SetExceptionHandled(false);
      } else {
        ctx->SetExceptionHandled(true);
      }
    } else {
      ctx->SetException(nullptr);
      ctx->SetExceptionHandled(false);
    }
  }
}

void HermesTryCatch::ReThrow() { is_rethrow_ = true; }

bool HermesTryCatch::HasCaught() {
  if (enable_) {
    std::shared_ptr<HermesCtx> ctx = std::static_pointer_cast<HermesCtx>(ctx_);
    return !!ctx->GetException();
  }
  return false;
}

bool HermesTryCatch::CanContinue() {
  return false;
}

bool HermesTryCatch::HasTerminated() {
  return true;
}

bool HermesTryCatch::IsVerbose() { return is_verbose_; }

void HermesTryCatch::SetVerbose(bool is_verbose) { is_verbose_ = is_verbose; }

std::shared_ptr<CtxValue> HermesTryCatch::Exception() {
  if (enable_) {
    std::shared_ptr<HermesCtx> ctx = std::static_pointer_cast<HermesCtx>(ctx_);
    if (!ctx->IsExceptionHandled()) {
      return ctx->GetException();
    }
  }
  return nullptr;
}

string_view HermesTryCatch::GetExceptionMessage() {
  if (enable_) {
    std::shared_ptr<HermesCtx> ctx = std::static_pointer_cast<HermesCtx>(ctx_);
    if (!ctx->IsExceptionHandled()) {
      return ctx->GetExceptionMessage(ctx->GetException());
    }
  }
  return "";
}

}  // namespace napi
}  // namespace driver
}  // namespace hippy
