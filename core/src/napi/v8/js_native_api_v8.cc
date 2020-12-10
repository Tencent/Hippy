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
#include <mutex>  // NOLINT(build/c++11)
#include <sstream>
#include <string>
#include <vector>

#include "core/base/common.h"
#include "core/base/logging.h"
#include "core/base/macros.h"
#include "core/modules/module_base.h"
#include "core/napi/callback_info.h"
#include "core/napi/native_source_code.h"
#include "core/scope.h"
#include "hippy.h"

namespace hippy {
namespace napi {

v8::Platform* V8VM::platform_ = nullptr;
std::mutex V8VM::mutex_;

namespace {

void JsCallbackFunc(const v8::FunctionCallbackInfo<v8::Value>& info) {
  HIPPY_DLOG(hippy::Debug, "JsCallbackFunc begin");

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
    HIPPY_LOG(hippy::Fatal, "JsCallbackFunc scope error");
    info.GetReturnValue().SetUndefined();
    return;
  }
  CallbackInfo callback_info(scope);

  v8::Isolate* isolate = info.GetIsolate();
  if (!isolate) {
    HIPPY_LOG(hippy::Error, "JsCallbackFunc isolate error");
    return;
  }

  v8::HandleScope handle_scope(isolate);
  v8::Local<v8::Context> context = isolate->GetCurrentContext();
  if (context.IsEmpty()) {
    HIPPY_LOG(hippy::Error, "JsCallbackFunc context empty");
    return;
  }

  v8::Context::Scope context_scope(context);
  HIPPY_DLOG(hippy::Debug, "callback_info info.length = %d", info.Length());
  for (int i = 0; i < info.Length(); i++) {
    callback_info.AddValue(std::make_shared<V8CtxValue>(isolate, info[i]));
  }
  callback(callback_info);

  std::shared_ptr<V8CtxValue> exception = std::static_pointer_cast<V8CtxValue>(
      callback_info.GetExceptionValue()->Get());

  if (exception) {
    const v8::Persistent<v8::Value>& persistent_value =
        exception->persisent_value_;
    v8::Handle<v8::Value> handle_value =
        v8::Handle<v8::Value>::New(isolate, persistent_value);
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

  info.GetReturnValue().Set(ret_value->persisent_value_);
}

void NativeCallbackFunc(const v8::FunctionCallbackInfo<v8::Value>& info) {
  HIPPY_DLOG(hippy::Debug, "NativeCallbackFunc");
  auto data = info.Data().As<v8::External>();
  if (data.IsEmpty()) {
    HIPPY_LOG(hippy::Error, "NativeCallbackFunc data is empty");
    info.GetReturnValue().SetUndefined();
    return;
  }

  CBTuple* cb_tuple = reinterpret_cast<CBTuple*>(data->Value());
  CBDataTuple data_tuple(*cb_tuple, info);
  HIPPY_DLOG(hippy::Debug, "run native cb begin");
  cb_tuple->fn_((void*)&data_tuple);
  HIPPY_DLOG(hippy::Debug, "run native cb end");
}

void GetInternalBinding(const v8::FunctionCallbackInfo<v8::Value>& info) {
  HIPPY_DLOG(hippy::Debug, "v8 GetInternalBinding begin");

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
    HIPPY_LOG(hippy::Fatal, "GetInternalBinding scope error");
    info.GetReturnValue().SetUndefined();
    return;
  }

  v8::Isolate* isolate = info.GetIsolate();
  v8::HandleScope handle_scope(isolate);

  v8::Handle<v8::Context> context = isolate->GetCurrentContext();
  v8::Context::Scope context_scope(context);
  std::string name = *module_name;
  HIPPY_DLOG(hippy::Debug, "module_name = %s", name.c_str());
  std::shared_ptr<V8CtxValue> module_value =
      std::static_pointer_cast<V8CtxValue>(scope->GetModuleValue(name));
  if (module_value) {
    HIPPY_DLOG(hippy::Debug, "use module cache, module = %s", name.c_str());
    v8::Handle<v8::Value> function =
        v8::Handle<v8::Value>::New(isolate, module_value->persisent_value_);
    info.GetReturnValue().Set(function);
    return;
  }

  auto module_class = binding_data->map_.find(name);
  if (module_class == binding_data->map_.end()) {
    HIPPY_DLOG(hippy::Warning, "can not find module %s", name.c_str());
    info.GetReturnValue().SetUndefined();
    return;
  }

  v8::Handle<v8::FunctionTemplate> constructor =
      v8::FunctionTemplate::New(isolate);
  for (const auto& fn : module_class->second) {
    const std::string& fn_name = fn.first;
    std::unique_ptr<FunctionData> fn_data =
        std::make_unique<FunctionData>(scope, fn.second);
    v8::Handle<v8::FunctionTemplate> function_template =
        v8::FunctionTemplate::New(
            isolate, JsCallbackFunc,
            v8::External::New(isolate, (void*)fn_data.get()));
    scope->SaveFunctionData(std::move(fn_data));
    HIPPY_DLOG(hippy::Debug, "bind fn_name = %s", fn_name.c_str());
    constructor->Set(isolate, fn_name.c_str(), function_template);
  }

  v8::Local<v8::Function> function =
      constructor->GetFunction(context).ToLocalChecked();
  scope->AddModuleValue(name, std::make_shared<V8CtxValue>(isolate, function));
  info.GetReturnValue().Set(function);

  HIPPY_DLOG(hippy::Debug, "v8 GetInternalBinding end");
}

class ExternalOneByteStringResourceImpl
    : public v8::String::ExternalOneByteStringResource {
 public:
  ExternalOneByteStringResourceImpl(const uint8_t* data, size_t length)
      : data_(data), str_data_(""), length_(length) {}

  ExternalOneByteStringResourceImpl(const std::string&& data)
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

  ExternalStringResourceImpl(const std::string&& data)
      : data_(nullptr), str_data_(std::move(data)) {
    length_ = str_data_.length();
  }

  ~ExternalStringResourceImpl() = default;
  virtual const uint16_t* data() const {
    if (data_) {
      return data_;
    } else {
      return (uint16_t*)str_data_.c_str();
    }
  };

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

void DetachThread() {
  JNIEnvironment::DetachCurrentThread();
}

std::shared_ptr<Ctx> V8VM::CreateContext() {
  HIPPY_DLOG(hippy::Debug, "CreateContext");
  return std::make_shared<V8Ctx>(isolate_);
}

void V8Ctx::GetMessageInfo(v8::Local<v8::Message> message,
                           std::string& desc,
                           std::string& stack) {
  v8::HandleScope handle_scope(isolate_);
  v8::Handle<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  v8::String::Utf8Value msg_str(isolate_, message->Get());
  v8::String::Utf8Value file_name(isolate_,
                                  message->GetScriptOrigin().ResourceName());
  const char* file_name_str =
      *file_name ? *file_name : "<string conversion failed>";
  int linenum = message->GetLineNumber(context).FromMaybe(-1);
  int start = message->GetStartColumn(context).FromMaybe(-1);
  int end = message->GetEndColumn(context).FromMaybe(-1);

  std::string message_str = *msg_str ? *msg_str : "<message conversion failed>";
  std::stringstream description;
  description << file_name_str << ": " << linenum << ": " << start << "-" << end
              << ": " << message_str;

  desc = description.str();
  HIPPY_DLOG(hippy::Debug, "description = %s", desc.c_str());
  v8::Local<v8::StackTrace> trace = message->GetStackTrace();
  if (trace.IsEmpty()) {
    return;
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
    stack_stream << "\n"
                 << stack_script_name << ": " << frame->GetLineNumber() << ": "
                 << frame->GetColumn() << ": " << stack_function_name;
  }
  stack = stack_stream.str();
  HIPPY_DLOG(hippy::Debug, "stack = %s", stack.c_str());
}

std::string V8Ctx::GetException(const v8::TryCatch& try_catch) {
  v8::HandleScope handle_scope(isolate_);
  v8::Handle<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  v8::Local<v8::Value> exception = try_catch.Exception();
  if (exception.IsEmpty()) {
    return "";
  }
  v8::String::Utf8Value ex(isolate_, exception);
  const char* exception_str = *ex ? *ex : "<string conversion failed>";
  HIPPY_DLOG(hippy::Debug, "exception_str = %s", exception_str);
  v8::Handle<v8::Message> message = try_catch.Message();
  if (message.IsEmpty()) {
    return std::string(exception_str);
  }

  std::string desc, stack;
  GetMessageInfo(message, desc, stack);
  return "{\"message\": \"" + desc + "\", \"stack\": \"" + stack + "\"}";
}

bool V8Ctx::RegisterGlobalInJs() {
  HIPPY_DLOG(hippy::Debug, "RegisterGlobalInJs");
  v8::HandleScope handle_scope(isolate_);
  v8::Handle<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  v8::Local<v8::Object> global = context->Global();

  return global->Set(
      v8::String::NewFromUtf8(isolate_, "global", v8::NewStringType::kNormal)
          .FromMaybe(v8::Local<v8::String>()),
      global);
}

bool V8Ctx::SetGlobalJsonVar(const std::string& name, const char* json) {
  HIPPY_DLOG(hippy::Debug, "SetGlobalJsonVar name = %s, json = %s",
             name.c_str(), json);
  v8::HandleScope handle_scope(isolate_);
  v8::Handle<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  v8::Local<v8::Object> global = context->Global();
  v8::Handle<v8::Value> json_value = ParseJson(json);
  if (!json_value.IsEmpty()) {
    return global->Set(v8::String::NewFromUtf8(isolate_, name.c_str(),
                                               v8::NewStringType::kNormal)
                           .FromMaybe(v8::Local<v8::String>()),
                       json_value);
  }
  return false;
}

bool V8Ctx::SetGlobalStrVar(const std::string& name, const char* str) {
  HIPPY_DLOG(hippy::Debug, "SetGlobalStrVar name = %s, str = %s", name.c_str(),
             str);
  v8::HandleScope handle_scope(isolate_);
  v8::Handle<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  v8::Local<v8::Object> global = context->Global();
  v8::Handle<v8::String> v8_str =
      v8::String::NewFromUtf8(isolate_, str, v8::NewStringType::kNormal)
          .FromMaybe(v8::Local<v8::String>());
  return global->Set(v8::String::NewFromUtf8(isolate_, name.c_str(),
                                             v8::NewStringType::kNormal)
                         .FromMaybe(v8::Local<v8::String>()),
                     v8_str);
}

bool V8Ctx::SetGlobalObjVar(const std::string& name,
                            std::shared_ptr<CtxValue> obj) {
  HIPPY_DLOG(hippy::Debug, "SetGlobalObjVar name = %s", name.c_str());
  std::shared_ptr<V8CtxValue> ctx_value =
      std::static_pointer_cast<V8CtxValue>(obj);

  v8::HandleScope handle_scope(isolate_);
  v8::Handle<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  v8::Local<v8::Object> global = context->Global();
  const v8::Persistent<v8::Value>& persistent_value =
      ctx_value->persisent_value_;
  v8::Handle<v8::Value> handle_value =
      v8::Handle<v8::Value>::New(isolate_, persistent_value);
  return global->Set(v8::String::NewFromUtf8(isolate_, name.c_str(),
                                             v8::NewStringType::kNormal)
                         .FromMaybe(v8::Local<v8::String>()),
                     handle_value);
}

std::shared_ptr<CtxValue> V8Ctx::GetGlobalStrVar(const std::string& name) {
  HIPPY_DLOG(hippy::Debug, "GetGlobalStrVar name = %s", name.c_str());
  v8::HandleScope handle_scope(isolate_);
  v8::Handle<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  v8::Local<v8::Object> global = context->Global();
  v8::Handle<v8::Value> value =
      global->Get(v8::String::NewFromUtf8(isolate_, name.c_str(),
                                          v8::NewStringType::kNormal)
                      .FromMaybe(v8::Local<v8::String>()));
  return std::make_shared<V8CtxValue>(isolate_, value);
}

std::shared_ptr<CtxValue> V8Ctx::GetProperty(
    const std::shared_ptr<CtxValue>& object,
    const std::string& name) {
  return nullptr;
}

void V8Ctx::RegisterGlobalModule(std::shared_ptr<Scope> scope,
                                 const ModuleClassMap& modules) {
  HIPPY_DLOG(hippy::Debug, "RegisterGlobalModule");
  v8::HandleScope handle_scope(isolate_);

  v8::Handle<v8::Context> v8_context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(v8_context);

  for (const auto& cls : modules) {
    v8::Handle<v8::FunctionTemplate> module_object =
        v8::FunctionTemplate::New(isolate_);

    for (const auto& fn : cls.second) {
      std::unique_ptr<FunctionData> data =
          std::make_unique<FunctionData>(scope, fn.second);
      module_object->Set(v8::String::NewFromUtf8(isolate_, fn.first.c_str(),
                                                 v8::NewStringType::kNormal)
                             .FromMaybe(v8::Local<v8::String>()),
                         v8::FunctionTemplate::New(
                             isolate_, JsCallbackFunc,
                             v8::External::New(isolate_, (void*)data.get())));
      scope->SaveFunctionData(std::move(data));
    }

    v8::Local<v8::Function> function =
        module_object->GetFunction(v8_context).ToLocalChecked();

    v8::Handle<v8::String> classNameKey =
        v8::String::NewFromUtf8(isolate_, cls.first.c_str(),
                                v8::NewStringType::kNormal)
            .FromMaybe(v8::Local<v8::String>());

    v8::Maybe<bool> ret =
        v8_context->Global()->Set(v8_context, classNameKey, function);
    ret.ToChecked();
  }
}

void V8Ctx::RegisterNativeBinding(const std::string& name,
                                  hippy::base::RegisterFunction fn,
                                  void* data) {
  HIPPY_DLOG(hippy::Debug, "RegisterNativeBinding name = %s", name.c_str());

  v8::HandleScope handle_scope(isolate_);
  v8::Handle<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  data_tuple_ = std::make_unique<CBTuple>(fn, data);
  v8::Local<v8::FunctionTemplate> fn_template = v8::FunctionTemplate::New(
      isolate_, NativeCallbackFunc,
      v8::External::New(isolate_, (void*)data_tuple_.get()));
  fn_template->RemovePrototype();
  context->Global()
      ->Set(context,
            v8::String::NewFromUtf8(isolate_, name.c_str(),
                                    v8::NewStringType::kNormal)
                .FromMaybe(v8::Local<v8::String>()),
            fn_template->GetFunction())
      .ToChecked();
}

std::shared_ptr<CtxValue> GetInternalBindingFn(std::shared_ptr<Scope> scope) {
  HIPPY_DLOG(hippy::Debug, "GetInternalBindingFn");

  std::shared_ptr<V8Ctx> ctx =
      std::static_pointer_cast<V8Ctx>(scope->GetContext());
  v8::Isolate* isolate = ctx->isolate_;
  v8::HandleScope handle_scope(isolate);
  v8::Local<v8::Context> v8_context = ctx->context_persistent_.Get(isolate);
  v8::Context::Scope context_scope(v8_context);

  // GetInternalBindingFn 是向 V8 注册 JS Function
  // GetInternalBinding 是 JS 调用 Function 的实际执行函数
  v8::Handle<v8::Function> v8_function =
      v8::Function::New(
          v8_context, GetInternalBinding,
          v8::External::New(isolate, (void*)scope->GetBindingData().get()))
          .ToLocalChecked();

  return std::make_shared<V8CtxValue>(isolate, v8_function);
}

std::shared_ptr<CtxValue> V8Ctx::RunScript(const uint8_t* data,
                                           size_t len,
                                           const std::string& file_name,
                                           bool is_use_code_cache,
                                           std::string* cache,
                                           std::string* exception,
                                           Encoding encodeing) {
  HIPPY_DLOG(hippy::Debug,
             "V8Ctx::RunScript file_name = %s, len = %d, encodeing = %d, "
             "is_use_code_cache = %d, cache = %d, exception = %d",
             file_name.c_str(), len, is_use_code_cache, encodeing, cache,
             exception);
  v8::HandleScope handle_scope(isolate_);
  v8::Handle<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  v8::Handle<v8::String> source;

  v8::TryCatch try_catch(isolate_);
  switch (encodeing) {
    case Encoding::ONE_BYTE_ENCODING: {
      ExternalOneByteStringResourceImpl* one_byte =
          new ExternalOneByteStringResourceImpl(data, len);
      source = v8::String::NewExternalOneByte(isolate_, one_byte)
                   .FromMaybe(v8::Local<v8::String>());
      break;
    }
    case Encoding::TWO_BYTE_ENCODING: {
      if (len % 2 != 0) {
        HIPPY_LOG(hippy::Error, "utf16 error, len = %d", len);
        return nullptr;
      }
      ExternalStringResourceImpl* two_byte =
          new ExternalStringResourceImpl((uint16_t*)data, len / 2);
      source = v8::String::NewExternalTwoByte(isolate_, two_byte)
                   .FromMaybe(v8::Local<v8::String>());
      break;
    }
    default: {
      source = v8::String::NewFromUtf8(isolate_, (const char*)data,
                                       v8::NewStringType::kNormal)
                   .FromMaybe(v8::Local<v8::String>());
      break;
    }
  }

  if (source.IsEmpty()) {
    HIPPY_LOG(hippy::Warning, "v8_source empty, file_name = %s",
              file_name.c_str());
    if (exception) {
      *exception = GetException(try_catch);
    } else {
      try_catch.ReThrow();
    }
    return nullptr;
  }

  return InternalRunScript(context, source, file_name, is_use_code_cache, cache,
                           exception);
}

std::shared_ptr<CtxValue> V8Ctx::RunScript(const std::string&& script,
                                           const std::string& file_name,
                                           bool is_use_code_cache,
                                           std::string* cache,
                                           std::string* exception,
                                           Encoding encodeing) {
  HIPPY_DLOG(hippy::Debug,
             "V8Ctx::RunScript script_file_name = %s, encodeing = %d, "
             "is_use_code_cache = %d, cache = %d, exception = %d",
             file_name.c_str(), is_use_code_cache, encodeing, cache, exception);
  v8::HandleScope handle_scope(isolate_);
  v8::Handle<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  v8::Handle<v8::String> source;

  v8::TryCatch try_catch(isolate_);
  switch (encodeing) {
    case Encoding::ONE_BYTE_ENCODING: {
      ExternalOneByteStringResourceImpl* one_byte =
          new ExternalOneByteStringResourceImpl(std::move(script));
      source = v8::String::NewExternalOneByte(isolate_, one_byte)
                   .FromMaybe(v8::Local<v8::String>());
      break;
    }
    case Encoding::TWO_BYTE_ENCODING: {
      int len = script.length();
      if (len % 2 != 0) {
        HIPPY_LOG(hippy::Error, "utf16 error, len = %d", len);
        return nullptr;
      }

      ExternalStringResourceImpl* two_byte =
          new ExternalStringResourceImpl(std::move(script));
      source = v8::String::NewExternalTwoByte(isolate_, two_byte)
                   .FromMaybe(v8::Local<v8::String>());
      break;
    }
    default: {
      source = v8::String::NewFromUtf8(isolate_, script.c_str(),
                                       v8::NewStringType::kNormal)
                   .FromMaybe(v8::Local<v8::String>());
      break;
    }
  }
  if (source.IsEmpty()) {
    HIPPY_LOG(hippy::Warning, "v8_source empty, file_name = %s",
              file_name.c_str());
    if (exception) {
      *exception = GetException(try_catch);
    } else {
      try_catch.ReThrow();
    }
    return nullptr;
  }
  return InternalRunScript(context, source, file_name, is_use_code_cache, cache,
                           exception);
}

std::shared_ptr<CtxValue> V8Ctx::InternalRunScript(
    v8::Handle<v8::Context> context,
    v8::Handle<v8::String> source,
    const std::string& file_name,
    bool is_use_code_cache,
    std::string* cache,
    std::string* exception) {
  v8::TryCatch try_catch(isolate_);
  v8::ScriptOrigin origin(v8::String::NewFromUtf8(isolate_, file_name.c_str(),
                                                  v8::NewStringType::kNormal)
                              .FromMaybe(v8::Local<v8::String>()));
  v8::MaybeLocal<v8::Script> script;
  if (cache) {
    v8::ScriptCompiler::CachedData* cached_data =
        new v8::ScriptCompiler::CachedData(
            reinterpret_cast<const uint8_t*>(cache), (*cache).length(),
            v8::ScriptCompiler::CachedData::BufferNotOwned);
    v8::ScriptCompiler::Source script_source(source, origin, cached_data);
    script = v8::ScriptCompiler::Compile(context, &script_source,
                                         v8::ScriptCompiler::kConsumeCodeCache);
    if (script.IsEmpty()) {
      if (exception) {
        *exception = GetException(try_catch);
      } else {
        try_catch.ReThrow();
      }
      return nullptr;
    }
  } else {
    if (is_use_code_cache) {
      v8::ScriptCompiler::Source script_source(source, origin);
      script = v8::ScriptCompiler::Compile(context, &script_source);
      if (script.IsEmpty()) {
        if (exception) {
          *exception = GetException(try_catch);
        } else {
          try_catch.ReThrow();
        }
        return nullptr;
      }
      const v8::ScriptCompiler::CachedData* cached_data =
          v8::ScriptCompiler::CreateCodeCache(
              script.ToLocalChecked()->GetUnboundScript());
      *cache = std::string((char*)cached_data->data, cached_data->length);
    } else {
      script = v8::Script::Compile(context, source, &origin);
    }
  }

  if (script.IsEmpty()) {
    if (exception) {
      *exception = GetException(try_catch);
    } else {
      try_catch.ReThrow();
    }
    return nullptr;
  }

  v8::MaybeLocal<v8::Value> v8_maybe_value =
      script.FromMaybe(v8::Local<v8::Script>())->Run(context);
  if (v8_maybe_value.IsEmpty()) {
    if (exception) {
      *exception = GetException(try_catch);
    } else {
      try_catch.ReThrow();
    }
    return nullptr;
  }
  v8::Handle<v8::Value> v8_value = v8_maybe_value.ToLocalChecked();
  return std::make_shared<V8CtxValue>(isolate_, v8_value);
}

std::shared_ptr<CtxValue> V8Ctx::GetJsFn(const std::string& name) {
  HIPPY_DLOG(hippy::Debug, "GetJsFn name = %s", name.c_str());
  v8::HandleScope handle_scope(isolate_);
  v8::Handle<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  v8::Local<v8::String> js_name =
      v8::String::NewFromUtf8(isolate_, name.c_str(),
                              v8::NewStringType::kNormal)
          .FromMaybe(v8::Local<v8::String>());
  v8::Local<v8::Function> value = v8::Local<v8::Function>::Cast(
      context_persistent_.Get(isolate_)->Global()->Get(js_name));
  return std::make_shared<V8CtxValue>(isolate_, value);
}

}  // namespace napi
}  // namespace hippy
