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

#ifndef HIPPY_CORE_MODULES_MODULE_REGISTER_H_
#define HIPPY_CORE_MODULES_MODULE_REGISTER_H_

#include <stdio.h>

#include <memory>
#include <string>

#include "core/base/macros.h"
#include "core/modules/module_base.h"
#include "core/napi/callback_info.h"
#include "core/napi/js_native_api_types.h"
#include "core/scope.h"

#define REGISTER_MODULE(Module, Function)                                   \
  auto __##Module##Function##__ = [] {                                      \
    ModuleRegister::instance()->RegisterInternalModule(&Module::Function,   \
                                                       #Module, #Function); \
    return 0;                                                               \
  }();

#define REGISTER_GLOBAL_MODULE(Module, Function)                          \
  auto __##Module##Function##__ = [] {                                    \
    ModuleRegister::instance()->RegisterGlobalModule(&Module::Function,   \
                                                     #Module, #Function); \
    return 0;                                                             \
  }();

class ModuleRegister {
 public:
  static ModuleRegister* instance();

  template <typename Module, typename Function>
  void RegisterInternalModule(Function Module::*member_fn,
                              const std::string& module_name,
                              const std::string& function_name) {
    internal_modules_[module_name][function_name] =
        GenerateCallback(member_fn, module_name);
  }

  template <typename Module, typename Function>
  void RegisterGlobalModule(Function Module::*member_fn,
                            const std::string& module_name,
                            const std::string& function_name) {
    global_modules_[module_name][function_name] =
        GenerateCallback(member_fn, module_name);
  }

  const hippy::napi::ModuleClassMap& GetInternalList() const {
    return internal_modules_;
  }
  const hippy::napi::ModuleClassMap& GetGlobalList() const {
    return global_modules_;
  }

 private:
  ModuleRegister() = default;

  template <typename Module, typename Function>
  hippy::napi::JsCallback GenerateCallback(Function Module::*member_fn,
                                           const std::string& module_name) {
    return [member_fn, module_name](const hippy::napi::CallbackInfo& info) {
      std::shared_ptr<Scope> scope = info.GetScope();
      if (!scope) {
        return;
      }

      auto module_ptr = scope->GetModuleClass(module_name);
      if (!module_ptr) {
        auto module = std::make_unique<Module>();
        module_ptr = module.get();
        scope->AddModuleClass(module_name, std::move(module));
      }

      // Call module function.
      auto target = static_cast<Module*>(module_ptr);
      if (target) {
        std::mem_fn(member_fn)(*target, info);
      }
    };
  }

  hippy::napi::ModuleClassMap internal_modules_;
  hippy::napi::ModuleClassMap global_modules_;

  DISALLOW_COPY_AND_ASSIGN(ModuleRegister);
};

#endif  // HIPPY_CORE_MODULES_MODULE_REGISTER_H_
