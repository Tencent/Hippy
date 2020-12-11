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

#ifndef HIPPY_CORE_NAPI_CALLBACK_INFO_H_
#define HIPPY_CORE_NAPI_CALLBACK_INFO_H_

#include <stdio.h>

#include <memory>
#include <vector>

#include "core/base/macros.h"
#include "core/napi/js_native_api_types.h"
#include "core/scope.h"

namespace hippy {
namespace napi {

class ReturnValue {
 public:
  ReturnValue() = default;

  void SetUndefined() { value_ = nullptr; }
  void Set(std::shared_ptr<CtxValue> value) { value_ = value; }
  std::shared_ptr<CtxValue> Get() const { return value_; }

 private:
  std::shared_ptr<CtxValue> value_;

  DISALLOW_COPY_AND_ASSIGN(ReturnValue);
};

class ExceptionValue {
 public:
  ExceptionValue() = default;

  void Set(std::shared_ptr<CtxValue> value) { value_ = value; }
  void Set(std::shared_ptr<Ctx> context, const char* value);
  std::shared_ptr<CtxValue> Get() const { return value_; }

 private:
  std::shared_ptr<CtxValue> value_;

  DISALLOW_COPY_AND_ASSIGN(ExceptionValue);
};

class CallbackInfo {
 public:
  explicit CallbackInfo(std::shared_ptr<Scope> scope);

  void AddValue(std::shared_ptr<CtxValue> value);
  std::shared_ptr<CtxValue> operator[](int index) const;

  size_t Length() const { return values_.size(); }
  std::shared_ptr<Scope> GetScope() const { return scope_; }
  ReturnValue* GetReturnValue() const { return ret_value_.get(); }
  ExceptionValue* GetExceptionValue() const { return exception_value_.get(); }

 private:
  std::shared_ptr<Scope> scope_;
  std::vector<std::shared_ptr<CtxValue>> values_;
  std::unique_ptr<ReturnValue> ret_value_;
  std::unique_ptr<ExceptionValue> exception_value_;

  DISALLOW_COPY_AND_ASSIGN(CallbackInfo);
};

}  // namespace napi
}  // namespace hippy

#endif  // HIPPY_CORE_NAPI_CALLBACK_INFO_H_
