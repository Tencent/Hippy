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

#include "core/napi/v8/js_native_api_v8.h"

#include <iostream>
#include <mutex>
#include <sstream>
#include <string>
#include <vector>

#include "base/logging.h"
#include "core/base/common.h"
#include "core/base/macros.h"
#include "core/base/string_view_utils.h"
#include "core/modules/module_base.h"
#include "core/napi/callback_info.h"
#include "core/napi/native_source_code.h"
#include "core/scope.h"
#include "v8/libplatform/libplatform.h"

namespace hippy {
namespace napi {

using unicode_string_view = tdf::base::unicode_string_view;
using DomValue = tdf::base::DomValue;
using StringViewUtils = hippy::base::StringViewUtils;
using JSValueWrapper = hippy::base::JSValueWrapper;

std::unique_ptr<v8::Platform> V8VM::platform_ = nullptr;
std::mutex V8VM::mutex_;

void JsCallbackFunc(const v8::FunctionCallbackInfo<v8::Value>& info) {
  TDF_BASE_DLOG(INFO) << "JsCallbackFunc begin";

  auto data = info.Data().As<v8::External>();
  if (data.IsEmpty()) {
    info.GetReturnValue().SetUndefined();
    return;
  }

  auto* fn_data = reinterpret_cast<FunctionData*>(data->Value());
  if (!fn_data) {
    info.GetReturnValue().SetUndefined();
    return;
  }

  JsCallback callback = fn_data->callback_;
  std::shared_ptr<Scope> scope = fn_data->scope_.lock();
  if (!scope) {
    TDF_BASE_LOG(FATAL) << "JsCallbackFunc scope error";
    info.GetReturnValue().SetUndefined();
    return;
  }
  CallbackInfo callback_info(scope);

  v8::Isolate* isolate = info.GetIsolate();
  if (!isolate) {
    TDF_BASE_LOG(ERROR) << "JsCallbackFunc isolate error";
    return;
  }

  v8::HandleScope handle_scope(isolate);
  v8::Local<v8::Context> context = isolate->GetCurrentContext();
  if (context.IsEmpty()) {
    TDF_BASE_LOG(ERROR) << "JsCallbackFunc context empty";
    return;
  }

  v8::Context::Scope context_scope(context);
  TDF_BASE_DLOG(INFO) << "callback_info info.length = " << info.Length();
  for (int i = 0; i < info.Length(); i++) {
    callback_info.AddValue(std::make_shared<V8CtxValue>(isolate, info[i]));
  }
  callback(callback_info);

  std::shared_ptr<V8CtxValue> exception = std::static_pointer_cast<V8CtxValue>(
      callback_info.GetExceptionValue()->Get());

  if (exception) {
    const v8::Global<v8::Value>& global_value = exception->global_value_;
    v8::Local<v8::Value> handle_value =
        v8::Local<v8::Value>::New(isolate, global_value);
    isolate->ThrowException(handle_value);
    info.GetReturnValue().SetUndefined();
    return;
  }

  std::shared_ptr<V8CtxValue> ret_value = std::static_pointer_cast<V8CtxValue>(
      callback_info.GetReturnValue()->Get());
  if (!ret_value) {
    info.GetReturnValue().SetUndefined();
    return;
  }

  info.GetReturnValue().Set(ret_value->global_value_);
}

void NativeCallbackFunc(const v8::FunctionCallbackInfo<v8::Value>& info) {
  TDF_BASE_DLOG(INFO) << "NativeCallbackFunc";
  auto data = info.Data().As<v8::External>();
  if (data.IsEmpty()) {
    TDF_BASE_LOG(ERROR) << "NativeCallbackFunc data is empty";
    info.GetReturnValue().SetUndefined();
    return;
  }

  auto* cb_tuple = reinterpret_cast<CBTuple*>(data->Value());
  CBDataTuple data_tuple(*cb_tuple, info);
  TDF_BASE_DLOG(INFO) << "run native cb begin";
  cb_tuple->fn_(static_cast<void*>(&data_tuple));
  TDF_BASE_DLOG(INFO) << "run native cb end";
}

void GetInternalBinding(const v8::FunctionCallbackInfo<v8::Value>& info) {
  TDF_BASE_DLOG(INFO) << "v8 GetInternalBinding begin";

  auto data = info.Data().As<v8::External>();
  if (data.IsEmpty()) {
    info.GetReturnValue().SetUndefined();
    return;
  }

  size_t count = info.Length();
  if (count <= 0 || !info[0]->IsString()) {
    info.GetReturnValue().SetUndefined();
    return;
  }

  auto* binding_data = reinterpret_cast<BindingData*>(data->Value());
  if (!binding_data) {
    info.GetReturnValue().SetUndefined();
    return;
  }

  std::shared_ptr<Scope> scope = binding_data->scope_.lock();
  if (!scope) {
    TDF_BASE_LOG(ERROR) << "GetInternalBinding scope error";
    info.GetReturnValue().SetUndefined();
    return;
  }

  std::shared_ptr<V8Ctx> v8_ctx =
      std::static_pointer_cast<V8Ctx>(scope->GetContext());

  v8::Isolate* isolate = info.GetIsolate();
  v8::HandleScope handle_scope(isolate);

  v8::Local<v8::Context> context =
      v8_ctx->context_persistent_.Get(v8_ctx->isolate_);
  v8::Context::Scope context_scope(context);

  v8::MaybeLocal<v8::String> maybe_module_name = info[0]->ToString(context);
  if (maybe_module_name.IsEmpty()) {
    info.GetReturnValue().SetUndefined();
    return;
  }
  unicode_string_view module_name =
      v8_ctx->ToStringView(maybe_module_name.ToLocalChecked());
  if (StringViewUtils::IsEmpty(module_name)) {
    info.GetReturnValue().SetUndefined();
    return;
  }

  TDF_BASE_DLOG(INFO) << "module_name = " << module_name;
  std::shared_ptr<V8CtxValue> module_value =
      std::static_pointer_cast<V8CtxValue>(scope->GetModuleValue(module_name));
  if (module_value) {
    TDF_BASE_DLOG(INFO) << "use module cache, module = " << module_name;
    v8::Local<v8::Value> function =
        v8::Local<v8::Value>::New(isolate, module_value->global_value_);
    info.GetReturnValue().Set(function);
    return;
  }

  auto module_class = binding_data->map_.find(module_name);
  if (module_class == binding_data->map_.end()) {
    TDF_BASE_LOG(WARNING) << "can not find module " << module_name;
    info.GetReturnValue().SetUndefined();
    return;
  }

  v8::Local<v8::FunctionTemplate> constructor =
      v8::FunctionTemplate::New(isolate);
  for (const auto& fn : module_class->second) {
    const unicode_string_view& fn_name = fn.first;
    std::unique_ptr<FunctionData> fn_data =
        std::make_unique<FunctionData>(scope, fn.second);
    v8::Local<v8::FunctionTemplate> function_template =
        v8::FunctionTemplate::New(
            isolate, JsCallbackFunc,
            v8::External::New(isolate, static_cast<void*>(fn_data.get())));
    scope->SaveFunctionData(std::move(fn_data));
    TDF_BASE_DLOG(INFO) << "bind fn_name = " << fn_name;
    v8::Local<v8::String> name = v8_ctx->CreateV8String(fn_name);
    constructor->Set(name, function_template, v8::PropertyAttribute::ReadOnly);
  }

  v8::Local<v8::Function> function =
      constructor->GetFunction(context).ToLocalChecked();
  scope->AddModuleValue(module_name,
                        std::make_shared<V8CtxValue>(isolate, function));
  info.GetReturnValue().Set(function);

  TDF_BASE_DLOG(INFO) << "v8 GetInternalBinding end";
}

std::shared_ptr<VM> CreateVM(const std::shared_ptr<VMInitParam>& param) {
  return std::make_shared<V8VM>(std::static_pointer_cast<V8VMInitParam>(param));
}

std::shared_ptr<TryCatch> CreateTryCatchScope(bool enable,
                                              std::shared_ptr<Ctx> ctx) {
  return std::make_shared<V8TryCatch>(enable, ctx);
}

void DetachThread() {
  //JNIEnvironment::GetInstance()->DetachCurrentThread();
}

V8VM::V8VM(const std::shared_ptr<V8VMInitParam>& param): VM(param) {
  TDF_BASE_DLOG(INFO) << "V8VM begin";
  {
    std::lock_guard<std::mutex> lock(mutex_);
    if (platform_ != nullptr) {
#if defined(V8_X5_LITE) && defined(THREAD_LOCAL_PLATFORM)
      TDF_BASE_DLOG(INFO) << "InitializePlatform";
      v8::V8::InitializePlatform(platform_.get());
#endif
    } else {
      TDF_BASE_DLOG(INFO) << "NewDefaultPlatform";
      platform_ = v8::platform::NewDefaultPlatform();

      v8::V8::SetFlagsFromString("--wasm-disable-structured-cloning",
                                 strlen("--wasm-disable-structured-cloning"));
#if defined(V8_X5_LITE)
      v8::V8::InitializePlatform(platform_.get(), true);
#else
      v8::V8::InitializePlatform(platform_.get());
#endif
      TDF_BASE_DLOG(INFO) << "Initialize";
      v8::V8::Initialize();
    }
  }

  create_params_.array_buffer_allocator =
      v8::ArrayBuffer::Allocator::NewDefaultAllocator();
  if (param) {
    create_params_.constraints.ConfigureDefaultsFromHeapSize(param->initial_heap_size_in_bytes,
                                                             param->maximum_heap_size_in_bytes);
  }
  isolate_ = v8::Isolate::New(create_params_);
  isolate_->Enter();
  isolate_->SetCaptureStackTraceForUncaughtExceptions(true);
  TDF_BASE_DLOG(INFO) << "V8VM end";
}

V8VM::~V8VM() {
  isolate_->Exit();
  isolate_->Dispose();

  delete create_params_.array_buffer_allocator;
}

void V8VM::PlatformDestroy() {
  platform_ = nullptr;

  v8::V8::Dispose();
  v8::V8::ShutdownPlatform();
}

std::shared_ptr<Ctx> V8VM::CreateContext() {
  TDF_BASE_DLOG(INFO) << "CreateContext";
  return std::make_shared<V8Ctx>(isolate_);
}

V8TryCatch::V8TryCatch(bool enable, const std::shared_ptr<Ctx>& ctx)
    : TryCatch(enable, ctx), try_catch_(nullptr) {
  if (enable) {
    std::shared_ptr<V8Ctx> v8_ctx = std::static_pointer_cast<V8Ctx>(ctx);
    if (v8_ctx) {
      try_catch_ = std::make_shared<v8::TryCatch>(v8_ctx->isolate_);
    }
  }
}

V8TryCatch::~V8TryCatch() = default;

void V8TryCatch::ReThrow() {
  if (try_catch_) {
    try_catch_->ReThrow();
  }
}

bool V8TryCatch::HasCaught() {
  if (try_catch_) {
    return try_catch_->HasCaught();
  }
  return false;
}

bool V8TryCatch::CanContinue() {
  if (try_catch_) {
    return try_catch_->CanContinue();
  }
  return true;
}

bool V8TryCatch::HasTerminated() {
  if (try_catch_) {
    return try_catch_->HasTerminated();
  }
  return false;
}

bool V8TryCatch::IsVerbose() {
  if (try_catch_) {
    return try_catch_->IsVerbose();
  }
  return false;
}

void V8TryCatch::SetVerbose(bool verbose) {
  if (try_catch_) {
    try_catch_->SetVerbose(verbose);
  }
}

std::shared_ptr<CtxValue> V8TryCatch::Exception() {
  if (try_catch_) {
    v8::Local<v8::Value> exception = try_catch_->Exception();
    std::shared_ptr<V8Ctx> v8_ctx = std::static_pointer_cast<V8Ctx>(ctx_);
    return std::make_shared<V8CtxValue>(v8_ctx->isolate_, exception);
  }
  return nullptr;
}

unicode_string_view V8TryCatch::GetExceptionMsg() {
  if (!try_catch_) {
    return unicode_string_view();
  }

  std::shared_ptr<V8Ctx> v8_ctx = std::static_pointer_cast<V8Ctx>(ctx_);
  v8::HandleScope handle_scope(v8_ctx->isolate_);
  v8::Local<v8::Context> context =
      v8_ctx->context_persistent_.Get(v8_ctx->isolate_);
  v8::Context::Scope context_scope(context);

  v8::Local<v8::Message> message = try_catch_->Message();
  unicode_string_view desc = v8_ctx->GetMsgDesc(message);
  unicode_string_view stack = v8_ctx->GetStackInfo(message);

  unicode_string_view ret = unicode_string_view("message: ") + desc +
                            unicode_string_view(", stack: ") + stack;
  return ret;
}

std::shared_ptr<CtxValue> GetInternalBindingFn(const std::shared_ptr<Scope>& scope) {
  TDF_BASE_DLOG(INFO) << "GetInternalBindingFn";

  std::shared_ptr<V8Ctx> ctx =
      std::static_pointer_cast<V8Ctx>(scope->GetContext());
  v8::Isolate* isolate = ctx->isolate_;
  v8::HandleScope handle_scope(isolate);
  v8::Local<v8::Context> v8_context = ctx->context_persistent_.Get(isolate);
  v8::Context::Scope context_scope(v8_context);

  v8::Local<v8::Function> v8_function =
      v8::Function::New(
          v8_context, GetInternalBinding,
          v8::External::New(isolate,
                            static_cast<void*>(scope->GetBindingData().get())))
          .ToLocalChecked();

  return std::make_shared<V8CtxValue>(isolate, v8_function);
}

class ExternalOneByteStringResourceImpl
    : public v8::String::ExternalOneByteStringResource {
 public:
  ExternalOneByteStringResourceImpl(const uint8_t* data, size_t length)
      : data_(data), length_(length) {}

  explicit ExternalOneByteStringResourceImpl(const std::string&& data)
      : data_(nullptr), str_data_(data) {
    length_ = str_data_.length();
  }

  ~ExternalOneByteStringResourceImpl() override = default;

  const char* data() const override {
    if (data_) {
      return reinterpret_cast<const char*>(data_);
    } else {
      return str_data_.c_str();
    }
  }
  size_t length() const override { return length_; }

 private:
  const uint8_t* data_;
  std::string str_data_;
  size_t length_;

  DISALLOW_COPY_AND_ASSIGN(ExternalOneByteStringResourceImpl);
};

class ExternalStringResourceImpl : public v8::String::ExternalStringResource {
 public:
  ExternalStringResourceImpl(const uint16_t* data, size_t length)
      : data_(data), length_(length) {}

  explicit ExternalStringResourceImpl(const std::string&& data)
      : data_(nullptr), str_data_(data) {
    length_ = str_data_.length();
  }

  ~ExternalStringResourceImpl() override = default;
  const uint16_t* data() const override {
    if (data_) {
      return data_;
    } else {
      return reinterpret_cast<const uint16_t*>(str_data_.c_str());
    }
  }

  size_t length() const override { return length_ / 2; }

 private:
  const uint16_t* data_;
  const std::string str_data_;
  size_t length_;

  DISALLOW_COPY_AND_ASSIGN(ExternalStringResourceImpl);
};

// to do

unicode_string_view V8Ctx::GetMsgDesc(v8::Local<v8::Message> message) {
  if (message.IsEmpty()) {
    return "";
  }

  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  unicode_string_view msg = ToStringView(message->Get());
  v8::MaybeLocal<v8::String> maybe_file_name =
      message->GetScriptOrigin().ResourceName()->ToString(context);
  unicode_string_view file_name;
  if (!maybe_file_name.IsEmpty()) {
    file_name = ToStringView(maybe_file_name.ToLocalChecked());
  } else {
    file_name = unicode_string_view("");
  }
  int line = message->GetLineNumber(context).FromMaybe(-1);
  int start = message->GetStartColumn(context).FromMaybe(-1);
  int end = message->GetEndColumn(context).FromMaybe(-1);

  std::basic_stringstream<char> description;
  description << file_name << ": " << line << ": " << start << "-" << end
              << ": " << msg;
  std::string u8_str = description.str();
  unicode_string_view desc(reinterpret_cast<const uint8_t*>(u8_str.c_str()));
  TDF_BASE_DLOG(INFO) << "description = " << desc;
  return desc;
}

unicode_string_view V8Ctx::GetStackInfo(v8::Local<v8::Message> message) {
  if (message.IsEmpty()) {
    return "";
  }

  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  v8::Local<v8::StackTrace> trace = message->GetStackTrace();
  if (trace.IsEmpty()) {
    return "";
  }

  std::basic_stringstream<char> stack_stream;
  int len = trace->GetFrameCount();
  for (int i = 0; i < len; ++i) {
    v8::Local<v8::StackFrame> frame = trace->GetFrame(isolate_, i);
    if (frame.IsEmpty()) {
      continue;
    }

    v8::Local<v8::String> v8_script_name = frame->GetScriptName();
    unicode_string_view script_name("");
    if (!v8_script_name.IsEmpty()) {
      script_name = ToStringView(v8_script_name);
    }

    unicode_string_view function_name("");
    v8::Local<v8::String> v8_function_name = frame->GetFunctionName();
    if (!v8_function_name.IsEmpty()) {
      function_name = ToStringView(v8_function_name);
    }

    stack_stream << std::endl
                 << script_name << ":" << frame->GetLineNumber() << ":"
                 << frame->GetColumn() << ":" << function_name;
  }
  std::string u8_str = stack_stream.str();
  unicode_string_view stack_str(
      reinterpret_cast<const uint8_t*>(u8_str.c_str()));
  TDF_BASE_DLOG(INFO) << "stack = " << stack_str;
  return stack_str;
}

bool V8Ctx::RegisterGlobalInJs() {
  TDF_BASE_DLOG(INFO) << "RegisterGlobalInJs";
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  v8::Local<v8::Object> global = context->Global();

  return global
      ->Set(context,
            v8::String::NewFromOneByte(
                isolate_, reinterpret_cast<const uint8_t*>("global"),
                v8::NewStringType::kNormal)
                .ToLocalChecked(),
            global)
      .FromMaybe(false);
}

bool V8Ctx::SetGlobalJsonVar(const unicode_string_view& name,
                             const unicode_string_view& json) {
  TDF_BASE_DLOG(INFO) << "SetGlobalJsonVar name = " << name
                      << ", json = " << json;

  if (StringViewUtils::IsEmpty(name) || StringViewUtils::IsEmpty(json)) {
    return false;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  v8::Local<v8::Object> global = context->Global();

  v8::Local<v8::String> v8_str = CreateV8String(json);
  v8::Local<v8::String> v8_name = CreateV8String(name);
  v8::MaybeLocal<v8::Value> json_obj = v8::JSON::Parse(context, v8_str);
  if (!json_obj.IsEmpty()) {
    return global->Set(context, v8_name, json_obj.ToLocalChecked())
        .FromMaybe(false);
  }
  return false;
}

bool V8Ctx::SetGlobalStrVar(const unicode_string_view& name,
                            const unicode_string_view& str) {
  TDF_BASE_DLOG(INFO) << "SetGlobalStrVar name = " << name << ", str = " << str;
  if (StringViewUtils::IsEmpty(name)) {
    return false;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  v8::Local<v8::Object> global = context->Global();
  v8::Local<v8::String> v8_str = CreateV8String(str);
  v8::Local<v8::String> v8_name = CreateV8String(name);
  return global->Set(context, v8_name, v8_str).FromMaybe(false);
}

bool V8Ctx::SetGlobalObjVar(const unicode_string_view& name,
                            const std::shared_ptr<CtxValue>& obj,
                            const PropertyAttribute& attr) {
  TDF_BASE_DLOG(INFO) << "SetGlobalStrVar name = " << name
                      << ", attr = " << attr;
  if (StringViewUtils::IsEmpty(name)) {
    return false;
  }
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(obj);

  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  v8::Local<v8::Object> global = context->Global();
  v8::Local<v8::Value> handle_value;
  if (ctx_value) {
    const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
    handle_value = v8::Local<v8::Value>::New(isolate_, global_value);
  } else {
    handle_value = v8::Null(isolate_);
  }
  auto v8_attr = v8::PropertyAttribute(attr);
  v8::Local<v8::String> v8_name = CreateV8String(name);
  return global->DefineOwnProperty(context, v8_name, handle_value, v8_attr)
      .FromMaybe(false);
}

std::shared_ptr<CtxValue> V8Ctx::GetGlobalStrVar(
    const unicode_string_view& name) {
  TDF_BASE_DLOG(INFO) << "GetGlobalStrVar name = " << name;
  if (StringViewUtils::IsEmpty(name)) {
    return nullptr;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  v8::Local<v8::Object> global = context->Global();
  v8::Local<v8::String> v8_name = CreateV8String(name);
  v8::MaybeLocal<v8::Value> maybe_value = global->Get(context, v8_name);
  if (maybe_value.IsEmpty()) {
    return CreateUndefined();
  }
  return std::make_shared<V8CtxValue>(isolate_, maybe_value.ToLocalChecked());
}

std::shared_ptr<CtxValue> V8Ctx::GetGlobalObjVar(
    const unicode_string_view& name) {
  TDF_BASE_DLOG(INFO) << "GetGlobalObjVar name = " << name;
  return GetGlobalStrVar(name);
}

std::shared_ptr<CtxValue> V8Ctx::GetProperty(
    const std::shared_ptr<CtxValue>& object,
    const unicode_string_view& name) {
  TDF_BASE_DLOG(INFO) << "GetGlobalStrVar name =" << name;
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(object);
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  const v8::Global<v8::Value>& persistent_value = ctx_value->global_value_;
  v8::Local<v8::Value> str = CreateV8String(name);
  v8::Local<v8::Value> handle_value =
      v8::Local<v8::Value>::New(isolate_, persistent_value);
  v8::Local<v8::Value> value = v8::Local<v8::Object>::Cast(handle_value)
                                   ->Get(context, str)
                                   .ToLocalChecked();
  return std::make_shared<V8CtxValue>(isolate_, value);
}

void V8Ctx::RegisterGlobalModule(const std::shared_ptr<Scope>& scope,
                                 const ModuleClassMap& modules) {
  TDF_BASE_DLOG(INFO) << "RegisterGlobalModule";
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  for (const auto& cls : modules) {
    v8::Local<v8::FunctionTemplate> module_object =
        v8::FunctionTemplate::New(isolate_);

    for (const auto& fn : cls.second) {
      std::unique_ptr<FunctionData> data =
          std::make_unique<FunctionData>(scope, fn.second);
      module_object->Set(
          CreateV8String(fn.first),
          v8::FunctionTemplate::New(
              isolate_, JsCallbackFunc,
              v8::External::New(isolate_, static_cast<void*>(data.get()))));
      scope->SaveFunctionData(std::move(data));
    }

    v8::Local<v8::Function> function =
        module_object->GetFunction(context).ToLocalChecked();

    v8::Local<v8::String> classNameKey = CreateV8String(cls.first);
    v8::Maybe<bool> ret =
        context->Global()->Set(context, classNameKey, function);
    ret.ToChecked();
  }
}

void V8Ctx::RegisterNativeBinding(const unicode_string_view& name,
                                  hippy::base::RegisterFunction fn,
                                  void* data) {
  TDF_BASE_DLOG(INFO) << "RegisterNativeBinding name = " << name;

  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  data_tuple_ = std::make_unique<CBTuple>(fn, data);
  v8::Local<v8::FunctionTemplate> fn_template = v8::FunctionTemplate::New(
      isolate_, NativeCallbackFunc,
      v8::External::New(isolate_, static_cast<void*>(data_tuple_.get())));
  fn_template->RemovePrototype();
  v8::Local<v8::String> v8_name = CreateV8String(name);
  context->Global()
      ->Set(context, v8_name,
            fn_template->GetFunction(context).ToLocalChecked())
      .ToChecked();
}

std::shared_ptr<CtxValue> V8Ctx::RunScript(const unicode_string_view& str_view,
                                           const unicode_string_view& file_name,
                                           bool is_use_code_cache,
                                           unicode_string_view* cache,
                                           bool is_copy) {
  TDF_BASE_LOG(INFO) << "V8Ctx::RunScript file_name = " << file_name
                     << ", is_use_code_cache = " << is_use_code_cache
                     << ", cache = " << cache << ", is_copy = " << is_copy;
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  v8::MaybeLocal<v8::String> source;

  unicode_string_view::Encoding encoding = str_view.encoding();
  switch (encoding) {
    case unicode_string_view::Encoding::Latin1: {
      const std::string& str = str_view.latin1_value();
      if (is_copy) {
        source = v8::String::NewFromOneByte(
            isolate_, reinterpret_cast<const uint8_t*>(str.c_str()),
            v8::NewStringType::kInternalized, str.length());
      } else {
        auto* one_byte =
            new ExternalOneByteStringResourceImpl(
                reinterpret_cast<const uint8_t*>(str.c_str()), str.length());
        source = v8::String::NewExternalOneByte(isolate_, one_byte);
      }
      break;
    }
    case unicode_string_view::Encoding::Utf16: {
      const std::u16string& str = str_view.utf16_value();
      if (is_copy) {
        source = v8::String::NewFromTwoByte(
            isolate_, reinterpret_cast<const uint16_t*>(str.c_str()),
            v8::NewStringType::kNormal, str.length());
      } else {
        auto* two_byte = new ExternalStringResourceImpl(
            reinterpret_cast<const uint16_t*>(str.c_str()), str.length());
        source = v8::String::NewExternalTwoByte(isolate_, two_byte);
      }
      break;
    }
    case unicode_string_view::Encoding::Utf32: {
      const std::u32string& str = str_view.utf32_value();
      std::wstring_convert<std::codecvt_utf8<char32_t>, char32_t> convert;
      std::string bytes = convert.to_bytes(str);
      std::u16string two_byte(reinterpret_cast<const char16_t*>(bytes.c_str()),
                              bytes.length() / sizeof(char16_t));
      source = v8::String::NewFromTwoByte(
          isolate_, reinterpret_cast<const uint16_t*>(str.c_str()),
          v8::NewStringType::kNormal, str.length());
      break;
    }
    case unicode_string_view::Encoding::Utf8: {
      const unicode_string_view::u8string& str = str_view.utf8_value();
      source = v8::String::NewFromUtf8(
          isolate_, reinterpret_cast<const char*>(str.c_str()),
          v8::NewStringType::kNormal);
      break;
    }
    default: {
      TDF_BASE_NOTREACHED();
      break;
    }
  }

  if (source.IsEmpty()) {
    TDF_BASE_DLOG(WARNING) << "v8_source empty, file_name = " << file_name;
    return nullptr;
  }

  return InternalRunScript(context, source.ToLocalChecked(), file_name,
                           is_use_code_cache, cache);
}

std::shared_ptr<CtxValue> V8Ctx::InternalRunScript(
    v8::Local<v8::Context> context,
    v8::Local<v8::String> source,
    const unicode_string_view& file_name,
    bool is_use_code_cache,
    unicode_string_view* cache) {
  v8::Local<v8::String> v8_file_name = CreateV8String(file_name);
#if (V8_MAJOR_VERSION == 8 && V8_MINOR_VERSION == 9 && \
     V8_BUILD_NUMBER >= 45) ||                         \
    (V8_MAJOR_VERSION == 8 && V8_MINOR_VERSION > 9) || (V8_MAJOR_VERSION > 8)
  v8::ScriptOrigin origin(isolate_, v8_file_name);
#else
  v8::ScriptOrigin origin(v8_file_name);
#endif
  v8::MaybeLocal<v8::Script> script;
  if (is_use_code_cache && cache && !StringViewUtils::IsEmpty(*cache)) {
    unicode_string_view::Encoding encoding = cache->encoding();
    if (encoding == unicode_string_view::Encoding::Utf8) {
        const unicode_string_view::u8string& str = cache->utf8_value();
        auto* cached_data =
                new v8::ScriptCompiler::CachedData(
                        str.c_str(), str.length(),
                        v8::ScriptCompiler::CachedData::BufferNotOwned);
        v8::ScriptCompiler::Source script_source(source, origin, cached_data);
        script = v8::ScriptCompiler::Compile(
                context, &script_source, v8::ScriptCompiler::kConsumeCodeCache);
    } else {
        TDF_BASE_NOTREACHED();
    }
  } else {
    if (is_use_code_cache && cache) {
      v8::ScriptCompiler::Source script_source(source, origin);
      script = v8::ScriptCompiler::Compile(context, &script_source);
      if (script.IsEmpty()) {
        return nullptr;
      }
      const v8::ScriptCompiler::CachedData* cached_data =
          v8::ScriptCompiler::CreateCodeCache(
              script.ToLocalChecked()->GetUnboundScript());
      *cache = unicode_string_view(cached_data->data, cached_data->length);
    } else {
      script = v8::Script::Compile(context, source, &origin);
    }
  }

  if (script.IsEmpty()) {
    return nullptr;
  }

  v8::MaybeLocal<v8::Value> v8_maybe_value =
      script.ToLocalChecked()->Run(context);
  if (v8_maybe_value.IsEmpty()) {
    return nullptr;
  }
  v8::Local<v8::Value> v8_value = v8_maybe_value.ToLocalChecked();
  return std::make_shared<V8CtxValue>(isolate_, v8_value);
}

std::shared_ptr<CtxValue> V8Ctx::GetJsFn(const unicode_string_view& name) {
  TDF_BASE_DLOG(INFO) << "GetJsFn name = " << name;
  if (StringViewUtils::IsEmpty(name)) {
    return nullptr;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  v8::Local<v8::String> js_name = CreateV8String(name);
  v8::MaybeLocal<v8::Value> maybe_func =
      context_persistent_.Get(isolate_)->Global()->Get(context, js_name);
  if (maybe_func.IsEmpty()) {
    return CreateUndefined();
  }
  return std::make_shared<V8CtxValue>(isolate_, maybe_func.ToLocalChecked());
}

bool V8Ctx::ThrowExceptionToJS(const std::shared_ptr<CtxValue>& exception) {
  unicode_string_view error_handle_name(kHippyErrorHandlerName);
  std::shared_ptr<CtxValue> exception_handler =
      GetGlobalObjVar(error_handle_name);

  if (!IsFunction(exception_handler)) {
    const auto& source_code = hippy::GetNativeSourceCode(kErrorHandlerJSName);
    TDF_BASE_DCHECK(source_code.data_ && source_code.length_);
    unicode_string_view str_view(source_code.data_, source_code.length_);
    exception_handler =
        RunScript(str_view, error_handle_name, false, nullptr, false);
    SetGlobalObjVar(error_handle_name, exception_handler,
                    PropertyAttribute::ReadOnly);
  }

  std::shared_ptr<CtxValue> args[2];
  args[0] = CreateString("uncaughtException");
  args[1] = exception;

  v8::TryCatch try_catch(isolate_);
  std::shared_ptr<CtxValue> ret_value =
      CallFunction(exception_handler, 2, args);
  if (try_catch.HasCaught()) {
    auto message = try_catch.Message();
    TDF_BASE_LOG(WARNING) << "HippyExceptionHandler error, desc = "
                          << GetMsgDesc(message)
                          << ", stack = " << GetStackInfo(message);
  }
  return true;
}

std::shared_ptr<CtxValue> V8Ctx::CallFunction(
    const std::shared_ptr<CtxValue>& function,
    size_t argument_count,
    const std::shared_ptr<CtxValue> arguments[]) {
  TDF_BASE_DLOG(INFO) << "V8Ctx CallFunction begin";

  if (!function) {
    TDF_BASE_LOG(ERROR) << "function is nullptr";
    return nullptr;
  }

  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope contextScope(context);
  if (context.IsEmpty() || context->Global().IsEmpty()) {
    TDF_BASE_LOG(ERROR) << "CallFunction context error";
    return nullptr;
  }

  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(function);
  v8::Local<v8::Value> handle_value =
      v8::Local<v8::Value>::New(isolate_, ctx_value->global_value_);
  if (!handle_value->IsFunction()) {
    TDF_BASE_LOG(WARNING) << "CallFunction handle_value is not a function";
    return nullptr;
  }

  v8::Function* v8_fn = v8::Function::Cast(*handle_value);
  v8::Local<v8::Value> args[argument_count];
  for (size_t i = 0; i < argument_count; i++) {
    std::shared_ptr<V8CtxValue> argument =
        std::static_pointer_cast<V8CtxValue>(arguments[i]);
    if (argument) {
      args[i] = v8::Local<v8::Value>::New(isolate_, argument->global_value_);
    } else {
      TDF_BASE_LOG(WARNING) << "CallFunction argument error, i = " << i;
      return nullptr;
    }
  }

  TDF_BASE_DLOG(INFO) << "v8 CallFunction call begin";
  v8::MaybeLocal<v8::Value> maybe_result = v8_fn->Call(
      context, context->Global(), static_cast<int>(argument_count), args);
  TDF_BASE_DLOG(INFO) << "v8 CallFunction call end";

  if (maybe_result.IsEmpty()) {
    TDF_BASE_DLOG(INFO) << "maybe_result is empty";
    return nullptr;
  }
  return std::make_shared<V8CtxValue>(isolate_, maybe_result.ToLocalChecked());
}

std::shared_ptr<CtxValue> V8Ctx::CreateNumber(double number) {
  v8::HandleScope isolate_scope(isolate_);

  v8::Local<v8::Value> v8_number = v8::Number::New(isolate_, number);
  if (v8_number.IsEmpty()) {
    return nullptr;
  }
  return std::make_shared<V8CtxValue>(isolate_, v8_number);
}

std::shared_ptr<CtxValue> V8Ctx::CreateBoolean(bool b) {
  v8::HandleScope isolate_scope(isolate_);

  v8::Local<v8::Boolean> v8_boolean = v8::Boolean::New(isolate_, b);
  if (v8_boolean.IsEmpty()) {
    return nullptr;
  }
  return std::make_shared<V8CtxValue>(isolate_, v8_boolean);
}

std::shared_ptr<CtxValue> V8Ctx::CreateString(
    const unicode_string_view& str_view) {
  if (str_view.encoding() == unicode_string_view::Encoding::Unkown) {
    return nullptr;
  }
  v8::HandleScope isolate_scope(isolate_);

  v8::Local<v8::String> v8_string = CreateV8String(str_view);
  return std::make_shared<V8CtxValue>(isolate_, v8_string);
}

std::shared_ptr<CtxValue> V8Ctx::CreateUndefined() {
  v8::HandleScope isolate_scope(isolate_);

  v8::Local<v8::Value> undefined = v8::Undefined(isolate_);
  if (undefined.IsEmpty()) {
    return nullptr;
  }
  return std::make_shared<V8CtxValue>(isolate_, undefined);
}

std::shared_ptr<CtxValue> V8Ctx::CreateNull() {
  v8::HandleScope isolate_scope(isolate_);

  v8::Local<v8::Value> v8_null = v8::Null(isolate_);
  if (v8_null.IsEmpty()) {
    return nullptr;
  }
  return std::make_shared<V8CtxValue>(isolate_, v8_null);
}

v8::Local<v8::String> V8Ctx::CreateV8String(
    const unicode_string_view& str_view) const {
  unicode_string_view::Encoding encoding = str_view.encoding();
  switch (encoding) {
    case unicode_string_view::Encoding::Latin1: {
      const std::string& one_byte_str = str_view.latin1_value();
      return v8::String::NewFromOneByte(
                 isolate_,
                 reinterpret_cast<const uint8_t*>(one_byte_str.c_str()),
                 v8::NewStringType::kNormal)
          .ToLocalChecked();
      break;
    }
    case unicode_string_view::Encoding::Utf8: {
      const unicode_string_view::u8string& utf8_str = str_view.utf8_value();
      return v8::String::NewFromUtf8(
                 isolate_, reinterpret_cast<const char*>(utf8_str.c_str()),
                 v8::NewStringType::kNormal)
          .ToLocalChecked();
      break;
    }
    case unicode_string_view::Encoding::Utf16: {
      const std::u16string& two_byte_str = str_view.utf16_value();
      return v8::String::NewFromTwoByte(
                 isolate_,
                 reinterpret_cast<const uint16_t*>(two_byte_str.c_str()),
                 v8::NewStringType::kNormal)
          .ToLocalChecked();
      break;
    }
    default:
      break;
  }
  TDF_BASE_NOTREACHED();
  return {};
}

std::shared_ptr<JSValueWrapper> V8Ctx::ToJsValueWrapper(
    const std::shared_ptr<CtxValue>& value) {
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value =
      v8::Local<v8::Value>::New(isolate_, global_value);
  if (handle_value->IsUndefined()) {
    return std::make_shared<JSValueWrapper>(JSValueWrapper::Undefined());
  } else if (handle_value->IsNull()) {
    return std::make_shared<JSValueWrapper>(JSValueWrapper::Null());
  } else if (handle_value->IsBoolean()) {
    bool v8_value = handle_value->ToBoolean(isolate_)->Value();
    return std::make_shared<JSValueWrapper>(v8_value);
  } else if (handle_value->IsString()) {
    return std::make_shared<JSValueWrapper>(
        *v8::String::Utf8Value(isolate_, handle_value));
  } else if (handle_value->IsNumber()) {
    double v8_value = handle_value->ToNumber(context).ToLocalChecked()->Value();
    return std::make_shared<JSValueWrapper>(v8_value);
  } else if (handle_value->IsArray()) {
    v8::Local<v8::Object> v8_value =
        handle_value->ToObject(context).ToLocalChecked();
    // v8::NewStringType::kInternalized
    v8::Local<v8::Array>::Cast(handle_value);
    v8::Local<v8::String> len_str =
        v8::String::NewFromOneByte(isolate_,
                                   reinterpret_cast<const uint8_t*>("length"),
                                   v8::NewStringType::kInternalized)
            .ToLocalChecked();
    uint32_t len = v8_value->Get(context, len_str)
                       .ToLocalChecked()
                       ->Uint32Value(context)
                       .FromMaybe(0);
    JSValueWrapper::JSArrayType ret;
    for (uint32_t i = 0; i < len; i++) {
      v8::Local<v8::Value> element = v8_value->Get(context, i).ToLocalChecked();
      std::shared_ptr<JSValueWrapper> value_obj =
          ToJsValueWrapper(std::make_shared<V8CtxValue>(isolate_, element));
      ret.push_back(*value_obj);
    }
    return std::make_shared<JSValueWrapper>(std::move(ret));
  } else if (handle_value->IsObject()) {
    v8::Local<v8::Object> v8_value =
        handle_value->ToObject(context).ToLocalChecked();
    JSValueWrapper::JSObjectType ret;
    v8::MaybeLocal<v8::Array> maybe_props =
        v8_value->GetOwnPropertyNames(context);
    if (!maybe_props.IsEmpty()) {
      v8::Local<v8::Array> props = maybe_props.ToLocalChecked();
      for (uint32_t i = 0; i < props->Length(); i++) {
        v8::Local<v8::Value> props_key =
            props->Get(context, i).ToLocalChecked();
        v8::Local<v8::Value> props_value =
            v8_value->Get(context, props_key).ToLocalChecked();

        std::string key_obj;
        if (props_key->IsString()) {
          key_obj = *v8::String::Utf8Value(isolate_, props_key);
        } else {
          TDF_BASE_LOG(ERROR)
              << "ToJsValueWrapper parse v8::Object err, props_key illegal";
          return nullptr;
        }

        std::shared_ptr<JSValueWrapper> value_obj = ToJsValueWrapper(
            std::make_shared<V8CtxValue>(isolate_, props_value));
        ret[key_obj] = *value_obj;
      }
    }
    return std::make_shared<JSValueWrapper>(std::move(ret));
  }

  // TDF_BASE_UNIMPLEMENTED();
  return nullptr;
}

std::shared_ptr<DomValue> V8Ctx::ToDomValue(
    const std::shared_ptr<CtxValue>& value) {
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value =
      v8::Local<v8::Value>::New(isolate_, global_value);
  if (handle_value->IsUndefined()) {
    return std::make_shared<DomValue>(DomValue::Undefined());
  } else if (handle_value->IsNull()) {
    return std::make_shared<DomValue>(DomValue::Null());
  } else if (handle_value->IsBoolean()) {
    bool v8_value = handle_value->ToBoolean(isolate_)->Value();
    return std::make_shared<DomValue>(v8_value);
  } else if (handle_value->IsString()) {
    return std::make_shared<DomValue>(
        *v8::String::Utf8Value(isolate_, handle_value));
  } else if (handle_value->IsNumber()) {
    double v8_value = handle_value->ToNumber(context).ToLocalChecked()->Value();
    return std::make_shared<DomValue>(v8_value);
  } else if (handle_value->IsArray()) {
    v8::Local<v8::Object> v8_value =
        handle_value->ToObject(context).ToLocalChecked();
    // v8::NewStringType::kInternaliz
    v8::Local<v8::Array>::Cast(handle_value);
    v8::Local<v8::String> len_str =
        v8::String::NewFromOneByte(isolate_,
                                   reinterpret_cast<const uint8_t*>("length"),
                                   v8::NewStringType::kInternalized)
            .ToLocalChecked();
    uint32_t len = v8_value->Get(context, len_str)
        .ToLocalChecked()
        ->Uint32Value(context)
        .FromMaybe(0);
    DomValue::DomValueArrayType ret;
    for (uint32_t i = 0; i < len; i++) {
      v8::Local<v8::Value> element = v8_value->Get(context, i).ToLocalChecked();
      std::shared_ptr<DomValue> value_obj =
          ToDomValue(std::make_shared<V8CtxValue>(isolate_, element));
      ret.push_back(*value_obj);
    }
    return std::make_shared<DomValue>(std::move(ret));
  } else if (handle_value->IsObject()) {
    v8::Local<v8::Object> v8_value =
        handle_value->ToObject(context).ToLocalChecked();
    DomValue::DomValueObjectType ret;
    v8::MaybeLocal<v8::Array> maybe_props =
        v8_value->GetOwnPropertyNames(context);
    if (!maybe_props.IsEmpty()) {
      v8::Local<v8::Array> props = maybe_props.ToLocalChecked();
      for (uint32_t i = 0; i < props->Length(); i++) {
        v8::Local<v8::Value> props_key =
            props->Get(context, i).ToLocalChecked();
        v8::Local<v8::Value> props_value =
            v8_value->Get(context, props_key).ToLocalChecked();

        std::string key_obj;
        if (props_key->IsString()) {
          key_obj = *v8::String::Utf8Value(isolate_, props_key);
        } else {
          TDF_BASE_LOG(ERROR)
          << "ToJsValueWrapper parse v8::Object err, props_key illegal";
          return nullptr;
        }

        std::shared_ptr<DomValue> value_obj = ToDomValue(
            std::make_shared<V8CtxValue>(isolate_, props_value));
        ret[key_obj] = *value_obj;
      }
    }
    return std::make_shared<DomValue>(std::move(ret));
  }

  // TDF_BASE_NOTIMPLEMENTED();
  return nullptr;
}

std::shared_ptr<CtxValue> V8Ctx::CreateCtxValue(
    const std::shared_ptr<JSValueWrapper>& wrapper) {
  TDF_BASE_DCHECK(wrapper);
  if (wrapper->IsUndefined()) {
    return CreateUndefined();
  } else if (wrapper->IsNull()) {
    return CreateNull();
  } else if (wrapper->IsString()) {
    std::string str = wrapper->StringValue();
    unicode_string_view str_view(StringViewUtils::ToU8Pointer(str.c_str()),
                                 str.length());
    return CreateString(str_view);
  } else if (wrapper->IsInt32()) {
    return CreateNumber(wrapper->Int32Value());
  } else if (wrapper->IsDouble()) {
    return CreateNumber(wrapper->DoubleValue());
  } else if (wrapper->IsBoolean()) {
    return CreateBoolean(wrapper->BooleanValue());
  } else if (wrapper->IsArray()) {
    auto arr = wrapper->ArrayValue();
    std::shared_ptr<CtxValue> args[arr.size()];
    for (auto i = 0; i < arr.size(); ++i) {
      args[i] = CreateCtxValue(std::make_shared<JSValueWrapper>(arr[i]));
    }
    return CreateArray(arr.size(), args);
  } else if (wrapper->IsObject()) {
    auto obj = wrapper->ObjectValue();

    v8::HandleScope handle_scope(isolate_);
    v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
    v8::Context::Scope context_scope(context);

    v8::Local<v8::Object> v8_obj = v8::Object::New(isolate_);
    for (const auto& p : obj) {
      auto obj_key = p.first;
      auto obj_value = p.second;
      unicode_string_view obj_key_view(
          StringViewUtils::ToU8Pointer(obj_key.c_str()), obj_key.length());
      v8::Local<v8::String> key = CreateV8String(obj_key_view);
      std::shared_ptr<V8CtxValue> ctx_value =
          std::static_pointer_cast<V8CtxValue>(
              CreateCtxValue(std::make_shared<JSValueWrapper>(obj_value)));
      const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
      TDF_BASE_DCHECK(!global_value.IsEmpty());
      v8::Local<v8::Value> handle_value =
          v8::Local<v8::Value>::New(isolate_, global_value);
      v8_obj->Set(context, key, handle_value).ToChecked();
    }
    return std::make_shared<V8CtxValue>(isolate_, v8_obj);
  }

  TDF_BASE_NOTIMPLEMENTED();
  return nullptr;
}

std::shared_ptr<CtxValue> V8Ctx::CreateCtxValue(
    const std::shared_ptr<DomValue>& value) {
  TDF_BASE_DCHECK(value);
  if (value->IsUndefined()) {
    return CreateUndefined();
  } else if (value->IsNull()) {
    return CreateNull();
  } else if (value->IsString()) {
    std::string str = value->ToString();
    unicode_string_view str_view(StringViewUtils::ToU8Pointer(str.c_str()),
                                 str.length());
    return CreateString(str_view);
  } else if (value->IsNumber()) {
    return CreateNumber(value->ToDouble());
  } else if (value->IsBoolean()) {
    return CreateBoolean(value->ToBoolean());
  } else if (value->IsArray()) {
    auto arr = value->ToArray();
    std::shared_ptr<CtxValue> args[arr.size()];
    for (auto i = 0; i < arr.size(); ++i) {
      args[i] = CreateCtxValue(std::make_shared<DomValue>(arr[i]));
    }
    return CreateArray(arr.size(), args);
  } else if (value->IsObject()) {
    auto obj = value->ToObject();

    v8::HandleScope handle_scope(isolate_);
    v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
    v8::Context::Scope context_scope(context);

    v8::Local<v8::Object> v8_obj = v8::Object::New(isolate_);
    for (const auto& p : obj) {
      auto obj_key = p.first;
      auto obj_value = p.second;
      unicode_string_view obj_key_view(
          StringViewUtils::ToU8Pointer(obj_key.c_str()), obj_key.length());
      v8::Local<v8::String> key = CreateV8String(obj_key_view);
      std::shared_ptr<V8CtxValue> ctx_value =
          std::static_pointer_cast<V8CtxValue>(
              CreateCtxValue(std::make_shared<DomValue>(obj_value)));
      const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
      TDF_BASE_DCHECK(!global_value.IsEmpty());
      v8::Local<v8::Value> handle_value =
          v8::Local<v8::Value>::New(isolate_, global_value);
      v8_obj->Set(context, key, handle_value).ToChecked();
    }
    return std::make_shared<V8CtxValue>(isolate_, v8_obj);
  }

  // TDF_BASE_NOTIMPLEMENTED();
  return nullptr;
}

unicode_string_view V8Ctx::ToStringView(v8::Local<v8::String> str) const {
  TDF_BASE_DCHECK(!str.IsEmpty());
  v8::String* v8_string = v8::String::Cast(*str);
  int32_t len = v8_string->Length();
  if (v8_string->IsOneByte()) {
    std::string one_byte_string;
    one_byte_string.resize(len);
    v8_string->WriteOneByte(isolate_,
                            reinterpret_cast<uint8_t*>(&one_byte_string[0]));
    return unicode_string_view(one_byte_string);
  }
  std::u16string two_byte_string;
  two_byte_string.resize(len);
  v8_string->Write(isolate_, reinterpret_cast<uint16_t*>(&two_byte_string[0]));
  return unicode_string_view(two_byte_string);
}

std::shared_ptr<CtxValue> V8Ctx::CreateObject(const unicode_string_view& json) {
  if (StringViewUtils::IsEmpty(json)) {
    return nullptr;
  }

  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  v8::Local<v8::String> v8_string = CreateV8String(json);
  v8::MaybeLocal<v8::Value> maybe_obj = v8::JSON::Parse(context, v8_string);
  if (maybe_obj.IsEmpty()) {
    return nullptr;
  }
  return std::make_shared<V8CtxValue>(isolate_, maybe_obj.ToLocalChecked());
}

std::shared_ptr<CtxValue> V8Ctx::CreateArray(
    size_t count,
    std::shared_ptr<CtxValue> value[]) {
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Array> array = v8::Array::New(isolate_, count);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  for (size_t i = 0; i < count; i++) {
    v8::Local<v8::Value> handle_value;
    std::shared_ptr<V8CtxValue> ctx_value =
        std::static_pointer_cast<V8CtxValue>(value[i]);
    if (ctx_value) {
      const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
      handle_value = v8::Local<v8::Value>::New(isolate_, global_value);
    } else {
      TDF_BASE_LOG(ERROR) << "array item error";
      return nullptr;
    }
    if (!array->Set(context, i, handle_value).FromMaybe(false)) {
      TDF_BASE_LOG(ERROR) << "set array item failed";
      return nullptr;
    }
  }
  return std::make_shared<V8CtxValue>(isolate_, array);
}

std::shared_ptr<CtxValue> V8Ctx::CreateMap(size_t count,
                                           std::shared_ptr<CtxValue>* value) {
  if (!count) {
    return nullptr;
  }
  v8::HandleScope handle_scope(isolate_);

  v8::Local<v8::Map> map = v8::Map::New(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  for (size_t i = 0; i < count; i += 2) {
    std::shared_ptr<V8CtxValue> ctx_value_key =
        std::static_pointer_cast<V8CtxValue>(value[i]);
    const v8::Global<v8::Value>& persistent_value_key =
        ctx_value_key->global_value_;
    v8::Local<v8::Value> handle_value_key =
        v8::Local<v8::Value>::New(isolate_, persistent_value_key);

    std::shared_ptr<V8CtxValue> ctx_value =
        std::static_pointer_cast<V8CtxValue>(value[i + 1]);
    const v8::Global<v8::Value>& persistent_value = ctx_value->global_value_;
    v8::Local<v8::Value> handle_value =
        v8::Local<v8::Value>::New(isolate_, persistent_value);
    map->Set(context, handle_value_key, handle_value).ToLocalChecked();
  }
  return std::make_shared<V8CtxValue>(isolate_, map);
}

std::shared_ptr<CtxValue> V8Ctx::CreateJsError(const unicode_string_view& msg) {
  TDF_BASE_DLOG(INFO) << "V8Ctx::CreateJsError msg = " << msg;
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  v8::Local<v8::Value> error = v8::Exception::Error(CreateV8String(msg));
  if (error.IsEmpty()) {
    TDF_BASE_LOG(INFO) << "error is empty";
    return nullptr;
  }
  return std::make_shared<V8CtxValue>(isolate_, error);
}

bool V8Ctx::GetValueNumber(const std::shared_ptr<CtxValue>& value, double* result) {
  if (!value || !result) {
    return false;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value =
      v8::Local<v8::Value>::New(isolate_, global_value);

  if (handle_value.IsEmpty() || !handle_value->IsNumber()) {
    return false;
  }

  v8::Local<v8::Number> number =
      handle_value->ToNumber(context).ToLocalChecked();
  if (number.IsEmpty()) {
    return false;
  }

  *result = number->Value();
  return true;
}

bool V8Ctx::GetValueNumber(const std::shared_ptr<CtxValue>& value, int32_t* result) {
  if (!value || !result) {
    return false;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value =
      v8::Local<v8::Value>::New(isolate_, global_value);

  if (handle_value.IsEmpty() || !handle_value->IsInt32()) {
    return false;
  }

  v8::Local<v8::Int32> number = handle_value->ToInt32(context).ToLocalChecked();
  *result = number->Value();
  return true;
}

bool V8Ctx::GetValueBoolean(const std::shared_ptr<CtxValue>& value, bool* result) {
  if (!value || !result) {
    return false;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value =
      v8::Local<v8::Value>::New(isolate_, global_value);

  if (handle_value.IsEmpty() ||
      (!handle_value->IsBoolean() && !handle_value->IsBooleanObject())) {
    return false;
  }

  v8::Local<v8::Boolean> boolean = handle_value->ToBoolean(isolate_);
  *result = boolean->Value();
  return true;
}

bool V8Ctx::GetValueString(const std::shared_ptr<CtxValue>& value,
                           unicode_string_view* result) {
  TDF_BASE_DLOG(INFO) << "V8Ctx::GetValueString";
  if (!value || !result) {
    return false;
  }
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value =
      v8::Local<v8::Value>::New(isolate_, global_value);
  if (handle_value.IsEmpty()) {
    return false;
  }

  if (handle_value->IsString() || handle_value->IsStringObject()) {
    *result = ToStringView(handle_value->ToString(context).ToLocalChecked());
    return true;
  }
  return false;
}

bool V8Ctx::GetValueJson(const std::shared_ptr<CtxValue>& value,
                         unicode_string_view* result) {
  if (!value || !result) {
    return false;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value =
      v8::Local<v8::Value>::New(isolate_, global_value);
  if (handle_value.IsEmpty() || !handle_value->IsObject()) {
    return false;
  }

  v8::MaybeLocal<v8::String> v8_maybe_string =
      v8::JSON::Stringify(context, handle_value);
  if (v8_maybe_string.IsEmpty()) {
    return false;
  }

  v8::Local<v8::String> v8_string = v8_maybe_string.ToLocalChecked();
  *result = ToStringView(v8_string);
  return true;
}

bool V8Ctx::IsMap(const std::shared_ptr<CtxValue>& value) {
  if (!value) {
    return false;
  }

  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& persistent_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value =
      v8::Local<v8::Value>::New(isolate_, persistent_value);

  if (handle_value.IsEmpty()) {
    return false;
  }
  return handle_value->IsMap();
}

bool V8Ctx::IsNullOrUndefined(const std::shared_ptr<CtxValue>& value) {
  if (!value) {
    return true;
  }

  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& persistent_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value =
      v8::Local<v8::Value>::New(isolate_, persistent_value);

  if (handle_value.IsEmpty()) {
    return false;
  }
  return handle_value->IsNullOrUndefined();
}

// Array Helpers

bool V8Ctx::IsArray(const std::shared_ptr<CtxValue>& value) {
  if (!value) {
    return false;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value =
      v8::Local<v8::Value>::New(isolate_, global_value);

  if (handle_value.IsEmpty()) {
    return false;
  }
  return handle_value->IsArray();
}

uint32_t V8Ctx::GetArrayLength(const std::shared_ptr<CtxValue>& value) {
  if (value == nullptr) {
    return 0;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value =
      v8::Local<v8::Value>::New(isolate_, global_value);

  if (handle_value.IsEmpty()) {
    return 0;
  }

  if (handle_value->IsArray()) {
    v8::Array* array = v8::Array::Cast(*handle_value);
    return array->Length();
  }

  return 0;
}

std::shared_ptr<CtxValue> V8Ctx::CopyArrayElement(
    const std::shared_ptr<CtxValue>& value,
    uint32_t index) {
  if (!value) {
    return nullptr;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value =
      v8::Local<v8::Value>::New(isolate_, global_value);

  if (handle_value.IsEmpty()) {
    return nullptr;
  }

  if (handle_value->IsArray()) {
    v8::Array* array = v8::Array::Cast(*handle_value);
    v8::Local<v8::Value> ret = array->Get(context, index).ToLocalChecked();
    if (ret.IsEmpty()) {
      return nullptr;
    }

    return std::make_shared<V8CtxValue>(isolate_, ret);
  }
  return nullptr;
}

// Map Helpers
uint32_t V8Ctx::GetMapLength(std::shared_ptr<CtxValue>& value) {
  if (value == nullptr) {
    return 0;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& persistent_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value =
      v8::Local<v8::Value>::New(isolate_, persistent_value);

  if (handle_value.IsEmpty()) {
    return 0;
  }

  if (handle_value->IsMap()) {
    v8::Map* map = v8::Map::Cast(*handle_value);
    return map->Size();
  }

  return 0;
}

std::shared_ptr<CtxValue> V8Ctx::ConvertMapToArray(
    const std::shared_ptr<CtxValue>& value) {
  if (value == nullptr) {
    return nullptr;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& persistent_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value =
      v8::Local<v8::Value>::New(isolate_, persistent_value);

  if (handle_value.IsEmpty()) {
    return nullptr;
  }

  if (handle_value->IsMap()) {
    v8::Map* map = v8::Map::Cast(*handle_value);
    v8::Local<v8::Array> array = map->AsArray();
    return std::make_shared<V8CtxValue>(isolate_, array);
  }

  return nullptr;
}

// Object Helpers

bool V8Ctx::HasNamedProperty(const std::shared_ptr<CtxValue>& value,
                             const unicode_string_view& name) {
  if (!value || StringViewUtils::IsEmpty(name)) {
    return false;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value =
      v8::Local<v8::Value>::New(isolate_, global_value);

  if (handle_value.IsEmpty()) {
    return false;
  }

  if (handle_value->IsMap()) {
    v8::Map* map = v8::Map::Cast(*handle_value);
    v8::Local<v8::String> key = CreateV8String(name);
    if (key.IsEmpty()) {
      return false;
    }

    v8::Maybe<bool> ret = map->Has(context, key);
    return ret.ToChecked();
  }
  return false;
}

std::shared_ptr<CtxValue> V8Ctx::CopyNamedProperty(
    const std::shared_ptr<CtxValue>& value,
    const unicode_string_view& name) {
  if (!value || StringViewUtils::IsEmpty(name)) {
    return nullptr;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value =
      v8::Local<v8::Value>::New(isolate_, global_value);

  if (handle_value.IsEmpty()) {
    return nullptr;
  }

  if (handle_value->IsMap()) {
    v8::Map* map = v8::Map::Cast(*handle_value);
    if (map == nullptr) {
      return nullptr;
    }

    v8::Local<v8::String> key = CreateV8String(name);
    if (key.IsEmpty()) {
      return nullptr;
    }

    return std::make_shared<V8CtxValue>(
        isolate_, map->Get(context, key).ToLocalChecked());
  }

  return nullptr;
}

// Function Helpers

bool V8Ctx::IsFunction(const std::shared_ptr<CtxValue>& value) {
  if (!value) {
    return false;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value =
      v8::Local<v8::Value>::New(isolate_, global_value);

  if (handle_value.IsEmpty()) {
    return false;
  }

  return handle_value->IsFunction();
}

unicode_string_view V8Ctx::CopyFunctionName(
    const std::shared_ptr<CtxValue>& function) {
  if (!function) {
    return unicode_string_view();
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(function);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value =
      v8::Local<v8::Value>::New(isolate_, global_value);

  unicode_string_view result;
  if (handle_value->IsFunction()) {
    v8::Local<v8::String> v8_str =
        handle_value->ToString(context).ToLocalChecked();
    result = ToStringView(v8_str);
  }

  return result;
}

}  // namespace napi
}  // namespace hippy
