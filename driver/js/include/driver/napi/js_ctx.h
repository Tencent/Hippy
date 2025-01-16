/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2023 THL A29 Limited, a Tencent company.
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
#include <map>
#include <memory>
#include <string>
#include <unordered_map>

#include "footstone/logging.h"
#include "driver/base/common.h"
#include "driver/base/js_value_wrapper.h"
#include "driver/napi/callback_info.h"
#include "driver/napi/js_class_definition.h"
#include "driver/napi/js_ctx_value.h"

#include "dom/dom_event.h"

namespace hippy {
inline namespace driver {
inline namespace napi {

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

enum Encoding {
  UNKNOWN_ENCODING,
  ONE_BYTE_ENCODING,
  TWO_BYTE_ENCODING,
  UTF8_ENCODING
};

class FunctionWrapper {
 public:
  FunctionWrapper(JsCallback callback, void* data) : callback(callback), data(data) {}

  JsCallback callback;
  void* data;
};


using WeakCallback = std::function<void(void* callback_data, void* internal_data)>;
class WeakCallbackWrapper {
 public:
  WeakCallbackWrapper(WeakCallback callback, void* data) : callback(callback), data(data) {}

  WeakCallback callback;
  void* data;
};

class CtxValue;

struct PropertyDescriptor {
  std::shared_ptr<CtxValue> name;
  std::unique_ptr<FunctionWrapper> method;
  std::unique_ptr<FunctionWrapper> getter;
  std::unique_ptr<FunctionWrapper> setter;
  std::shared_ptr<CtxValue> value;
  PropertyAttribute attr;
  void* data;

  PropertyDescriptor(std::shared_ptr<CtxValue> name,
                     std::unique_ptr<FunctionWrapper> method,
                     std::unique_ptr<FunctionWrapper> getter,
                     std::unique_ptr<FunctionWrapper> setter,
                     std::shared_ptr<CtxValue> value,
                     PropertyAttribute attr,
                     void* data) {
    this->name = name;
    this->method = std::move(method);
    this->getter = std::move(getter);
    this->setter = std::move(setter);
    this->value = value;
    this->attr = attr;
    this->data = data;
  }
};

class Ctx {
 public:
  using string_view = footstone::string_view;

  Ctx() {}
  virtual ~Ctx() { FOOTSTONE_LOG(INFO) << "~Ctx"; }

  virtual std::shared_ptr<CtxValue> DefineProxy(const std::unique_ptr<FunctionWrapper>& constructor_wrapper) = 0;

  virtual std::shared_ptr<CtxValue> DefineClass(const string_view& name,
                                                const std::shared_ptr<ClassDefinition>& parent,
                                                const std::unique_ptr<FunctionWrapper>& constructor_wrapper,
                                                size_t property_count,
                                                std::shared_ptr<PropertyDescriptor> properties[]) = 0;
  virtual std::shared_ptr<CtxValue> NewInstance(const std::shared_ptr<CtxValue>& cls,
                                                int argc,
                                                std::shared_ptr<CtxValue> argv[],
                                                void* external) = 0;
  virtual void* GetObjectExternalData(const std::shared_ptr<CtxValue>& object) = 0;
  virtual std::shared_ptr<CtxValue> GetGlobalObject() = 0;
  virtual bool SetProperty(std::shared_ptr<CtxValue> object,
                           std::shared_ptr<CtxValue> key,
                           std::shared_ptr<CtxValue> value) = 0;
  virtual bool SetProperty(std::shared_ptr<CtxValue> object,
                           std::shared_ptr<CtxValue> key,
                           std::shared_ptr<CtxValue> value,
                           const PropertyAttribute& attr) = 0;
  virtual std::shared_ptr<CtxValue> GetProperty(
      const std::shared_ptr<CtxValue>& object,
      std::shared_ptr<CtxValue> key) = 0;
  virtual std::shared_ptr<CtxValue> GetProperty(
      const std::shared_ptr<CtxValue>& object,
      const string_view& name) = 0;
  virtual std::shared_ptr<CtxValue> CreateObject() = 0;
  virtual std::shared_ptr<CtxValue> CreateNumber(double number) = 0;
  virtual std::shared_ptr<CtxValue> CreateBoolean(bool b) = 0;
  virtual std::shared_ptr<CtxValue> CreateString(
      const string_view& string) = 0;
  virtual std::shared_ptr<CtxValue> CreateUndefined() = 0;
  virtual std::shared_ptr<CtxValue> CreateNull() = 0;
  virtual std::shared_ptr<CtxValue> CreateFunction(const std::unique_ptr<hippy::napi::FunctionWrapper>& wrapper) = 0;
  virtual std::shared_ptr<CtxValue> CreateObject(const std::unordered_map<
      string_view,
      std::shared_ptr<CtxValue>>& object) = 0;
  virtual std::shared_ptr<CtxValue> CreateObject(const std::unordered_map<
      std::shared_ptr<CtxValue>,
      std::shared_ptr<CtxValue>>& object) = 0;
  virtual std::shared_ptr<CtxValue> CreateMap(const std::map<
      std::shared_ptr<CtxValue>,
      std::shared_ptr<CtxValue>>& map) = 0;
  virtual std::shared_ptr<CtxValue> CreateArray(
      size_t count,
      std::shared_ptr<CtxValue> value[]) = 0;
  virtual std::shared_ptr<CtxValue> CreateException(const string_view& msg) = 0;
  virtual std::shared_ptr<CtxValue> CreateByteBuffer(void* buffer, size_t length) = 0;

  // Get From Value
  virtual std::shared_ptr<CtxValue> CallFunction(
      const std::shared_ptr<CtxValue>& function,
      const std::shared_ptr<CtxValue>& receiver,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[]) = 0;

  virtual bool GetValueNumber(const std::shared_ptr<CtxValue>& value,
                              double* result) = 0;
  virtual bool GetValueNumber(const std::shared_ptr<CtxValue>& value,
                              int32_t* result) = 0;
  virtual bool GetValueBoolean(const std::shared_ptr<CtxValue>& value,
                               bool* result) = 0;
  virtual bool GetValueString(const std::shared_ptr<CtxValue>& value,
                              string_view* result) = 0;
  virtual bool GetValueJson(const std::shared_ptr<CtxValue>& value,
                            string_view* result) = 0;
  virtual bool GetEntriesFromObject(const std::shared_ptr<CtxValue>& value,
                                    std::unordered_map<std::shared_ptr<CtxValue>, std::shared_ptr<CtxValue>>& map) = 0;
  virtual bool GetEntriesFromMap(const std::shared_ptr<CtxValue>& value,
                                 std::unordered_map<std::shared_ptr<CtxValue>, std::shared_ptr<CtxValue>>& map) = 0;
  virtual bool IsNull(const std::shared_ptr<CtxValue>& value) = 0;
  virtual bool IsUndefined(const std::shared_ptr<CtxValue>& value) = 0;
  virtual bool IsNullOrUndefined(const std::shared_ptr<CtxValue>& value) = 0;
  virtual bool IsBoolean(const std::shared_ptr<CtxValue>& value) = 0;
  virtual bool IsNumber(const std::shared_ptr<CtxValue>& value) = 0;
  virtual bool IsString(const std::shared_ptr<CtxValue>& value) = 0;
  virtual bool IsFunction(const std::shared_ptr<CtxValue>& value) = 0;
  virtual bool IsObject(const std::shared_ptr<CtxValue>& value) = 0;
  virtual bool IsMap(const std::shared_ptr<CtxValue>& value) = 0;
  virtual bool IsArray(const std::shared_ptr<CtxValue>& value) = 0;
  virtual bool IsByteBuffer(const std::shared_ptr<CtxValue>& value) = 0;

  virtual bool GetByteBuffer(const std::shared_ptr<CtxValue>& value,
                             void** out_data,
                             size_t& out_length,
                             uint32_t& out_type) = 0;

  virtual uint32_t GetArrayLength(const std::shared_ptr<CtxValue>& value) = 0;
  virtual std::shared_ptr<CtxValue> CopyArrayElement(const std::shared_ptr<CtxValue>& value,
                                                     uint32_t index) = 0;
  virtual bool HasNamedProperty(const std::shared_ptr<CtxValue>& value,
                                const string_view& name) = 0;
  virtual std::shared_ptr<CtxValue> CopyNamedProperty(
      const std::shared_ptr<CtxValue>& value,
      const string_view& name) = 0;
  virtual string_view CopyFunctionName(const std::shared_ptr<CtxValue>& value) = 0;
  virtual bool Equals(const std::shared_ptr<CtxValue>& lhs, const std::shared_ptr<CtxValue>& rhs) = 0;

  virtual std::shared_ptr<CtxValue> RunScript(
      const string_view& data,
      const string_view& file_name) = 0;

  virtual void ThrowException(const std::shared_ptr<CtxValue>& exception) = 0;
  virtual void ThrowException(const string_view& exception) = 0;

  virtual void SetExternalData(void* data) = 0;
  virtual std::shared_ptr<ClassDefinition> GetClassDefinition(const string_view& name) = 0;
  virtual void SetWeak(std::shared_ptr<CtxValue> value,
                       const std::unique_ptr<WeakCallbackWrapper>& wrapper) = 0;
  virtual void InvalidWeakCallbackWrapper() {}
  virtual void SetReceiverData(std::shared_ptr<CtxValue> value, void* data) {}
};

}
}
}
