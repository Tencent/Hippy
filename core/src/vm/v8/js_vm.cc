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

#include "core/vm/js_vm.h"

#include "core/base/string_view_utils.h"
#include "core/vm/v8/v8_vm.h"
#include "core/napi/v8/v8_ctx.h"
#include "core/napi/v8/v8_ctx_value.h"

namespace hippy {
namespace vm {

using Ctx = hippy::napi::Ctx;
using V8Ctx = hippy::napi::V8Ctx;
using CtxValue = hippy::napi::CtxValue;
using V8CtxValue = hippy::napi::V8CtxValue;

std::shared_ptr<CtxValue> VM::ParseJson(const std::shared_ptr<Ctx>& ctx, const unicode_string_view& json) {
  if (hippy::base::StringViewUtils::IsEmpty(json)) {
    return nullptr;
  }

  auto v8_ctx = std::static_pointer_cast<V8Ctx>(ctx);
  auto isolate = v8_ctx->isolate_;
  v8::HandleScope handle_scope(isolate);
  v8::Local<v8::Context> context = v8_ctx->context_persistent_.Get(isolate);
  v8::Context::Scope context_scope(context);

  auto v8_string = V8VM::CreateV8String(isolate, json);
  v8::MaybeLocal<v8::Value> maybe_obj = v8::JSON::Parse(context, v8_string);
  if (maybe_obj.IsEmpty()) {
    return nullptr;
  }
  return std::make_shared<V8CtxValue>(isolate, maybe_obj.ToLocalChecked());
}

}
}
