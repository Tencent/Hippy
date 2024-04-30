/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

#include "base/logging.h"
#include "base/unicode_string_view.h"
#include "core/base/macros.h"
#include "core/napi/js_ctx.h"

template <std::size_t N>
constexpr JSStringRef CreateWithCharacters(const char16_t (&u16)[N]) noexcept {
  return JSStringCreateWithCharacters((const JSChar*)u16, N - 1);
}

namespace hippy {
namespace napi {

constexpr char16_t kLengthStr[] = u"length";
constexpr char16_t kMessageStr[] = u"message";
constexpr char16_t kStackStr[] = u"stack";

class JSCCtxValue;

struct FuncData {
  void* global_external_data;
  void* func_wrapper;
  FuncData(void* global_data, void* func_wrapper): global_external_data(global_data), func_wrapper(func_wrapper) {}
};

class JSCCtx : public Ctx {
 public:
  using unicode_string_view = tdf::base::unicode_string_view;
  using JSValueWrapper = hippy::base::JSValueWrapper;

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
  
  inline void SaveFuncData(std::unique_ptr<FuncData> func_data) {
    func_data_holder_.push_back(std::move(func_data));
  }
  
  virtual std::shared_ptr<CtxValue> DefineProxy(const std::unique_ptr<FuncWrapper>& wrapper) override;

  virtual std::shared_ptr<CtxValue> DefineClass(unicode_string_view name,
                                                const std::unique_ptr<FuncWrapper>& constructor_wrapper,
                                                size_t property_count,
                                                std::shared_ptr<PropertyDescriptor> properties[]) override;
  
  virtual std::shared_ptr<CtxValue> NewInstance(const std::shared_ptr<CtxValue>& cls,
                                                int argc, std::shared_ptr<CtxValue> argv[],
                                                void* external) override;
  
  virtual std::shared_ptr<CtxValue> GetGlobalObject() override;
  virtual bool SetProperty(std::shared_ptr<CtxValue> object,
                           std::shared_ptr<CtxValue> key,
                           std::shared_ptr<CtxValue> value) override;
  virtual bool SetProperty(std::shared_ptr<CtxValue> object,
                           std::shared_ptr<CtxValue> key,
                           std::shared_ptr<CtxValue> value,
                           const PropertyAttribute& attr) override;
  virtual std::shared_ptr<CtxValue> GetProperty(
      const std::shared_ptr<CtxValue>& object,
      const unicode_string_view& name) override;
  virtual std::shared_ptr<CtxValue> GetProperty(
      const std::shared_ptr<CtxValue>& object,
      std::shared_ptr<CtxValue> key) override;
  virtual std::shared_ptr<CtxValue> CreateObject() override;
  virtual std::shared_ptr<CtxValue> CreateNumber(double number) override;
  virtual std::shared_ptr<CtxValue> CreateBoolean(bool b) override;
  virtual std::shared_ptr<CtxValue> CreateString(
      const unicode_string_view& string) override;
  virtual std::shared_ptr<CtxValue> CreateUndefined() override;
  virtual std::shared_ptr<CtxValue> CreateNull() override;
  virtual std::shared_ptr<CtxValue> CreateObject(const std::unordered_map<
      unicode_string_view,
      std::shared_ptr<CtxValue>>& object) override;
  virtual std::shared_ptr<CtxValue> CreateObject(const std::unordered_map<
      std::shared_ptr<CtxValue>,
      std::shared_ptr<CtxValue>>& object) override;
  virtual std::shared_ptr<CtxValue> CreateArray(
      size_t count,
      std::shared_ptr<CtxValue> value[]) override;
  virtual std::shared_ptr<CtxValue> CreateMap(const std::map<
      std::shared_ptr<CtxValue>,
      std::shared_ptr<CtxValue>>& map) override {
    TDF_BASE_UNIMPLEMENTED();
    return nullptr;
  }
  virtual std::shared_ptr<CtxValue> CreateError(
      const unicode_string_view& msg) override;

  // Get From Value
  virtual std::shared_ptr<CtxValue> CallFunction(
      const std::shared_ptr<CtxValue>& function,
      size_t argument_count = 0,
      const std::shared_ptr<CtxValue> argumets[] = nullptr) override;
  
  virtual std::shared_ptr<CtxValue> CreateFunction(std::unique_ptr<FuncWrapper>& wrapper) override;

  virtual bool GetValueNumber(const std::shared_ptr<CtxValue>& value, double* result) override;
  virtual bool GetValueNumber(const std::shared_ptr<CtxValue>& value, int32_t* result) override;
  virtual bool GetValueBoolean(const std::shared_ptr<CtxValue>& value, bool* result) override;
  virtual bool GetValueString(const std::shared_ptr<CtxValue>& value,
                              unicode_string_view* result) override;
  virtual bool GetValueJson(const std::shared_ptr<CtxValue>& value,
                            unicode_string_view* result) override;
  virtual bool IsMap(const std::shared_ptr<CtxValue>& value) override {
    TDF_BASE_UNIMPLEMENTED();
    return false;
  }
  // Null Helpers
  virtual bool IsNullOrUndefined(const std::shared_ptr<CtxValue>& value) override;

  // Array Helpers

  virtual bool IsArray(const std::shared_ptr<CtxValue>& value) override;
  virtual uint32_t GetArrayLength(const std::shared_ptr<CtxValue>& value) override;
  virtual std::shared_ptr<CtxValue> CopyArrayElement(const std::shared_ptr<CtxValue>& value, uint32_t index) override;

  // Object Helpers

  virtual bool HasNamedProperty(const std::shared_ptr<CtxValue>& value,
                                const unicode_string_view& name) override;
  virtual std::shared_ptr<CtxValue> CopyNamedProperty(
      const std::shared_ptr<CtxValue>& value,
      const unicode_string_view& name) override;
  // Function Helpers

  virtual bool IsString(const std::shared_ptr<CtxValue>& value) override;
  virtual bool IsFunction(const std::shared_ptr<CtxValue>& value) override;
  virtual bool IsObject(const std::shared_ptr<CtxValue>& value) override;
  virtual unicode_string_view CopyFunctionName(const std::shared_ptr<CtxValue>& value) override;

  virtual std::shared_ptr<CtxValue> RunScript(
      const unicode_string_view& data,
      const unicode_string_view& file_name) override;
    
  virtual void ThrowException(const std::shared_ptr<CtxValue> &exception) override;
  virtual void ThrowException(const unicode_string_view& exception) override;
  virtual void HandleUncaughtException(const std::shared_ptr<CtxValue>& exception) override;

  virtual std::shared_ptr<JSValueWrapper> ToJsValueWrapper(
      const std::shared_ptr<CtxValue>& value) override;
  virtual std::shared_ptr<CtxValue> CreateCtxValue(
      const std::shared_ptr<JSValueWrapper>& wrapper) override;
  
  virtual void SetExternalData(void* data) override;

  unicode_string_view GetExceptionMsg(const std::shared_ptr<CtxValue>& exception);

  JSGlobalContextRef context_;
  std::shared_ptr<JSCCtxValue> exception_;
  bool is_exception_handled_;
  void* external_data_;
  std::vector<std::unique_ptr<FuncData>> func_data_holder_;
};

inline tdf::base::unicode_string_view ToStrView(JSStringRef str) {
  return tdf::base::unicode_string_view(
      reinterpret_cast<const char16_t*>(JSStringGetCharactersPtr(str)),
      JSStringGetLength(str));
}


}  // namespace napi
}  // namespace hippy

