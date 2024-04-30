/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

#include "v8/stack_trace.h"

#include "bridge/runtime.h"
#include "jni/jni_utils.h"
#include "jni/jni_env.h"
#include "v8/v8.h"

namespace hippy {
inline namespace driver {
inline namespace v8_engine {

using V8VM = hippy::vm::V8VM;

#if V8_MAJOR_VERSION < 9
constexpr int kFrameLimit = 20;
#endif

REGISTER_JNI("com/tencent/mtt/hippy/v8/V8", // NOLINT(cert-err58-cpp)
              "printCurrentStackTrace",
              "(JLcom/tencent/mtt/hippy/common/Callback;)V",
              GetCurrentStackTrace)


void GetCurrentStackTrace(JNIEnv *j_env,
                          jobject j_object,
                          jlong j_runtime_id,
                          jobject j_callback) {
  auto runtime = Runtime::Find(hippy::base::checked_numeric_cast<jlong, int32_t>(j_runtime_id));
  TDF_BASE_CHECK(runtime);

  auto ctx = std::static_pointer_cast<hippy::napi::V8Ctx>( runtime->GetScope()->GetContext());
  v8::Isolate *isolate = ctx->isolate_;
  v8::HandleScope handle_scope(isolate);
#if V8_MAJOR_VERSION >= 9
  std::ostringstream trace;
  v8::Message::PrintCurrentStackTrace(isolate, trace);
  auto trace_str = trace.str();
  auto trace_info = tdf::base::unicode_string_view::new_from_utf8(trace_str.c_str(), trace_str.length());
#else
  auto trace = v8::StackTrace::CurrentStackTrace(isolate, kFrameLimit);
  auto trace_info = ctx->GetStackTrace(trace);
#endif

  auto j_cb_class = j_env->GetObjectClass(j_callback);
  auto j_cb_method_id = j_env->GetMethodID(j_cb_class, "callback",
                                           "(Ljava/lang/Object;Ljava/lang/Throwable;)V");
  auto j_trace_info = JniUtils::StrViewToJString(j_env, trace_info);
  j_env->CallVoidMethod(j_callback, j_cb_method_id, j_trace_info, nullptr);
  JNIEnvironment::ClearJEnvException(j_env);
  j_env->DeleteLocalRef(j_trace_info);
}


}
}
}
