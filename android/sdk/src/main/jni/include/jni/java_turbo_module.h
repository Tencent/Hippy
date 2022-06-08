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

#include "convert_utils.h"
#include "scoped_java_ref.h"

class JavaTurboModule : public hippy::napi::HippyTurboModule {
 public:
  JavaTurboModule(const std::string &name, std::shared_ptr<JavaRef> &impl);

  ~JavaTurboModule();

  std::shared_ptr<JavaRef> impl_;

  std::shared_ptr<JavaRef> impl_j_clazz_;

  // methodName, signature
  std::unordered_map<std::string, MethodInfo> method_map_;

  virtual std::shared_ptr<hippy::napi::CtxValue> InvokeJavaMethod(
      hippy::napi::TurboEnv &turbo_env,
      const std::shared_ptr<hippy::napi::CtxValue> &prop_name,
      const std::shared_ptr<hippy::napi::CtxValue> &this_val,
      const std::shared_ptr<hippy::napi::CtxValue> *args,
      size_t count);

  void InitPropertyMap();

  virtual std::shared_ptr<hippy::napi::CtxValue> Get(
      hippy::napi::TurboEnv &,
      const std::shared_ptr<hippy::napi::CtxValue> &prop_name) override;

  static void Init();

  static void Destroy();
};
