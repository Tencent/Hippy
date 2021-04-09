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

#include "jni/jni_register.h"

#include "jni/jni_env.h"
#include "jni/uri.h"

std::unique_ptr<JNIRegister>& JNIRegister::GetInstance() {
  static std::unique_ptr<JNIRegister> instance = nullptr;
  static std::once_flag flag;

  std::call_once(flag, [] { instance = std::make_unique<JNIRegister>(); });

  return instance;
}

bool JNIRegister::RegisterMethods(JNIEnv* j_env) {
  const std::unordered_map<std::string, std::vector<JNIRegisterData>>&
      jni_modules = JNIRegister::GetInstance()->GetJniModules();

  std::vector<JNINativeMethod> methods;
  for (auto it = jni_modules.begin(); it != jni_modules.end(); ++it) {
    jclass j_class;
    j_class = j_env->FindClass(it->first.c_str());
    if (!j_class) {
      HIPPY_LOG(hippy::Error, "NativeAccess class not found");
      return false;
    }
    std::vector<JNIRegisterData> datas = it->second;
    for (auto data_it = datas.begin(); data_it != datas.end(); ++data_it) {
      JNINativeMethod method = data_it->ToJNINativeMethod();
      jmethodID id = j_env->GetMethodID(j_class, method.name, method.signature);
      if (!id) {
        if (j_env->ExceptionCheck()) {
          j_env->ExceptionDescribe();
        }
        HIPPY_LOG(hippy::Error, "Cannot find method %s%s of NativeAccess",
                  method.name, method.signature);
        return false;
      }
      methods.push_back(method);
    }

    j_env->RegisterNatives(j_class, methods.data(), methods.size());
  }
  return true;
}

JNIRegisterData::JNIRegisterData(const char* name,
                                 const char* sign,
                                 void* pointer)
    : name_(name), sign_(sign), pointer_(pointer) {}

JNINativeMethod JNIRegisterData::ToJNINativeMethod() {
  return {name_.c_str(), sign_.c_str(), pointer_};
}
