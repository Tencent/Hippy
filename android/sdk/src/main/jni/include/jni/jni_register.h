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

#include <string>

#include "core/core.h"

class JNIRegisterData {
 public:
  JNIRegisterData(const char *name,
                  const char *sign,
                  void *pointer,
                  bool is_static = false);
  JNINativeMethod ToJNINativeMethod();
  inline bool IsStaticMethod() { return is_static_; }

 private:
  std::string name_;
  std::string sign_;
  void *pointer_;
  bool is_static_;
};

class JNIRegister {
 public:
  static std::unique_ptr<JNIRegister> &GetInstance();
  static bool RegisterMethods(JNIEnv *j_env);

  JNIRegister() = default;
  bool RegisterJNIModule(const char *module,
                         const char *name,
                         const char *signature,
                         void *pointer,
                         bool is_static = false) {
    auto it = jni_modules_.find(module);
    if (it != jni_modules_.end()) {
      jni_modules_[module].push_back({name, signature, pointer, is_static});
    } else {
      jni_modules_[module] = {{name, signature, pointer, is_static}};
    }
    return true;
  }

  const std::unordered_map<std::string, std::vector<JNIRegisterData>>
      &GetJniModules() {
    return jni_modules_;
  }

 private:
  std::unordered_map<std::string, std::vector<JNIRegisterData>> jni_modules_;

  DISALLOW_COPY_AND_ASSIGN(JNIRegister);
};

#define REGISTER_JNI_INTERNAL(clazz, name, signature, pointer, is_static, key) \
  auto __REGISTER_JNI_##key = []() {                                           \
    JNIRegister::GetInstance()->RegisterJNIModule(                             \
        clazz, name, signature, reinterpret_cast<void *>(pointer), is_static); \
    return 0;                                                                  \
  }();

#define REGISTER_JNI_TEMP(clazz, name, signature, pointer, is_static, key) \
  REGISTER_JNI_INTERNAL(clazz, name, signature, pointer, is_static,        \
                        pointer##key)

#define REGISTER_JNI(clazz, name, signature, pointer) \
  REGISTER_JNI_TEMP(clazz, name, signature, pointer, false, __COUNTER__)

#define REGISTER_STATIC_JNI(clazz, name, signature, pointer) \
  REGISTER_JNI_TEMP(clazz, name, signature, pointer, true, __COUNTER__)
