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

#include <core/napi/v8/js_native_turbo_v8.h>

#include <string>

#include "jni_env.h"

#ifndef ANDROID_DEMO_TURBOMODULERUNTIME_H
#define ANDROID_DEMO_TURBOMODULERUNTIME_H

class TurboModuleRuntime {
 public:
  jobject turbo_module_manager_obj_;
  std::shared_ptr<hippy::napi::TurboEnv> turbo_env_;
  std::unordered_map<std::string, std::shared_ptr<hippy::napi::CtxValue>>
      module_cache_;

  explicit TurboModuleRuntime(jobject obj) {
    JNIEnv* env = JNIEnvironment::GetInstance()->AttachCurrentThread();
    turbo_module_manager_obj_ = env->NewGlobalRef(obj);
    env->DeleteLocalRef(obj);
  }

  ~TurboModuleRuntime() {
    TDF_BASE_DLOG(INFO) << "~TurboModuleRuntime()";
    JNIEnv* env = JNIEnvironment::GetInstance()->AttachCurrentThread();
    if (turbo_module_manager_obj_) {
      env->DeleteGlobalRef(turbo_module_manager_obj_);
    }

    if (turbo_env_) {
      turbo_env_.reset();
    }

    if (!module_cache_.empty()) {
      module_cache_.clear();
    }
  }
};

#endif  // ANDROID_DEMO_TURBOMODULERUNTIME_H
