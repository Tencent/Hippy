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

#include "bridge/adr_bridge.h"
#include "bridge/js2java.h"

#include <memory>

#include "base/logging.h"
#include "base/unicode_string_view.h"
#include "bridge/runtime.h"
#include "core/scope.h"
#include "core/vm/v8/serializer.h"
#include "jni/jni_env.h"
#include "jni/jni_utils.h"

using unicode_string_view = tdf::base::unicode_string_view;
using StringViewUtils = hippy::base::StringViewUtils;
using Ctx = hippy::napi::Ctx;

namespace hippy {
namespace bridge {

void CallJava(const hippy::napi::CallbackInfo& info, int32_t runtime_id) {
  TDF_BASE_DLOG(INFO) << "CallJava runtime_id = " << runtime_id;
  auto runtime = Runtime::Find(runtime_id);
  if (!runtime) {
    TDF_BASE_DLOG(INFO) << "CallJava runtime not found";
    return;
  }

  auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(std::any_cast<void*>(info.GetSlot()));
  auto scope = scope_wrapper->scope.lock();
  TDF_BASE_CHECK(scope);
  auto context = scope->GetContext();

  jstring j_module_name;
  std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
  JNIEnv *j_env = instance->AttachCurrentThread();
  if (info[0]) {
    unicode_string_view module_name;
    if (!context->GetValueString(info[0], &module_name)) {
      info.GetExceptionValue()->Set(context,"module name error");
      return;
    }
    j_module_name = JniUtils::StrViewToJString(j_env, module_name);
    TDF_BASE_DLOG(INFO) << "CallJava module_name = " << module_name;
  } else {
    info.GetExceptionValue()->Set(context, "info error");
    return;
  }

  jstring j_module_func;
  if (info[1]) {
    unicode_string_view fn_name;
    if (!context->GetValueString(info[1], &fn_name)) {
      info.GetExceptionValue()->Set(context,"func name error");
      return;
    }
    j_module_func = JniUtils::StrViewToJString(j_env, fn_name);
    TDF_BASE_DLOG(INFO) << "CallJava fn_name = " << fn_name;
  } else {
    info.GetExceptionValue()->Set(context, "info error");
    return;
  }

  jstring j_cb_id = nullptr;
  if (info[2]) {
    unicode_string_view cb_id_str;
    double cb_id;
    if (context->GetValueString(info[2], &cb_id_str)) {
      TDF_BASE_DLOG(INFO) << "CallJava cb_id = " << cb_id_str;
      j_cb_id = JniUtils::StrViewToJString(j_env, cb_id_str);
    } else if (context->GetValueNumber(info[2], &cb_id)) {
      cb_id_str = std::to_string(cb_id);
      TDF_BASE_DLOG(INFO) << "CallJava cb_id = " << cb_id_str;
      j_cb_id = JniUtils::StrViewToJString(j_env, cb_id_str);
    }
  }

  std::string buffer_data;
  if (info[3] && context->IsObject(info[3])) {
    if (runtime->IsEnableV8Serialization()) {
      auto v8_ctx = std::static_pointer_cast<hippy::napi::V8Ctx>(context);
      buffer_data = v8_ctx->GetSerializationBuffer(info[3], runtime->GetBuffer());
    } else {
      unicode_string_view json;
      auto flag = context->GetValueJson(info[3], &json);
      TDF_BASE_DCHECK(flag);
      TDF_BASE_DLOG(INFO) << "CallJava json = " << json;
      buffer_data = StringViewUtils::ToU8StdStr(json);
    }
  }

  int32_t transfer_type = 0;
  if (info[4]) {
    context->GetValueNumber(info[4], &transfer_type);
  }
  TDF_BASE_DLOG(INFO) << "CallNative transfer_type = " << transfer_type;

  jobject j_buffer;
  jmethodID j_method;
  if (transfer_type == 1) {  // Direct
    j_buffer = j_env->NewDirectByteBuffer(
        const_cast<void *>(reinterpret_cast<const void *>(buffer_data.c_str())),
        hippy::base::checked_numeric_cast<size_t, jlong>(buffer_data.length()));
    j_method = instance->GetMethods().j_call_natives_direct_method_id;
  } else {  // Default
    auto buffer_size = hippy::base::checked_numeric_cast<size_t, jsize>(buffer_data.length());
    j_buffer = j_env->NewByteArray(buffer_size);
    j_env->SetByteArrayRegion(
        reinterpret_cast<jbyteArray>(j_buffer), 0, buffer_size,
        reinterpret_cast<const jbyte *>(buffer_data.c_str()));
    j_method = instance->GetMethods().j_call_natives_method_id;
  }

  auto bridge = std::static_pointer_cast<ADRBridge>(runtime->GetBridge());
  j_env->CallVoidMethod(bridge->GetObj(), j_method, j_module_name,
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
