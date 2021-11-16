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
#include "jni/jni_env.h"
#include "jni/jni_utils.h"
#include "v8/v8.h"

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
  V8VM(std::shared_ptr<V8VMInitParam> param);
  ~V8VM();

  virtual std::shared_ptr<Ctx> CreateContext();
  static void CodeCacheSanityCheck(v8::Isolate* isolate,
                                   int result,
                                   v8::Local<v8::String> source) {}
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

  explicit V8TryCatch(bool enable = false, std::shared_ptr<Ctx> ctx = nullptr);
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
    context_persistent_.Empty();
    global_persistent_.Empty();
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
  virtual std::shared_ptr<CtxValue> CreateMap(
      size_t count,
      std::shared_ptr<CtxValue> value[]);
  virtual std::shared_ptr<CtxValue> CreateJsError(
      const unicode_string_view& msg);

  // Get From Value
  virtual std::shared_ptr<CtxValue> CallFunction(
      std::shared_ptr<CtxValue> function,
      size_t argument_count,
      const std::shared_ptr<CtxValue> argumets[] = nullptr);

  virtual bool GetValueNumber(std::shared_ptr<CtxValue> value, double* result);
  virtual bool GetValueNumber(std::shared_ptr<CtxValue> value, int32_t* result);
  virtual bool GetValueBoolean(std::shared_ptr<CtxValue> value, bool* result);
  virtual bool GetValueString(std::shared_ptr<CtxValue> value,
                              unicode_string_view* result);
  virtual bool GetValueJson(std::shared_ptr<CtxValue> value,
                            unicode_string_view* result);

  virtual bool IsMap(std::shared_ptr<CtxValue>);

  virtual bool IsNullOrUndefined(std::shared_ptr<CtxValue>);

  // Array Helpers

  virtual bool IsArray(std::shared_ptr<CtxValue> value);
  virtual uint32_t GetArrayLength(std::shared_ptr<CtxValue> value);
  virtual std::shared_ptr<CtxValue> CopyArrayElement(std::shared_ptr<CtxValue>,
                                                     uint32_t index);

  // Map Helpers
  virtual uint32_t GetMapLength(std::shared_ptr<CtxValue>);
  virtual std::shared_ptr<CtxValue> ConvertMapToArray(
      const std::shared_ptr<CtxValue> value);

  // Object Helpers

  virtual bool HasNamedProperty(std::shared_ptr<CtxValue> value,
                                const unicode_string_view& utf8name);
  virtual std::shared_ptr<CtxValue> CopyNamedProperty(
      std::shared_ptr<CtxValue> value,
      const unicode_string_view& utf8name);
  // Function Helpers

  virtual bool IsFunction(std::shared_ptr<CtxValue> value);
  virtual unicode_string_view CopyFunctionName(std::shared_ptr<CtxValue> value);

  virtual std::shared_ptr<CtxValue> RunScript(
      const unicode_string_view& data,
      const unicode_string_view& file_name,
      bool is_use_code_cache = false,
      unicode_string_view* cache = nullptr,
      bool is_copy = true);

  virtual std::shared_ptr<CtxValue> GetJsFn(const unicode_string_view& name);
  virtual bool ThrowExceptionToJS(std::shared_ptr<CtxValue> exception);

  virtual std::shared_ptr<JSValueWrapper> ToJsValueWrapper(
      std::shared_ptr<CtxValue> value);
  virtual std::shared_ptr<CtxValue> CreateCtxValue(
      std::shared_ptr<JSValueWrapper> wrapper);

  unicode_string_view ToStringView(v8::Local<v8::String> str);
  unicode_string_view GetMsgDesc(v8::Local<v8::Message> message);
  unicode_string_view GetStackInfo(v8::Local<v8::Message> message);
  v8::Local<v8::String> CreateV8String(const unicode_string_view& string);

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

  v8::Global<v8::Value> global_value_;
  v8::Isolate* isolate_;

  DISALLOW_COPY_AND_ASSIGN(V8CtxValue);
};

}  // namespace napi
}  // namespace hippy
