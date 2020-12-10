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

#ifndef CORE_NAPI_JSC_JS_NATIVE_API_JSC_H_
#define CORE_NAPI_JSC_JS_NATIVE_API_JSC_H_

#include <JavaScriptCore/JavaScriptCore.h>
#include <stdio.h>
#include <mutex>  // NOLINT(build/c++11)
#include <vector>

#include "core/base/macros.h"
#include "core/napi/js-native-api-types.h"

namespace hippy {
namespace napi {

struct napi_vm__ {
  napi_vm__() {
    vm = JSContextGroupCreate();
  }

  ~napi_vm__() {
    JSContextGroupRelease(vm);
    vm = nullptr;
  }
  JSContextGroupRef vm;
};

struct napi_context__ {
  explicit napi_context__(JSContextGroupRef vm) {
    context_ = JSGlobalContextCreateInGroup(vm, nullptr);
  }

  ~napi_context__() {
    JSGlobalContextRelease(context_);
    context_ = nullptr;
  }

  JSGlobalContextRef context_;
  ModuleClassMap modules;

  napi_status error;
};

struct napi_value__ {
  napi_value__(napi_context context, JSValueRef value)
      : context_(context), value_(value) {
    JSValueProtect(context_->context_, value_);
  }
  ~napi_value__() { JSValueUnprotect(context_->context_, value_); }

  napi_context context_;
  JSValueRef value_;

  DISALLOW_COPY_AND_ASSIGN(napi_value__);
};

}  // namespace napi
}  // namespace hippy

#endif  // CORE_NAPI_JSC_JS_NATIVE_API_JSC_H_
