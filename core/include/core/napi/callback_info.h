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

#include <memory>
#include <vector>

#include "base/unicode_string_view.h"
#include "core/base/macros.h"
#include "core/napi/js_native_api_types.h"
#include "core/scope.h"

namespace hippy {
namespace napi {

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
  explicit CallbackInfo(std::shared_ptr<Scope> scope);
  CallbackInfo(const CallbackInfo &) = delete;
  CallbackInfo &operator=(const CallbackInfo &) = delete;

  void AddValue(const std::shared_ptr<CtxValue>& value);
  std::shared_ptr<CtxValue> operator[](size_t index) const;

  size_t Length() const { return values_.size(); }
  std::shared_ptr<Scope> GetScope() const { return scope_; }
  ReturnValue* GetReturnValue() const { return ret_value_.get(); }
  ExceptionValue* GetExceptionValue() const { return exception_value_.get(); }

 private:
  std::shared_ptr<Scope> scope_;
  std::vector<std::shared_ptr<CtxValue>> values_;
  std::unique_ptr<ReturnValue> ret_value_;
  std::unique_ptr<ExceptionValue> exception_value_;
};

}  // namespace napi
}  // namespace hippy
