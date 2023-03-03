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

#include <functional>
#include <map>
#include <memory>
#include <string>
#include <unordered_map>

#include "base/logging.h"
#include "core/base/common.h"
#include "core/base/js_value_wrapper.h"
#include "core/napi/callback_info.h"
#include "core/napi/js_ctx_value.h"

namespace hippy {
namespace napi {

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

class CBTuple {
 public:
  CBTuple(hippy::base::RegisterFunction fn, void* data): fn_(fn), data_(data) {}
  hippy::base::RegisterFunction fn_;
  void* data_;
};

class FuncWrapper {
 public:
  FuncWrapper(JsCallback cb, void* data): cb(cb), data(data) {}

  JsCallback cb;
  void* data;
};

struct PropertyDescriptor {
  std::shared_ptr<CtxValue> name;
  bool has_method;
  std::unique_ptr<FuncWrapper> method;
  bool has_getter;
  std::unique_ptr<FuncWrapper> getter;
  bool has_setter;
  std::unique_ptr<FuncWrapper> setter;
  std::shared_ptr<CtxValue> value;
  PropertyAttribute attr;
  void* data;

  PropertyDescriptor(std::shared_ptr<CtxValue> name,
                     std::unique_ptr<FuncWrapper> method,
                     std::unique_ptr<FuncWrapper> getter,
                     std::unique_ptr<FuncWrapper> setter,
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
    if (this->method) {
      has_method = true;
    } else {
      has_method = false;
    }
    if (this->getter) {
      has_getter = true;
    } else {
      has_getter = false;
    }
    if (this->setter) {
      has_setter = true;
    } else {
      has_setter = false;
    }
  }
};

class Ctx {
 public:
  using JSValueWrapper = hippy::base::JSValueWrapper;
  using unicode_string_view = tdf::base::unicode_string_view;

  Ctx() {}
  virtual ~Ctx() { TDF_BASE_DLOG(INFO) << "~Ctx"; }

  virtual std::shared_ptr<CtxValue> DefineProxy(const std::unique_ptr<FuncWrapper>& constructor_wrapper) = 0;

  virtual std::shared_ptr<CtxValue> DefineClass(unicode_string_view name,
                                                const std::unique_ptr<FuncWrapper>& constructor_wrapper,
                                                size_t property_count,
                                                std::shared_ptr<PropertyDescriptor> properties[]) = 0;
  virtual std::shared_ptr<CtxValue> NewInstance(const std::shared_ptr<CtxValue>& cls,
                                                int argc, std::shared_ptr<CtxValue> argv[],
                                                void* external) = 0;
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
      const unicode_string_view& name) = 0;
  virtual std::shared_ptr<CtxValue> CreateObject() = 0;
  virtual std::shared_ptr<CtxValue> CreateNumber(double number) = 0;
  virtual std::shared_ptr<CtxValue> CreateBoolean(bool b) = 0;
  virtual std::shared_ptr<CtxValue> CreateString(
      const unicode_string_view& string) = 0;
  virtual std::shared_ptr<CtxValue> CreateUndefined() = 0;
  virtual std::shared_ptr<CtxValue> CreateNull() = 0;
  virtual std::shared_ptr<CtxValue> CreateFunction(std::unique_ptr<hippy::napi::FuncWrapper>& wrapper) = 0;
  virtual std::shared_ptr<CtxValue> CreateObject(const std::unordered_map<
  unicode_string_view,
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
  virtual std::shared_ptr<CtxValue> CreateError(
      const unicode_string_view& msg) = 0;

  // Get From Value
  virtual std::shared_ptr<CtxValue> CallFunction(
      const std::shared_ptr<CtxValue>& function,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[]) = 0;

  virtual bool GetValueNumber(const std::shared_ptr<CtxValue>& value,
                              double* result) = 0;
  virtual bool GetValueNumber(const std::shared_ptr<CtxValue>& value,
                              int32_t* result) = 0;
  virtual bool GetValueBoolean(const std::shared_ptr<CtxValue>& value,
                               bool* result) = 0;
  virtual bool GetValueString(const std::shared_ptr<CtxValue>& value,
                              unicode_string_view* result) = 0;
  virtual bool GetValueJson(const std::shared_ptr<CtxValue>& value,
                            unicode_string_view* result) = 0;
  virtual bool IsNullOrUndefined(const std::shared_ptr<CtxValue>& value) = 0;

  virtual bool IsMap(const std::shared_ptr<CtxValue>& value) = 0;

  // Array Helpers
  virtual bool IsArray(const std::shared_ptr<CtxValue>& value) = 0;
  virtual uint32_t GetArrayLength(const std::shared_ptr<CtxValue>& value) = 0;
  virtual std::shared_ptr<CtxValue> CopyArrayElement(const std::shared_ptr<CtxValue>& value,
                                                     uint32_t index) = 0;

  // Object Helpers

  virtual bool HasNamedProperty(const std::shared_ptr<CtxValue>& value,
                                const unicode_string_view& name) = 0;
  virtual std::shared_ptr<CtxValue> CopyNamedProperty(
      const std::shared_ptr<CtxValue>& value,
      const unicode_string_view& name) = 0;
  // Function Helpers

  virtual bool IsString(const std::shared_ptr<CtxValue>& value) = 0;
  virtual bool IsFunction(const std::shared_ptr<CtxValue>& value) = 0;
  virtual bool IsObject(const std::shared_ptr<CtxValue>& value) = 0;
  virtual unicode_string_view CopyFunctionName(const std::shared_ptr<CtxValue>& value) = 0;

  virtual std::shared_ptr<CtxValue> RunScript(
      const unicode_string_view& data,
      const unicode_string_view& file_name) = 0;

  virtual void ThrowException(const std::shared_ptr<CtxValue>& exception) = 0;
  virtual void ThrowException(const unicode_string_view& exception) = 0;
  virtual void HandleUncaughtException(const std::shared_ptr<CtxValue>& exception) = 0;

  virtual std::shared_ptr<JSValueWrapper> ToJsValueWrapper(
      const std::shared_ptr<CtxValue>& value) = 0;
  virtual std::shared_ptr<CtxValue> CreateCtxValue(
      const std::shared_ptr<JSValueWrapper>& wrapper) = 0;

  virtual void SetExternalData(void* data) = 0;
};

}
}
