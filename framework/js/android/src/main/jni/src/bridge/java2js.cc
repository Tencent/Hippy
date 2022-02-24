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

#include "bridge/java2js.h"

#include <utility>

#include "bridge/js2java.h"
#include "core/runtime/v8/runtime.h"
#include "core/runtime/v8/v8_bridge_utils.h"
#include "core/base/string_view_utils.h"
#include "jni/jni_register.h"

namespace hippy::runtime {

#ifdef ENABLE_INSPECTOR
using V8InspectorClientImpl = hippy::inspector::V8InspectorClientImpl;
extern std::shared_ptr<V8InspectorClientImpl> global_inspector;
#endif

}

namespace hippy::bridge {

REGISTER_JNI( // NOLINT(cert-err58-cpp)
    "com/tencent/mtt/hippy/bridge/HippyBridgeImpl",
    "callFunction",
    "(Ljava/lang/String;JLcom/tencent/mtt/hippy/bridge/NativeCallback;[BII)V",
    CallFunctionByHeapBuffer)

REGISTER_JNI( // NOLINT(cert-err58-cpp)
    "com/tencent/mtt/hippy/bridge/HippyBridgeImpl",
    "callFunction",
    "(Ljava/lang/String;JLcom/tencent/mtt/hippy/bridge/"
    "NativeCallback;Ljava/nio/ByteBuffer;II)V",
    CallFunctionByDirectBuffer)

using unicode_string_view = tdf::base::unicode_string_view;
using bytes = std::string;
using Ctx = hippy::napi::Ctx;
using CtxValue = hippy::napi::CtxValue;
using StringViewUtils = hippy::base::StringViewUtils;
using CALLFUNCTION_CB_STATE = hippy::runtime::CALL_FUNCTION_CB_STATE;
using V8BridgeUtils = hippy::runtime::V8BridgeUtils;

void CallFunction(JNIEnv* j_env,
                  __unused jobject j_obj,
                  jstring j_action,
                  jlong j_runtime_id,
                  jobject j_callback,
                  bytes buffer_data,
                  std::shared_ptr<JavaRef> buffer_owner) {
  unicode_string_view action_name = JniUtils::ToStrView(j_env, j_action);
  std::shared_ptr<JavaRef> cb = std::make_shared<JavaRef>(j_env, j_callback);
  V8BridgeUtils::CallJs(action_name, hippy::base::checked_numeric_cast<jlong, int32_t>(j_runtime_id),
                        [cb](CALLFUNCTION_CB_STATE state, const unicode_string_view& msg) {
                  JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
                  jstring j_msg = JniUtils::StrViewToJString(j_env, msg);
                  CallJavaMethod(cb->GetObj(), static_cast<jlong>(state), j_msg);
                  j_env->DeleteLocalRef(j_msg);
                }, std::move(buffer_data),
                        [buffer_owner = std::move(buffer_owner)]() {});
}

void CallFunctionByHeapBuffer(JNIEnv* j_env,
                              jobject j_obj,
                              jstring j_action,
                              jlong j_runtime_id,
                              jobject j_callback,
                              jbyteArray j_byte_array,
                              jint j_offset,
                              jint j_length) {
  CallFunction(j_env, j_obj, j_action, j_runtime_id, j_callback,
               JniUtils::AppendJavaByteArrayToBytes(j_env, j_byte_array, j_offset, j_length),
               nullptr);
}

void CallFunctionByDirectBuffer(JNIEnv* j_env,
                                jobject j_obj,
                                jstring j_action,
                                jlong j_runtime_id,
                                jobject j_callback,
                                jobject j_buffer,
                                jint j_offset,
                                jint j_length) {
  char* buffer_address = static_cast<char*>(j_env->GetDirectBufferAddress(j_buffer));
  TDF_BASE_CHECK(buffer_address != nullptr);
  CallFunction(j_env, j_obj, j_action, j_runtime_id, j_callback,
               bytes(buffer_address + j_offset, j_length),
               std::make_shared<JavaRef>(j_env, j_buffer));
}

void CallJavaMethod(jobject j_obj, jlong j_value, jstring j_msg) {
  if (!j_obj) {
    TDF_BASE_DLOG(INFO) << "CallJavaMethod j_obj is nullptr";
    return;
  }

  JNIEnv* j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  jclass j_class = j_env->GetObjectClass(j_obj);
  if (!j_class) {
    TDF_BASE_LOG(ERROR) << "CallJavaMethod j_class error";
    return;
  }

  jmethodID j_cb_id = j_env->GetMethodID(j_class, "Callback", "(JLjava/lang/String;)V");
  if (!j_cb_id) {
    TDF_BASE_LOG(ERROR) << "CallJavaMethod j_cb_id error";
    return;
  }

  j_env->CallVoidMethod(j_obj, j_cb_id, j_value, j_msg);
  JNIEnvironment::ClearJEnvException(j_env);
  j_env->DeleteLocalRef(j_class);
}

}  // namespace hippy
