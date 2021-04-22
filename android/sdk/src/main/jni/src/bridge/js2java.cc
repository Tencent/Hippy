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

#include "bridge/runtime.h"
#include "bridge/serializer.h"
#include "jni/hippy_buffer.h"
#include "jni/jni_env.h"

namespace hippy {
namespace bridge {

void CallJava(hippy::napi::CBDataTuple* data) {
  HIPPY_DLOG(hippy::Debug, "CallJava");
  int64_t runtime_key = *(reinterpret_cast<int64_t*>(data->cb_tuple_.data_));
  std::shared_ptr<Runtime> runtime = Runtime::Find(runtime_key);
  if (!runtime) {
    return;
  }

  const v8::FunctionCallbackInfo<v8::Value>& info = data->info_;
  v8::Isolate* isolate = info.GetIsolate();
  if (!isolate) {
    HIPPY_LOG(hippy::Error, "CallJava isolate error");
    return;
  }

  v8::HandleScope handle_scope(isolate);
  std::shared_ptr<hippy::napi::V8Ctx> ctx =
      std::static_pointer_cast<hippy::napi::V8Ctx>(
          runtime->GetScope()->GetContext());
  v8::Local<v8::Context> context = ctx->context_persistent_.Get(isolate);
  v8::Context::Scope context_scope(context);
  if (context.IsEmpty()) {
    HIPPY_LOG(hippy::Error, "CallJava context empty");
    return;
  }

  jstring j_module_name = nullptr;
  std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
  JNIEnv* j_env = instance->AttachCurrentThread();
  if (info.Length() >= 1 && !info[0].IsEmpty()) {
    v8::String::Utf8Value module_name(isolate, info[0]);
    j_module_name = j_env->NewStringUTF(JniUtils::ToCString(module_name));
    HIPPY_DLOG(hippy::Debug, "CallJava module_name = %s",
               JniUtils::ToCString(module_name));
  }

  jstring j_module_func = nullptr;
  if (info.Length() >= 2 && !info[1].IsEmpty()) {
    v8::String::Utf8Value module_func(isolate, info[1]);
    j_module_func = j_env->NewStringUTF(JniUtils::ToCString(module_func));
    HIPPY_DLOG(hippy::Debug, "CallJava module_func = %s",
               JniUtils::ToCString(module_func));
  }

  jstring j_cb_id = nullptr;
  if (info.Length() >= 3 && !info[2].IsEmpty()) {
    v8::String::Utf8Value cb_id(isolate, info[2]);
    j_cb_id = j_env->NewStringUTF(JniUtils::ToCString(cb_id));
    HIPPY_DLOG(hippy::Debug, "CallJava cb_id = %s", JniUtils::ToCString(cb_id));
  }

  jbyteArray j_params_str = nullptr;
  std::string buffer_data;
  if (info.Length() >= 4 && !info[3].IsEmpty() && info[3]->IsObject()) {
    if (!runtime->IsParamJson()) {
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
      HIPPY_DLOG(hippy::Debug, "CallJava json = %s", JniUtils::ToCString(json));
      int str_len = strlen(JniUtils::ToCString(json));
      j_params_str = j_env->NewByteArray(str_len);
      j_env->SetByteArrayRegion(
          j_params_str, 0, str_len,
          reinterpret_cast<const jbyte*>(JniUtils::ToCString(json)));
    }
  }

  uint8_t transfer_type = 0;
  if (info.Length() >= 5 && !info[4].IsEmpty() && info[4]->IsNumber()) {
    transfer_type =
        static_cast<uint8_t>(info[4]->NumberValue(context).FromMaybe(0));
  }
  HIPPY_DLOG(hippy::Debug, "CallNative transfer_type = %d", transfer_type);

  jobject j_buffer = nullptr;
  jmethodID j_method = nullptr;
  if (transfer_type == 1) {  // Direct
    j_buffer = j_env->NewDirectByteBuffer(
        const_cast<void*>(reinterpret_cast<const void*>(buffer_data.c_str())),
        buffer_data.length());
    j_method = instance->GetMethods().call_natives_direct_method_id;
  } else {  // Default
    j_buffer = j_env->NewByteArray(buffer_data.length());
    j_env->SetByteArrayRegion(
        reinterpret_cast<jbyteArray>(j_buffer), 0, buffer_data.length(),
        reinterpret_cast<const jbyte*>(buffer_data.c_str()));
    j_method = instance->GetMethods().call_natives_method_id;
  }

  j_env->CallVoidMethod(runtime->GetBridge()->GetObj(), j_method, j_module_name,
                        j_module_func, j_cb_id, j_buffer);

  JNIEnvironment::ClearJEnvException(j_env);

  // delete local ref
  j_env->DeleteLocalRef(j_module_name);
  j_env->DeleteLocalRef(j_module_func);
  j_env->DeleteLocalRef(j_cb_id);
  j_env->DeleteLocalRef(j_params_str);
}

void CallJavaMethod(jobject j_obj, jlong j_value) {
  HIPPY_DLOG(hippy::Debug, "CallJavaMethod begin");
  jclass j_class = nullptr;

  if (!j_obj) {
    HIPPY_DLOG(hippy::Debug, "CallJavaMethod j_obj is nullptr");
    return;
  }

  JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  j_class = j_env->GetObjectClass(j_obj);
  if (!j_class) {
    HIPPY_LOG(hippy::Error, "CallJavaMethod j_class error");
    return;
  }

  jmethodID j_cb_id = j_env->GetMethodID(j_class, "Callback", "(J)V");
  if (!j_cb_id) {
    HIPPY_LOG(hippy::Error, "CallJavaMethod j_cb_id error");
    return;
  }

  HIPPY_DLOG(hippy::Debug, "CallJavaMethod call method");
  j_env->CallVoidMethod(j_obj, j_cb_id, j_value);
  JNIEnvironment::ClearJEnvException(j_env);

  if (j_class) {
    j_env->DeleteLocalRef(j_class);
  }
  HIPPY_DLOG(hippy::Debug, "CallJavaMethod end");
}

}  // namespace bridge
}  // namespace hippy
