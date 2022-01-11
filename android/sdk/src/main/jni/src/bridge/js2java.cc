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

#include "bridge/js2java.h"

#include <memory>

#include "base/logging.h"
#include "base/unicode_string_view.h"
#include "bridge/runtime.h"
#include "bridge/serializer.h"
#include "core/base/string_view_utils.h"
#include "jni/jni_env.h"

using unicode_string_view = tdf::base::unicode_string_view;
using StringViewUtils = hippy::base::StringViewUtils;

namespace hippy {
namespace bridge {

void CallJava(hippy::napi::CBDataTuple *data) {
  TDF_BASE_DLOG(INFO) << "CallJava";
  auto runtime_id = static_cast<int32_t>(reinterpret_cast<int64_t>(data->cb_tuple_.data_));
  std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_id);
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

  jstring j_module_name;
  std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
  JNIEnv *j_env = instance->AttachCurrentThread();
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
    unicode_string_view module_name = v8_ctx->ToStringView(module_maybe_str.ToLocalChecked());
    j_module_name = JniUtils::StrViewToJString(j_env, module_name);
    TDF_BASE_DLOG(INFO) << "CallJava module_name = " << module_name;
  } else {
    isolate->ThrowException(
        v8::Exception::Error(
            v8::String::NewFromOneByte(isolate,
                                       reinterpret_cast<const uint8_t *>("info error"))
                .ToLocalChecked()));
    return;
  }

  jstring j_module_func;
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
    unicode_string_view module_func = v8_ctx->ToStringView(func_maybe_str.ToLocalChecked());
    j_module_func = JniUtils::StrViewToJString(j_env, module_func);
    TDF_BASE_DLOG(INFO) << "CallJava module_func = " << module_func;
  } else {
    isolate->ThrowException(
        v8::Exception::Error(
            v8::String::NewFromOneByte(isolate,
                                       reinterpret_cast<const uint8_t *>("info error"))
                .ToLocalChecked()));
    return;
  }

  jstring j_cb_id = nullptr;
  if (info.Length() >= 3 && !info[2].IsEmpty()) {
    v8::MaybeLocal<v8::String> cb_id_maybe_str = info[2]->ToString(context);
    if (!cb_id_maybe_str.IsEmpty()) {
      unicode_string_view cb_id = v8_ctx->ToStringView(cb_id_maybe_str.ToLocalChecked());
      j_cb_id = JniUtils::StrViewToJString(j_env, cb_id);
      TDF_BASE_DLOG(INFO) << "CallJava cb_id = " << cb_id;
    }
  }

  std::string buffer_data;
  if (info.Length() >= 4 && !info[3].IsEmpty() && info[3]->IsObject()) {
    if (runtime->IsEnableV8Serialization()) {
      Serializer serializer(isolate, context, runtime->GetBuffer());
      serializer.WriteHeader();
      serializer.WriteValue(info[3]);
      std::pair<uint8_t *, size_t> pair = serializer.Release();
      buffer_data =
          std::string(reinterpret_cast<const char *>(pair.first), pair.second);
    } else {
      std::shared_ptr<hippy::napi::V8CtxValue> obj =
          std::make_shared<hippy::napi::V8CtxValue>(isolate, info[3]);
      unicode_string_view json;
      TDF_BASE_DCHECK(v8_ctx->GetValueJson(obj, &json));
      TDF_BASE_DLOG(INFO) << "CallJava json = " << json;
      buffer_data = StringViewUtils::ToU8StdStr(json);
    }
  }

  uint8_t transfer_type = 0;
  if (info.Length() >= 5 && !info[4].IsEmpty() && info[4]->IsNumber()) {
    transfer_type =
        static_cast<uint8_t>(info[4]->NumberValue(context).FromMaybe(0));
  }
  TDF_BASE_DLOG(INFO) << "CallNative transfer_type = " << transfer_type;

  jobject j_buffer;
  jmethodID j_method;
  if (transfer_type == 1) {  // Direct
    j_buffer = j_env->NewDirectByteBuffer(
        const_cast<void *>(reinterpret_cast<const void *>(buffer_data.c_str())),
        buffer_data.length());
    j_method = instance->GetMethods().j_call_natives_direct_method_id;
  } else {  // Default
    auto buffer_size = JniUtils::CheckedNumericCast<size_t, jsize>(buffer_data.length());
    j_buffer = j_env->NewByteArray(buffer_size);
    j_env->SetByteArrayRegion(
        reinterpret_cast<jbyteArray>(j_buffer), 0, buffer_size,
        reinterpret_cast<const jbyte *>(buffer_data.c_str()));
    j_method = instance->GetMethods().j_call_natives_method_id;
  }

  j_env->CallVoidMethod(runtime->GetBridge()->GetObj(), j_method, j_module_name,
                        j_module_func, j_cb_id, j_buffer);

  JNIEnvironment::ClearJEnvException(j_env);

  // delete local ref
  j_env->DeleteLocalRef(j_module_name);
  j_env->DeleteLocalRef(j_module_func);
  j_env->DeleteLocalRef(j_cb_id);
  j_env->DeleteLocalRef(j_buffer);
}

}  // namespace bridge
}  // namespace hippy
