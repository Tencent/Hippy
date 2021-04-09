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
  JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
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
  HippyBuffer* hippy_buffer = nullptr;
  if (info.Length() >= 4 && !info[3].IsEmpty() && info[3]->IsObject()) {
    if (!runtime->IsParamJson()) {
      hippy_buffer = JniUtils::WriteToBuffer(
          isolate, v8::Local<v8::Object>::Cast(info[3]));
      if (hippy_buffer != nullptr && hippy_buffer->data != nullptr) {
        j_params_str = j_env->NewByteArray(hippy_buffer->position);
        j_env->SetByteArrayRegion(
            j_params_str, 0, hippy_buffer->position,
            reinterpret_cast<const jbyte*>(hippy_buffer->data));
      }
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

  j_env->CallVoidMethod(
      runtime->GetBridge()->GetObj(),
      JNIEnvironment::GetInstance()->GetMethods().call_natives_method_id,
      j_module_name, j_module_func, j_cb_id, j_params_str);

  JNIEnvironment::ClearJEnvException(j_env);

  // delete local ref
  j_env->DeleteLocalRef(j_module_name);
  j_env->DeleteLocalRef(j_module_func);
  j_env->DeleteLocalRef(j_cb_id);
  j_env->DeleteLocalRef(j_params_str);
  if (hippy_buffer != nullptr) {
    ReleaseBuffer(hippy_buffer);
  }
  hippy_buffer = nullptr;
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
