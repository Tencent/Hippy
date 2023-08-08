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

#include "connector/java2js.h"

#include <utility>

#include "vfs/uri_loader.h"

#include "connector/js2java.h"
#include "driver/js_driver_utils.h"
#include "footstone/string_view_utils.h"
#include "jni/jni_register.h"
#include "jni/jni_utils.h"
#include "jni/jni_env.h"
#include "jni/scoped_java_ref.h"
#include "jni/data_holder.h"

using string_view = footstone::stringview::string_view;
using byte_string = std::string;
using Ctx = hippy::napi::Ctx;
using CtxValue = hippy::napi::CtxValue;
using StringViewUtils = footstone::stringview::StringViewUtils;
using CALLFUNCTION_CB_STATE = hippy::CALL_FUNCTION_CB_STATE;
using V8BridgeUtils = hippy::JsDriverUtils;

namespace hippy {
inline namespace runtime {

#if defined(ENABLE_INSPECTOR) && !defined(V8_WITHOUT_INSPECTOR)
using V8InspectorClientImpl = hippy::inspector::V8InspectorClientImpl;
extern std::shared_ptr<V8InspectorClientImpl> global_inspector;
#endif

}
}

namespace hippy {
inline namespace framework {
inline namespace bridge {

REGISTER_JNI( // NOLINT(cert-err58-cpp)
    "com/openhippy/connector/JsDriver",
    "callFunction",
    "(ILjava/lang/String;Lcom/openhippy/connector/NativeCallback;[BII)V",
    CallFunctionByHeapBuffer)

REGISTER_JNI( // NOLINT(cert-err58-cpp)
    "com/openhippy/connector/JsDriver",
    "callFunction",
    "(ILjava/lang/String;Lcom/openhippy/connector/NativeCallback;Ljava/nio/ByteBuffer;II)V",
    CallFunctionByDirectBuffer)


void CallFunction(JNIEnv* j_env,
                  __unused jobject j_obj,
                  jint j_scope_id,
                  jstring j_action,
                  jobject j_callback,
                  byte_string buffer_data,
                  std::shared_ptr<JavaRef> buffer_owner) {
  auto action_name = JniUtils::ToStrView(j_env, j_action);
  auto callback = std::make_shared<JavaRef>(j_env, j_callback);
  std::any scope_object;
  auto scope_id = footstone::checked_numeric_cast<jint, uint32_t>(j_scope_id);
  auto flag = hippy::global_data_holder.Find(scope_id, scope_object);
  if (!flag)  {
    FOOTSTONE_LOG(ERROR) << "scope can not found, scope id = " << scope_id << "!!!";
    return;
  }
  auto scope = std::any_cast<std::shared_ptr<Scope>>(scope_object);
  JsDriverUtils::CallJs(action_name, scope,
                        [callback](CALLFUNCTION_CB_STATE state, const string_view& msg) {
                          auto j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
                          auto j_msg = JniUtils::StrViewToJString(j_env, msg);
                          CallJavaMethod(callback->GetObj(), static_cast<jlong>(state), j_msg);
                          j_env->DeleteLocalRef(j_msg);
                        },
                        std::move(buffer_data),
                        [buffer_owner = std::move(buffer_owner)]() {});
}

void CallFunctionByHeapBuffer(JNIEnv* j_env,
                              jobject j_obj,
                              jint j_scope_id,
                              jstring j_action,
                              jobject j_callback,
                              jbyteArray j_byte_array,
                              jint j_offset,
                              jint j_length) {
  CallFunction(j_env, j_obj, j_scope_id, j_action, j_callback,
               JniUtils::AppendJavaByteArrayToBytes(j_env, j_byte_array, j_offset, j_length),
               nullptr);
}

void CallFunctionByDirectBuffer(JNIEnv* j_env,
                                jobject j_obj,
                                jint j_scope_id,
                                jstring j_action,
                                jobject j_callback,
                                jobject j_buffer,
                                jint j_offset,
                                jint j_length) {
  char* buffer_address = static_cast<char*>(j_env->GetDirectBufferAddress(j_buffer));
  FOOTSTONE_CHECK(buffer_address != nullptr);
  CallFunction(j_env, j_obj, j_scope_id, j_action, j_callback,
               byte_string(buffer_address + j_offset,
                           footstone::check::checked_numeric_cast<jint, unsigned long>(j_length)),
               std::make_shared<JavaRef>(j_env, j_buffer));
}

void CallJavaMethod(jobject j_obj, jlong j_value, jstring j_msg) {
  if (!j_obj) {
    FOOTSTONE_DLOG(INFO) << "CallJavaMethod j_obj is nullptr";
    return;
  }

  auto j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  auto j_class = j_env->GetObjectClass(j_obj);
  if (!j_class) {
    FOOTSTONE_LOG(ERROR) << "CallJavaMethod j_class error";
    return;
  }

  auto j_cb_id = j_env->GetMethodID(j_class, "Callback", "(JLjava/lang/String;)V");
  if (!j_cb_id) {
    FOOTSTONE_LOG(ERROR) << "CallJavaMethod j_cb_id error";
    return;
  }

  j_env->CallVoidMethod(j_obj, j_cb_id, j_value, j_msg);
  JNIEnvironment::ClearJEnvException(j_env);
  j_env->DeleteLocalRef(j_class);
}

} // namespace bridge
} // namespace framework
} // namespace hippy
