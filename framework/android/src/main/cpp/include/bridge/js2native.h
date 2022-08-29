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

#include <memory>

#include "driver/napi/v8/js_native_api_v8.h"
#include "driver/scope.h"

namespace hippy {
inline namespace framework {
inline namespace bridge {

class Js2Native {
public:
  using Ctx = hippy::napi::Ctx;
  using CtxValue = hippy::napi::CtxValue;
  using JsCallback = hippy::napi::JsCallback;

  Js2Native() = default;
  virtual ~Js2Native() = default;

  static bool Run(std::shared_ptr<Scope> scope);
};

} // namespace bridge
} // namespace framework
} // namespace hippy
