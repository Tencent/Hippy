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

#include "v8/request_interrupt.h"

#include "bridge/runtime.h"
#include "jni/jni_env.h"
#include "v8/v8.h"

namespace hippy {
inline namespace driver {
inline namespace v8_engine {

using V8VM = hippy::vm::V8VM;

REGISTER_JNI("com/tencent/mtt/hippy/v8/V8", // NOLINT(cert-err58-cpp)
             "requestInterrupt",
             "(JLcom/tencent/mtt/hippy/common/Callback;)V",
             RequestInterrupt)


void RequestInterrupt(JNIEnv *j_env,
                      jobject j_object,
                      jlong j_runtime_id,
                      jobject j_callback) {
  auto runtime = Runtime::Find(hippy::base::checked_numeric_cast<jlong, int32_t>(j_runtime_id));
  TDF_BASE_CHECK(runtime);
  auto cb = std::make_shared<JavaRef>(j_env, j_callback);
  auto interrupt_queue = runtime->GetInterruptQueue();
  auto task = std::make_unique<JavaScriptTask>();
  task->callback = [cb]() {
    auto j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
    auto j_callback = cb->GetObj();
    auto j_cb_class = j_env->GetObjectClass(j_callback);
    auto j_cb_method_id = j_env->GetMethodID(j_cb_class, "callback",
                                             "(Ljava/lang/Object;Ljava/lang/Throwable;)V");
    j_env->CallVoidMethod(cb->GetObj(), j_cb_method_id, nullptr, nullptr);
    JNIEnvironment::ClearJEnvException(j_env);
  };
  interrupt_queue->PostTask(std::move(task));
}


}
}
}
