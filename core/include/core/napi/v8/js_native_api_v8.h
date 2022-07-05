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

#include <stdint.h>

#include <mutex>
#include <string>
#include <vector>

#include "base/logging.h"
#include "base/unicode_string_view.h"
#include "core/base/common.h"
#include "core/base/js_value_wrapper.h"
#include "core/base/macros.h"
#include "core/modules/module_base.h"
#include "core/napi/callback_info.h"
#include "core/napi/js_native_api.h"
#include "core/napi/js_native_api_types.h"
#include "core/napi/native_source_code.h"
#include "core/scope.h"
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wconversion"
#include "v8/v8.h"
#pragma clang diagnostic pop

namespace hippy {
namespace napi {

void JsCallbackFunc(const v8::FunctionCallbackInfo<v8::Value>& info);
void NativeCallbackFunc(const v8::FunctionCallbackInfo<v8::Value>& info);
void GetInternalBinding(const v8::FunctionCallbackInfo<v8::Value>& info);

struct V8VMInitParam: public VMInitParam {
  size_t initial_heap_size_in_bytes;
  size_t maximum_heap_size_in_bytes;
};

class V8VM : public VM {
 public:
  V8VM(const std::shared_ptr<V8VMInitParam>& param);
  ~V8VM();

  virtual std::shared_ptr<Ctx> CreateContext();
  static void PlatformDestroy();

  v8::Isolate* isolate_;
  v8::Isolate::CreateParams create_params_;

 public:
  static std::unique_ptr<v8::Platform> platform_;
  static std::mutex mutex_;
};

class V8TryCatch : public TryCatch {
 public:
  using unicode_string_view = tdf::base::unicode_string_view;

  explicit V8TryCatch(bool enable = false, const std::shared_ptr<Ctx>& ctx = nullptr);
  virtual ~V8TryCatch();

  virtual void ReThrow();
  virtual bool HasCaught();
  virtual bool CanContinue();
  virtual bool HasTerminated();
  virtual bool IsVerbose();
  virtual void SetVerbose(bool verbose);
  virtual std::shared_ptr<CtxValue> Exception();
  virtual unicode_string_view GetExceptionMsg();

 private:
  std::shared_ptr<v8::TryCatch> try_catch_;
};

class CBTuple {
 public:
  CBTuple(hippy::base::RegisterFunction fn, void* data)
      : fn_(fn), data_(data) {}
  hippy::base::RegisterFunction fn_;
  void* data_;
};

class CBDataTuple {
 public:
  CBDataTuple(const CBTuple& cb_tuple,
              const v8::FunctionCallbackInfo<v8::Value>& info)
      : cb_tuple_(cb_tuple), info_(info) {}
  const CBTuple& cb_tuple_;
  const v8::FunctionCallbackInfo<v8::Value>& info_;
};

class V8Ctx : public Ctx {
 public:
  using unicode_string_view = tdf::base::unicode_string_view;
  using JSValueWrapper = hippy::base::JSValueWrapper;

  explicit V8Ctx(v8::Isolate* isolate) : isolate_(isolate) {
    v8::HandleScope handle_scope(isolate);

    v8::Local<v8::ObjectTemplate> global = v8::ObjectTemplate::New(isolate);
    v8::Local<v8::Context> context = v8::Context::New(isolate, nullptr, global);

    global_persistent_.Reset(isolate, global);
    context_persistent_.Reset(isolate, context);
  }

  ~V8Ctx() {
    context_persistent_.Reset();
    global_persistent_.Reset();
  }

  virtual bool RegisterGlobalInJs() override;
  virtual bool SetGlobalJsonVar(const unicode_string_view& name,
                                const unicode_string_view& json) override;
  virtual bool SetGlobalStrVar(const unicode_string_view& name,
                               const unicode_string_view& str) override;
  virtual bool SetGlobalObjVar(const unicode_string_view& name,
                               const std::shared_ptr<CtxValue>& obj,
                               const PropertyAttribute& attr) override;
  virtual std::shared_ptr<CtxValue> GetGlobalStrVar(
      const unicode_string_view& name) override;
  virtual std::shared_ptr<CtxValue> GetGlobalObjVar(
      const unicode_string_view& name) override;
  virtual std::shared_ptr<CtxValue> GetProperty(
      const std::shared_ptr<CtxValue>& object,
      const unicode_string_view& name) override;

  virtual void RegisterGlobalModule(const std::shared_ptr<Scope>& scope,
                                    const ModuleClassMap& modules) override;
  virtual void RegisterNativeBinding(const unicode_string_view& name,
                                     hippy::base::RegisterFunction fn,
                                     void* data) override;

  virtual std::shared_ptr<CtxValue> CreateNumber(double number) override;
  virtual std::shared_ptr<CtxValue> CreateBoolean(bool b) override;
  virtual std::shared_ptr<CtxValue> CreateString(
      const unicode_string_view& string) override;
  virtual std::shared_ptr<CtxValue> CreateUndefined() override;
  virtual std::shared_ptr<CtxValue> CreateNull() override;
  virtual std::shared_ptr<CtxValue> ParseJson(
      const unicode_string_view& json) override;
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
      std::shared_ptr<CtxValue>>& map) override;
  virtual std::shared_ptr<CtxValue> CreateError(
      const unicode_string_view& msg) override;

  // Get From Value
  virtual std::shared_ptr<CtxValue> CallFunction(
      const std::shared_ptr<CtxValue>& function,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[]) override;

  virtual bool GetValueNumber(const std::shared_ptr<CtxValue>& value, double* result) override;
  virtual bool GetValueNumber(const std::shared_ptr<CtxValue>& value, int32_t* result) override;
  virtual bool GetValueBoolean(const std::shared_ptr<CtxValue>& value, bool* result) override;
  virtual bool GetValueString(const std::shared_ptr<CtxValue>& value,
                              unicode_string_view* result) override;
  virtual bool GetValueJson(const std::shared_ptr<CtxValue>& value,
                            unicode_string_view* result) override;

  virtual bool IsMap(const std::shared_ptr<CtxValue>& value) override;

  virtual bool IsNullOrUndefined(const std::shared_ptr<CtxValue>& value) override;

  // Array Helpers

  virtual bool IsArray(const std::shared_ptr<CtxValue>& value) override;
  virtual uint32_t GetArrayLength(const std::shared_ptr<CtxValue>& value) override;
  virtual std::shared_ptr<CtxValue> CopyArrayElement(const std::shared_ptr<CtxValue>& value,
                                                     uint32_t index) override;

  // Map Helpers
  virtual size_t GetMapLength(std::shared_ptr<CtxValue>& value);
  virtual std::shared_ptr<CtxValue> ConvertMapToArray(
      const std::shared_ptr<CtxValue>& value);

  // Object Helpers

  virtual bool HasNamedProperty(const std::shared_ptr<CtxValue>& value,
                                const unicode_string_view& utf8name) override;
  virtual std::shared_ptr<CtxValue> CopyNamedProperty(
      const std::shared_ptr<CtxValue>& value,
      const unicode_string_view& utf8name) override;
  // Function Helpers

  virtual bool IsFunction(const std::shared_ptr<CtxValue>& value) override;
  virtual unicode_string_view CopyFunctionName(const std::shared_ptr<CtxValue>& value) override;

  virtual std::shared_ptr<CtxValue> RunScript(
      const unicode_string_view& data,
      const unicode_string_view& file_name) override;
  virtual std::shared_ptr<CtxValue> RunScript(
      const unicode_string_view& data,
      const unicode_string_view& file_name,
      bool is_use_code_cache,
      unicode_string_view* cache,
      bool is_copy);

  virtual std::shared_ptr<CtxValue> GetJsFn(const unicode_string_view& name) override;
  virtual void ThrowException(const std::shared_ptr<CtxValue>& exception) override;
  virtual void ThrowException(const unicode_string_view& exception) override;
  virtual void HandleUncaughtException(const std::shared_ptr<CtxValue>& exception) override;

  virtual std::shared_ptr<JSValueWrapper> ToJsValueWrapper(
      const std::shared_ptr<CtxValue>& value) override;
  virtual std::shared_ptr<CtxValue> CreateCtxValue(
      const std::shared_ptr<JSValueWrapper>& wrapper) override;

  unicode_string_view ToStringView(v8::Local<v8::String> str) const;
  unicode_string_view GetMsgDesc(v8::Local<v8::Message> message);
  unicode_string_view GetStackInfo(v8::Local<v8::Message> message);
  v8::Local<v8::String> CreateV8String(const unicode_string_view& string) const;

  v8::Isolate* isolate_;
  v8::Persistent<v8::ObjectTemplate> global_persistent_;
  v8::Persistent<v8::Context> context_persistent_;
  std::unique_ptr<CBTuple> data_tuple_;

 private:
  std::shared_ptr<CtxValue> InternalRunScript(
      v8::Local<v8::Context> context,
      v8::Local<v8::String> source,
      const unicode_string_view& file_name,
      bool is_use_code_cache,
      unicode_string_view* cache);
};

struct V8CtxValue : public CtxValue {
  V8CtxValue(v8::Isolate* isolate, const v8::Local<v8::Value>& value)
      : global_value_(isolate, value) {}
  V8CtxValue(v8::Isolate* isolate, const v8::Persistent<v8::Value>& value)
      : global_value_(isolate, value) {}
  ~V8CtxValue() { global_value_.Reset(); }
  V8CtxValue(const V8CtxValue &) = delete;
  V8CtxValue &operator=(const V8CtxValue &) = delete;

  v8::Global<v8::Value> global_value_;
  v8::Isolate* isolate_;
};

}  // namespace napi
}  // namespace hippy
