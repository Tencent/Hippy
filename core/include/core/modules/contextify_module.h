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

#include "core/modules/module_base.h"
#include "core/napi/callback_info.h"
#include "core/napi/js_native_api_types.h"

class Scope;

class ContextifyModule : public ModuleBase {
 public:
  using unicode_string_view = tdf::base::unicode_string_view;
  using CtxValue = hippy::napi::CtxValue;

  ContextifyModule() {}
  void RunInThisContext(const hippy::napi::CallbackInfo& info);
  void LoadUntrustedContent(const hippy::napi::CallbackInfo& info);
  void RemoveCBFunc(const unicode_string_view& uri);

 private:
  std::unordered_map<unicode_string_view, std::shared_ptr<CtxValue>>
      cb_func_map_;
};
