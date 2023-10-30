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

#include "connector/js2java.h"

#include <memory>

#include "connector/bridge.h"
#include "driver/js_driver_utils.h"
#include "driver/scope.h"
#include "footstone/logging.h"
#include "footstone/string_view_utils.h"
#include "footstone/string_view.h"
#include "jni/jni_env.h"
#include "jni/jni_utils.h"

namespace hippy {
inline namespace framework {
inline namespace bridge {

using string_view = footstone::stringview::string_view;
using StringViewUtils = footstone::stringview::StringViewUtils;
using JsDriverUtils = hippy::JsDriverUtils;
using byte_string = std::string;

jmethodID j_call_natives_direct_method_id;
jmethodID j_call_natives_method_id;

void InitBridge(JNIEnv* j_env) {
  auto j_hippy_bridge_cls = j_env->FindClass("com/openhippy/connector/JsDriver");
  j_call_natives_direct_method_id = j_env->GetMethodID(j_hippy_bridge_cls, "callNatives",
                                                       "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/"
                                                       "String;Ljava/nio/ByteBuffer;)V");
  j_call_natives_method_id = j_env->GetMethodID(j_hippy_bridge_cls, "callNatives",
                                                "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;[B)V");
  j_env->DeleteLocalRef(j_hippy_bridge_cls);

  if (j_env->ExceptionCheck()) {
    j_env->ExceptionClear();
  }
}

void CallHost(CallbackInfo& info) {
  auto cb = [](
      const std::shared_ptr<Scope>& scope,
      const string_view& module,
      const string_view& func,
      const string_view& cb_id,
      bool is_heap_buffer,
      const byte_string& buffer) {
    auto instance = JNIEnvironment::GetInstance();
    auto j_env = instance->AttachCurrentThread();
    jobject j_buffer;
    jmethodID j_method;
    auto j_module = JniUtils::StrViewToJString(j_env, module);
    auto j_func = JniUtils::StrViewToJString(j_env, func);
    auto j_cb_id = JniUtils::StrViewToJString(j_env, cb_id);
    auto len = footstone::check::checked_numeric_cast<size_t, jsize>(buffer.length());
    if (is_heap_buffer == 1) {  // Direct
      j_buffer = j_env->NewDirectByteBuffer(
          const_cast<void*>(reinterpret_cast<const void*>(buffer.c_str())),
          len);
      j_method = j_call_natives_direct_method_id;
    } else {  // Default
      j_buffer = j_env->NewByteArray(len);
      j_env->SetByteArrayRegion(
          reinterpret_cast<jbyteArray>(j_buffer), 0, len,
          reinterpret_cast<const jbyte*>(buffer.c_str()));
      j_method = j_call_natives_method_id;
    }
    auto bridge = std::any_cast<std::shared_ptr<Bridge>>(scope->GetBridge());
    j_env->CallVoidMethod(bridge->GetObj(), j_method, j_module, j_func, j_cb_id, j_buffer);
    JNIEnvironment::ClearJEnvException(j_env);

    // delete local ref
    j_env->DeleteLocalRef(j_module);
    j_env->DeleteLocalRef(j_func);
    j_env->DeleteLocalRef(j_cb_id);
    j_env->DeleteLocalRef(j_buffer);
  };
  JsDriverUtils::CallNative(info, cb);
}

} // namespace bridge
} // namespace framework
} // namespace hippy
