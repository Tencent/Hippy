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

#include "v8/heap_limit.h"

#include "bridge/runtime.h"
#include "jni/jni_env.h"
#include "v8/v8.h"

namespace hippy {
inline namespace driver {
inline namespace v8_engine {

using V8VM = hippy::vm::V8VM;

REGISTER_JNI("com/tencent/mtt/hippy/v8/V8", // NOLINT(cert-err58-cpp)
             "addNearHeapLimitCallback",
             "(JLcom/tencent/mtt/hippy/v8/V8$NearHeapLimitCallback;)V",
             AddNearHeapLimitCallback)


void AddNearHeapLimitCallback(JNIEnv *j_env,
                      jobject j_object,
                      jlong j_runtime_id,
                      jobject j_callback) {
  auto runtime_id = hippy::base::checked_numeric_cast<jlong, int32_t>(j_runtime_id);
  auto runtime = Runtime::Find(runtime_id);
  TDF_BASE_CHECK(runtime);
  auto cb = std::make_shared<JavaRef>(j_env, j_callback);
  runtime->SetNearHeapLimitCallback([cb]  (
      void*, size_t current_heap_limit, size_t initial_heap_limit) -> size_t {
    auto j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
    auto j_callback = cb->GetObj();
    auto j_cb_class = j_env->GetObjectClass(j_callback);
    auto j_cb_method_id = j_env->GetMethodID(j_cb_class, "callback","(JJ)J");
    auto j_current_heap_limit = hippy::base::checked_numeric_cast<size_t, jlong>(current_heap_limit);
    auto j_initial_heap_limit = hippy::base::checked_numeric_cast<size_t, jlong>(initial_heap_limit);
    auto j_new_limit = j_env->CallLongMethod(j_callback, j_cb_method_id, j_current_heap_limit, j_initial_heap_limit);
    JNIEnvironment::ClearJEnvException(j_env);
    return hippy::base::checked_numeric_cast<jlong, size_t>(j_new_limit);
  });
  v8::Isolate *isolate = std::static_pointer_cast<V8VM>(runtime->GetEngine()->GetVM())->isolate_;
  isolate->AddNearHeapLimitCallback([](void* data, size_t current_heap_limit,
                                       size_t initial_heap_limit) -> size_t {
    auto runtime = Runtime::Find(static_cast<int32_t>(reinterpret_cast<int64_t>(data)));
    auto cb = runtime->GetNearHeapLimitCallback();
    TDF_BASE_CHECK(cb);
    return cb(data, current_heap_limit, initial_heap_limit);
  }, reinterpret_cast<void*>(runtime_id));
}

}
}
}
