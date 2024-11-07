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

#include <any>
#include <memory>
#include <unordered_map>

#include "driver/napi/hermes/hermes_class_definition.h"
#include "driver/napi/hermes/hermes_ctx_value.h"
#include "driver/napi/js_ctx.h"
#include "driver/vm/hermes/hermes_vm.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wextra-semi"
#pragma clang diagnostic ignored "-Wsign-conversion"
#pragma clang diagnostic ignored "-Wshorten-64-to-32"
#include "jsi/jsi.h"

#ifdef ENABLE_INSPECTOR
#include "hermes/cdp/CDPAgent.h"
#include "hermes/cdp/CDPDebugAPI.h"

using CDPAgent = facebook::hermes::cdp::CDPAgent;
using CDPDebugAPI = facebook::hermes::cdp::CDPDebugAPI;
#endif /* ENABLE_INSPECTOR */

#pragma clang diagnostic pop

namespace hippy {
inline namespace driver {
inline namespace napi {

using Runtime = facebook::jsi::Runtime;
using PropNameID = facebook::jsi::PropNameID;
using Value = facebook::jsi::Value;
using Object = facebook::jsi::Object;
using NativeState = facebook::jsi::NativeState;
using String = facebook::jsi::String;
using Array = facebook::jsi::Array;

class LocalNativeState : public NativeState {
public:
  LocalNativeState() = default;
  ~LocalNativeState() = default;
  
  void Set(void* address) { data_ = address; }
  void* Get() { return data_; }
  
  void Set(int key, void* address) {
    data_map_[key] = address;
  }
  
  void* Get(int key) {
    auto it = data_map_.find(key);
    if (it != data_map_.end()) {
      return it->second;
    }
    return nullptr;
  }
  
private:
  void* data_;
  std::unordered_map<int, void*> data_map_;
};

class GlobalNativeState : public NativeState {
 public:
  GlobalNativeState() = default;
  ~GlobalNativeState() = default;

  void Set(uint32_t index, std::any data) { external_map_[index] = data; }
  bool Get(uint32_t index, std::any& value) const {
    const auto it = external_map_.find(index);
    if (it == external_map_.end()) return false;
    value = it->second;
    return true;
  }

 private:
  std::unordered_map<uint32_t, std::any> external_map_;
};

class HippyJsiBuffer : public facebook::jsi::Buffer {
 public:
  HippyJsiBuffer(const uint8_t* data, size_t len);
  virtual ~HippyJsiBuffer();
  uint8_t* data() const override { return data_; }
  size_t size() const override { return len_; }

 private:
  uint8_t* data_;
  size_t len_;
};

class HermesCtx : public Ctx {
 public:
  HermesCtx();
  ~HermesCtx();

  virtual std::shared_ptr<CtxValue> DefineProxy(const std::unique_ptr<FunctionWrapper>& constructor_wrapper) override;

  virtual std::shared_ptr<CtxValue> DefineProxyHandler(const std::unique_ptr<FunctionWrapper>& proxy_handler) override;

  virtual std::shared_ptr<CtxValue> DefineClass(const string_view& name, const std::shared_ptr<ClassDefinition>& parent,
                                                const std::unique_ptr<FunctionWrapper>& constructor_wrapper,
                                                size_t property_count,
                                                std::shared_ptr<PropertyDescriptor> properties[]) override;

  virtual std::shared_ptr<CtxValue> NewInstance(const std::shared_ptr<CtxValue>& cls, int argc,
                                                std::shared_ptr<CtxValue> argv[], void* external) override;

  virtual void* GetObjectExternalData(const std::shared_ptr<CtxValue>& object) override;

  virtual std::shared_ptr<CtxValue> GetGlobalObject() override;

  virtual bool SetProperty(std::shared_ptr<CtxValue> object, std::shared_ptr<CtxValue> key,
                           std::shared_ptr<CtxValue> value) override;
  virtual bool SetProperty(std::shared_ptr<CtxValue> object, std::shared_ptr<CtxValue> key,
                           std::shared_ptr<CtxValue> value, const PropertyAttribute& attr) override;
  virtual std::shared_ptr<CtxValue> GetProperty(const std::shared_ptr<CtxValue>& object,
                                                std::shared_ptr<CtxValue> key) override;
  virtual std::shared_ptr<CtxValue> GetProperty(const std::shared_ptr<CtxValue>& object,
                                                const string_view& name) override;

  // Create Hermes JS Object
  virtual std::shared_ptr<CtxValue> CreateObject() override;
  virtual std::shared_ptr<CtxValue> CreateNumber(double number) override;
  virtual std::shared_ptr<CtxValue> CreateBoolean(bool b) override;
  virtual std::shared_ptr<CtxValue> CreateString(const string_view& string_view) override;
  virtual std::shared_ptr<CtxValue> CreateUndefined() override;
  virtual std::shared_ptr<CtxValue> CreateNull() override;
  virtual std::shared_ptr<CtxValue> CreateFunction(const std::unique_ptr<FunctionWrapper>& wrapper) override;
  virtual std::shared_ptr<CtxValue> CreateObject(
      const std::unordered_map<string_view, std::shared_ptr<CtxValue>>& object) override;
  virtual std::shared_ptr<CtxValue> CreateObject(
      const std::unordered_map<std::shared_ptr<CtxValue>, std::shared_ptr<CtxValue>>& object) override;
  virtual std::shared_ptr<CtxValue> CreateMap(
      const std::map<std::shared_ptr<CtxValue>, std::shared_ptr<CtxValue>>& map) override;
  virtual std::shared_ptr<CtxValue> CreateArray(size_t count, std::shared_ptr<CtxValue> value[]) override;
  virtual std::shared_ptr<CtxValue> CreateException(const string_view& msg) override;
  virtual std::shared_ptr<CtxValue> CreateByteBuffer(void* buffer, size_t length) override;

  virtual std::shared_ptr<CtxValue> CallFunction(const std::shared_ptr<CtxValue>& function,
                                                 const std::shared_ptr<CtxValue>& receiver, size_t argument_count,
                                                 const std::shared_ptr<CtxValue> arguments[]) override;

  // Get From Value
  virtual bool GetValueNumber(const std::shared_ptr<CtxValue>& value, double* result) override;
  virtual bool GetValueNumber(const std::shared_ptr<CtxValue>& value, int32_t* result) override;
  virtual bool GetValueBoolean(const std::shared_ptr<CtxValue>& value, bool* result) override;
  virtual bool GetValueString(const std::shared_ptr<CtxValue>& value, string_view* result) override;
  virtual bool GetValueJson(const std::shared_ptr<CtxValue>& value, string_view* result) override;
  virtual bool GetEntriesFromObject(
      const std::shared_ptr<CtxValue>& value,
      std::unordered_map<std::shared_ptr<CtxValue>, std::shared_ptr<CtxValue>>& map) override;
  virtual bool GetEntriesFromMap(
      const std::shared_ptr<CtxValue>& value,
      std::unordered_map<std::shared_ptr<CtxValue>, std::shared_ptr<CtxValue>>& map) override;

  // Check Value type
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

  virtual bool GetByteBuffer(const std::shared_ptr<CtxValue>& value, void** out_data, size_t& out_length,
                             uint32_t& out_type) override;
  virtual uint32_t GetArrayLength(const std::shared_ptr<CtxValue>& value) override;
  virtual std::shared_ptr<CtxValue> CopyArrayElement(const std::shared_ptr<CtxValue>& value, uint32_t index) override;
  virtual bool HasNamedProperty(const std::shared_ptr<CtxValue>& value, const string_view& utf8name) override;
  virtual std::shared_ptr<CtxValue> CopyNamedProperty(const std::shared_ptr<CtxValue>& value,
                                                      const string_view& name) override;
  virtual string_view CopyFunctionName(const std::shared_ptr<CtxValue>& value) override;
  virtual bool Equals(const std::shared_ptr<CtxValue>& lhs, const std::shared_ptr<CtxValue>& rhs) override;

  virtual std::shared_ptr<CtxValue> RunScript(const string_view& data, const string_view& file_name) override;


  void SetExternalData(void* data) override;
  virtual std::shared_ptr<ClassDefinition> GetClassDefinition(const string_view& name) override;
  virtual void SetWeak(std::shared_ptr<CtxValue> value, const std::unique_ptr<WeakCallbackWrapper>& wrapper) override;

  virtual std::shared_ptr<TryCatch> CreateTryCatchScope(bool enable, std::shared_ptr<Ctx> ctx) override;
  virtual void ThrowException(const std::shared_ptr<CtxValue>& exception) override;
  virtual void ThrowException(const string_view& exception) override;
  inline std::shared_ptr<HermesExceptionCtxValue> GetException() { return exception_; }
  string_view GetExceptionMessage(const std::shared_ptr<CtxValue>& exception);

  const std::unique_ptr<HermesRuntime>& GetRuntime() { return runtime_; }
  
  // Get platform-specific internal embedded code
  std::unique_ptr<NativeSourceCodeProvider> GetNativeSourceCodeProvider() const override;

#ifdef ENABLE_INSPECTOR
  inline std::unique_ptr<CDPAgent> &GetCDPAgent() { return cdpAgent_; };
  void SetupDebugAgent(facebook::hermes::debugger::EnqueueRuntimeTaskFunc enqueueRuntimeTask,
                       facebook::hermes::cdp::OutboundMessageFunc messageCallback);
#endif /* ENABLE_INSPECTOR */

 private:
  Value Eval(const char* code);
  Function EvalFunction(const std::string& code);
  void BuiltinModule();
  void BuiltinFunction(facebook::jsi::Object& module, const std::string& name);

 private:
  std::unique_ptr<HermesRuntime> runtime_;
#ifdef ENABLE_INSPECTOR
  std::unique_ptr<CDPAgent> cdpAgent_;
  std::unique_ptr<CDPDebugAPI> cdpDebugAPI_;
#endif /* ENABLE_INSPECTOR */
  std::shared_ptr<GlobalNativeState> global_native_state_;
  std::unordered_map<string_view, std::shared_ptr<HermesClassDefinition>> template_map_;
  std::shared_ptr<HermesExceptionCtxValue> exception_;
  friend class hippy::driver::vm::HermesVM;
};

}  // namespace napi
}  // namespace driver
}  // namespace hippy
