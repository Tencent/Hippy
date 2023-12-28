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

#include "connector/convert_utils.h"
#include "jni/scoped_java_ref.h"

namespace hippy {
inline namespace framework {
inline namespace turbo {

class JavaTurboModule {
 public:
  using Ctx = hippy::napi::Ctx;
  using CtxValue = hippy::napi::CtxValue;
  using FunctionWrapper = hippy::napi::FunctionWrapper;
  using PropertyDescriptor = hippy::napi::PropertyDescriptor;
  using JavaRef = hippy::JavaRef;

  struct TurboWrapper {
    JavaTurboModule* module;
    std::shared_ptr<CtxValue> name;
    std::unique_ptr<FunctionWrapper> func_wrapper;

    TurboWrapper(JavaTurboModule* module, const std::shared_ptr<CtxValue>& name) {
      this->module = module;
      this->name = name;
      this->func_wrapper = nullptr;
    }

    void SetFunctionWrapper(std::unique_ptr<FunctionWrapper> wrapper) {
      func_wrapper = std::move(wrapper);
    }
  };

  JavaTurboModule(const std::string& name,
                  std::shared_ptr<JavaRef>& impl,
                  const std::shared_ptr<Ctx>& ctx);

  std::shared_ptr<JavaRef> impl_;

  std::shared_ptr<JavaRef> impl_j_clazz_;

  std::string name;

  std::unique_ptr<hippy::napi::FunctionWrapper> wrapper_holder_;

  // methodName, signature
  std::unordered_map<std::string, MethodInfo> method_map_;

  std::shared_ptr<CtxValue> constructor;
  //Hermes 引擎没有提供类似于 V8 ObjectTemplate 的 SetHandler 接口，因此通过 Proxy 进行模拟实现
  std::shared_ptr<CtxValue> proxy_handler;
  std::unique_ptr<FunctionWrapper> constructor_wrapper;
  std::unordered_map<std::shared_ptr<CtxValue>, std::unique_ptr<TurboWrapper>> turbo_wrapper_map;
  std::unordered_map<std::shared_ptr<CtxValue>, std::shared_ptr<CtxValue>> func_map;
  std::shared_ptr<PropertyDescriptor> properties[1];

  std::shared_ptr<CtxValue> InvokeJavaMethod(
      const std::shared_ptr<CtxValue>& prop_name,
      hippy::napi::CallbackInfo& info,
      void* data);

  void InitPropertyMap();

  static void Init(JNIEnv* j_env);

  static void Destroy(JNIEnv* j_env);
};

}
}
}
