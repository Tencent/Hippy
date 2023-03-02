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

#include "core/napi/callback_info.h"

#include "core/scope.h"

namespace hippy {
namespace napi {

CallbackInfo::CallbackInfo() {
  ret_value_ = std::make_unique<ReturnValue>();
  exception_value_ = std::make_unique<ExceptionValue>();
  receiver_ = nullptr;
}

void CallbackInfo::AddValue(const std::shared_ptr<CtxValue>& value) {
  if (!value) {
    return;
  }
  values_.push_back(value);
}

std::shared_ptr<CtxValue> CallbackInfo::operator[](size_t index) const {
  if (index < 0 || static_cast<size_t>(index) >= Length()) {
    return nullptr;
  }
  return values_[index];
}

void ExceptionValue::Set(const std::shared_ptr<Ctx>& context,
                         const unicode_string_view& str) {
  value_ = context->CreateString(str);
}

}  // namespace napi
}  // namespace hippy
