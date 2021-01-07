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

#ifndef HIPPY_CORE_NAPI_JSC_JS_NATIVE_API_JSC_H_
#define HIPPY_CORE_NAPI_JSC_JS_NATIVE_API_JSC_H_

#include <JavaScriptCore/JavaScriptCore.h>
#include <stdio.h>

#include <mutex>  // NOLINT(build/c++11)
#include <vector>

#include "core/base/macros.h"
#include "core/napi/js_native_api_types.h"

namespace hippy {
namespace napi {

class JSCVM : public VM {
 public:
  JSCVM() { vm_ = JSContextGroupCreate(); }

  ~JSCVM() {
    JSContextGroupRelease(vm_);
    vm_ = nullptr;
  }
  JSContextGroupRef vm_;

  virtual void RegisterUncaughtExceptionCallback();
  virtual std::shared_ptr<Ctx> CreateContext();
};

class JSCCtx : public Ctx {
 public:
  explicit JSCCtx(JSContextGroupRef vm) {
    context_ = JSGlobalContextCreateInGroup(vm, nullptr);

    error_ = napi_ok;
  }

  ~JSCCtx() {
    JSGlobalContextRelease(context_);
    context_ = nullptr;
  }

  JSGlobalContextRef GetCtxRef() { return context_; }

  virtual bool RegisterGlobalInJs();
  virtual bool SetGlobalJsonVar(const std::string& name,
                                const char* json,
                                std::string* exception = nullptr);
  virtual bool SetGlobalStrVar(const std::string& name,
                               const char* str,
                               std::string* exception = nullptr);
  virtual bool SetGlobalObjVar(const std::string& name,
                               std::shared_ptr<CtxValue> obj,
                               std::string* exception = nullptr);
  virtual std::shared_ptr<CtxValue> GetGlobalStrVar(
      const std::string& name,
      std::string* exception = nullptr);
  virtual std::shared_ptr<CtxValue> GetGlobalObjVar(
      const std::string& name,
      std::string* exception = nullptr);
  virtual std::shared_ptr<CtxValue> GetProperty(
      const std::shared_ptr<CtxValue> object,
      const std::string& name,
      std::string* exception = nullptr);
  virtual void RegisterGlobalModule(std::shared_ptr<Scope> scope,
                                    const ModuleClassMap& modules);
  virtual void RegisterNativeBinding(const std::string& name,
                                     hippy::base::RegisterFunction fn,
                                     void* data);

  virtual std::shared_ptr<CtxValue> CreateNumber(double number);
  virtual std::shared_ptr<CtxValue> CreateBoolean(bool b);
  virtual std::shared_ptr<CtxValue> CreateString(const char* string);
  virtual std::shared_ptr<CtxValue> CreateUndefined();
  virtual std::shared_ptr<CtxValue> CreateNull();
  virtual std::shared_ptr<CtxValue> CreateObject(const char* json);
  virtual std::shared_ptr<CtxValue> CreateArray(
      size_t count,
      std::shared_ptr<CtxValue> value[]);

  virtual std::shared_ptr<CtxValue> CreateJsError(const std::string& msg) {
    return nullptr;
  }

  // Get From Value
  virtual std::shared_ptr<CtxValue> CallFunction(
      std::shared_ptr<CtxValue> function,
      size_t argument_count = 0,
      const std::shared_ptr<CtxValue> argumets[] = nullptr,
      std::string* exception = nullptr);

  virtual bool GetValueNumber(std::shared_ptr<CtxValue>, double* result);
  virtual bool GetValueNumber(std::shared_ptr<CtxValue>, int32_t* result);
  virtual bool GetValueBoolean(std::shared_ptr<CtxValue>, bool* result);
  virtual bool GetValueString(std::shared_ptr<CtxValue>, std::string* result);
  virtual bool GetValueJson(std::shared_ptr<CtxValue>, std::string* result);

  // Array Helpers

  virtual bool IsArray(std::shared_ptr<CtxValue>);
  virtual uint32_t GetArrayLength(std::shared_ptr<CtxValue>);
  virtual std::shared_ptr<CtxValue> CopyArrayElement(std::shared_ptr<CtxValue>,
                                                     uint32_t index);

  // Object Helpers

  virtual bool HasNamedProperty(std::shared_ptr<CtxValue>, const char* name);
  virtual std::shared_ptr<CtxValue> CopyNamedProperty(std::shared_ptr<CtxValue>,
                                                      const char* name);
  // Function Helpers

  virtual bool IsFunction(std::shared_ptr<CtxValue>);
  virtual std::string CopyFunctionName(std::shared_ptr<CtxValue>);
  virtual std::shared_ptr<CtxValue> GetJsFn(const std::string& name,
                                            std::string* exception = nullptr);

  virtual std::shared_ptr<CtxValue> RunScript(
      const uint8_t* data,
      size_t len,
      const std::string& file_name,
      bool is_use_code_cache = false,
      std::string* cache = nullptr,
      std::string* exception = nullptr,
      Encoding encodeing = Encoding::ONE_BYTE_ENCODING);

  virtual std::shared_ptr<CtxValue> RunScript(
      const std::string&& script,
      const std::string& file_name,
      bool is_use_code_cache = false,
      std::string* cache = nullptr,
      std::string* exception = nullptr,
      Encoding encodeing = Encoding::UNKNOWN_ENCODING);

  bool HandleJsException(JSValueRef value, std::string& exception_str);

  JSGlobalContextRef context_;
  napi_status error_;
};

class JSCCtxValue : public CtxValue {
 public:
  JSCCtxValue(JSGlobalContextRef context, JSValueRef value)
      : context_(context), value_(value) {
    JSValueProtect(context_, value_);
  }

  ~JSCCtxValue() { JSValueUnprotect(context_, value_); }

  JSGlobalContextRef context_;
  JSValueRef value_;

  DISALLOW_COPY_AND_ASSIGN(JSCCtxValue);
};

}  // namespace napi
}  // namespace hippy

#endif  // HIPPY_CORE_NAPI_JSC_JS_NATIVE_API_JSC_H_
