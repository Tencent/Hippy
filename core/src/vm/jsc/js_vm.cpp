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
#include "core/vm/jsc/jsc_vm.h"
#include "core/napi/jsc/jsc_ctx.h"
#include "core/napi/jsc/jsc_ctx_value.h"

using Ctx = hippy::napi::Ctx;
using JSCCtx = hippy::napi::JSCCtx;
using CtxValue = hippy::napi::CtxValue;
using JSCCtxValue = hippy::napi::JSCCtxValue;

namespace hippy {
namespace vm {

std::shared_ptr<CtxValue> VM::ParseJson(const std::shared_ptr<Ctx>& ctx, const unicode_string_view& json) {
  if (hippy::base::StringViewUtils::IsEmpty(json)) {
    return nullptr;
  }
  
  auto jsc_ctx = std::static_pointer_cast<JSCCtx>(ctx);
  auto context = jsc_ctx->context_;
  JSStringRef str_ref = JSCVM::CreateJSCString(json);
  JSValueRef value = JSValueMakeFromJSONString(context, str_ref);
  JSStringRelease(str_ref);
  return std::make_shared<JSCCtxValue>(context, value);
}

}
}
