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

#include "core/base/common.h"
#include "core/base/logging.h"

class Scope;

namespace hippy {
namespace napi {

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

class CtxValue {
 public:
  CtxValue(){};
  virtual ~CtxValue(){
      // HIPPY_DLOG(hippy::Debug, "~CtxValue");
  };
};

class Ctx {
 public:
  Ctx(){};
  virtual ~Ctx() { HIPPY_DLOG(hippy::Debug, "~Ctx"); };

  virtual bool RegisterGlobalInJs() = 0;
  virtual bool SetGlobalVar(const std::string& name, const char* json) = 0;
  virtual std::shared_ptr<CtxValue> GetGlobalVar(const std::string& name) = 0;
  virtual std::shared_ptr<CtxValue> GetProperty(
      const std::shared_ptr<CtxValue>& object,
      const std::string& name) = 0;

  virtual void RegisterGlobalModule(std::shared_ptr<Scope> scope,
                                    const ModuleClassMap& modules) = 0;
  virtual void RegisterNativeBinding(const std::string& name,
                                     hippy::base::RegisterFunction fn,
                                     void* data) = 0;
  virtual std::shared_ptr<CtxValue> EvaluateJavascript(
      const uint8_t* data,
      size_t len,
      const char* name = nullptr) = 0;
  virtual std::shared_ptr<CtxValue> CreateNumber(double number) = 0;
  virtual std::shared_ptr<CtxValue> CreateBoolean(bool b) = 0;
  virtual std::shared_ptr<CtxValue> CreateString(const char* string) = 0;
  virtual std::shared_ptr<CtxValue> CreateUndefined() = 0;
  virtual std::shared_ptr<CtxValue> CreateNull() = 0;
  virtual std::shared_ptr<CtxValue> CreateObject(const char* json) = 0;
  virtual std::shared_ptr<CtxValue> CreateArray(
      size_t count,
      std::shared_ptr<CtxValue> value[]) = 0;

  // Get From Value
  virtual std::shared_ptr<CtxValue> CallFunction(
      std::shared_ptr<CtxValue> function,
      size_t argument_count = 0,
      const std::shared_ptr<CtxValue> argumets[] = nullptr,
      std::shared_ptr<std::string>* exception = nullptr) = 0;

  virtual bool GetValueNumber(std::shared_ptr<CtxValue>, double* result) = 0;
  virtual bool GetValueNumber(std::shared_ptr<CtxValue>, int32_t* result) = 0;
  virtual bool GetValueBoolean(std::shared_ptr<CtxValue>, bool* result) = 0;
  virtual bool GetValueString(std::shared_ptr<CtxValue>,
                              std::string* result) = 0;
  virtual bool GetValueJson(std::shared_ptr<CtxValue>, std::string* result) = 0;

  // Array Helpers

  virtual bool IsArray(std::shared_ptr<CtxValue>) = 0;
  virtual uint32_t GetArrayLength(std::shared_ptr<CtxValue>) = 0;
  virtual std::shared_ptr<CtxValue> CopyArrayElement(std::shared_ptr<CtxValue>,
                                                     uint32_t index) = 0;

  // Object Helpers

  virtual bool HasNamedProperty(std::shared_ptr<CtxValue>,
                                const char* utf8name) = 0;
  virtual std::shared_ptr<CtxValue> CopyNamedProperty(std::shared_ptr<CtxValue>,
                                                      const char* utf8name) = 0;
  // Function Helpers

  virtual bool IsFunction(std::shared_ptr<CtxValue>) = 0;
  virtual std::string CopyFunctionName(std::shared_ptr<CtxValue>) = 0;
  virtual std::shared_ptr<CtxValue> GetJsFn(const std::string& name) = 0;
};

class VM {
 public:
  VM(){};
  virtual ~VM() { HIPPY_DLOG(hippy::Debug, "~VM"); };

  virtual std::shared_ptr<Ctx> CreateContext() = 0;
};

class BindingData {
 public:
  std::weak_ptr<Scope> scope_;
  ModuleClassMap map_;

  BindingData(std::weak_ptr<Scope> scope, ModuleClassMap map)
      : scope_(scope), map_(map) {}
};

class FunctionData {
 public:
  std::weak_ptr<Scope> scope_;
  JsCallback callback_;

  FunctionData(std::weak_ptr<Scope> scope, JsCallback callback)
      : scope_(scope), callback_(callback) {}
};

}  // namespace napi
}  // namespace hippy

#endif  // CORE_NAPI_JS_NATIVE_API_TYPES_H_
