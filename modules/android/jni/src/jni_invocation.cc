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

#include "jni/jni_invocation.h"

#include <algorithm>
#include <mutex>

#include "footstone/logging.h"

#include "jni/jni_env.h"
#include "jni/jni_register.h"

namespace hippy {
inline namespace framework {
inline namespace jni {

std::shared_ptr<JniInvocation> JniInvocation::Instance() {
  static std::shared_ptr<JniInvocation> instance = nullptr;
  static std::once_flag flag;

  std::call_once(flag, [] { instance = std::make_shared<JniInvocation>(); });

  return instance;
}

jint JniInvocation::JNI_OnLoad(JavaVM* j_vm, void* reserved) {
  jint version = hippy::JNIEnvironment::GetInstance()->JNI_OnLoad(j_vm, reserved);
  for (const auto& func: jni_onload_) {
    auto ret = func(j_vm, reserved);
    if (ret != version){
      FOOTSTONE_CHECK(false);
    }
  }
  return version;
}

void JniInvocation::JNI_OnUnload(JavaVM* j_vm, void* reserved) {
  for (const auto& func: jni_onunload_) {
    func(j_vm, reserved);
  }
  hippy::JNIEnvironment::DestroyInstance();
}

}
}
}


jint JNI_OnLoad(JavaVM* j_vm, __unused void* reserved) {
  hippy::JniInvocation::Instance()->JNI_OnLoad(j_vm, reserved);

  return JNI_VERSION_1_4;
}

void JNI_OnUnload(__unused JavaVM* j_vm, __unused void* reserved) {
  hippy::JniInvocation::Instance()->JNI_OnUnload(j_vm, reserved);
}
