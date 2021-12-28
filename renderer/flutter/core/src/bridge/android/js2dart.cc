/*****************************************************************************
 * @copyright Copyright (C), 1998-2020, Tencent Tech. Co., Ltd.
 * @file     js2dart.cc
 * @brief    
 * @author   skindhu
 * @version  1.0.0
 * @date     2021/8/12
 *****************************************************************************/
#include "js2dart.h"
#include "runtime.h"
#include "bridge/string_util.h"
#include "serializer.h"

using unicode_string_view = tdf::base::unicode_string_view;
using StringViewUtil = hippy::base::StringViewUtils;

namespace voltron {
namespace bridge {
void callDartMethod(hippy::napi::CBDataTuple *data) {
  TDF_BASE_DLOG(INFO) << "CallDartMethod";
  int64_t runtime_key = *(reinterpret_cast<int64_t *>(data->cb_tuple_.data_));
  std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_key);
  if (!runtime) {
    return;
  }

  const v8::FunctionCallbackInfo<v8::Value> &info = data->info_;
  v8::Isolate *isolate = info.GetIsolate();
  if (!isolate) {
    TDF_BASE_DLOG(ERROR) << "CallJava isolate error";
    return;
  }

  v8::HandleScope handle_scope(isolate);
  std::shared_ptr<hippy::napi::V8Ctx> v8_ctx =
      std::static_pointer_cast<hippy::napi::V8Ctx>(
          runtime->GetScope()->GetContext());
  v8::Local<v8::Context> context = v8_ctx->context_persistent_.Get(isolate);
  v8::Context::Scope context_scope(context);
  if (context.IsEmpty()) {
    TDF_BASE_DLOG(ERROR) << "CallJava context empty";
    return;
  }

  const char16_t *module_name;
  if (info.Length() >= 1 && !info[0].IsEmpty()) {

    v8::MaybeLocal<v8::String> module_maybe_str = info[0]->ToString(context);
    if (module_maybe_str.IsEmpty()) {
      isolate->ThrowException(
          v8::Exception::TypeError(
              v8::String::NewFromOneByte(isolate,
                                         reinterpret_cast<const uint8_t *>("module name error"))
                  .ToLocalChecked()));
      return;
    }
    unicode_string_view module_name_view =
        v8_ctx->ToStringView(module_maybe_str.ToLocalChecked());
    module_name = StrViewToCU16String(module_name_view);
    TDF_BASE_DLOG(INFO) << "callDartMethod module_name = " << module_name_view;
  } else {
    isolate->ThrowException(
        v8::Exception::Error(
            v8::String::NewFromOneByte(isolate,
                                       reinterpret_cast<const uint8_t *>("info error"))
                .ToLocalChecked()));
    return;
  }

  const char16_t *module_func;
  if (info.Length() >= 2 && !info[1].IsEmpty()) {
    v8::MaybeLocal<v8::String> func_maybe_str = info[1]->ToString(context);
    if (func_maybe_str.IsEmpty()) {
      isolate->ThrowException(
          v8::Exception::TypeError(
              v8::String::NewFromOneByte(isolate,
                                         reinterpret_cast<const uint8_t *>("func name error"))
                  .ToLocalChecked()));
      return;
    }
    unicode_string_view module_func_view =
        v8_ctx->ToStringView(func_maybe_str.ToLocalChecked());
    module_func = StrViewToCU16String(module_func_view);
    TDF_BASE_DLOG(INFO) << "callDartMethod module_func = " << module_func_view;
  } else {
    isolate->ThrowException(
        v8::Exception::Error(
            v8::String::NewFromOneByte(isolate,
                                       reinterpret_cast<const uint8_t *>("info error"))
                .ToLocalChecked()));
    return;
  }

  const char16_t *call_id = nullptr;
  if (info.Length() >= 3 && !info[2].IsEmpty()) {
    v8::MaybeLocal<v8::String> cb_id_maybe_str = info[2]->ToString(context);
    if (!cb_id_maybe_str.IsEmpty()) {
      unicode_string_view
          cb_id = v8_ctx->ToStringView(cb_id_maybe_str.ToLocalChecked());
      call_id = StrViewToCU16String(cb_id);
      TDF_BASE_DLOG(INFO) << "callDartMethod cb_id = " << cb_id;
    }
  }

  const char *buffer_data = nullptr;
  int buffer_length = 0;
  if (info.Length() >= 4 && !info[3].IsEmpty() && info[3]->IsObject()) {
    if (runtime->IsEnableV8Serialization()) {
      Serializer serializer(isolate, context, runtime->GetBuffer());
      serializer.WriteHeader();
      serializer.WriteValue(info[3]);
      std::pair<uint8_t *, size_t> pair = serializer.Release();
      std::string result = std::string(reinterpret_cast<const char *>(pair.first), pair.second);
      buffer_length= result.length();
      // 直接传buffer_length，防止result.c_str时字符串被意外截断
      buffer_data = copyCharToChar(result.c_str(), buffer_length);

      std::shared_ptr<hippy::napi::V8CtxValue> obj =
          std::make_shared<hippy::napi::V8CtxValue>(isolate, info[3]);
      unicode_string_view json;
      TDF_BASE_DCHECK(v8_ctx->GetValueJson(obj, &json));
      TDF_BASE_DLOG(INFO) << "callDartMethod json = " << json;

    } else {
      std::shared_ptr<hippy::napi::V8CtxValue> obj =
          std::make_shared<hippy::napi::V8CtxValue>(isolate, info[3]);
      unicode_string_view json;
      TDF_BASE_DCHECK(v8_ctx->GetValueJson(obj, &json));
      TDF_BASE_DLOG(INFO) << "callDartMethod json = " << json;
      buffer_data = StringViewUtils::ToU8StdStr(json).c_str();
    }
  }

  runtime->GetPlatformRuntime()->CallNaive(module_name,
                                           module_func,
                                           call_id,
                                           buffer_data,
                                           buffer_length,
                                           !runtime->IsEnableV8Serialization(),
                                           nullptr, true);
}
}  // namespace bridge

}  // namespace voltron