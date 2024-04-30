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

#include <any>
#include <memory>
#include <vector>
#include <unordered_map>

#include "base/unicode_string_view.h"
#include "core/base/macros.h"

namespace hippy {
namespace napi {

class CallbackInfo;
class Ctx;
class CtxValue;

using JsCallback = void (*)(const CallbackInfo& info, void* data);

// Map: FunctionName -> Callback (e.g. "Log" -> ConsoleModule::Log)
using ModuleClass = std::unordered_map<tdf::base::unicode_string_view, hippy::napi::JsCallback>;

// Map: ClassName -> ModuleClass (e.g. "ConsoleModule" -> [ModuleClass])
using ModuleClassMap = std::unordered_map<tdf::base::unicode_string_view, ModuleClass>;

class ReturnValue {
 public:
  ReturnValue() = default;
  ReturnValue(const ReturnValue &) = delete;
  ReturnValue &operator=(const ReturnValue &) = delete;

  void SetUndefined() { value_ = nullptr; }
  void Set(std::shared_ptr<CtxValue> value) { value_ = value; }
  std::shared_ptr<CtxValue> Get() const { return value_; }

 private:
  std::shared_ptr<CtxValue> value_;
};

class ExceptionValue {
 public:
  using unicode_string_view = tdf::base::unicode_string_view;

  ExceptionValue() = default;
  ExceptionValue(const ExceptionValue &) = delete;
  ExceptionValue &operator=(const ExceptionValue &) = delete;

  void Set(std::shared_ptr<CtxValue> value) { value_ = value; }
  void Set(const std::shared_ptr<Ctx>& context, const unicode_string_view& str);
  std::shared_ptr<CtxValue> Get() const { return value_; }

 private:
  std::shared_ptr<CtxValue> value_;
};

class CallbackInfo {
 public:
  CallbackInfo();
  CallbackInfo(const CallbackInfo &) = delete;
  CallbackInfo &operator=(const CallbackInfo &) = delete;

  inline void SetReceiver(std::shared_ptr<CtxValue> receiver) { receiver_ = receiver; }
  inline std::shared_ptr<CtxValue> GetReceiver() const { return receiver_; }
  inline size_t Length() const { return values_.size(); }
  inline std::any GetSlot() const { return slot_; }
  inline void SetSlot(std::any slot) { slot_ = slot;}
  inline ReturnValue* GetReturnValue() const { return ret_value_.get(); }
  inline ExceptionValue* GetExceptionValue() const { return exception_value_.get(); }

  void AddValue(const std::shared_ptr<CtxValue>& value);
  std::shared_ptr<CtxValue> operator[](size_t index) const;

 private:
  std::any slot_;
  std::shared_ptr<CtxValue> receiver_;
  std::vector<std::shared_ptr<CtxValue>> values_;
  std::unique_ptr<ReturnValue> ret_value_;
  std::unique_ptr<ExceptionValue> exception_value_;
};

}  // namespace napi
}  // namespace hippy
