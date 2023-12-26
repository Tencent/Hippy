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

#include <string>
#include <set>

#include "connector/turbo.h"
#include "driver/napi/js_ctx.h"

namespace hippy {
inline namespace framework {
inline namespace turbo {

class ArkTsTurboModule {
 public:
  using Ctx = hippy::napi::Ctx;
  using CtxValue = hippy::napi::CtxValue;
  using FunctionWrapper = hippy::napi::FunctionWrapper;
  using PropertyDescriptor = hippy::napi::PropertyDescriptor;

  struct TurboWrapper {
    ArkTsTurboModule* module;
    std::shared_ptr<CtxValue> name;
    std::unique_ptr<FunctionWrapper> func_wrapper;

    TurboWrapper(ArkTsTurboModule* module, const std::shared_ptr<CtxValue>& name) {
      this->module = module;
      this->name = name;
      this->func_wrapper = nullptr;
    }

    void SetFunctionWrapper(std::unique_ptr<FunctionWrapper> wrapper) {
      func_wrapper = std::move(wrapper);
    }
  };

  ArkTsTurboModule(const std::string& name,
                  std::shared_ptr<Turbo>& impl,
                  const std::shared_ptr<Ctx>& ctx,
                  napi_env env);

  std::string name;
  std::shared_ptr<Turbo> impl;
  napi_env env;
  std::unique_ptr<hippy::napi::FunctionWrapper> wrapper_holder_;
  std::set<std::string> method_set_;

  std::shared_ptr<CtxValue> constructor;
  std::unique_ptr<FunctionWrapper> constructor_wrapper;
  std::unordered_map<std::shared_ptr<CtxValue>, std::unique_ptr<TurboWrapper>> turbo_wrapper_map;
  std::unordered_map<std::shared_ptr<CtxValue>, std::shared_ptr<CtxValue>> func_map;
  std::shared_ptr<PropertyDescriptor> properties[1];
    
  std::shared_ptr<CtxValue> InvokeArkTsMethod(
      const std::shared_ptr<CtxValue>& prop_name,
      ArkTsTurboModule* module,
      hippy::napi::CallbackInfo& info,
      void* data,
      std::shared_ptr<Ctx> ctx);
  std::set<std::string> InitMethodSet();

};

}
}
}
