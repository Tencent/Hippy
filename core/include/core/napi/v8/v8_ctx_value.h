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

#include "core/napi/js_ctx_value.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wconversion"
#include "v8/v8.h"
#pragma clang diagnostic pop

namespace hippy {
namespace napi {

struct V8CtxValue : public CtxValue {
  V8CtxValue(v8::Isolate* isolate, const v8::Local<v8::Value>& value)
      : global_value_(isolate, value) {}
  V8CtxValue(v8::Isolate* isolate, const v8::Persistent<v8::Value>& value)
      : global_value_(isolate, value) {}
  ~V8CtxValue() { global_value_.Reset(); }
  V8CtxValue(const V8CtxValue &) = delete;
  V8CtxValue &operator=(const V8CtxValue &) = delete;

  v8::Global<v8::Value> global_value_;
  v8::Isolate* isolate_;
};

}
}
