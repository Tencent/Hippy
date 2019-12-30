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

#ifndef CORE_NAPI_V8_JS_NATIVE_API_V8_H_
#define CORE_NAPI_V8_JS_NATIVE_API_V8_H_

#include <stdint.h>
#include <string>
#include <vector>

#include "core/base/logging.h"
#include "core/base/macros.h"
#include "core/napi/js-native-api.h"
#include "third_party/v8/libplatform/libplatform.h"
#include "third_party/v8/v8.h"

#include "code-cache-sanity-check.h"

namespace hippy {
namespace napi {

struct napi_vm__ {
  napi_vm__() {
    HIPPY_LOG(hippy::Debug, "napi_vm__ Isolate create");
    if (platform_ != nullptr) {
      v8::V8::InitializePlatform(platform_);
    }

    static std::once_flag flag;
    std::call_once(flag, [] {
      platform_ = v8::platform::CreateDefaultPlatform();
      v8::V8::SetFlagsFromString("--wasm-disable-structured-cloning",
                                 strlen("--wasm-disable-structured-cloning"));
      v8::V8::InitializePlatform(platform_, true);
      v8::V8::Initialize();
    });

    create_params.array_buffer_allocator =
        v8::ArrayBuffer::Allocator::NewDefaultAllocator();
    isolate = v8::Isolate::New(create_params);
    isolate->AddCodeCacheSanityCheckCallback(CodeCacheSanityCheck);
    isolate->Enter();
    isolate->SetCaptureStackTraceForUncaughtExceptions(true);
    context_count = 1;
  }
  ~napi_vm__() {
    HIPPY_LOG(hippy::Debug, "napi_vm__ Isolate destroy");
    isolate->Exit();
    isolate->Dispose();

    if (create_params.array_buffer_allocator) {
      delete create_params.array_buffer_allocator;
    }
  }

  static void CodeCacheSanityCheck(v8::Isolate *isolate,
                                   int result,
                                   v8::Local<v8::String> source) {
    CodeCacheSanityCheck::check(isolate, result, source);
  }
  static void PlatformDestroy() {
    delete platform_;

    v8::V8::Dispose();
    v8::V8::ShutdownPlatform();
  }

  v8::Isolate *isolate;
  v8::Isolate::CreateParams create_params;
  int context_count;

 public:
  static v8::Platform *platform_;
};

struct napi_context__ {
  explicit napi_context__(napi_vm v) {
    isolate_ = v->isolate;

    v8::Isolate *isolate = v->isolate;
    v8::HandleScope handleScope(isolate);

    v8::Local<v8::ObjectTemplate> global = v8::ObjectTemplate::New(isolate);
    v8::Handle<v8::Context> context =
        v8::Context::New(isolate, nullptr, global);

    global_persistent.Reset(isolate, global);
    context_persistent.Reset(isolate, context);

    flag_context = std::to_string(v->context_count++);
  }
  ~napi_context__() {
    context_persistent.Empty();
    global_persistent.Empty();
  }

  v8::Isolate *isolate_;
  v8::Persistent<v8::ObjectTemplate> global_persistent;
  v8::Persistent<v8::Context> context_persistent;
  ModuleClassMap modules;
  std::string flag_context;

 public:
  napi_status error;
};

struct napi_value__ {
  napi_value__(v8::Isolate *isolate, const v8::Local<v8::Value> &value)
      : persisent_value(isolate, value) {}
  napi_value__(v8::Isolate *isolate, const v8::Persistent<v8::Value> &value)
      : persisent_value(isolate, value) {}
  ~napi_value__() { persisent_value.Reset(); }

  v8::Persistent<v8::Value> persisent_value;

  DISALLOW_COPY_AND_ASSIGN(napi_value__);
};

}  // namespace napi
}  // namespace hippy

#endif  // CORE_NAPI_V8_JS_NATIVE_API_V8_H_
