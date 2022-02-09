/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
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

#include "exception_handler.h"
#include "bridge/string_util.h"

static const uint32_t kRuntimeKeyIndex = 0;

void ExceptionHandler::ReportJsException(const std::shared_ptr<Runtime>& runtime, const unicode_string_view& desc,
                                         const unicode_string_view& stack) {
  TDF_BASE_DLOG(INFO) << "ReportJsException begin";

  auto runtime = runtime->GetBridge()->GetPlatformRuntime();
  if (runtime->GetBridge()->GetPlatformRuntime()) {
    const char16_t* exception = StrViewToCU16String(desc);
    const char16_t* stack_trace = StrViewToCU16String(stack);

    runtime->GetPlatformRuntime()->ReportJSException(exception, stack_trace);
  }

  TDF_BASE_DLOG(INFO) << "ReportJsException end";
}

void ExceptionHandler::HandleUncaughtJsError(v8::Local<v8::Message> message, v8::Local<v8::Value> error) {
  TDF_BASE_DLOG(INFO) << "HandleUncaughtJsError begin";

  if (error.IsEmpty()) {
    TDF_BASE_DLOG(ERROR) << "HandleUncaughtJsError error is empty";
    return;
  }
  v8::Isolate* isolate = message->GetIsolate();
  int64_t runtime_key = *(reinterpret_cast<int64_t*>(isolate->GetData(kRuntimeKeyIndex)));
  std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_key);
  if (!runtime) {
    return;
  }

  std::shared_ptr<hippy::napi::V8Ctx> ctx =
      std::static_pointer_cast<hippy::napi::V8Ctx>(runtime->GetScope()->GetContext());
  TDF_BASE_LOG(ERROR) << "HandleUncaughtJsError error desc = " << ctx->GetMsgDesc(message)
                      << ", stack = " << ctx->GetStackInfo(message);

  ExceptionHandler::ReportJsException(runtime, ctx->GetMsgDesc(message), ctx->GetStackInfo(message));

  ctx->ThrowExceptionToJS(std::make_shared<hippy::napi::V8CtxValue>(isolate, error));

  TDF_BASE_DLOG(INFO) << "HandleUncaughtJsError end";
}
