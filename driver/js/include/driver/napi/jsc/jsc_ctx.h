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
#include <CoreFoundation/CoreFoundation.h>
#include <stdio.h>

#include <mutex>
#include <vector>
#include <set>

#include "footstone/logging.h"
#include "footstone/string_view.h"
#include "driver/base/common.h"
#include "driver/napi/js_ctx.h"
#include "driver/napi/js_class_definition.h"
#include "driver/vm/js_vm.h"

template <std::size_t N>
constexpr JSStringRef CreateWithCharacters(const char16_t (&u16)[N]) noexcept {
  return JSStringCreateWithCharacters((const JSChar*)u16, N - 1);
}

namespace hippy {
inline namespace driver {
inline namespace napi {

constexpr char16_t kLengthStr[] = u"length";
constexpr char16_t kMessageStr[] = u"message";
constexpr char16_t kStackStr[] = u"stack";

class JSCCtxValue;

struct ConstructorData {
  void* function_wrapper;
  std::shared_ptr<JSCCtxValue> prototype;
  void* weak_callback_wrapper;
  JSClassRef class_ref;
  std::unordered_map<JSObjectRef, void*> object_data_map;
  ConstructorData(void* func_wrapper, std::shared_ptr<JSCCtxValue>prototype, JSClassRef ref): function_wrapper(func_wrapper), prototype(prototype), weak_callback_wrapper(nullptr), class_ref(ref), object_data_map({}) {}
  ~ConstructorData() {
    JSClassRelease(class_ref);
  }
};

class ConstructorDataManager {
public:
  void SaveConstructorDataPtr(void* ptr) {
    std::lock_guard<std::mutex> lock(mutex_);
    constructor_data_ptr_set_.insert(ptr);
  }

  void ClearConstructorDataPtr(void* ptr) {
    std::lock_guard<std::mutex> lock(mutex_);
    constructor_data_ptr_set_.erase(ptr);
  }

  bool IsValidConstructorDataPtr(void* ptr) {
    std::lock_guard<std::mutex> lock(mutex_);
    return constructor_data_ptr_set_.find(ptr) != constructor_data_ptr_set_.end();
  }
private:
  std::set<void*> constructor_data_ptr_set_;
  std::mutex mutex_;
};

class JSCCtx : public Ctx {
public:
  using string_view = footstone::string_view;
  using JSValueWrapper = hippy::base::JSValueWrapper;
  using VM = hippy::vm::VM;
  
  explicit JSCCtx(JSContextGroupRef group, std::weak_ptr<VM> vm);
  
  ~JSCCtx();
  
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
  
  inline void SetName(const CFStringRef name) {
    if (!name) {
      return;
    }
    JSStringRef js_name = JSStringCreateWithCFString(name);
    JSGlobalContextSetName(context_, js_name);
    JSStringRelease(js_name);
  }
    
  virtual std::shared_ptr<CtxValue> DefineProxy(const std::unique_ptr<FunctionWrapper>& wrapper) override;
  
  virtual std::shared_ptr<CtxValue> DefineClass(const string_view& name,
                                                const std::shared_ptr<ClassDefinition>& parent,
                                                const std::unique_ptr<FunctionWrapper>& constructor_wrapper,
                                                size_t property_count,
                                                std::shared_ptr<PropertyDescriptor> properties[]) override;
  
  virtual std::shared_ptr<CtxValue> NewInstance(const std::shared_ptr<CtxValue>& cls,
                                                int argc, std::shared_ptr<CtxValue> argv[],
                                                void* external) override;
  virtual void* GetObjectExternalData(const std::shared_ptr<CtxValue>& object) override;
  virtual std::shared_ptr<CtxValue> GetGlobalObject() override;
  virtual bool SetProperty(std::shared_ptr<CtxValue> object,
                           std::shared_ptr<CtxValue> key,
                           std::shared_ptr<CtxValue> value) override;
  virtual bool SetProperty(std::shared_ptr<CtxValue> object,
                           std::shared_ptr<CtxValue> key,
                           std::shared_ptr<CtxValue> value,
                           const PropertyAttribute& attr) override;
  virtual std::shared_ptr<CtxValue> GetProperty(const std::shared_ptr<CtxValue>& object,
                                                const string_view& name) override;
  virtual std::shared_ptr<CtxValue> GetProperty(const std::shared_ptr<CtxValue>& object,
                                                std::shared_ptr<CtxValue> key) override;
  virtual std::shared_ptr<CtxValue> CreateObject() override;
  virtual std::shared_ptr<CtxValue> CreateNumber(double number) override;
  virtual std::shared_ptr<CtxValue> CreateBoolean(bool b) override;
  virtual std::shared_ptr<CtxValue> CreateString(const string_view& string) override;
  virtual std::shared_ptr<CtxValue> CreateUndefined() override;
  virtual std::shared_ptr<CtxValue> CreateNull() override;
  virtual std::shared_ptr<CtxValue> CreateObject(const std::unordered_map<
                                                 string_view,
                                                 std::shared_ptr<CtxValue>>& object) override;
  virtual std::shared_ptr<CtxValue> CreateObject(const std::unordered_map<
                                                 std::shared_ptr<CtxValue>,
                                                 std::shared_ptr<CtxValue>>& object) override;
  virtual std::shared_ptr<CtxValue> CreateArray(size_t count,
                                                std::shared_ptr<CtxValue> value[]) override;
  virtual std::shared_ptr<CtxValue> CreateMap(const std::map<std::shared_ptr<CtxValue>, std::shared_ptr<CtxValue>>& map) override;
  virtual std::shared_ptr<CtxValue> CreateException(const string_view& msg) override;
  
  virtual std::shared_ptr<CtxValue> CreateByteBuffer(void* buffer, size_t length) override;
  
  // Get From Value
  virtual std::shared_ptr<CtxValue> CallFunction(const std::shared_ptr<CtxValue>& function,
                                                 const std::shared_ptr<CtxValue>& receiver,
                                                 size_t argument_count = 0,
                                                 const std::shared_ptr<CtxValue> argumets[] = nullptr) override;
  
  virtual std::shared_ptr<CtxValue> CreateFunction(const std::unique_ptr<FunctionWrapper>& wrapper) override;
  
  virtual bool GetValueNumber(const std::shared_ptr<CtxValue>& value, double* result) override;
  virtual bool GetValueNumber(const std::shared_ptr<CtxValue>& value, int32_t* result) override;
  virtual bool GetValueBoolean(const std::shared_ptr<CtxValue>& value, bool* result) override;
  virtual bool GetValueString(const std::shared_ptr<CtxValue>& value,
                              string_view* result) override;
  virtual bool GetValueJson(const std::shared_ptr<CtxValue>& value,
                            string_view* result) override;
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
  
  // Array Helpers
  virtual uint32_t GetArrayLength(const std::shared_ptr<CtxValue>& value) override;
  virtual std::shared_ptr<CtxValue> CopyArrayElement(const std::shared_ptr<CtxValue>& value, uint32_t index) override;
  
  // Object Helpers
  
  virtual bool HasNamedProperty(const std::shared_ptr<CtxValue>& value,
                                const string_view& name) override;
  virtual std::shared_ptr<CtxValue> CopyNamedProperty(const std::shared_ptr<CtxValue>& value,
                                                      const string_view& name) override;
  // Function Helpers
  virtual string_view CopyFunctionName(const std::shared_ptr<CtxValue>& value) override;
  virtual bool Equals(const std::shared_ptr<CtxValue>& lhs, const std::shared_ptr<CtxValue>& rhs) override;
  virtual std::shared_ptr<CtxValue> RunScript(const string_view& data,
                                              const string_view& file_name) override;
  
  virtual void ThrowException(const std::shared_ptr<CtxValue> &exception) override;
  virtual void ThrowException(const string_view& exception) override;
  
  virtual void SetExternalData(void* data) override;
  virtual std::shared_ptr<ClassDefinition> GetClassDefinition(const string_view& name) override;
  virtual void SetWeak(std::shared_ptr<CtxValue> value, const std::unique_ptr<WeakCallbackWrapper>& wrapper) override;
  
  string_view GetExceptionMessage(const std::shared_ptr<CtxValue>& exception);
  void* GetPrivateData(const std::shared_ptr<CtxValue>& value);
  void SaveConstructorData(std::unique_ptr<ConstructorData> constructor_data);
  std::shared_ptr<JSCCtxValue> GetClassPrototype(JSClassRef ref);
  
  JSGlobalContextRef context_;
  std::shared_ptr<JSCCtxValue> exception_;
  bool is_exception_handled_;
  std::unordered_map<string_view, std::shared_ptr<ClassDefinition>> class_definition_map_;
  std::weak_ptr<VM> vm_;
    
  std::unordered_map<JSClassRef, std::unique_ptr<ConstructorData>> constructor_data_holder_;
};

inline footstone::string_view ToStrView(JSStringRef str) {
  return footstone::string_view(reinterpret_cast<const char16_t*>(JSStringGetCharactersPtr(str)),
                                JSStringGetLength(str));
}


}  // namespace napi
}
}  // namespace hippy
