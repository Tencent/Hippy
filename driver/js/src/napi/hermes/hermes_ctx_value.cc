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

#include "driver/napi/hermes/hermes_ctx_value.h"

#include "footstone/logging.h"

namespace hippy {
inline namespace driver {
inline namespace napi {

Value HermesCtxValue::GetValue(const std::unique_ptr<HermesRuntime>& runtime) {
  if (type_ == HermesCtxValue::Type::ObjectKind) {
    return Value(*runtime, value_.asObject(*runtime));
  } else if (type_ == HermesCtxValue::Type::SymbolKind) {
    return Value(*runtime, value_.asSymbol(*runtime));
  } else if (type_ == HermesCtxValue::Type::StringKind) {
    return Value(*runtime, value_.asString(*runtime));
  } else if (type_ == HermesCtxValue::Type::BigIntKind) {
    return Value(*runtime, value_.asBigInt(*runtime));
  } else {
    return Value(*runtime, value_);
  }
}

}  // namespace napi
}  // namespace driver
}  // namespace hippy
