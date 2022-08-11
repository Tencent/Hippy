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

#include "bridge/bridge.h"
#include "driver/runtime/v8/v8_bridge_utils.h"
#include "driver/napi/v8/serializer.h"
#include "footstone/logging.h"
#include "footstone/string_view_utils.h"
#include "footstone/unicode_string_view.h"
#include "jni/jni_env.h"
#include "jni/jni_utils.h"

namespace hippy::bridge {

using unicode_string_view = footstone::stringview::unicode_string_view;
using StringViewUtils = hippy::base::StringViewUtils;
using V8BridgeUtils = hippy::runtime::V8BridgeUtils;
using byte_string = std::string;

void CallNative(hippy::napi::CBDataTuple* data) {
  auto cb = [](const std::shared_ptr<Runtime>& runtime,
               const unicode_string_view& module,
               const unicode_string_view& func,
               const unicode_string_view& cb_id,
               bool is_heap_buffer,
               const byte_string& buffer) {
    std::shared_ptr<JNIEnvironment> instance = JNIEnvironment::GetInstance();
    JNIEnv* j_env = instance->AttachCurrentThread();
    jobject j_buffer;
    jmethodID j_method;
    jstring j_module = JniUtils::StrViewToJString(j_env, module);
    jstring j_func = JniUtils::StrViewToJString(j_env, func);
    jstring j_cb_id = JniUtils::StrViewToJString(j_env, cb_id);
    auto len = footstone::check::checked_numeric_cast<size_t, jsize>(buffer.length());
    if (is_heap_buffer == 1) {  // Direct
      j_buffer = j_env->NewDirectByteBuffer(
          const_cast<void*>(reinterpret_cast<const void*>(buffer.c_str())),
          len);
      j_method = instance->GetMethods().j_call_natives_direct_method_id;
    } else {  // Default
      j_buffer = j_env->NewByteArray(len);
      j_env->SetByteArrayRegion(
          reinterpret_cast<jbyteArray>(j_buffer), 0, len,
          reinterpret_cast<const jbyte*>(buffer.c_str()));
      j_method = instance->GetMethods().j_call_natives_method_id;
    }

    FOOTSTONE_DCHECK(runtime->HasData(kBridgeSlot));
    auto bridge = std::any_cast<std::shared_ptr<Bridge>>(runtime->GetData(kBridgeSlot));
    j_env->CallVoidMethod(bridge->GetObj(), j_method, j_module, j_func, j_cb_id, j_buffer);
    JNIEnvironment::ClearJEnvException(j_env);

    // delete local ref
    j_env->DeleteLocalRef(j_module);
    j_env->DeleteLocalRef(j_func);
    j_env->DeleteLocalRef(j_cb_id);
    j_env->DeleteLocalRef(j_buffer);
  };
  V8BridgeUtils::CallNative(data, cb);
}

}  // namespace hippy
