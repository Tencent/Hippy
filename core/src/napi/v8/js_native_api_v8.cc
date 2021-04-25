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
#include "core/modules/module_base.h"
#include "core/napi/callback_info.h"
#include "core/napi/native_source_code.h"
#include "core/scope.h"
#include "hippy.h"

namespace hippy {
namespace napi {

std::unique_ptr<v8::Platform> V8VM::platform_ = nullptr;
std::mutex V8VM::mutex_;

namespace {

void JsCallbackFunc(const v8::FunctionCallbackInfo<v8::Value>& info) {
  TDF_BASE_DLOG(INFO) << "JsCallbackFunc begin";

  auto data = info.Data().As<v8::External>();
  if (data.IsEmpty()) {
    info.GetReturnValue().SetUndefined();
    return;
  }

  FunctionData* fn_data = reinterpret_cast<FunctionData*>(data->Value());
  if (!fn_data) {
    info.GetReturnValue().SetUndefined();
    return;
  }

  JsCallback callback = fn_data->callback_;
  std::shared_ptr<Scope> scope = fn_data->scope_.lock();
  if (!scope) {
    TDF_BASE_DLOG(FATAL) << "JsCallbackFunc scope error";
    info.GetReturnValue().SetUndefined();
    return;
  }
  CallbackInfo callback_info(scope);

  v8::Isolate* isolate = info.GetIsolate();
  if (!isolate) {
    TDF_BASE_DLOG(ERROR) << "JsCallbackFunc isolate error";
    return;
  }

  v8::HandleScope handle_scope(isolate);
  v8::Local<v8::Context> context = isolate->GetCurrentContext();
  if (context.IsEmpty()) {
    TDF_BASE_DLOG(ERROR) << "JsCallbackFunc context empty";
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
    TDF_BASE_DLOG(ERROR) << "NativeCallbackFunc data is empty";
    info.GetReturnValue().SetUndefined();
    return;
  }

  CBTuple* cb_tuple = reinterpret_cast<CBTuple*>(data->Value());
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

  v8::String::Utf8Value module_name(info.GetIsolate(), info[0]);
  if (module_name.length() <= 0) {
    info.GetReturnValue().SetUndefined();
    return;
  }

  BindingData* binding_data = reinterpret_cast<BindingData*>(data->Value());
  if (!binding_data) {
    info.GetReturnValue().SetUndefined();
    return;
  }

  std::shared_ptr<Scope> scope = binding_data->scope_.lock();
  if (!scope) {
    TDF_BASE_DLOG(FATAL) << "GetInternalBinding scope error";
    info.GetReturnValue().SetUndefined();
    return;
  }

  v8::Isolate* isolate = info.GetIsolate();
  v8::HandleScope handle_scope(isolate);

  v8::Local<v8::Context> context = isolate->GetCurrentContext();
  v8::Context::Scope context_scope(context);
  std::string name = *module_name;
  TDF_BASE_DLOG(INFO) << "module_name = " << name.c_str();
  std::shared_ptr<V8CtxValue> module_value =
      std::static_pointer_cast<V8CtxValue>(scope->GetModuleValue(name));
  if (module_value) {
    TDF_BASE_DLOG(INFO) << "use module cache, module = %s", name.c_str();
    v8::Local<v8::Value> function =
        v8::Local<v8::Value>::New(isolate, module_value->global_value_);
    info.GetReturnValue().Set(function);
    return;
  }

  auto module_class = binding_data->map_.find(name);
  if (module_class == binding_data->map_.end()) {
    TDF_BASE_DLOG(WARNING) << "can not find module " << name;
    info.GetReturnValue().SetUndefined();
    return;
  }

  v8::Local<v8::FunctionTemplate> constructor =
      v8::FunctionTemplate::New(isolate);
  for (const auto& fn : module_class->second) {
    const std::string& fn_name = fn.first;
    std::unique_ptr<FunctionData> fn_data =
        std::make_unique<FunctionData>(scope, fn.second);
    v8::Local<v8::FunctionTemplate> function_template =
        v8::FunctionTemplate::New(
            isolate, JsCallbackFunc,
            v8::External::New(isolate, static_cast<void*>(fn_data.get())));
    scope->SaveFunctionData(std::move(fn_data));
    TDF_BASE_DLOG(INFO) << "bind fn_name = " << fn_name;
    constructor->Set(isolate, fn_name.c_str(), function_template);
  }

  v8::Local<v8::Function> function =
      constructor->GetFunction(context).ToLocalChecked();
  scope->AddModuleValue(name, std::make_shared<V8CtxValue>(isolate, function));
  info.GetReturnValue().Set(function);

  TDF_BASE_DLOG(INFO) << "v8 GetInternalBinding end";
}

class ExternalOneByteStringResourceImpl
    : public v8::String::ExternalOneByteStringResource {
 public:
  ExternalOneByteStringResourceImpl(const uint8_t* data, size_t length)
      : data_(data), str_data_(""), length_(length) {}

  explicit ExternalOneByteStringResourceImpl(const std::string&& data)
      : data_(nullptr), str_data_(std::move(data)) {
    length_ = str_data_.length();
  }

  ~ExternalOneByteStringResourceImpl() override = default;

  const char* data() const override {
    if (data_) {
      return (const char*)data_;
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
      : data_(data), str_data_(""), length_(length) {}

  explicit ExternalStringResourceImpl(const std::string&& data)
      : data_(nullptr), str_data_(std::move(data)) {
    length_ = str_data_.length();
  }

  ~ExternalStringResourceImpl() = default;
  virtual const uint16_t* data() const {
    if (data_) {
      return data_;
    } else {
      return reinterpret_cast<const uint16_t*>(str_data_.c_str());
    }
  }

  virtual size_t length() const { return length_ / 2; }

 private:
  const uint16_t* data_;
  const std::string str_data_;
  size_t length_;

  DISALLOW_COPY_AND_ASSIGN(ExternalStringResourceImpl);
};

}  // namespace

std::shared_ptr<VM> CreateVM() {
  return std::make_shared<V8VM>();
}

std::shared_ptr<TryCatch> CreateTryCatchScope(bool enable,
                                              std::shared_ptr<Ctx> ctx) {
  return std::make_shared<V8TryCatch>(enable, ctx);
}

void DetachThread() {
  JNIEnvironment::GetInstance()->DetachCurrentThread();
}

V8VM::V8VM() {
  TDF_BASE_DLOG(INFO) << "V8VM begin";
  {
    std::lock_guard<std::mutex> lock(mutex_);
    if (platform_ != nullptr) {
      TDF_BASE_DLOG(INFO) << "InitializePlatform";
      v8::V8::InitializePlatform(platform_.get());
    } else {
      TDF_BASE_DLOG(INFO) << "NewDefaultPlatform";
      platform_ = v8::platform::NewDefaultPlatform();
      v8::V8::SetFlagsFromString("--wasm-disable-structured-cloning",
                                 strlen("--wasm-disable-structured-cloning"));
      v8::V8::InitializePlatform(platform_.get(), true);
      TDF_BASE_DLOG(INFO) << "Initialize";
      v8::V8::Initialize();
    }
  }

  create_params_.array_buffer_allocator =
      v8::ArrayBuffer::Allocator::NewDefaultAllocator();
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

V8TryCatch::V8TryCatch(bool enable, std::shared_ptr<Ctx> ctx)
    : TryCatch(enable, ctx), try_catch_(nullptr) {
  if (enable) {
    std::shared_ptr<V8Ctx> v8_ctx = std::static_pointer_cast<V8Ctx>(ctx);
    if (v8_ctx) {
      try_catch_ = std::make_shared<v8::TryCatch>(v8_ctx->isolate_);
    }
  }
}

V8TryCatch::~V8TryCatch() {}

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

std::string V8TryCatch::GetExceptionMsg() {
  if (!try_catch_) {
    return nullptr;
  }

  std::shared_ptr<V8Ctx> v8_ctx = std::static_pointer_cast<V8Ctx>(ctx_);
  v8::HandleScope handle_scope(v8_ctx->isolate_);
  v8::Local<v8::Context> context =
      v8_ctx->context_persistent_.Get(v8_ctx->isolate_);
  v8::Context::Scope context_scope(context);

  v8::Local<v8::Message> message = try_catch_->Message();
  std::string desc = v8_ctx->GetMsgDesc(message);
  std::string stack = v8_ctx->GetStackInfo(message);
  return "message: " + desc + ", stack: " + stack;
}

std::string V8Ctx::GetMsgDesc(v8::Local<v8::Message> message) {
  if (message.IsEmpty()) {
    return "";
  }

  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  v8::String::Utf8Value msg_str(isolate_, message->Get());
  v8::String::Utf8Value file_name(isolate_,
                                  message->GetScriptOrigin().ResourceName());
  const char* file_name_str =
      *file_name ? *file_name : "<file name conversion failed>";
  int linenum = message->GetLineNumber(context).FromMaybe(-1);
  int start = message->GetStartColumn(context).FromMaybe(-1);
  int end = message->GetEndColumn(context).FromMaybe(-1);

  std::string message_str = *msg_str ? *msg_str : "<message conversion failed>";
  std::stringstream description;
  description << file_name_str << ": " << linenum << ": " << start << "-" << end
              << ": " << message_str;

  std::string desc = description.str();
  TDF_BASE_DLOG(INFO) << "description = " << desc;
  return desc;
}

std::string V8Ctx::GetStackInfo(v8::Local<v8::Message> message) {
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

  std::stringstream stack_stream;
  int len = trace->GetFrameCount();
  for (int i = 0; i < len; ++i) {
    v8::Local<v8::StackFrame> frame = trace->GetFrame(isolate_, i);
    v8::String::Utf8Value script_name(isolate_, frame->GetScriptName());
    v8::String::Utf8Value function_name(isolate_, frame->GetFunctionName());
    std::string stack_script_name =
        *script_name ? *script_name : "<script name conversion failed>";
    std::string stack_function_name =
        *function_name ? *function_name : "<function name conversion failed>";
    stack_stream << " \\n " << stack_script_name << ":"
                 << frame->GetLineNumber() << ":" << frame->GetColumn() << ":"
                 << stack_function_name;
  }
  std::string stack = stack_stream.str();
  TDF_BASE_DLOG(INFO) << "stack = " << stack;
  return stack;
}

bool V8Ctx::RegisterGlobalInJs() {
  TDF_BASE_DLOG(INFO) << "RegisterGlobalInJs";
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  v8::Local<v8::Object> global = context->Global();

  return global
      ->Set(context,
            TO_LOCAL_UNCHECKED(
                v8::String::NewFromUtf8(isolate_, "global",
                                        v8::NewStringType::kNormal),
                v8::String),
            global)
      .FromMaybe(false);
}

bool V8Ctx::SetGlobalJsonVar(const std::string& name, const char* json) {
  TDF_BASE_DLOG(INFO) << "SetGlobalJsonVar name = " << name
                      << ", json = " << json;
  if (name.empty() || !json) {
    return false;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  v8::Local<v8::Object> global = context->Global();
  v8::Local<v8::Value> json_value = ParseJson(json);
  if (!json_value.IsEmpty()) {
    return global
        ->Set(context,
              TO_LOCAL_UNCHECKED(
                  v8::String::NewFromUtf8(isolate_, name.c_str(),
                                          v8::NewStringType::kNormal),
                  v8::String),
              json_value)
        .FromMaybe(false);
  }
  return false;
}

bool V8Ctx::SetGlobalStrVar(const std::string& name, const char* str) {
  TDF_BASE_DLOG(INFO) << "SetGlobalStrVar name = " << name << ", str = " << str;
  if (name.empty()) {
    return false;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  v8::Local<v8::Object> global = context->Global();
  v8::Local<v8::String> v8_str = TO_LOCAL_UNCHECKED(
      v8::String::NewFromUtf8(isolate_, str, v8::NewStringType::kNormal),
      v8::String);
  return global
      ->Set(context,
            TO_LOCAL_UNCHECKED(
                v8::String::NewFromUtf8(isolate_, name.c_str(),
                                        v8::NewStringType::kNormal),
                v8::String),
            v8_str)
      .FromMaybe(false);
}

bool V8Ctx::SetGlobalObjVar(const std::string& name,
                            std::shared_ptr<CtxValue> obj,
                            PropertyAttribute attr) {
  TDF_BASE_DLOG(INFO) << "SetGlobalStrVar name = " << name
                      << ", attr = " << attr;
  if (name.empty()) {
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
  v8::PropertyAttribute v8_attr = v8::PropertyAttribute(attr);
  return global
      ->DefineOwnProperty(context,
                          TO_LOCAL_UNCHECKED(v8::String::NewFromUtf8(
                                                 isolate_, name.c_str(),
                                                 v8::NewStringType::kNormal),
                                             v8::String),
                          handle_value, v8_attr)
      .FromMaybe(false);
}

std::shared_ptr<CtxValue> V8Ctx::GetGlobalStrVar(const std::string& name) {
  TDF_BASE_DLOG(INFO) << "GetGlobalStrVar name = " << name;
  if (name.empty()) {
    return nullptr;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  v8::Local<v8::Object> global = context->Global();
  v8::Local<v8::Value> value = TO_LOCAL_UNCHECKED(
      global->Get(context, TO_LOCAL_UNCHECKED(v8::String::NewFromUtf8(
                                                  isolate_, name.c_str(),
                                                  v8::NewStringType::kNormal),
                                              v8::String)),
      v8::Value);
  return std::make_shared<V8CtxValue>(isolate_, value);
}

std::shared_ptr<CtxValue> V8Ctx::GetGlobalObjVar(const std::string& name) {
  TDF_BASE_DLOG(INFO) << "GetGlobalObjVar name = " << name;
  return GetGlobalStrVar(name);
}

std::shared_ptr<CtxValue> V8Ctx::GetProperty(
    const std::shared_ptr<CtxValue> object,
    const std::string& name) {
  return nullptr;
}

void V8Ctx::RegisterGlobalModule(std::shared_ptr<Scope> scope,
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
          TO_LOCAL_UNCHECKED(
              v8::String::NewFromUtf8(isolate_, fn.first.c_str(),
                                      v8::NewStringType::kNormal),
              v8::String),
          v8::FunctionTemplate::New(
              isolate_, JsCallbackFunc,
              v8::External::New(isolate_, static_cast<void*>(data.get()))));
      scope->SaveFunctionData(std::move(data));
    }

    v8::Local<v8::Function> function =
        module_object->GetFunction(context).ToLocalChecked();

    v8::Local<v8::String> classNameKey =
        TO_LOCAL_UNCHECKED(v8::String::NewFromUtf8(isolate_, cls.first.c_str(),
                                                   v8::NewStringType::kNormal),
                           v8::String);

    v8::Maybe<bool> ret =
        context->Global()->Set(context, classNameKey, function);
    ret.ToChecked();
  }
}

void V8Ctx::RegisterNativeBinding(const std::string& name,
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
  context->Global()
      ->Set(context,
            TO_LOCAL_UNCHECKED(
                v8::String::NewFromUtf8(isolate_, name.c_str(),
                                        v8::NewStringType::kNormal),
                v8::String),
            TO_LOCAL_UNCHECKED(fn_template->GetFunction(context), v8::Function))
      .ToChecked();
}

std::shared_ptr<CtxValue> GetInternalBindingFn(std::shared_ptr<Scope> scope) {
  TDF_BASE_DLOG(INFO) << "GetInternalBindingFn";

  std::shared_ptr<V8Ctx> ctx =
      std::static_pointer_cast<V8Ctx>(scope->GetContext());
  v8::Isolate* isolate = ctx->isolate_;
  v8::HandleScope handle_scope(isolate);
  v8::Local<v8::Context> v8_context = ctx->context_persistent_.Get(isolate);
  v8::Context::Scope context_scope(v8_context);

  // GetInternalBindingFn 是向 V8 注册 JS Function
  // GetInternalBinding 是 JS 调用 Function 的实际执行函数
  v8::Local<v8::Function> v8_function =
      v8::Function::New(
          v8_context, GetInternalBinding,
          v8::External::New(isolate,
                            static_cast<void*>(scope->GetBindingData().get())))
          .ToLocalChecked();

  return std::make_shared<V8CtxValue>(isolate, v8_function);
}

std::shared_ptr<CtxValue> V8Ctx::RunScript(const uint8_t* data,
                                           size_t len,
                                           const std::string& file_name,
                                           bool is_use_code_cache,
                                           std::string* cache,
                                           Encoding encodeing) {
  TDF_BASE_DLOG(INFO) << "V8Ctx::RunScript  len = " << len
                      << ", file_name = " << file_name
                      << ", is_use_code_cache = " << is_use_code_cache
                      << ", cache = " << cache << ", encodeing = " << encodeing;
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  v8::Local<v8::String> source;

  switch (encodeing) {
    case Encoding::ONE_BYTE_ENCODING: {
      ExternalOneByteStringResourceImpl* one_byte =
          new ExternalOneByteStringResourceImpl(data, len);
      source = TO_LOCAL_UNCHECKED(
          v8::String::NewExternalOneByte(isolate_, one_byte), v8::String);
      break;
    }
    case Encoding::TWO_BYTE_ENCODING: {
      if (len % 2 != 0) {
        TDF_BASE_DLOG(ERROR) << "utf16 error, len = " << len;
        return nullptr;
      }
      ExternalStringResourceImpl* two_byte = new ExternalStringResourceImpl(
          reinterpret_cast<uint16_t*>(const_cast<uint8_t*>(data)), len / 2);
      source = TO_LOCAL_UNCHECKED(
          v8::String::NewExternalTwoByte(isolate_, two_byte), v8::String);
      break;
    }
    default: {
      source = TO_LOCAL_UNCHECKED(
          v8::String::NewFromUtf8(isolate_, reinterpret_cast<const char*>(data),
                                  v8::NewStringType::kNormal),
          v8::String);
      break;
    }
  }

  if (source.IsEmpty()) {
    TDF_BASE_DLOG(WARNING) << "v8_source empty, file_name = " << file_name;
    return nullptr;
  }

  return InternalRunScript(context, source, file_name, is_use_code_cache,
                           cache);
}

std::shared_ptr<CtxValue> V8Ctx::RunScript(const std::string&& script,
                                           const std::string& file_name,
                                           bool is_use_code_cache,
                                           std::string* cache,
                                           Encoding encodeing) {
  TDF_BASE_LOG(INFO) << "V8Ctx::RunScript script_file_name = " << file_name
                     << ", is_use_code_cache = " << is_use_code_cache
                     << ", cache = " << cache << ", encodeing = " << encodeing;
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  v8::Local<v8::String> source;
  switch (encodeing) {
    case Encoding::ONE_BYTE_ENCODING: {
      ExternalOneByteStringResourceImpl* one_byte =
          new ExternalOneByteStringResourceImpl(std::move(script));
      source = TO_LOCAL_UNCHECKED(
          v8::String::NewExternalOneByte(isolate_, one_byte), v8::String);
      break;
    }
    case Encoding::TWO_BYTE_ENCODING: {
      int len = script.length();
      if (len % 2 != 0) {
        TDF_BASE_DLOG(ERROR) << "utf16 error, len = " << len;
        return nullptr;
      }

      ExternalStringResourceImpl* two_byte =
          new ExternalStringResourceImpl(std::move(script));
      source = TO_LOCAL_UNCHECKED(
          v8::String::NewExternalTwoByte(isolate_, two_byte), v8::String);
      break;
    }
    default: {
      source = TO_LOCAL_UNCHECKED(
          v8::String::NewFromUtf8(isolate_, script.c_str(),
                                  v8::NewStringType::kNormal),
          v8::String);
      break;
    }
  }
  if (source.IsEmpty()) {
    TDF_BASE_DLOG(WARNING) << "v8_source empty, file_name = " << file_name;
    return nullptr;
  }
  return InternalRunScript(context, source, file_name, is_use_code_cache,
                           cache);
}

std::shared_ptr<CtxValue> V8Ctx::InternalRunScript(
    v8::Local<v8::Context> context,
    v8::Local<v8::String> source,
    const std::string& file_name,
    bool is_use_code_cache,
    std::string* cache) {
  v8::ScriptOrigin origin(
      TO_LOCAL_UNCHECKED(v8::String::NewFromUtf8(isolate_, file_name.c_str(),
                                                 v8::NewStringType::kNormal),
                         v8::String));
  v8::MaybeLocal<v8::Script> script;
  if (is_use_code_cache && cache) {
    v8::ScriptCompiler::CachedData* cached_data =
        new v8::ScriptCompiler::CachedData(
            reinterpret_cast<const uint8_t*>(cache), (*cache).length(),
            v8::ScriptCompiler::CachedData::BufferNotOwned);
    v8::ScriptCompiler::Source script_source(source, origin, cached_data);
    script = v8::ScriptCompiler::Compile(context, &script_source,
                                         v8::ScriptCompiler::kConsumeCodeCache);
    if (script.IsEmpty()) {
      return nullptr;
    }
  } else {
    if (is_use_code_cache) {
      v8::ScriptCompiler::Source script_source(source, origin);
      script = v8::ScriptCompiler::Compile(context, &script_source);
      if (script.IsEmpty()) {
        return nullptr;
      }
      const v8::ScriptCompiler::CachedData* cached_data =
          v8::ScriptCompiler::CreateCodeCache(
              script.ToLocalChecked()->GetUnboundScript());
      *cache = std::string(reinterpret_cast<const char*>(cached_data->data),
                           cached_data->length);
    } else {
      script = v8::Script::Compile(context, source, &origin);
    }
  }

  if (script.IsEmpty()) {
    return nullptr;
  }

  v8::MaybeLocal<v8::Value> v8_maybe_value =
      TO_LOCAL_UNCHECKED(script, v8::Script)->Run(context);
  if (v8_maybe_value.IsEmpty()) {
    return nullptr;
  }
  v8::Local<v8::Value> v8_value = v8_maybe_value.ToLocalChecked();
  return std::make_shared<V8CtxValue>(isolate_, v8_value);
}

std::shared_ptr<CtxValue> V8Ctx::GetJsFn(const std::string& name) {
  TDF_BASE_DLOG(INFO) << "GetJsFn name = " << name;
  if (name.empty()) {
    return nullptr;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  v8::Local<v8::String> js_name =
      TO_LOCAL_UNCHECKED(v8::String::NewFromUtf8(isolate_, name.c_str(),
                                                 v8::NewStringType::kNormal),
                         v8::String);
  v8::Local<v8::Function> value =
      v8::Local<v8::Function>::Cast(TO_LOCAL_UNCHECKED(
          context_persistent_.Get(isolate_)->Global()->Get(context, js_name),
          v8::Value));
  return std::make_shared<V8CtxValue>(isolate_, value);
}

bool V8Ctx::ThrowExceptionToJS(std::shared_ptr<CtxValue> exception) {
  std::shared_ptr<CtxValue> exception_handler =
      GetGlobalObjVar(kHippyErrorHandlerName);

  if (!IsFunction(exception_handler)) {
    auto source_code = hippy::GetNativeSourceCode(kErrorHandlerJSName);
    TDF_BASE_DCHECK(source_code.data_ && source_code.length_);
    exception_handler =
        RunScript(source_code.data_, source_code.length_, kErrorHandlerJSName);
    bool is_func = IsFunction(exception_handler);
    TDF_BASE_DCHECK(is_func);
    SetGlobalObjVar(kHippyErrorHandlerName, exception_handler,
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
    std::shared_ptr<CtxValue> function,
    size_t argument_count,
    const std::shared_ptr<CtxValue> arguments[]) {
  TDF_BASE_DLOG(INFO) << "V8Ctx CallFunction begin";

  if (!function) {
    TDF_BASE_DLOG(ERROR) << "function is nullptr";
    return nullptr;
  }

  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope contextScope(context);
  if (context.IsEmpty() || context->Global().IsEmpty()) {
    TDF_BASE_DLOG(ERROR) << "CallFunction context error";
    return nullptr;
  }

  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(function);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value =
      v8::Local<v8::Value>::New(isolate_, global_value);
  if (!handle_value->IsFunction()) {
    TDF_BASE_DLOG(WARNING) << "CallFunction handle_value is not a function";
    return nullptr;
  }

  v8::Function* v8_fn = v8::Function::Cast(*handle_value);
  v8::Local<v8::Value> args[argument_count];
  for (size_t i = 0; i < argument_count; i++) {
    std::shared_ptr<V8CtxValue> argument =
        std::static_pointer_cast<V8CtxValue>(arguments[i]);
    if (argument) {
      const v8::Global<v8::Value>& global_value = argument->global_value_;
      args[i] = v8::Local<v8::Value>::New(isolate_, global_value);
    } else {
      args[i] = v8::Null(isolate_);
    }
  }

  TDF_BASE_DLOG(INFO) << "CallFunction call fn";
  v8::MaybeLocal<v8::Value> maybe_result = v8_fn->Call(
      context, context->Global(), static_cast<int>(argument_count), args);

  if (maybe_result.IsEmpty()) {
    TDF_BASE_DLOG(INFO) << "maybe_result is empty";
    return nullptr;
  }
  return std::make_shared<V8CtxValue>(isolate_, maybe_result.ToLocalChecked());
}

}  // namespace napi
}  // namespace hippy
