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
#include "driver/napi/jsh/jsh_ctx_value.h"
#include "driver/napi/jsh/jsh_class_definition.h"
#include <ark_runtime/jsvm.h>

namespace hippy {
inline namespace driver {
inline namespace napi {

class JSHHandleScope {
 public:
  explicit JSHHandleScope(const JSVM_Env env) : env_(env) {
    auto status = OH_JSVM_OpenHandleScope(env_, &handle_scope_);
    FOOTSTONE_DCHECK(status == JSVM_OK);
  }
  ~JSHHandleScope() {
    auto status = OH_JSVM_CloseHandleScope(env_, handle_scope_);
    FOOTSTONE_DCHECK(status == JSVM_OK);
  }
  JSHHandleScope(const JSHHandleScope &) = delete;
  JSHHandleScope &operator=(const JSHHandleScope &) = delete;
  JSHHandleScope(JSHHandleScope &&) = delete;
  void *operator new(size_t) = delete;
  void *operator new[](size_t) = delete;
 private:
  JSVM_Env env_ = nullptr;
  JSVM_HandleScope handle_scope_ = nullptr;
};

constexpr static int kJSHExternalIndex = 0;
constexpr static int kJSHScopeWrapperIndex = 1;
constexpr static int kJSHWeakCallbackWrapperInvalidIndex = 2;
constexpr static int KJSHTurboFunctionGetIndex = 3;
constexpr static int kJSHExternalDataNum = 4;

extern void* GetPointerInInstanceData(JSVM_Env env, int index);

class JSHCtx : public Ctx {
 public:
  using unicode_string_view = footstone::string_view;
  using ExceptionMessageCallback = void (*)(JSVM_Env env, JSVM_Value error, void *external_data);

  explicit JSHCtx(JSVM_VM vm, ExceptionMessageCallback exception_cb, void *external_data);

  ~JSHCtx() {
    for (auto st : callback_structs_) {
      delete st;
    }
    for (auto arr : prop_descriptor_arrays_) {
      delete []arr;
    }
    for (auto property_st : property_structs_) {
      delete property_st;
    }
    template_map_.clear();
    OH_JSVM_CloseEnvScope(env_, env_scope_);
    env_scope_ = nullptr;
    OH_JSVM_DestroyEnv(env_);
    env_ = nullptr;
  }

  virtual std::shared_ptr<CtxValue> DefineProxy(const std::unique_ptr<FunctionWrapper>& constructor_wrapper) override;

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
  
  virtual void ThrowException(const std::shared_ptr<CtxValue>& exception) override;
  virtual void ThrowException(const unicode_string_view& exception) override;
  virtual std::shared_ptr<CtxValue> CreateFunction(const std::unique_ptr<FunctionWrapper>& wrapper) override;
  virtual void SetWeak(std::shared_ptr<CtxValue> value,
                       const std::unique_ptr<WeakCallbackWrapper>& wrapper) override;
  virtual void InvalidWeakCallbackWrapper() override;
  virtual void SetReceiverData(std::shared_ptr<CtxValue> value, void* data) override;

  virtual std::shared_ptr<CtxValue> GetPropertyNames(const std::shared_ptr<CtxValue>& value);
  virtual std::shared_ptr<CtxValue> GetOwnPropertyNames(const std::shared_ptr<CtxValue>& value);

  void SetExternalData(void* data) override;
  virtual std::shared_ptr<ClassDefinition> GetClassDefinition(const string_view& name) override;

  std::string GetSerializationBuffer(const std::shared_ptr<CtxValue>& value,
                                     std::string& reused_buffer);
  void SetPointerInInstanceData(int index, void* address);
  
  JSVM_VM vm_ = nullptr;
  JSVM_Env env_ = nullptr;
  JSVM_EnvScope env_scope_ = nullptr;
  
  std::unordered_map<void*, void*> func_external_data_map_;
  std::unordered_map<string_view, std::shared_ptr<JSHClassDefinition>> template_map_;
  
  ExceptionMessageCallback exception_cb_ = nullptr;
  void* exception_cb_external_data_ = nullptr;
  
  void* instance_data_[kJSHExternalDataNum] = {0};
  
  std::vector<JSVM_CallbackStruct*> callback_structs_;
  std::vector<JSVM_PropertyDescriptor*> prop_descriptor_arrays_;
  std::vector<JSVM_PropertyHandlerConfigurationStruct*> property_structs_;

 private:
  std::shared_ptr<CtxValue> CreateTemplate(const std::unique_ptr<FunctionWrapper>& wrapper);
  std::shared_ptr<CtxValue> InternalRunScript(
      std::shared_ptr<CtxValue> &source_value,
      const unicode_string_view& file_name,
      bool is_use_code_cache,
      unicode_string_view* cache);
  bool CheckJSVMStatus(JSVM_Env env, JSVM_Status status);
};

}
}
}
