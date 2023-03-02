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

#include "base/unicode_string_view.h"
#include "core/napi/callback_info.h"
#include "core/scope.h"
#ifdef JS_V8
#include "core/vm/v8/snapshot_collector.h"
#endif

#define GEN_INVOKE_CB_INTERNAL(Module, Function, Name)                                          \
  static void Name(const hippy::napi::CallbackInfo& info, void* data) {                         \
    auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(std::any_cast<void*>(info.GetSlot())); \
    auto scope = scope_wrapper->scope.lock();                                                   \
    TDF_BASE_CHECK(scope);                                                                      \
    auto target = std::static_pointer_cast<Module>(scope->GetModuleObject(#Module));            \
    target->Function(info, data);                                                               \
  }

#ifndef REGISTER_EXTERNAL_REFERENCES
#define REGISTER_EXTERNAL_REFERENCES(FUNC_NAME)
#endif

#define GEN_INVOKE_CB(Module, Function) \
  GEN_INVOKE_CB_INTERNAL(Module, Function, Invoke##Module##Function) \
  REGISTER_EXTERNAL_REFERENCES(Invoke##Module##Function)

class ModuleBase {
 public:
  using unicode_string_view = tdf::base::unicode_string_view;
  using Ctx = hippy::napi::Ctx;
  using CtxValue = hippy::napi::CtxValue;

  ModuleBase() = default;
  virtual ~ModuleBase() = default;

  virtual std::shared_ptr<CtxValue> BindFunction(std::shared_ptr<Scope> scope, std::shared_ptr<CtxValue> rest_args[]) = 0;
};
