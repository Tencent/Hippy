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

#include "driver/napi/jsh/jsh_try_catch.h"
#include "footstone/string_view.h"
#include "footstone/string_view_utils.h"
#include "driver/napi/jsh/jsh_ctx.h"
#include "driver/napi/jsh/jsh_ctx_value.h"
#include "driver/vm/jsh/jsh_vm.h"

namespace hippy {
inline namespace driver {
inline namespace napi {

using string_view = footstone::string_view;

std::shared_ptr<TryCatch> CreateTryCatchScope(bool enable,
                                              std::shared_ptr<Ctx> ctx) {
  return std::make_shared<JSHTryCatch>(enable, ctx);
}

JSHTryCatch::JSHTryCatch(bool enable, const std::shared_ptr<Ctx>& ctx)
    : TryCatch(enable, ctx) {
}

JSHTryCatch::~JSHTryCatch() {
  if (HasCaught()) {
    if (is_rethrow_ && exception_) {
      auto jsh_ctx = std::static_pointer_cast<JSHCtx>(ctx_);
      auto env = jsh_ctx->env_;
      auto status = OH_JSVM_Throw(env, exception_->GetValue());
      FOOTSTONE_DCHECK(status == JSVM_OK);
    }
  }
}

void JSHTryCatch::ReThrow() {
  is_rethrow_ = true;
}

bool JSHTryCatch::HasCaught() {
  if (enable_) {
    if (exception_) {
      return true;
    }
    
    auto jsh_ctx = std::static_pointer_cast<JSHCtx>(ctx_);
    auto env = jsh_ctx->env_;
      
    bool isPending = false;
    if (OH_JSVM_IsExceptionPending(env, &isPending) == JSVM_OK && isPending) {
      JSVM_Value error = nullptr;
      if (OH_JSVM_GetAndClearLastException(env, &error) == JSVM_OK) {
        exception_ = std::make_shared<JSHCtxValue>(env, error);
        return true;
      }
    }
    return false;
  }
  return false;
}

bool JSHTryCatch::CanContinue() {
  if (enable_) {
    return exception_ ? false : true;
  }
  return true;
}

bool JSHTryCatch::HasTerminated() {
  if (enable_) {
    return exception_ ? true : false;
  }
  return false;
}

bool JSHTryCatch::IsVerbose() {
  return is_verbose_;
}

void JSHTryCatch::SetVerbose(bool verbose) {
  is_verbose_ = verbose;
}

std::shared_ptr<CtxValue> JSHTryCatch::Exception() {
  return exception_;
}

string_view JSHTryCatch::GetExceptionMessage() {
  if (enable_ && exception_) {
    auto jsh_ctx = std::static_pointer_cast<JSHCtx>(ctx_);
    auto env = jsh_ctx->env_;
    auto error = exception_->GetValue();
    
    JSVM_Value stack = nullptr;
    auto status = OH_JSVM_GetNamedProperty(env, error, "stack", &stack);
    FOOTSTONE_DCHECK(status == JSVM_OK);

    JSVM_Value message = nullptr;
    status = OH_JSVM_GetNamedProperty(env, error, "message", &message);
    FOOTSTONE_DCHECK(status == JSVM_OK);

    char stackstr[256] = {0};
    status = OH_JSVM_GetValueStringUtf8(env, stack, stackstr, 256, nullptr);
    FOOTSTONE_DCHECK(status == JSVM_OK);

    char messagestr[256] = {0};
    status = OH_JSVM_GetValueStringUtf8(env, message, messagestr, 256, nullptr);
    FOOTSTONE_DCHECK(status == JSVM_OK);
    
    std::string str = std::string("message: ") + messagestr + ", stack: " + stackstr;
    string_view ret(str);
    FOOTSTONE_DLOG(ERROR) << "GetExceptionMessage msg = " << ret;
    return ret;
  }
  return "";
}

}
}
}
