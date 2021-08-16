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

#include "core/napi/callback-info.h"

#include "core/napi/js-native-api.h"

namespace hippy {
namespace napi {

CallbackInfo::CallbackInfo(std::shared_ptr<Scope> scope) : scope_(scope) {
  ret_value_ = std::make_unique<ReturnValue>();
  exception_value_ = std::make_unique<ExceptionValue>();
}

void CallbackInfo::AddValue(std::shared_ptr<CtxValue> value) {
  if (!value)
    return;
  values_.push_back(value);
}

std::shared_ptr<CtxValue> CallbackInfo::operator[](int index) const {
  if (index < 0 || index >= Length()) {
    return nullptr;
  }
  return values_[index];
}

void ExceptionValue::Set(std::shared_ptr<Ctx> context, const char* value) {
  value_ = context->CreateString(value);
}

}  // namespace napi
}  // namespace hippy
