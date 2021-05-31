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

#include <JavaScriptCore/JavaScriptCore.h>
#include <stdio.h>

#include <mutex>
#include <vector>

#include "base/unicode_string_view.h"
#include "base/logging.h"
#include "core/base/macros.h"
#include "core/napi/js_native_api_types.h"

template <std::size_t N>
constexpr JSStringRef CreateWithCharacters(const char16_t (&u16)[N]) noexcept {
  return JSStringCreateWithCharacters((const JSChar*)u16, N - 1);
}

namespace hippy {
namespace napi {

const char16_t kLengthStr[] = u"length";
const char16_t kMessageStr[] = u"message";
const char16_t kStackStr[] = u"stack";

namespace {
using unicode_string_view = tdf::base::unicode_string_view;
using JSValueWrapper = hippy::base::JSValueWrapper;
};

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

class JSCCtxValue;

class JSCCtx : public Ctx {
 public:
  explicit JSCCtx(JSContextGroupRef vm) {
    context_ = JSGlobalContextCreateInGroup(vm, nullptr);

    exception_ = nullptr;
    is_exception_handled_ = false;
  }

  ~JSCCtx() {
    exception_ = nullptr;

    JSGlobalContextRelease(context_);
    context_ = nullptr;
  }

  JSGlobalContextRef GetCtxRef() { return context_; }

  inline std::shared_ptr<JSCCtxValue> GetException() { return exception_; }
  inline void SetException(std::shared_ptr<JSCCtxValue> exception) {
    if (is_exception_handled_) {
      return;
    }
    exception_ = exception;
    if (exception) {
      is_exception_handled_ = false;
    }
  }
  inline bool IsExceptionHandled() { return is_exception_handled_; }
  inline void SetExceptionHandled(bool is_exception_handled) {
    is_exception_handled_ = is_exception_handled;
  }
  virtual bool RegisterGlobalInJs();
  virtual bool SetGlobalJsonVar(const unicode_string_view& name,
                                const unicode_string_view& json);
  virtual bool SetGlobalStrVar(const unicode_string_view& name,
                               const unicode_string_view& str);
  virtual bool SetGlobalObjVar(const unicode_string_view& name,
                               std::shared_ptr<CtxValue> obj,
                               PropertyAttribute attr = None);
  virtual std::shared_ptr<CtxValue> GetGlobalStrVar(
      const unicode_string_view& name);
  virtual std::shared_ptr<CtxValue> GetGlobalObjVar(
      const unicode_string_view& name);
  virtual std::shared_ptr<CtxValue> GetProperty(
      const std::shared_ptr<CtxValue> object,
      const unicode_string_view& name);

  virtual void RegisterGlobalModule(std::shared_ptr<Scope> scope,
                                    const ModuleClassMap& modules);
  virtual void RegisterNativeBinding(const unicode_string_view& name,
                                     hippy::base::RegisterFunction fn,
                                     void* data);

  virtual std::shared_ptr<CtxValue> CreateNumber(double number);
  virtual std::shared_ptr<CtxValue> CreateBoolean(bool b);
  virtual std::shared_ptr<CtxValue> CreateString(
      const unicode_string_view& string);
  virtual std::shared_ptr<CtxValue> CreateUndefined();
  virtual std::shared_ptr<CtxValue> CreateNull();
  virtual std::shared_ptr<CtxValue> CreateObject(
      const unicode_string_view& json);
  virtual std::shared_ptr<CtxValue> CreateArray(
      size_t count,
      std::shared_ptr<CtxValue> value[]);
  virtual std::shared_ptr<CtxValue> CreateJsError(
      const unicode_string_view& msg);

  // Get From Value
  virtual std::shared_ptr<CtxValue> CallFunction(
      std::shared_ptr<CtxValue> function,
      size_t argument_count = 0,
      const std::shared_ptr<CtxValue> argumets[] = nullptr);

  virtual bool GetValueNumber(std::shared_ptr<CtxValue> value,
                              double* result);
  virtual bool GetValueNumber(std::shared_ptr<CtxValue> value,
                              int32_t* result);
  virtual bool GetValueBoolean(std::shared_ptr<CtxValue> value,
                               bool* result);
  virtual bool GetValueString(std::shared_ptr<CtxValue> value,
                              unicode_string_view* result);
  virtual bool GetValueJson(std::shared_ptr<CtxValue> value,
                            unicode_string_view* result);

  // Array Helpers

  virtual bool IsArray(std::shared_ptr<CtxValue> value);
  virtual uint32_t GetArrayLength(std::shared_ptr<CtxValue> value);
  virtual std::shared_ptr<CtxValue> CopyArrayElement(std::shared_ptr<CtxValue>,
                                                     uint32_t index);

  // Object Helpers

  virtual bool HasNamedProperty(std::shared_ptr<CtxValue> value,
                                const unicode_string_view& name);
  virtual std::shared_ptr<CtxValue> CopyNamedProperty(
      std::shared_ptr<CtxValue> value,
      const unicode_string_view& name);
  // Function Helpers

  virtual bool IsFunction(std::shared_ptr<CtxValue> value);
  virtual unicode_string_view CopyFunctionName(
      std::shared_ptr<CtxValue> value);

  virtual std::shared_ptr<CtxValue> RunScript(
      const unicode_string_view& data,
      const unicode_string_view& file_name,
      bool is_use_code_cache = false,
      unicode_string_view* cache = nullptr,
      bool is_copy = true);
  virtual std::shared_ptr<CtxValue> GetJsFn(
      const unicode_string_view& name);
  virtual bool ThrowExceptionToJS(std::shared_ptr<CtxValue> exception);
  
  virtual std::shared_ptr<JSValueWrapper> ToJsValueWrapper(
      std::shared_ptr<CtxValue> value);
  virtual std::shared_ptr<CtxValue> CreateCtxValue(std::shared_ptr<JSValueWrapper> wrapper);

  unicode_string_view GetExceptionMsg(std::shared_ptr<CtxValue> exception);
  JSStringRef CreateJSCString(const unicode_string_view& str_view);

  JSGlobalContextRef context_;
  std::shared_ptr<JSCCtxValue> exception_;
  bool is_exception_handled_;
};

inline unicode_string_view ToStrView(JSStringRef str) {
  return unicode_string_view(reinterpret_cast<const char16_t*>(JSStringGetCharactersPtr(str)), JSStringGetLength(str));
}

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

class JSCTryCatch : public TryCatch {
 public:
  JSCTryCatch(bool enable, std::shared_ptr<Ctx> ctx);
  virtual ~JSCTryCatch();
  virtual void ReThrow();
  virtual bool HasCaught();
  virtual bool CanContinue();
  virtual bool HasTerminated();
  virtual bool IsVerbose();
  virtual void SetVerbose(bool verbose);
  virtual std::shared_ptr<CtxValue> Exception();
  virtual tdf::base::unicode_string_view GetExceptionMsg();

 private:
  std::shared_ptr<JSCCtxValue> exception_;
  bool is_verbose_;
  bool is_rethrow_;
};

}  // namespace napi
}  // namespace hippy
