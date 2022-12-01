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

#pragma once

#include <android/log.h>
#include <jni.h>

#include <functional>
#include <vector>

namespace hippy {
inline namespace framework {
inline namespace jni {


class JniInvocation {
 public:
  using JniOnloadFunc = std::function<jint(JavaVM* j_vm, void* reserved)>;
  using JniOnunloadFunc = std::function<void(JavaVM* j_vm, void* reserved)>;

  JniInvocation()  = default;

  inline void PushJniOnLoad(JniOnloadFunc f) {
    jni_onload_.emplace_back(f);
  }
  inline void PushJniOnUnload(JniOnunloadFunc f) {
    jni_onunload_.emplace_back(f);
  }

  jint JNI_OnLoad(JavaVM* j_vm, void* reserved);
  void JNI_OnUnload(JavaVM* j_vm, void* reserved);

  static std::shared_ptr<JniInvocation> Instance();

 private:
  std::vector<JniOnloadFunc> jni_onload_;
  std::vector<JniOnunloadFunc> jni_onunload_;
};

}
}
}

jint JNI_OnLoad(JavaVM* j_vm, void* reserved);
void JNI_OnUnload(JavaVM* j_vm, void* reserved);

#define REGISTER_JNI_ONLOAD(FUNC_NAME)                      \
  auto onload = []() {                                      \
    JniInvocation::Instance()->PushJniOnLoad(FUNC_NAME);    \
    return 0;                                               \
  }();

#define REGISTER_JNI_ONUNLOAD(FUNC_NAME)                    \
  auto onunload = []() {                                    \
     JniInvocation::Instance()->PushJniOnUnload(FUNC_NAME); \
    return 0;                                               \
  }();
