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

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wextra-semi"
#pragma clang diagnostic ignored "-Wsign-conversion"
#include "hermes/hermes.h"
#include "jsi/jsi.h"
#pragma clang diagnostic pop

#include <memory>

#include "driver/napi/js_ctx_value.h"

namespace hippy {
inline namespace driver {
inline namespace napi {

using HermesRuntime = facebook::hermes::HermesRuntime;
using Runtime = facebook::jsi::Runtime;
using Value = facebook::jsi::Value;

using Symbol = facebook::jsi::Symbol;
using BigInt = facebook::jsi::BigInt;
using String = facebook::jsi::String;
using Object = facebook::jsi::Object;

class HermesCtxValue : public CtxValue {
 public:
  enum Type {
    SymbolKind,
    BigIntKind,
    StringKind,
    ObjectKind,
    UnknowKind,
  };

  HermesCtxValue(Runtime& runtime, const Value& value) : value_(runtime, value), type_(Type::UnknowKind) {}
  HermesCtxValue(Runtime& runtime, const Symbol& value) : value_(runtime, value), type_(Type::SymbolKind) {}
  HermesCtxValue(Runtime& runtime, const BigInt& value) : value_(runtime, value), type_(Type::BigIntKind) {}
  HermesCtxValue(Runtime& runtime, const String& value) : value_(runtime, value), type_(Type::StringKind) {}
  HermesCtxValue(Runtime& runtime, const Object& value) : value_(runtime, value), type_(Type::ObjectKind) {}
  Value GetValue(const std::unique_ptr<HermesRuntime>& runtime);

 private:
  Value value_;
  Type type_;
};

class HermesExceptionCtxValue : public HermesCtxValue {
public:
  HermesExceptionCtxValue(Runtime& runtime,
                          const std::exception_ptr exception,
                          const std::string& message,
                          const Object& value)
  : HermesCtxValue(runtime, value), exception_(std::move(exception)), message_(message) {}
  const std::string& GetMessage() const { return message_; }
private:
  std::exception_ptr exception_;
  std::string message_;
};

}  // namespace napi
}  // namespace driver
}  // namespace hippy
