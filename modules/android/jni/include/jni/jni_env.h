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

#include <jni.h>

#include <memory>
#include <mutex>

namespace hippy {
inline namespace framework {
inline namespace jni {

class JNIEnvironment {
 public:
  static std::shared_ptr<JNIEnvironment> GetInstance();
  static bool ClearJEnvException(JNIEnv* env);
  static void DestroyInstance();

  JNIEnvironment() = default;
  ~JNIEnvironment() = default;

  jint JNI_OnLoad(JavaVM* vm, __unused void* reserved);
  JNIEnv* AttachCurrentThread();

 private:
  static std::shared_ptr<JNIEnvironment> instance_;
  static std::mutex mutex_;

  JavaVM* j_vm_;
};

}
}
}
