/*****************************************************************************
 * @copyright Copyright (C), 1998-2020, Tencent Tech. Co., Ltd.
 * @file     exception_handler.cc
 * @brief    
 * @author   skindhu
 * @version  1.0.0
 * @date     2021/8/12
 *****************************************************************************/
#include "exception_handler.h"
#include "bridge/string_util.h"

using StringViewUtil = hippy::base::StringViewUtils;
static const uint32_t kRuntimeKeyIndex = 0;

void ExceptionHandler::ReportJsException(const std::shared_ptr<Runtime> &runtime,
                                         const unicode_string_view &desc,
                                         const unicode_string_view &stack) {
  TDF_BASE_DLOG(INFO) << "ReportJsException begin";

  if (runtime->GetPlatformRuntime()) {
    const char16_t *exception = StrViewToCU16String(desc);
    const char16_t *stack_trace = StrViewToCU16String(stack);

    runtime->GetPlatformRuntime()->ReportJSException(exception, stack_trace);
  }

  TDF_BASE_DLOG(INFO) << "ReportJsException end";
}

void ExceptionHandler::HandleUncaughtJsError(v8::Local<v8::Message> message,
                           v8::Local<v8::Value> error) {
  TDF_BASE_DLOG(INFO) << "HandleUncaughtJsError begin";

  if (error.IsEmpty()) {
    TDF_BASE_DLOG(ERROR) << "HandleUncaughtJsError error is empty";
    return;
  }
  v8::Isolate *isolate = message->GetIsolate();
  int64_t runtime_key =
      *(reinterpret_cast<int64_t *>(isolate->GetData(kRuntimeKeyIndex)));
  std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_key);
  if (!runtime) {
    return;
  }

  std::shared_ptr<hippy::napi::V8Ctx> ctx =
      std::static_pointer_cast<hippy::napi::V8Ctx>(
          runtime->GetScope()->GetContext());
  TDF_BASE_LOG(ERROR) << "HandleUncaughtJsError error desc = "
                      << ctx->GetMsgDesc(message)
                      << ", stack = " << ctx->GetStackInfo(message);

  ExceptionHandler::ReportJsException(runtime, ctx->GetMsgDesc(message),
                                      ctx->GetStackInfo(message));

  ctx->ThrowExceptionToJS(
      std::make_shared<hippy::napi::V8CtxValue>(isolate, error));

  TDF_BASE_DLOG(INFO) << "HandleUncaughtJsError end";
}
