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

#include "driver/vm/js_vm.h"

#include "footstone/string_view_utils.h"
#include "driver/vm/native_source_code.h"
#include "driver/napi/js_try_catch.h"

namespace hippy {
inline namespace driver {
inline namespace vm {

constexpr char kExceptionHandlerJSName[] = "ExceptionHandle.js";
constexpr char kHippyExceptionHandlerName[] = "HippyExceptionHandler";

using Ctx = hippy::Ctx;
using CtxValue = hippy::CtxValue;

void VM::HandleException(const std::shared_ptr<Ctx>& ctx,
                         const string_view& event_name,
                         const std::shared_ptr<CtxValue>& exception) {
  auto global_object = ctx->GetGlobalObject();
  string_view error_handle_name(kHippyExceptionHandlerName);
  auto error_handle_key = ctx->CreateString(error_handle_name);
  auto exception_handler = ctx->GetProperty(global_object, error_handle_key);
  if (!ctx->IsFunction(exception_handler)) {
    const auto& source_code = hippy::GetNativeSourceCode(kExceptionHandlerJSName);
    FOOTSTONE_DCHECK(source_code.data_ && source_code.length_);
    string_view str_view(source_code.data_, source_code.length_);
    exception_handler = ctx->RunScript(str_view, error_handle_name);
    ctx->SetProperty(global_object, error_handle_key, exception_handler);
  }

  std::shared_ptr<CtxValue> argv[2];
  argv[0] = ctx->CreateString(event_name);
  argv[1] = exception;

  auto try_catch = CreateTryCatchScope(true, ctx);
  auto ret_value = ctx->CallFunction(exception_handler, ctx->GetGlobalObject(), 2, argv);
  if (try_catch->HasCaught()) {
    auto message = try_catch->GetExceptionMessage();
    FOOTSTONE_LOG(WARNING) << "hippy exceptionHandler error, description = " << message;
  }
}

}
}
}
