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

#include <mutex>
#include <string>
#include <vector>

#include "core/base/common.h"
#include "core/base/logging.h"
#include "core/base/macros.h"
#include "core/napi/js-native-api.h"
#include "third_party/v8/libplatform/libplatform.h"
#include "third_party/v8/v8.h"

namespace hippy {
namespace napi {

class V8VM : public VM {
 public:
  V8VM() {
    HIPPY_DLOG(hippy::Debug, "V8VM begin");
    {
      std::lock_guard<std::mutex> lock(mutex_);
      if (platform_ != nullptr) {
        HIPPY_DLOG(hippy::Debug, "InitializePlatform");
        v8::V8::InitializePlatform(platform_);
      } else {
        HIPPY_DLOG(hippy::Debug, "CreateDefaultPlatform");
        platform_ = v8::platform::CreateDefaultPlatform();
        v8::V8::SetFlagsFromString("--wasm-disable-structured-cloning",
                                   strlen("--wasm-disable-structured-cloning"));
        v8::V8::InitializePlatform(platform_, true);
        HIPPY_DLOG(hippy::Debug, "Initialize");
        v8::V8::Initialize();
      }
    }

    create_params_.array_buffer_allocator =
        v8::ArrayBuffer::Allocator::NewDefaultAllocator();
    isolate_ = v8::Isolate::New(create_params_);
    isolate_->Enter();
    isolate_->SetCaptureStackTraceForUncaughtExceptions(true);
    HIPPY_DLOG(hippy::Debug, "V8VM end");
  }

  ~V8VM() {
    isolate_->Exit();
    isolate_->Dispose();

    delete create_params_.array_buffer_allocator;
  }

  virtual std::shared_ptr<Ctx> CreateContext();

  static void CodeCacheSanityCheck(v8::Isolate *isolate,
                                   int result,
                                   v8::Local<v8::String> source) {}

  static void PlatformDestroy() {
    delete platform_;

    v8::V8::Dispose();
    v8::V8::ShutdownPlatform();
  }

  v8::Isolate *isolate_;
  v8::Isolate::CreateParams create_params_;

 public:
  static v8::Platform *platform_;
  static std::mutex mutex_;
};

class CBTuple {
 public:
  CBTuple(hippy::base::RegisterFunction fn, void *data)
      : fn_(fn), data_(data){};
  hippy::base::RegisterFunction fn_;
  void *data_;
};

class CBDataTuple {
 public:
  CBDataTuple(const CBTuple &cb_tuple,
              const v8::FunctionCallbackInfo<v8::Value> &info)
      : cb_tuple_(cb_tuple), info_(info){};
  const CBTuple &cb_tuple_;
  const v8::FunctionCallbackInfo<v8::Value> &info_;
};

struct V8Ctx : public Ctx {
  explicit V8Ctx(v8::Isolate *isolate) : isolate_(isolate) {
    v8::HandleScope handle_scope(isolate);

    v8::Local<v8::ObjectTemplate> global = v8::ObjectTemplate::New(isolate);
    v8::Handle<v8::Context> context =
        v8::Context::New(isolate, nullptr, global);

    global_persistent_.Reset(isolate, global);
    context_persistent_.Reset(isolate, context);

    error_ = napi_ok;
  }

  ~V8Ctx() {
    context_persistent_.Empty();
    global_persistent_.Empty();
  }

  virtual bool RegisterGlobalInJs();
  virtual bool SetGlobalVar(const std::string &name, const char *json);
  virtual std::shared_ptr<CtxValue> GetGlobalVar(const std::string &name);
  virtual std::shared_ptr<CtxValue> GetProperty(
      const std::shared_ptr<CtxValue> &object,
      const std::string &name);
  virtual void RegisterGlobalModule(std::shared_ptr<Scope> scope,
                                    const ModuleClassMap &modules);
  virtual void RegisterNativeBinding(const std::string &name,
                                     hippy::base::RegisterFunction fn,
                                     void *data);
  virtual std::shared_ptr<CtxValue> EvaluateJavascript(
      const uint8_t *javascript_data,
      size_t javascript_length,
      const char *js_file_name = nullptr);

  virtual std::shared_ptr<CtxValue> CreateNumber(double number);
  virtual std::shared_ptr<CtxValue> CreateBoolean(bool b);
  virtual std::shared_ptr<CtxValue> CreateString(const char *string);
  virtual std::shared_ptr<CtxValue> CreateUndefined();
  virtual std::shared_ptr<CtxValue> CreateNull();
  virtual std::shared_ptr<CtxValue> CreateObject(const char *json);
  virtual std::shared_ptr<CtxValue> CreateArray(
      size_t count,
      std::shared_ptr<CtxValue> value[]);

  virtual bool GetValueNumber(std::shared_ptr<CtxValue>, double *result);
  virtual bool GetValueNumber(std::shared_ptr<CtxValue>, int32_t *result);
  virtual bool GetValueBoolean(std::shared_ptr<CtxValue>, bool *result);
  virtual bool GetValueString(std::shared_ptr<CtxValue>, std::string *result);
  virtual bool GetValueJson(std::shared_ptr<CtxValue>, std::string *result);

  // Array Helpers

  virtual bool IsArray(std::shared_ptr<CtxValue>);
  virtual uint32_t GetArrayLength(std::shared_ptr<CtxValue>);
  virtual std::shared_ptr<CtxValue> CopyArrayElement(std::shared_ptr<CtxValue>,
                                                     uint32_t index);

  // Object Helpers

  virtual bool HasNamedProperty(std::shared_ptr<CtxValue>,
                                const char *utf8name);
  virtual std::shared_ptr<CtxValue> CopyNamedProperty(std::shared_ptr<CtxValue>,
                                                      const char *utf8name);
  // Function Helpers

  virtual bool IsFunction(std::shared_ptr<CtxValue>);
  virtual std::string CopyFunctionName(std::shared_ptr<CtxValue>);
  virtual std::shared_ptr<CtxValue> CallFunction(
      std::shared_ptr<CtxValue> function,
      size_t argument_count,
      const std::shared_ptr<CtxValue> argumets[],
      std::shared_ptr<std::string>* exception = nullptr);

  virtual bool RunScriptWithCache(std::unique_ptr<std::vector<char>> script,
                                  const std::string &file_name,
                                  bool is_use_code_cache,
                                  std::shared_ptr<std::vector<char>> &cache);
  virtual std::shared_ptr<CtxValue> GetJsFn(const std::string &name);

  v8::Isolate *isolate_;
  v8::Persistent<v8::ObjectTemplate> global_persistent_;
  v8::Persistent<v8::Context> context_persistent_;
  std::unique_ptr<CBTuple> data_tuple_;

 public:
  napi_status error_;

 private:
  v8::Handle<v8::Value> ParseJson(const char *json);
};

struct V8CtxValue : public CtxValue {
  V8CtxValue(v8::Isolate *isolate, const v8::Local<v8::Value> &value)
      : persisent_value_(isolate, value) {}
  V8CtxValue(v8::Isolate *isolate, const v8::Persistent<v8::Value> &value)
      : persisent_value_(isolate, value) {}
  ~V8CtxValue() { persisent_value_.Reset(); }

  v8::Persistent<v8::Value> persisent_value_;
  v8::Isolate *isolate_;

  DISALLOW_COPY_AND_ASSIGN(V8CtxValue);
};

}  // namespace napi
}  // namespace hippy

#endif  // CORE_NAPI_V8_JS_NATIVE_API_V8_H_
