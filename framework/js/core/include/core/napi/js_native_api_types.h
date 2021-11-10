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

#include <functional>
#include <memory>
#include <string>
#include <unordered_map>

#include "base/logging.h"
#include "core/base/common.h"
#include "core/base/js_value_wrapper.h"
#include "dom/dom_value.h"

class Scope;

namespace hippy {
namespace napi {

static const char kErrorHandlerJSName[] = "ExceptionHandle.js";
static const char kHippyErrorHandlerName[] = "HippyExceptionHandler";

enum PropertyAttribute {
  /** None. **/
  None = 0,
  /** ReadOnly, i.e., not writable. **/
  ReadOnly = 1 << 0,
  /** DontEnum, i.e., not enumerable. **/
  DontEnum = 1 << 1,
  /** DontDelete, i.e., not configurable. **/
  DontDelete = 1 << 2
};

class CallbackInfo;
using JsCallback = std::function<void(const CallbackInfo& info)>;

// Map: FunctionName -> Callback (e.g. "Log" -> ConsoleModule::Log)
using ModuleClass =
    std::unordered_map<tdf::base::unicode_string_view, hippy::napi::JsCallback>;

// Map: ClassName -> ModuleClass (e.g. "ConsoleModule" -> [ModuleClass])
using ModuleClassMap =
    std::unordered_map<tdf::base::unicode_string_view, ModuleClass>;

enum Encoding {
  UNKNOWN_ENCODING,
  ONE_BYTE_ENCODING,
  TWO_BYTE_ENCODING,
  UTF8_ENCODING
};

class CtxValue {
 public:
  CtxValue() {}
  virtual ~CtxValue() {}
};

class Ctx {
 public:
  using JSValueWrapper = hippy::base::JSValueWrapper;
  using unicode_string_view = tdf::base::unicode_string_view;
  using DomValue = tdf::base::DomValue;

  Ctx() {}
  virtual ~Ctx() { TDF_BASE_DLOG(INFO) << "~Ctx"; }

  virtual bool RegisterGlobalInJs() = 0;
  virtual bool SetGlobalJsonVar(const unicode_string_view& name,
                                const unicode_string_view& json) = 0;
  virtual bool SetGlobalStrVar(const unicode_string_view& name,
                               const unicode_string_view& str) = 0;
  virtual bool SetGlobalObjVar(const unicode_string_view& name,
                               std::shared_ptr<CtxValue> obj,
                               PropertyAttribute attr = None) = 0;
  virtual std::shared_ptr<CtxValue> GetGlobalStrVar(
      const unicode_string_view& name) = 0;
  virtual std::shared_ptr<CtxValue> GetGlobalObjVar(
      const unicode_string_view& name) = 0;
  virtual std::shared_ptr<CtxValue> GetProperty(
      const std::shared_ptr<CtxValue> object,
      const unicode_string_view& name) = 0;

  virtual void RegisterGlobalModule(std::shared_ptr<Scope> scope,
                                    const ModuleClassMap& modules) = 0;
  virtual void RegisterNativeBinding(const unicode_string_view& name,
                                     hippy::base::RegisterFunction fn,
                                     void* data) = 0;

  virtual std::shared_ptr<CtxValue> CreateNumber(double number) = 0;
  virtual std::shared_ptr<CtxValue> CreateBoolean(bool b) = 0;
  virtual std::shared_ptr<CtxValue> CreateString(
      const unicode_string_view& string) = 0;
  virtual std::shared_ptr<CtxValue> CreateUndefined() = 0;
  virtual std::shared_ptr<CtxValue> CreateNull() = 0;
  virtual std::shared_ptr<CtxValue> CreateObject(
      const unicode_string_view& json) = 0;
  virtual std::shared_ptr<CtxValue> CreateArray(
      size_t count,
      std::shared_ptr<CtxValue> value[]) = 0;
  virtual std::shared_ptr<CtxValue> CreateJsError(
      const unicode_string_view& msg) = 0;

  // Get From Value
  virtual std::shared_ptr<CtxValue> CallFunction(
      std::shared_ptr<CtxValue> function,
      size_t argument_count = 0,
      const std::shared_ptr<CtxValue> argumets[] = nullptr) = 0;

  virtual bool GetValueNumber(std::shared_ptr<CtxValue> value,
                              double* result) = 0;
  virtual bool GetValueNumber(std::shared_ptr<CtxValue> value,
                              int32_t* result) = 0;
  virtual bool GetValueBoolean(std::shared_ptr<CtxValue> value,
                               bool* result) = 0;
  virtual bool GetValueString(std::shared_ptr<CtxValue> value,
                              unicode_string_view* result) = 0;
  virtual bool GetValueJson(std::shared_ptr<CtxValue> value,
                            unicode_string_view* result) = 0;

  // Array Helpers

  virtual bool IsArray(std::shared_ptr<CtxValue> value) = 0;
  virtual uint32_t GetArrayLength(std::shared_ptr<CtxValue> value) = 0;
  virtual std::shared_ptr<CtxValue> CopyArrayElement(std::shared_ptr<CtxValue>,
                                                     uint32_t index) = 0;

  // Object Helpers

  virtual bool HasNamedProperty(std::shared_ptr<CtxValue> value,
                                const unicode_string_view& name) = 0;
  virtual std::shared_ptr<CtxValue> CopyNamedProperty(
      std::shared_ptr<CtxValue> value,
      const unicode_string_view& name) = 0;
  // Function Helpers

  virtual bool IsFunction(std::shared_ptr<CtxValue> value) = 0;
  virtual unicode_string_view CopyFunctionName(
      std::shared_ptr<CtxValue> value) = 0;

  virtual std::shared_ptr<CtxValue> RunScript(
      const unicode_string_view& data,
      const unicode_string_view& file_name,
      bool is_use_code_cache = false,
      unicode_string_view* cache = nullptr,
      bool is_copy = true) = 0;
  virtual std::shared_ptr<CtxValue> GetJsFn(
      const unicode_string_view& name) = 0;
  virtual bool ThrowExceptionToJS(std::shared_ptr<CtxValue> exception) = 0;

  virtual std::shared_ptr<JSValueWrapper> ToJsValueWrapper(
      std::shared_ptr<CtxValue> value) = 0;
  virtual std::shared_ptr<CtxValue> CreateCtxValue(
      std::shared_ptr<JSValueWrapper> wrapper) = 0;

  virtual std::shared_ptr<DomValue> ToDomValue(
      std::shared_ptr<CtxValue> value) = 0;
  virtual std::shared_ptr<CtxValue> CreateDomValue(
      std::shared_ptr<DomValue> value) = 0;
};

class VM {
 public:
  VM(){};
  virtual ~VM() { TDF_BASE_DLOG(INFO) << "~VM"; };

  virtual std::shared_ptr<Ctx> CreateContext() = 0;
};

class TryCatch {
 public:
  explicit TryCatch(bool enable = false, std::shared_ptr<Ctx> ctx = nullptr)
      : enable_(enable), ctx_(ctx) {}
  virtual ~TryCatch() {}
  virtual void ReThrow() = 0;
  virtual bool HasCaught() = 0;
  virtual bool CanContinue() = 0;
  virtual bool HasTerminated() = 0;
  virtual bool IsVerbose() = 0;
  virtual void SetVerbose(bool verbose) = 0;
  virtual std::shared_ptr<CtxValue> Exception() = 0;
  virtual tdf::base::unicode_string_view GetExceptionMsg() = 0;

 protected:
  bool enable_;
  std::shared_ptr<Ctx> ctx_;
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
