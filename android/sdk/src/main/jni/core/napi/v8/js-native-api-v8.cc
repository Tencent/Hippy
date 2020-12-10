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

#include "core/napi/v8/js-native-api-v8.h"

#include <iostream>
#include <mutex>  // NOLINT(build/c++11)
#include <sstream>
#include <string>
#include <vector>

#include "core/base/logging.h"
#include "core/base/macros.h"
#include "core/environment.h"
#include "core/napi/callback-info.h"
#include "core/napi/native-source-code.h"

#include "exception-handler.h"
#include "jni-env.h"
#include "jni-utils.h"
#include "runtime.h"
#include "core/engine-impl.h"


namespace hippy {
namespace napi {

v8::Platform* napi_vm__::platform_ = nullptr;

namespace {

class IsolateClassManager {
 public:
  IsolateClassManager() {}
  ~IsolateClassManager() {}

  static IsolateClassManager* instance() {
    static IsolateClassManager* instance;
    static std::once_flag flag;
    std::call_once(flag, [] { instance = new IsolateClassManager(); });
    return instance;
  }

  JsCallback GetCallback(napi_context context,
                         const std::string& className,
                         const std::string& functionName) {
    std::lock_guard<std::mutex> look(m_mutex);
    HIPPY_DCHECK(context);

    auto cls_it = context->modules.find(className);
    if (cls_it == context->modules.cend())
      return nullptr;

    auto fn_it = cls_it->second.find(functionName);
    if (fn_it == cls_it->second.cend())
      return nullptr;

    return fn_it->second;
  }

  void AddContext(v8::Isolate* isolate, napi_context context) {
    std::lock_guard<std::mutex> lock(m_mutex);

    Entry* entry = GetEntry(isolate);
    if (entry) {
      entry->context_list.insert(
          std::make_pair(context->flag_context, context));
    } else {
      Entry* en = new Entry();
      en->isolate = isolate;
      en->context_list.insert(std::make_pair(context->flag_context, context));
      entry_list.push_back(en);
    }
  }

  void RemoveContext(v8::Isolate* isolate, hippy::napi::napi_context context) {
    std::lock_guard<std::mutex> lock(m_mutex);

    Entry* entry = GetEntry(isolate);
    if (entry == nullptr) {
      return;
    }

    auto item = entry->context_list.find(context->flag_context);
    if (item == entry->context_list.end()) {
      return;
    }

    entry->context_list.erase(context->flag_context);

    if (entry->context_list.size() == 0) {
      auto item =
          std::find(std::begin(entry_list), std::end(entry_list), entry);
      if (item != entry_list.end()) {
        entry_list.erase(item);
        delete entry;
      }
    }
  }

  napi_context GetContext(v8::Isolate* isolate, const std::string flag) {
    std::lock_guard<std::mutex> lock(m_mutex);

    Entry* entry = GetEntry(isolate);
    if (entry == nullptr) {
      return nullptr;
    }

    auto context = entry->context_list.find(flag);
    if (context == entry->context_list.end()) {
      return nullptr;
    }

    return context->second;
  }

 private:
  typedef struct Entry_ {
    v8::Isolate* isolate;
    std::unordered_map<std::string, napi_context> context_list;
  } Entry;

  Entry* GetEntry(v8::Isolate* isolate) {
    for (size_t i = 0; i < entry_list.size(); i++) {
      Entry* entry = entry_list[i];
      if (entry && entry->isolate == isolate) {
        return entry;
      }
    }

    return nullptr;
  }
  std::vector<Entry*> entry_list;
  std::mutex m_mutex;
};

v8::Handle<v8::String> extraDataString(v8::Isolate* isolate,
                                       const std::string& flag,
                                       const std::string& className,
                                       const std::string& funcName) {
  std::string strData = flag;
  strData += ".";
  strData += className;
  strData += ".";
  strData += funcName;
  v8::Handle<v8::String> v8ExtraData =
      v8::String::NewFromUtf8(isolate, strData.c_str(),
                              v8::NewStringType::kNormal)
          .ToLocalChecked();
  return v8ExtraData;
}

void JS_REGISTER_CLASS(const v8::FunctionCallbackInfo<v8::Value>& info) {
  //HIPPY_LOG(hippy::Debug, "JS_REGISTER_CLASS");
}

void JS_REGISTER_FUNCTION(const v8::FunctionCallbackInfo<v8::Value>& info) {
  v8::Handle<v8::Value> value = info.Data();
  if (value.IsEmpty()) {
    info.GetReturnValue().SetUndefined();
    return;
  }

  if (!value->IsString()) {
    info.GetReturnValue().SetUndefined();
    return;
  }

  v8::String::Utf8Value utf8Value(info.GetIsolate(), value);
  std::string extraData = *utf8Value;

  std::string flag = "";
  std::string className = "";
  std::string funcName = "";

  std::string tmp = "";
  for (size_t i = 0; i < extraData.length(); i++) {
    char ch = extraData.at(i);
    if (ch == '.') {
      if (flag.length() <= 0) {
        flag = tmp;
        tmp = "";
        continue;
      }
      if (className.length() <= 0) {
        className = tmp;
        tmp = "";
        continue;
      }
      if (funcName.length() <= 0) {
        funcName = tmp;
        tmp = "";
        continue;
      }
    } else {
      tmp += ch;
    }
  }
  if (funcName.length() <= 0) {
    funcName = tmp;
  }

  /*HIPPY_LOG(hippy::Debug,
            "HippyCore module call, flag=%s, module=%s, func=%s",
            flag.c_str(), className.c_str(), funcName.c_str());*/

  if (flag.length() <= 0 || className.length() <= 0 || funcName.length() <= 0) {
    info.GetReturnValue().SetUndefined();
    return;
  }

  napi_context context =
      IsolateClassManager::instance()->GetContext(info.GetIsolate(), flag);
  if (context == nullptr) {
    info.GetReturnValue().SetUndefined();
    return;
  }

  JsCallback cb = IsolateClassManager::instance()->GetCallback(
      context, className, funcName);
  if (!cb) {
    info.GetReturnValue().SetUndefined();
    return;
  }

  v8::Isolate* isolate = info.GetIsolate();
  v8::HandleScope handle_scope(isolate);
  v8::Local<v8::Context> local_context = isolate->GetCurrentContext();
  v8::Context::Scope context_scope(local_context);

  std::shared_ptr<Environment> env =
  EngineImpl::instance()->GetEnvWithContext(context).lock();
  if (!env) {
    info.GetReturnValue().SetUndefined();
    return;
  }
  CallbackInfo callback_info(env);
  for (int i = 0; i < info.Length(); i++) {
    callback_info.AddValue(std::make_shared<napi_value__>(isolate, info[i]));
  }
  cb(callback_info);

  napi_value exception = callback_info.GetExceptionValue()->Get();
  if (exception) {
    const v8::Persistent<v8::Value>& persistent_value =
        exception->persisent_value;
    v8::Handle<v8::Value> handle_value =
        v8::Handle<v8::Value>::New(isolate, persistent_value);
    isolate->ThrowException(handle_value);
    info.GetReturnValue().SetUndefined();
    return;
  }

  napi_value ret_value = callback_info.GetReturnValue()->Get();
  if (ret_value) {
    info.GetReturnValue().Set(ret_value->persisent_value);
    return;
  }
  info.GetReturnValue().SetUndefined();
}

void GetInternalBinding(const v8::FunctionCallbackInfo<v8::Value>& info) {
  //HIPPY_LOG(hippy::Debug, "GetInternalBinding start");

  size_t count = info.Length();
  if (count <= 0) {
    info.GetReturnValue().SetUndefined();
    return;
  }

  if (!info[0]->IsString()) {
    info.GetReturnValue().SetUndefined();
    return;
  }

  v8::String::Utf8Value module_name(info.GetIsolate(), info[0]);
  if (module_name.length() <= 0) {
    info.GetReturnValue().SetUndefined();
    return;
  }

  v8::Isolate* isolate = info.GetIsolate();
  v8::HandleScope handleScope(isolate);

  v8::Handle<v8::Context> v8Context = isolate->GetCurrentContext();
  v8::Context::Scope contextScope(v8Context);

  v8::Handle<v8::Value> value = info.Data();
  std::string context_flag = "";
  if (value->IsString()) {
    v8::String::Utf8Value utf8Value(isolate, value);
    context_flag = *utf8Value;
  }

  /*HIPPY_LOG(hippy::Debug, "GetInternalBinding context_flag=%s",
            context_flag.c_str());*/

  napi_context context = IsolateClassManager::instance()->GetContext(
      info.GetIsolate(), context_flag);
  if (context == nullptr) {
    info.GetReturnValue().SetUndefined();
    return;
  }

  auto cls_it = context->modules.find(*module_name);
  if (cls_it == context->modules.cend()) {
    info.GetReturnValue().SetUndefined();
    return;
  }

  v8::Handle<v8::FunctionTemplate> constructor =
      v8::FunctionTemplate::New(isolate, JS_REGISTER_CLASS);
  for (const auto& fn : cls_it->second) {
    const std::string& functionName = fn.first;

    v8::Handle<v8::String> extraData = extraDataString(
        isolate, context->flag_context, cls_it->first, functionName);
    v8::Handle<v8::FunctionTemplate> function_template =
        v8::FunctionTemplate::New(isolate, JS_REGISTER_FUNCTION, extraData);

    constructor->Set(isolate, functionName.c_str(), function_template);
  }

  v8::Handle<v8::Function> function =
      constructor->GetFunction(v8Context).ToLocalChecked();
  info.GetReturnValue().Set(function);

  //HIPPY_LOG(hippy::Debug, "GetInternalBinding end");
}

void HandleUncaughtJsError(v8::Local<v8::Message> message,
                           v8::Local<v8::Value> data) {
  //HIPPY_LOG(hippy::Debug, "handle_uncaught_js_error get error");

  if (data.As<v8::External>().IsEmpty()) {
    HIPPY_LOG(hippy::Error, "handle_uncaught_js_error data is empty");
    return;
  }

  v8::Isolate* isolate =
      static_cast<v8::Isolate*>(data.As<v8::External>()->Value());

  if (isolate == nullptr) {
    HIPPY_LOG(hippy::Error, "handle_uncaught_js_error isolate is null");
    return;
  }

  v8::HandleScope handle_scope(isolate);
  v8::Local<v8::Context> context = isolate->GetCurrentContext();
  v8::Context::Scope context_scope(context);

  std::stringstream description_stream;
  std::stringstream stack_stream;

  {
    v8::String::Utf8Value msg(isolate, message->Get());
    v8::String::Utf8Value filename(isolate,
                                   message->GetScriptOrigin().ResourceName());
    const char* filename_string = JniUtils::ToCString(filename);
    int linenum = message->GetLineNumber(context).FromMaybe(-1);
    int start = message->GetStartColumn(context).FromMaybe(-1);
    int end = message->GetEndColumn(context).FromMaybe(-1);

    description_stream << filename_string << ":" << linenum << ": " << start
                       << "-" << end << ": " << JniUtils::ToCString(msg)
                       << " \\n ";
  }

  v8::Local<v8::StackTrace> trace = message->GetStackTrace();
  if (!trace.IsEmpty()) {
    int len = trace->GetFrameCount();
    for (int i = 0; i < len; ++i) {
      v8::Local<v8::StackFrame> frame = trace->GetFrame(isolate, i);
      v8::String::Utf8Value scriptname(isolate, frame->GetScriptName());
      v8::String::Utf8Value functionname(isolate, frame->GetFunctionName());
      stack_stream << JniUtils::ToCString(scriptname) << ":"
                   << frame->GetLineNumber() << ":" << frame->GetColumn()
                   << ": " << JniUtils::ToCString(functionname) << " \\n ";
    }
  }

  // native report
  ExceptionHandler::reportJsException(isolate, description_stream,
                                      stack_stream);

  // send error to js callback if exist
  auto source_code = hippy::GetNativeSourceCode("ExceptionHandle.js");
  HIPPY_DCHECK(source_code.data && source_code.length);

  v8::Local<v8::Value> cached_data = context->GetEmbedderData(0);
  if (!cached_data.IsEmpty()) {
    V8Runtime* runtime =
        static_cast<V8Runtime*>(v8::External::Cast(*cached_data)->Value());
    napi::napi_context napi_ctx = nullptr;
    std::shared_ptr<Environment> environment = runtime->env.lock();
    if (environment) {
      napi_ctx = environment->getContext();
    }
    if (napi_ctx == nullptr) {
      HIPPY_LOG(hippy::Error, "handle_uncaught_js_error napi_ctx is null");
      return;
    }

    napi::napi_value function = napi::napi_evaluate_javascript(
        napi_ctx, source_code.data, source_code.length, "ExceptionHandle.js");
    bool isFunc = napi::napi_is_function(napi_ctx, function);

    HIPPY_CHECK_WITH_MSG(
        isFunc == true,
        "HandleUncaughtJsError ExceptionHandle.js don't return function!!!");

    napi::napi_value args[2];
    args[0] = napi::napi_create_string(napi_ctx, "uncaughtException");
    std::string json_str = std::string("{\"message\":\"") +
                           description_stream.str() +
                           std::string("\",\"stack\":\"") + stack_stream.str() +
                           std::string("\"}");
    napi::napi_value jsObject =
        napi::napi_create_object(napi_ctx, json_str.c_str());

    if (jsObject == nullptr) {
      HIPPY_LOG(hippy::Error, "HandleUncaughtJsError json parse error");
      HIPPY_LOG(hippy::Error, "HandleUncaughtJsError description_stream = %s",
                description_stream.str().c_str());
      HIPPY_LOG(hippy::Error, "HandleUncaughtJsError stack_stream = %s",
                stack_stream.str().c_str());
      return;
    }

    args[1] = jsObject;

    napi::napi_value retValue =
        napi::napi_call_function(napi_ctx, function, 2, args);

  } else {
    HIPPY_LOG(hippy::Error, "HandleUncaughtJsError cached_data is empty");
  }
}

class ExternalOneByteStringResourceImpl
    : public v8::String::ExternalOneByteStringResource {
 public:
  ExternalOneByteStringResourceImpl(const uint8_t* data, size_t length)
      : data_(data), length_(length) {}
  ~ExternalOneByteStringResourceImpl() override = default;

  const char* data() const override {
    return reinterpret_cast<const char*>(data_);
  }
  size_t length() const override { return length_; }

 private:
  const uint8_t* data_;
  size_t length_;

  DISALLOW_COPY_AND_ASSIGN(ExternalOneByteStringResourceImpl);
};

}  // namespace

napi_vm napi_create_vm() {
  napi_vm vm = new napi_vm__();
  return vm;
}

void napi_vm_release(napi_vm vm) {
  if (vm) {
    delete vm;
  }

  JNIEnvironment::DetachCurrentThread();
}

void* napi_get_vm_data(napi_vm vm) {
  return (void*)vm->isolate;
}

void* napi_get_context_data(napi_context context) {
  return nullptr;
}

void* napi_get_platfrom(napi_vm vm) {
  return (void*)vm->platform_;
}

void  napi_enter_context(napi_context context) {
  v8::Handle<v8::Context> v8context = context->context_persistent.Get(context->isolate_);
  v8::Context::Scope context_scope(v8context);

  v8context->Enter();
}

void  napi_exit_context(napi_context context) {
  v8::Handle<v8::Context> v8context = context->context_persistent.Get(context->isolate_);
  v8::Context::Scope context_scope(v8context);

  v8context->Exit();
}

napi_context napi_create_context(napi_vm vm) {
  napi_context context = new napi_context__(vm);
  IsolateClassManager::instance()->AddContext(vm->isolate, context);
  return context;
}

void napi_context_release(napi_vm vm, napi_context context) {
  if (context) {
    IsolateClassManager::instance()->RemoveContext(vm->isolate, context);
    delete context;
  }
}

void napi_set_last_error(napi_context context, napi_status error) {
  HIPPY_DCHECK(context);

  context->error = error;
}

napi_status napi_get_last_error(napi_context context) {
  HIPPY_DCHECK(context);

  return context->error;
}

void napi_register_uncaught_exception_callback(napi_vm vm) {
  v8::HandleScope handle_scope(vm->isolate);
  vm->isolate->AddMessageListener(
      HandleUncaughtJsError,
      v8::External::New(vm->isolate, reinterpret_cast<void*>(vm->isolate)));
}

void napi_add_module_class(napi_context context,
                           const ModuleClassMap& modules) {
  HIPPY_DCHECK(context);
  context->modules.insert(modules.begin(), modules.end());
}

bool napi_register_global_in_js(napi_context context) {
  HIPPY_DCHECK(context);
  HIPPY_DCHECK(context);
  if (context == nullptr) {
    return false;
  }

  v8::Isolate* isolate = context->isolate_;
  v8::HandleScope handleScope(isolate);

  v8::Handle<v8::Context> v8context = context->context_persistent.Get(isolate);
  v8::Context::Scope context_scope(v8context);

  v8::Local<v8::Object> globalObject = v8context->Global();

  return globalObject->Set(v8::String::NewFromUtf8(isolate, "global"),
                           globalObject);
}

std::string napi_str_error(napi_context context, napi_status error) {
  HIPPY_DCHECK(context);
  return "";
}

void napi_register_global_module(napi_context context,
                                 const ModuleClassMap& modules) {
  HIPPY_DCHECK(context);

  v8::Isolate* isolate = context->isolate_;
  v8::HandleScope handleScope(isolate);

  v8::Handle<v8::Context> v8context = context->context_persistent.Get(isolate);
  v8::Context::Scope context_scope(v8context);

  for (const auto& cls : modules) {
    const std::string& className = cls.first;

    v8::Handle<v8::FunctionTemplate> constructor =
        v8::FunctionTemplate::New(isolate, JS_REGISTER_CLASS);

    for (const auto& fn : cls.second) {
      const std::string& functionName = fn.first;

      v8::Handle<v8::String> extraData = extraDataString(
          isolate, context->flag_context, className, functionName);
      v8::Handle<v8::FunctionTemplate> function_template =
          v8::FunctionTemplate::New(isolate, JS_REGISTER_FUNCTION, extraData);

      constructor->Set(isolate, functionName.c_str(), function_template);
    }

    v8::Handle<v8::Function> function =
        constructor->GetFunction(v8context).ToLocalChecked();
    v8::Handle<v8::String> classNameKey =
        v8::String::NewFromUtf8(isolate, className.c_str(),
                                v8::NewStringType::kNormal)
            .ToLocalChecked();
    v8::Maybe<bool> ret =
        v8context->Global()->Set(v8context, classNameKey, function);
    ret.ToChecked();
  }
}

napi_value napi_get_internal_binding(napi_context context) {
  HIPPY_DCHECK(context);
  if (context == nullptr) {
    return nullptr;
  }

  v8::Isolate* isolate = context->isolate_;
  v8::HandleScope handleScope(isolate);

  v8::Local<v8::Context> v8context = context->context_persistent.Get(isolate);
  v8::Context::Scope context_scope(v8context);

  v8::Handle<v8::String> context_flag =
      v8::String::NewFromUtf8(isolate, context->flag_context.c_str(),
                              v8::NewStringType::kNormal)
          .ToLocalChecked();
  v8::Handle<v8::Function> v8Function =
      v8::Function::New(v8context, GetInternalBinding, context_flag)
          .ToLocalChecked();
  return std::make_shared<napi_value__>(isolate, v8Function);
}

napi_value napi_evaluate_javascript(napi_context context,
                                    const uint8_t* javascript_data,
                                    size_t javascript_length,
                                    const char* filename) {
  HIPPY_DCHECK(context);
  if (context == nullptr) {
    HIPPY_LOG(hippy::Error, "napi_evaluate_javascript context is null");
    return nullptr;
  }

  if (!javascript_data || !javascript_length) {
    HIPPY_LOG(hippy::Error,
              "napi_evaluate_javascript javascript_data or javascript_length "
              "is null");
    return nullptr;
  }

  v8::Isolate* isolate = context->isolate_;
  v8::HandleScope handleScope(isolate);

  v8::Local<v8::Context> v8context = context->context_persistent.Get(isolate);
  v8::Context::Scope context_scope(v8context);

  ExternalOneByteStringResourceImpl* source =
      new ExternalOneByteStringResourceImpl(javascript_data, javascript_length);
  v8::Local<v8::String> v8String =
      v8::String::NewExternalOneByte(isolate, source).ToLocalChecked();

  v8::MaybeLocal<v8::Script> v8MaybeScript;
  if (filename != nullptr) {
    std::string file_name;
    bool debug = false;
    if (debug) {  // fix bug: file source not show at the first time on dev
                  // tools
      file_name =
          std::string("hippy-core-debug:///internal_") + std::string(filename);
    } else {
      file_name =
          std::string("hippy-core:///internal_") + std::string(filename);
    }
    v8::ScriptOrigin origin(v8::String::NewFromUtf8(isolate, file_name.c_str(),
                                                    v8::NewStringType::kNormal)
                                .ToLocalChecked());
    v8MaybeScript = v8::Script::Compile(v8context, v8String, &origin);
  } else {
    v8MaybeScript = v8::Script::Compile(v8context, v8String);
  }
  if (v8MaybeScript.IsEmpty()) {
    HIPPY_LOG(hippy::Error, "napi_evaluate_javascript Compile error");
    return nullptr;
  }

  v8::Handle<v8::Script> v8Script = v8MaybeScript.ToLocalChecked();
  v8::MaybeLocal<v8::Value> v8MaybeValue = v8Script->Run(v8context);
  if (v8MaybeValue.IsEmpty()) {
    HIPPY_LOG(hippy::Error, "napi_evaluate_javascript Run error");
    return nullptr;
  }

  v8::Handle<v8::Value> v8Value = v8MaybeValue.ToLocalChecked();
  return std::make_shared<napi_value__>(isolate, v8Value);
}

}  // namespace napi
}  // namespace hippy
