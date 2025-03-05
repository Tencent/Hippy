/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2023 THL A29 Limited, a Tencent company.
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

#include "driver/napi/js_class_definition.h"
#include "footstone/string_view.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wextra-semi"
#pragma clang diagnostic ignored "-Wsign-conversion"
#include "jsi/jsi.h"
#pragma clang diagnostic pop

namespace hippy {
inline namespace driver {
inline namespace napi {

using Runtime = facebook::jsi::Runtime;
using Function = facebook::jsi::Function;
using Value = facebook::jsi::Value;

class HermesClassDefinition : public ClassDefinition {
 public:
  HermesClassDefinition(Runtime& runtime, const footstone::stringview::string_view& name, Function& function);
  virtual ~HermesClassDefinition();

  Value& GetTemplate() { return function_; }

 private:
  footstone::stringview::string_view name_;
  Value function_;
};

}  // namespace napi
}  // namespace driver
}  // namespace hippy
