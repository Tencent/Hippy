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

#include "jni/jni_load.h"

#include <algorithm>
#include <mutex>

#include "footstone/logging.h"

namespace hippy {
inline namespace framework {
inline namespace jni {

std::shared_ptr<JniLoad> JniLoad::Instance() {
  static std::shared_ptr<JniLoad> instance = nullptr;
  static std::once_flag flag;

  std::call_once(flag, [] { instance = std::make_shared<JniLoad>(); });

  return instance;
}

bool JniLoad::Onload(JNIEnv* j_env) {
  return std::all_of(jni_onload_.begin(), jni_onload_.end(), [j_env](auto func) {
    return func(j_env);
  });
}

void JniLoad::Onunload(JNIEnv* j_env) {
  for (const auto& func: jni_onunload_) {
    func(j_env);
  }
}

}
}
}
