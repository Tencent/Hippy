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

#include "footstone/logging.h"
#include "footstone/string_view.h"
#include "driver/base/js_value_wrapper.h"
#include "driver/napi/js_ctx.h"
#include "driver/napi/js_ctx_value.h"
#include "driver/napi/v8/v8_ctx_value.h"
#include "driver/napi/v8/v8_class_definition.h"
#include "driver/vm/native_source_code.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wconversion"
#include "v8/v8.h"
#pragma clang diagnostic pop

namespace hippy {
inline namespace driver {
inline namespace napi {

class V8Ctx : public Ctx {
 public:
  using unicode_string_view = footstone::string_view;

  explicit V8Ctx(v8::Isolate* isolate);

  ~V8Ctx() {
    context_persistent_.Reset();
    global_persistent_.Reset();
  }

  virtual std::shared_ptr<CtxValue> DefineProxy(const std::unique_ptr<FunctionWrapper>& constructor_wrapper) override;

  virtual std::shared_ptr<CtxValue> DefineProxyHandler(const std::unique_ptr<FunctionWrapper>& proxy_handler) override;

  virtual std::shared_ptr<CtxValue> DefineClass(const unicode_string_view& name,
                                                const std::shared_ptr<ClassDefinition>& parent,
                                                const std::unique_ptr<FunctionWrapper>& constructor_wrapper,
                                                size_t property_count,
                                                std::shared_ptr<PropertyDescriptor> properties[]) override;
  virtual std::shared_ptr<CtxValue> NewInstance(const std::shared_ptr<CtxValue>& cls,
                                                int argc, std::shared_ptr<CtxValue> argv[],
                                                void* external) override;
  virtual void* GetObjectExternalData(const std::shared_ptr<CtxValue>& object) override;

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
  virtual std::shared_ptr<CtxValue> CreateException(const unicode_string_view& msg) override;
  virtual std::shared_ptr<CtxValue> CreateByteBuffer(void* buffer, size_t length) override;

  // Get From Value
  virtual std::shared_ptr<CtxValue> CallFunction(
      const std::shared_ptr<CtxValue>& function,
      const std::shared_ptr<CtxValue>& receiver,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[]) override;

  virtual bool GetValueNumber(const std::shared_ptr<CtxValue>& value, double* result) override;
  virtual bool GetValueNumber(const std::shared_ptr<CtxValue>& value, int32_t* result) override;
  virtual bool GetValueBoolean(const std::shared_ptr<CtxValue>& value, bool* result) override;
  virtual bool GetValueString(const std::shared_ptr<CtxValue>& value,
                              unicode_string_view* result) override;
  virtual bool GetValueJson(const std::shared_ptr<CtxValue>& value,
                            unicode_string_view* result) override;
  virtual bool GetEntriesFromObject(const std::shared_ptr<CtxValue>& value,
                                    std::unordered_map<std::shared_ptr<CtxValue>, std::shared_ptr<CtxValue>>& map) override;
  virtual bool GetEntriesFromMap(const std::shared_ptr<CtxValue>& value,
                                 std::unordered_map<std::shared_ptr<CtxValue>, std::shared_ptr<CtxValue>>& map) override;
  virtual bool IsNull(const std::shared_ptr<CtxValue>& value) override;
  virtual bool IsUndefined(const std::shared_ptr<CtxValue>& value) override;
  virtual bool IsNullOrUndefined(const std::shared_ptr<CtxValue>& value) override;
  virtual bool IsBoolean(const std::shared_ptr<CtxValue>& value) override;
  virtual bool IsNumber(const std::shared_ptr<CtxValue>& value) override;
  virtual bool IsString(const std::shared_ptr<CtxValue>& value) override;
  virtual bool IsFunction(const std::shared_ptr<CtxValue>& value) override;
  virtual bool IsObject(const std::shared_ptr<CtxValue>& value) override;
  virtual bool IsMap(const std::shared_ptr<CtxValue>& value) override;
  virtual bool IsArray(const std::shared_ptr<CtxValue>& value) override;
  virtual bool IsByteBuffer(const std::shared_ptr<CtxValue>& value) override;

  virtual bool GetByteBuffer(const std::shared_ptr<CtxValue>& value,
                             void** out_data,
                             size_t& out_length,
                             uint32_t& out_type) override;
  virtual uint32_t GetArrayLength(const std::shared_ptr<CtxValue>& value) override;
  virtual std::shared_ptr<CtxValue> CopyArrayElement(const std::shared_ptr<CtxValue>& value,
                                                     uint32_t index) override;

  // Map Helpers
  virtual size_t GetMapLength(std::shared_ptr<CtxValue>& value);
  virtual std::shared_ptr<CtxValue> ConvertMapToArray(const std::shared_ptr<CtxValue>& value);

  // Object Helpers

  virtual bool HasNamedProperty(const std::shared_ptr<CtxValue>& value,
                                const unicode_string_view& utf8name) override;
  virtual std::shared_ptr<CtxValue> CopyNamedProperty(
      const std::shared_ptr<CtxValue>& value,
      const unicode_string_view& utf8name) override;
  // Function Helpers
  virtual unicode_string_view CopyFunctionName(const std::shared_ptr<CtxValue>& value) override;

  virtual bool Equals(const std::shared_ptr<CtxValue>& lhs, const std::shared_ptr<CtxValue>& rhs) override;

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
  virtual std::shared_ptr<CtxValue> CreateFunction(const std::unique_ptr<FunctionWrapper>& wrapper) override;
  virtual void SetWeak(std::shared_ptr<CtxValue> value,
                       const std::unique_ptr<WeakCallbackWrapper>& wrapper) override;
  virtual void SetWeak(std::shared_ptr<CtxValue> value,
                       std::unique_ptr<WeakCallbackWrapper>&& wrapper) override;

  virtual std::shared_ptr<CtxValue> GetPropertyNames(const std::shared_ptr<CtxValue>& value);
  virtual std::shared_ptr<CtxValue> GetOwnPropertyNames(const std::shared_ptr<CtxValue>& value);

  void SetExternalData(void* data) override;
  virtual std::shared_ptr<ClassDefinition> GetClassDefinition(const string_view& name) override;

  std::string GetSerializationBuffer(const std::shared_ptr<CtxValue>& value,
                                     std::string& reused_buffer);
  void SetAlignedPointerInEmbedderData(int index, intptr_t address);
  virtual std::shared_ptr<TryCatch> CreateTryCatchScope(bool enable, std::shared_ptr<Ctx> ctx) override;

  // Get platform-specific internal embedded code
  std::unique_ptr<NativeSourceCodeProvider> GetNativeSourceCodeProvider() const override;

  v8::Isolate* isolate_;
  v8::Persistent<v8::ObjectTemplate> global_persistent_;
  v8::Persistent<v8::Context> context_persistent_;
  std::unordered_map<void*, void*> func_external_data_map_;
  std::unordered_map<string_view, std::shared_ptr<V8ClassDefinition>> template_map_;

 private:
  v8::Local<v8::FunctionTemplate> CreateTemplate(const std::unique_ptr<FunctionWrapper>& wrapper);
  std::shared_ptr<CtxValue> InternalRunScript(
      v8::Local<v8::Context> context,
      v8::Local<v8::String> source,
      const unicode_string_view& file_name,
      bool is_use_code_cache,
      unicode_string_view* cache);
};

}
}
}
