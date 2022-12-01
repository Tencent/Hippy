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

#include "include/jni/jni_register.h"

#include "footstone/check.h"
#include "footstone/logging.h"
#include "include/jni/jni_env.h"
#include "include/jni/jni_invocation.h"

namespace hippy {
inline namespace framework {
inline namespace jni {

std::unique_ptr<JNIRegister>& JNIRegister::GetInstance() {
  static std::unique_ptr<JNIRegister> instance = nullptr;
  static std::once_flag flag;

  std::call_once(flag, [] { instance = std::make_unique<JNIRegister>(); });

  return instance;
}

JNIRegisterData::JNIRegisterData(const char* name,
                                 const char* sign,
                                 void* pointer,
                                 bool is_static)
    : name_(name), sign_(sign), pointer_(pointer), is_static_(is_static) {}

JNINativeMethod JNIRegisterData::ToJNINativeMethod() {
  return {name_.c_str(), sign_.c_str(), pointer_};
}

jint JNI_OnLoad(__unused JavaVM* j_vm, __unused void* reserved) {
  auto j_env = JNIEnvironment::GetInstance()->AttachCurrentThread();
  const auto& jni_modules = JNIRegister::GetInstance()->GetJniModules();
  for (const auto & jni_module : jni_modules) {
    std::vector<JNINativeMethod> methods;
    jclass j_class;
    const char* class_name = jni_module.first.c_str();
    j_class = j_env->FindClass(class_name);
    if (!j_class) {
      FOOTSTONE_CHECK(false) << "NativeAccess class " << class_name << "not found";
      return JNI_VERSION_1_4;
    }
    std::vector<JNIRegisterData> jni_register_data = jni_module.second;
    for (auto & data : jni_register_data) {
      JNINativeMethod method = data.ToJNINativeMethod();
      jmethodID id;
      bool is_static = data.IsStaticMethod();
      if (is_static) {
        id = j_env->GetStaticMethodID(j_class, method.name, method.signature);
      } else {
        id = j_env->GetMethodID(j_class, method.name, method.signature);
      }
      if (!id) {
        if (j_env->ExceptionCheck()) {
          j_env->ExceptionDescribe();
        }
        FOOTSTONE_CHECK(false)
            << "Cannot find method name = "
            << method.name
            << " signature = "
            << method.signature
            << " is_static = " << is_static << " of NativeAccess";
        return false;
      }
      methods.push_back(method);
    }

    j_env->RegisterNatives(j_class, methods.data(),
                           footstone::check::checked_numeric_cast<size_t, jint>(methods.size()));
  }
  return JNI_VERSION_1_4;
}

REGISTER_JNI_ONLOAD(hippy::JNI_OnLoad)

}
}
}
