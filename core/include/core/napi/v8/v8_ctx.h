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

#include "base/logging.h"
#include "base/unicode_string_view.h"
#include "core/napi/js_ctx.h"
#include "core/napi/js_ctx_value.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wconversion"
#include "v8/v8.h"
#pragma clang diagnostic pop

namespace hippy {
namespace napi {

class V8Ctx : public Ctx {
 public:
  using unicode_string_view = tdf::base::unicode_string_view;
  using JSValueWrapper = hippy::base::JSValueWrapper;

  explicit V8Ctx(v8::Isolate* isolate) : isolate_(isolate) {
    v8::HandleScope handle_scope(isolate);
    v8::Local<v8::ObjectTemplate> global = v8::ObjectTemplate::New(isolate);
    v8::Local<v8::Context> context = v8::Context::New(isolate, nullptr, global);
    v8::Context::Scope contextScope(context);

    global_persistent_.Reset(isolate, global);
    context_persistent_.Reset(isolate, context);
  }

  ~V8Ctx() {
    context_persistent_.Reset();
    global_persistent_.Reset();
  }

  inline void* GetFuncExternalData(void* key) {
    return func_external_data_map_[key];
  }

  inline void SaveFuncExternalData(void* key, void* value) {
    func_external_data_map_[key] = value;
  }

  inline bool HasFuncExternalData(void* key) {
    return func_external_data_map_.find(key) != func_external_data_map_.end();
  }

  virtual std::shared_ptr<CtxValue> DefineProxy(const std::unique_ptr<FuncWrapper>& constructor_wrapper) override;

  virtual std::shared_ptr<CtxValue> DefineClass(unicode_string_view name,
                                                const std::unique_ptr<FuncWrapper>& constructor_wrapper,
                                                size_t property_count,
                                                std::shared_ptr<PropertyDescriptor> properties[]) override;
  virtual std::shared_ptr<CtxValue> NewInstance(const std::shared_ptr<CtxValue>& cls,
                                                int argc, std::shared_ptr<CtxValue> argv[],
                                                void* external) override;
  virtual void* GetExternal(const std::shared_ptr<CtxValue>& object);

  virtual std::shared_ptr<CtxValue> GetGlobalObject() override;
  // In general, SetProperty will be faster then SetProperty(attr) , however, does not allow for specifying attributes.
  virtual bool SetProperty(std::shared_ptr<CtxValue> object,
                           std::shared_ptr<CtxValue> key,
                           std::shared_ptr<CtxValue> value) override;
  // key must be string
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

  virtual bool IsString(const std::shared_ptr<CtxValue>& value) override;
  virtual bool IsFunction(const std::shared_ptr<CtxValue>& value) override;
  virtual bool IsObject(const std::shared_ptr<CtxValue>& value) override;
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

  virtual void SetDefaultContext(const std::shared_ptr<v8::SnapshotCreator>& creator);

  virtual void ThrowException(const std::shared_ptr<CtxValue>& exception) override;
  virtual void ThrowException(const unicode_string_view& exception) override;
  virtual void HandleUncaughtException(const std::shared_ptr<CtxValue>& exception) override;

  virtual std::shared_ptr<JSValueWrapper> ToJsValueWrapper(
      const std::shared_ptr<CtxValue>& value) override;
  virtual std::shared_ptr<CtxValue> CreateCtxValue(
      const std::shared_ptr<JSValueWrapper>& wrapper) override;
  virtual std::shared_ptr<CtxValue> CreateFunction(std::unique_ptr<FuncWrapper>& wrapper) override;

  void SetExternalData(void* data) override;

  std::string GetSerializationBuffer(const std::shared_ptr<CtxValue>& value, std::string& reused_buffer);
  unicode_string_view ToStringView(v8::Local<v8::String> str) const;
  unicode_string_view GetMsgDesc(v8::Local<v8::Message> message) const;
  unicode_string_view GetStackInfo(v8::Local<v8::Message> message) const;
  unicode_string_view GetStackTrace(v8::Local<v8::StackTrace> trace) const;
  std::shared_ptr<CtxValue> CreateError(v8::Local<v8::Message> message) const;
  v8::Local<v8::String> CreateV8String(const unicode_string_view& string) const;
  void SetAlignedPointerInEmbedderData(int index, intptr_t address);

  v8::Isolate* isolate_;
  v8::Persistent<v8::ObjectTemplate> global_persistent_;
  v8::Persistent<v8::Context> context_persistent_;
  std::unordered_map<void*, void*> func_external_data_map_;

 private:
  v8::Local<v8::FunctionTemplate> CreateTemplate(const std::unique_ptr<FuncWrapper>& wrapper) const;
  std::shared_ptr<CtxValue> InternalRunScript(
      v8::Local<v8::Context> context,
      v8::Local<v8::String> source,
      const unicode_string_view& file_name,
      bool is_use_code_cache,
      unicode_string_view* cache);
};

}
}
