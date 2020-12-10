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

#ifndef CORE_NAPI_JS_NATIVE_API_TYPES_H_
#define CORE_NAPI_JS_NATIVE_API_TYPES_H_

#include <functional>
#include <memory>
#include <string>
#include <unordered_map>

namespace hippy {
namespace napi {

typedef struct napi_vm__* napi_vm;

typedef struct napi_context__* napi_context;

struct napi_value__;
using napi_value = std::shared_ptr<napi_value__>;
using napi_value_weak = std::weak_ptr<napi_value__>;

class CallbackInfo;
using JsCallback = std::function<void(const CallbackInfo& info)>;

// Map: FunctionName -> Callback (e.g. "Log" -> ConsoleModule::Log)
using ModuleClass = std::unordered_map<std::string, hippy::napi::JsCallback>;

// Map: ClassName -> ModuleClass (e.g. "ConsoleModule" -> [ModuleClass])
using ModuleClassMap = std::unordered_map<std::string, ModuleClass>;

enum napi_status {
  napi_ok = 0,
  napi_invalid_arg = -100,
  napi_vm_exception = -101,
  napi_context_exception = -102,
  napi_object_exception = -103,
  napi_string_exception = -104,
  napi_name_exception = -105,
  napi_function_exception = -106,
  napi_number_exception = -107,
  napi_boolean_exception = -108,
  napi_array_exception = -109,
  napi_system_error = -110,
  napi_unknown = -1000,
};

}  // namespace napi
}  // namespace hippy

#endif  // CORE_NAPI_JS_NATIVE_API_TYPES_H_
