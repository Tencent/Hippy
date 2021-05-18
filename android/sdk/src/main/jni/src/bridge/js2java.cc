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
#include "bridge/runtime.h"
#include "bridge/serializer.h"
#include "jni/hippy_buffer.h"
#include "jni/jni_env.h"

namespace hippy {
namespace bridge {

void CallJava(hippy::napi::CBDataTuple* data) {
  TDF_BASE_DLOG(INFO) << "CallJava";
  int64_t runtime_key = *(reinterpret_cast<int64_t*>(data->cb_tuple_.data_));
  std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_key);
  if (!runtime) {
    return;
  }

  const v8::FunctionCallbackInfo<v8::Value>& info = data->info_;
  v8::Isolate* isolate = info.GetIsolate();
  if (!isolate) {
    TDF_BASE_DLOG(ERROR) << "CallJava isolate error";
    return;
  }

  v8::HandleScope handle_scope(isolate);
  std::shared_ptr<hippy::napi::V8Ctx> ctx =
      std::static_pointer_cast<hippy::napi::V8Ctx>(
          runtime->GetScope()->GetContext());
  v8::Local<v8::Context> context = ctx->context_persistent_.Get(isolate);
  v8::Context::Scope context_scope(context);
  if (context.IsEmpty()) {
    TDF_BASE_DLOG(ERROR) << "CallJava context empty";
    return;
  }

  jstring j_module_name = nullptr;
  std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
  JNIEnv* j_env = instance->AttachCurrentThread();
  if (info.Length() >= 1 && !info[0].IsEmpty()) {
    v8::String::Utf8Value module_name(isolate, info[0]);
    j_module_name = j_env->NewStringUTF(JniUtils::ToCString(module_name));
    TDF_BASE_DLOG(INFO) << "CallJava module_name = "
                        << JniUtils::ToCString(module_name);
  }

  jstring j_module_func = nullptr;
  if (info.Length() >= 2 && !info[1].IsEmpty()) {
    v8::String::Utf8Value module_func(isolate, info[1]);
    j_module_func = j_env->NewStringUTF(JniUtils::ToCString(module_func));
    TDF_BASE_DLOG(INFO) << "CallJava module_func = "
                        << JniUtils::ToCString(module_func);
  }

  jstring j_cb_id = nullptr;
  if (info.Length() >= 3 && !info[2].IsEmpty()) {
    v8::String::Utf8Value cb_id(isolate, info[2]);
    j_cb_id = j_env->NewStringUTF(JniUtils::ToCString(cb_id));
    TDF_BASE_DLOG(INFO) << "CallJava cb_id = " << JniUtils::ToCString(cb_id);
  }

  std::string buffer_data;
  if (info.Length() >= 4 && !info[3].IsEmpty() && info[3]->IsObject()) {
    if (runtime->IsEnableV8Serialization()) {
      Serializer serializer(isolate, context, runtime->GetBuffer());
      serializer.WriteHeader();
      serializer.WriteValue(info[3]);
      std::pair<uint8_t*, size_t> pair = serializer.Release();
      buffer_data =
          std::string(reinterpret_cast<const char*>(pair.first), pair.second);
    } else {
      v8::Local<v8::Object> global = context->Global();
      v8::Local<v8::Value> JSON = TO_LOCAL_UNCHECKED(
          global->Get(context,
                      TO_LOCAL_UNCHECKED(
                          v8::String::NewFromUtf8(isolate, "JSON",
                                                  v8::NewStringType::kNormal),
                          v8::String)),
          v8::Value);
      v8::Local<v8::Value> fun = TO_LOCAL_UNCHECKED(
          v8::Local<v8::Object>::Cast(JSON)->Get(
              context, TO_LOCAL_UNCHECKED(
                           v8::String::NewFromUtf8(isolate, "stringify",
                                                   v8::NewStringType::kNormal),
                           v8::String)),
          v8::Value);
      v8::Local<v8::Value> argv[1] = {info[3]};
      v8::Local<v8::Value> s = TO_LOCAL_UNCHECKED(
          v8::Local<v8::Function>::Cast(fun)->Call(context, JSON, 1, argv),
          v8::Value);

      v8::String::Utf8Value json(isolate, s);
      buffer_data = std::string(JniUtils::ToCString(json));
      TDF_BASE_DLOG(INFO) << "CallJava json = " << buffer_data;
    }
  }

  uint8_t transfer_type = 0;
  if (info.Length() >= 5 && !info[4].IsEmpty() && info[4]->IsNumber()) {
    transfer_type =
        static_cast<uint8_t>(info[4]->NumberValue(context).FromMaybe(0));
  }
  TDF_BASE_DLOG(INFO) << "CallNative transfer_type = " << transfer_type;

  jobject j_buffer = nullptr;
  jmethodID j_method = nullptr;
  if (transfer_type == 1) {  // Direct
    j_buffer = j_env->NewDirectByteBuffer(
        const_cast<void*>(reinterpret_cast<const void*>(buffer_data.c_str())),
        buffer_data.length());
    j_method = instance->GetMethods().j_call_natives_direct_method_id;
  } else {  // Default
    j_buffer = j_env->NewByteArray(buffer_data.length());
    j_env->SetByteArrayRegion(
        reinterpret_cast<jbyteArray>(j_buffer), 0, buffer_data.length(),
        reinterpret_cast<const jbyte*>(buffer_data.c_str()));
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

void CallJavaMethod(jobject j_obj, jlong j_value) {
  TDF_BASE_DLOG(INFO) << "CallJavaMethod begin";
  jclass j_class = nullptr;

  if (!j_obj) {
    TDF_BASE_DLOG(INFO) << "CallJavaMethod j_obj is nullptr";
    return;
  }

  JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  j_class = j_env->GetObjectClass(j_obj);
  if (!j_class) {
    TDF_BASE_DLOG(ERROR) << "CallJavaMethod j_class error";
    return;
  }

  jmethodID j_cb_id = j_env->GetMethodID(j_class, "Callback", "(J)V");
  if (!j_cb_id) {
    TDF_BASE_DLOG(ERROR) << "CallJavaMethod j_cb_id error";
    return;
  }

  TDF_BASE_DLOG(INFO) << "CallJavaMethod call method";
  j_env->CallVoidMethod(j_obj, j_cb_id, j_value);
  JNIEnvironment::ClearJEnvException(j_env);

  if (j_class) {
    j_env->DeleteLocalRef(j_class);
  }
  TDF_BASE_DLOG(INFO) << "CallJavaMethod end";
}

}  // namespace bridge
}  // namespace hippy
