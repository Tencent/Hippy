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

#include <JavaScriptCore/JavaScriptCore.h>

#include "base/unicode_string_view.h"
#include "core/napi/js_ctx.h"

namespace hippy {
namespace napi {

class JSCCtxValue : public CtxValue {
public:
  JSCCtxValue(JSGlobalContextRef context, JSValueRef value)
  : context_(context), value_(value) {
    JSValueProtect(context_, value_);
  }
  ~JSCCtxValue() { JSValueUnprotect(context_, value_); }
  JSCCtxValue(const JSCCtxValue&) = delete;
  JSCCtxValue &operator=(const JSCCtxValue&) = delete;
  
  JSGlobalContextRef context_;
  JSValueRef value_;
};

}
}
