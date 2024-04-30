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

#include "core/napi/v8/v8_ctx.h"

#include "base/unicode_string_view.h"
#include "core/base/string_view_utils.h"
#include "core/napi/v8/v8_ctx_value.h"
#include "core/napi/v8/v8_try_catch.h"
#include "core/scope.h"
#include "core/vm/v8/v8_vm.h"
#include "core/vm/v8/serializer.h"
#include "core/vm/v8/snapshot_collector.h"
#include "core/vm/native_source_code.h"

namespace hippy {
namespace napi {

using unicode_string_view = tdf::base::unicode_string_view;
using StringViewUtils = hippy::base::StringViewUtils;
using JSValueWrapper = hippy::base::JSValueWrapper;
using V8VM = hippy::vm::V8VM;

constexpr static int kInternalIndex = 0;
constexpr static int kScopeWrapperIndex = 5;

void InvokePropertyCallback(v8::Local<v8::Name> property, const v8::PropertyCallbackInfo<v8::Value>& info) {
  auto isolate = info.GetIsolate();
  v8::HandleScope handle_scope(isolate);
  auto context = isolate->GetCurrentContext();
  v8::Context::Scope context_scope(context);

  CallbackInfo cb_info;
  cb_info.SetSlot(context->GetAlignedPointerFromEmbedderData(kScopeWrapperIndex));
  cb_info.SetReceiver(std::make_shared<V8CtxValue>(isolate, info.This()));
  auto name = std::make_shared<V8CtxValue>(isolate, property);
  cb_info.AddValue(name);
  auto data = info.Data().As<v8::External>();
  TDF_BASE_CHECK(!data.IsEmpty());
  auto* func_wrapper = reinterpret_cast<FuncWrapper*>(data->Value());
  TDF_BASE_CHECK(func_wrapper && func_wrapper->cb);
  (func_wrapper->cb)(cb_info, func_wrapper->data);
  auto exception = std::static_pointer_cast<V8CtxValue>(cb_info.GetExceptionValue()->Get());
  if (exception) {
    const auto& global_value = exception->global_value_;
    auto handle_value = v8::Local<v8::Value>::New(isolate, global_value);
    isolate->ThrowException(handle_value);
    info.GetReturnValue().SetUndefined();
    return;
  }

  auto ret_value = std::static_pointer_cast<V8CtxValue>(cb_info.GetReturnValue()->Get());
  if (!ret_value) {
    info.GetReturnValue().SetUndefined();
    return;
  }

  info.GetReturnValue().Set(ret_value->global_value_);
}

static void InvokeJsCallback(const v8::FunctionCallbackInfo<v8::Value>& info) {
  auto isolate = info.GetIsolate();
  v8::HandleScope handle_scope(isolate);
  auto context = isolate->GetCurrentContext();
  v8::Context::Scope context_scope(context);

  CallbackInfo cb_info;
  cb_info.SetSlot(context->GetAlignedPointerFromEmbedderData(kScopeWrapperIndex));
  cb_info.SetReceiver(std::make_shared<V8CtxValue>(isolate, info.This()));
  for (int i = 0; i < info.Length(); i++) {
    cb_info.AddValue(std::make_shared<V8CtxValue>(isolate, info[i]));
  }
  auto data = info.Data().As<v8::External>();
  TDF_BASE_CHECK(!data.IsEmpty());
  auto js_cb_address = data->Value();
  auto js_cb = reinterpret_cast<JsCallback>(js_cb_address);
  js_cb(cb_info, js_cb_address);
  auto exception = std::static_pointer_cast<V8CtxValue>(cb_info.GetExceptionValue()->Get());
  if (exception) {
    const auto& global_value = exception->global_value_;
    auto handle_value = v8::Local<v8::Value>::New(isolate, global_value);
    isolate->ThrowException(handle_value);
    info.GetReturnValue().SetUndefined();
    return;
  }

  auto ret_value = std::static_pointer_cast<V8CtxValue>(cb_info.GetReturnValue()->Get());
  if (!ret_value) {
    info.GetReturnValue().SetUndefined();
    return;
  }

  info.GetReturnValue().Set(ret_value->global_value_);
}

v8::Local<v8::FunctionTemplate> V8Ctx::CreateTemplate(const std::unique_ptr<FuncWrapper>& wrapper) const {
  // wrapper->cb is a function pointer which can be obtained at compile time
  return v8::FunctionTemplate::New(isolate_,InvokeJsCallback,
                                   v8::External::New(isolate_, reinterpret_cast<void*>(wrapper->cb)));

}

std::shared_ptr<CtxValue> V8Ctx::CreateFunction(std::unique_ptr<FuncWrapper>& wrapper) {
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  auto function_template = CreateTemplate(wrapper);
  SaveFuncExternalData(reinterpret_cast<void*>(wrapper->cb), wrapper->data);
  return std::make_shared<V8CtxValue>(isolate_, function_template->GetFunction(context).ToLocalChecked());
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
  ExternalOneByteStringResourceImpl(const ExternalOneByteStringResourceImpl &) = delete;
  const ExternalOneByteStringResourceImpl &operator=(const ExternalOneByteStringResourceImpl &) = delete;

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
  ExternalStringResourceImpl(const ExternalStringResourceImpl &) = delete;
  const ExternalStringResourceImpl &operator=(const ExternalStringResourceImpl &) = delete;

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
};

unicode_string_view V8Ctx::GetMsgDesc(v8::Local<v8::Message> message) const {
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

unicode_string_view V8Ctx::GetStackTrace(v8::Local<v8::StackTrace> trace) const {
  if (trace.IsEmpty()) {
    return "";
  }

  std::basic_stringstream<char> stack_stream;
  auto len = trace->GetFrameCount();
  for (auto i = 0; i < len; ++i) {
    v8::Local<v8::StackFrame> frame = trace->GetFrame(isolate_, static_cast<uint32_t>(i));
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
  return unicode_string_view::new_from_utf8(u8_str.c_str(), u8_str.length());
}

unicode_string_view V8Ctx::GetStackInfo(v8::Local<v8::Message> message) const {
  if (message.IsEmpty()) {
    return "";
  }

  auto trace = message->GetStackTrace();
  return GetStackTrace(trace);
}

std::shared_ptr<CtxValue> V8Ctx::CreateError(v8::Local<v8::Message> message) const {
  auto string = message->Get();
  return std::make_shared<V8CtxValue>(isolate_, string);
}

void V8Ctx::SetExternalData(void* address) {
  SetAlignedPointerInEmbedderData(kScopeWrapperIndex, reinterpret_cast<intptr_t>(address));
}

void V8Ctx::SetAlignedPointerInEmbedderData(int index, intptr_t address) {
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  context->SetAlignedPointerInEmbedderData(index,
                                           reinterpret_cast<void*>(address));
}

std::string V8Ctx::GetSerializationBuffer(const std::shared_ptr<CtxValue>& value, std::string& reused_buffer) {
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value = std::static_pointer_cast<V8CtxValue>(value);
  v8::Local<v8::Value> handle_value = v8::Local<v8::Value>::New(isolate_, ctx_value->global_value_);

  Serializer serializer(isolate_, context, reused_buffer);
  serializer.WriteHeader();
  serializer.WriteValue(handle_value);
  std::pair<uint8_t *, size_t> pair = serializer.Release();
  return {reinterpret_cast<const char *>(pair.first), pair.second};
}

std::shared_ptr<CtxValue> V8Ctx::GetGlobalObject() {
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  return std::make_shared<V8CtxValue>(isolate_, context->Global());
}

std::shared_ptr<CtxValue> V8Ctx::GetProperty(
    const std::shared_ptr<CtxValue>& object,
    const unicode_string_view& name) {
  TDF_BASE_CHECK(object);
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  auto key = CreateV8String(name);
  return GetProperty(object, std::make_shared<V8CtxValue>(isolate_, key));
}

std::shared_ptr<CtxValue> V8Ctx::GetProperty(
    const std::shared_ptr<CtxValue>& object,
    std::shared_ptr<CtxValue> key) {
  TDF_BASE_CHECK(object && key);
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  auto v8_object = std::static_pointer_cast<V8CtxValue>(object);
  auto v8_object_handle = v8::Local<v8::Value>::New(isolate_, v8_object->global_value_);

  auto v8_key = std::static_pointer_cast<V8CtxValue>(key);
  auto v8_key_handle = v8::Local<v8::Value>::New(isolate_, v8_key->global_value_);

  auto value = v8::Local<v8::Object>::Cast(v8_object_handle)->Get(context, v8_key_handle).ToLocalChecked();
  return std::make_shared<V8CtxValue>(isolate_, value);
}

std::shared_ptr<CtxValue> V8Ctx::RunScript(const unicode_string_view& str_view,
                                           const unicode_string_view& file_name) {
  return RunScript(str_view, file_name, false, nullptr, true);
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
            v8::NewStringType::kInternalized, hippy::base::checked_numeric_cast<size_t, int>(str.length()));
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
            v8::NewStringType::kNormal, hippy::base::checked_numeric_cast<size_t, int>(str.length()));
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
          v8::NewStringType::kNormal, hippy::base::checked_numeric_cast<size_t, int>(str.length()));
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
      TDF_BASE_UNREACHABLE();
    }
  }

  if (source.IsEmpty()) {
    TDF_BASE_DLOG(WARNING) << "v8_source empty, file_name = " << file_name;
    return nullptr;
  }

  return InternalRunScript(context, source.ToLocalChecked(), file_name, is_use_code_cache, cache);
}

void V8Ctx::SetDefaultContext(const std::shared_ptr<v8::SnapshotCreator>& creator) {
  TDF_BASE_CHECK(creator);
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  creator->SetDefaultContext(context);
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
              str.c_str(), hippy::base::checked_numeric_cast<size_t, int>(str.length()),
              v8::ScriptCompiler::CachedData::BufferNotOwned);
      v8::ScriptCompiler::Source script_source(source, origin, cached_data);
      script = v8::ScriptCompiler::Compile(
          context, &script_source, v8::ScriptCompiler::kConsumeCodeCache);
    } else {
      TDF_BASE_UNREACHABLE();
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
      *cache = unicode_string_view(cached_data->data,
                                   hippy::base::checked_numeric_cast<int,
                                                                     size_t>(cached_data->length));
    } else {
      script = v8::Script::Compile(context, source, &origin);
    }
  }

  if (script.IsEmpty()) {
    return nullptr;
  }

  v8::MaybeLocal<v8::Value> v8_maybe_value = script.ToLocalChecked()->Run(context);
  if (v8_maybe_value.IsEmpty()) {
    return nullptr;
  }
  v8::Local<v8::Value> v8_value = v8_maybe_value.ToLocalChecked();
  return std::make_shared<V8CtxValue>(isolate_, v8_value);
}

void V8Ctx::ThrowException(const std::shared_ptr<CtxValue> &exception) {
  std::shared_ptr<V8CtxValue> ctx_value = std::static_pointer_cast<V8CtxValue>(exception);
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value = v8::Local<v8::Value>::New(isolate_, global_value);
  isolate_->ThrowException(handle_value);
}

void V8Ctx::ThrowException(const unicode_string_view &exception) {
  ThrowException(CreateError(exception));
}

void V8Ctx::HandleUncaughtException(const std::shared_ptr<CtxValue>& exception) {
  auto global_object = GetGlobalObject();
  unicode_string_view error_handle_name(kHippyErrorHandlerName);
  auto error_handle_key = CreateString(error_handle_name);
  auto exception_handler = GetProperty(global_object, error_handle_key);
  if (!IsFunction(exception_handler)) {
    const auto& source_code = hippy::GetNativeSourceCode(kErrorHandlerJSName);
    TDF_BASE_DCHECK(source_code.data_ && source_code.length_);
    unicode_string_view str_view(source_code.data_, source_code.length_);
    exception_handler = RunScript(str_view, error_handle_name, false, nullptr, false);
    SetProperty(global_object, error_handle_key, exception_handler);
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
}

std::shared_ptr<CtxValue> V8Ctx::CallFunction(
    const std::shared_ptr<CtxValue>& function,
    size_t argument_count,
    const std::shared_ptr<CtxValue> arguments[]) {
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

  v8::MaybeLocal<v8::Value> maybe_result = v8_fn->Call(
      context, context->Global(), static_cast<int>(argument_count), args);

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
  if (str_view.encoding() == unicode_string_view::Encoding::Unknown) {
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
  return V8VM::CreateV8String(isolate_, str_view);
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
    for (size_t i = 0; i < arr.size(); ++i) {
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

  TDF_BASE_UNIMPLEMENTED();
  return nullptr;
}

unicode_string_view V8Ctx::ToStringView(v8::Local<v8::String> str) const {
  return V8VM::ToStringView(isolate_, str);
}

std::shared_ptr<CtxValue> V8Ctx::CreateObject(const std::unordered_map<
    unicode_string_view,
    std::shared_ptr<CtxValue>>& object) {
  std::unordered_map<std::shared_ptr<CtxValue>,std::shared_ptr<CtxValue>> obj;
  for (const auto& it : object) {
    auto key = CreateString(it.first);
    obj[key] = it.second;
  }
  return CreateObject(obj);
}

std::shared_ptr<CtxValue> V8Ctx::CreateObject(const std::unordered_map<
    std::shared_ptr<CtxValue>,
    std::shared_ptr<CtxValue>>& object) {
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  v8::Local<v8::Object> obj = v8::Object::New(isolate_);
  for (const auto& it : object) {
    auto key_ctx_value = std::static_pointer_cast<V8CtxValue>(it.first);
    auto key_handle_value =  v8::Local<v8::Value>::New(isolate_, key_ctx_value->global_value_);
    auto value_ctx_value = std::static_pointer_cast<V8CtxValue>(it.second);
    auto value_handle_value = v8::Local<v8::Value>::New(isolate_, value_ctx_value->global_value_);
    obj->Set(context, key_handle_value, value_handle_value).ToChecked();
  }
  return std::make_shared<V8CtxValue>(isolate_, obj);
}

std::shared_ptr<CtxValue> V8Ctx::CreateArray(
    size_t count,
    std::shared_ptr<CtxValue> value[]) {
  int array_size;
  if (!hippy::base::numeric_cast<size_t, int>(count, array_size)) {
    TDF_BASE_LOG(ERROR) << "array length out of boundary";
    return nullptr;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  v8::Local<v8::Array> array = v8::Array::New(isolate_, array_size);
  for (auto i = 0; i < array_size; i++) {
    v8::Local<v8::Value> handle_value;
    std::shared_ptr<V8CtxValue> ctx_value = std::static_pointer_cast<V8CtxValue>(value[i]);
    if (ctx_value) {
      handle_value = v8::Local<v8::Value>::New(isolate_, ctx_value->global_value_);
    } else {
      TDF_BASE_LOG(ERROR) << "array item error";
      return nullptr;
    }
    if (!array->Set(context, static_cast<uint32_t >(i), handle_value).FromMaybe(false)) {
      TDF_BASE_LOG(ERROR) << "set array item failed";
      return nullptr;
    }
  }
  return std::make_shared<V8CtxValue>(isolate_, array);
}

std::shared_ptr<CtxValue> V8Ctx::CreateMap(const std::map<
    std::shared_ptr<CtxValue>,
    std::shared_ptr<CtxValue>>& map) {

  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  v8::Local<v8::Map> js_map = v8::Map::New(isolate_);
  for (auto & it : map) {
    auto key_ctx_value = std::static_pointer_cast<V8CtxValue>(it.first);
    auto key_handle_value =  v8::Local<v8::Value>::New(isolate_, key_ctx_value->global_value_);
    auto value_ctx_value = std::static_pointer_cast<V8CtxValue>(it.second);
    auto value_handle_value = v8::Local<v8::Value>::New(isolate_, value_ctx_value->global_value_);
    js_map->Set(context, key_handle_value, value_handle_value).ToLocalChecked();
  }
  return std::make_shared<V8CtxValue>(isolate_, js_map);
}

std::shared_ptr<CtxValue> V8Ctx::CreateError(const unicode_string_view& msg) {
  TDF_BASE_DLOG(INFO) << "V8Ctx::CreateError msg = " << msg;
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
  std::shared_ptr<V8CtxValue> ctx_value = std::static_pointer_cast<V8CtxValue>(value);
  v8::Local<v8::Value> handle_value = v8::Local<v8::Value>::New(isolate_, ctx_value->global_value_);

  if (handle_value.IsEmpty() || !handle_value->IsNumber()) {
    return false;
  }

  auto number = handle_value->ToNumber(context).ToLocalChecked();
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
  if (!value || !result) {
    return false;
  }
  std::shared_ptr<V8CtxValue> ctx_value = std::static_pointer_cast<V8CtxValue>(value);
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value = v8::Local<v8::Value>::New(isolate_, global_value);
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
size_t V8Ctx::GetMapLength(std::shared_ptr<CtxValue>& value) {
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

bool V8Ctx::IsString(const std::shared_ptr<CtxValue>& value) {
  if (!value) {
    return false;
  }
  auto ctx_value = std::static_pointer_cast<V8CtxValue>(value);
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  const auto& global_value = ctx_value->global_value_;
  auto handle_value = v8::Local<v8::Value>::New(isolate_, global_value);
  return handle_value->IsString();
}

bool V8Ctx::IsFunction(const std::shared_ptr<CtxValue>& value) {
  if (!value) {
    return false;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value = std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value = v8::Local<v8::Value>::New(isolate_, global_value);

  if (handle_value.IsEmpty()) {
    return false;
  }

  return handle_value->IsFunction();
}


bool V8Ctx::IsObject(const std::shared_ptr<CtxValue>& value) {
  if (!value) {
    return false;
  }
  v8::HandleScope handle_scope(isolate_);
  v8::Local<v8::Context> context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  std::shared_ptr<V8CtxValue> ctx_value = std::static_pointer_cast<V8CtxValue>(value);
  const v8::Global<v8::Value>& global_value = ctx_value->global_value_;
  v8::Local<v8::Value> handle_value = v8::Local<v8::Value>::New(isolate_, global_value);

  if (handle_value.IsEmpty()) {
    return false;
  }

  return handle_value->IsObject();
}

unicode_string_view V8Ctx::CopyFunctionName(
    const std::shared_ptr<CtxValue>& function) {
  if (!function) {
    return {};
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

bool V8Ctx::SetProperty(std::shared_ptr<CtxValue> object,
                        std::shared_ptr<CtxValue> key,
                        std::shared_ptr<CtxValue> value) {
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  auto v8_object = std::static_pointer_cast<V8CtxValue>(object);
  auto handle_v8_object = v8::Local<v8::Value>::New(isolate_, v8_object->global_value_);
  auto v8_key = std::static_pointer_cast<V8CtxValue>(key);
  auto handle_v8_key = v8::Local<v8::Value>::New(isolate_, v8_key->global_value_);
  auto v8_value = std::static_pointer_cast<V8CtxValue>(value);
  auto handle_v8_value = v8::Local<v8::Value>::New(isolate_, v8_value->global_value_);

  auto handle_object =  v8::Local<v8::Object>::Cast(handle_v8_object);
  return handle_object->Set(context, handle_v8_key, handle_v8_value).FromMaybe(false);
}

bool V8Ctx::SetProperty(std::shared_ptr<CtxValue> object,
                        std::shared_ptr<CtxValue> key,
                        std::shared_ptr<CtxValue> value,
                        const PropertyAttribute& attr) {
  if (!IsString(key)) {
    return false;
  }
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);
  auto v8_object = std::static_pointer_cast<V8CtxValue>(object);
  auto handle_v8_object = v8::Local<v8::Value>::New(isolate_, v8_object->global_value_);
  auto v8_key = std::static_pointer_cast<V8CtxValue>(key);
  auto handle_v8_key = v8::Local<v8::Value>::New(isolate_, v8_key->global_value_);
  auto v8_value = std::static_pointer_cast<V8CtxValue>(value);
  auto handle_v8_value = v8::Local<v8::Value>::New(isolate_, v8_value->global_value_);

  auto handle_object =  v8::Local<v8::Object>::Cast(handle_v8_object);
  auto v8_attr = v8::PropertyAttribute(attr);
  return handle_object->DefineOwnProperty(context,
                                          handle_v8_key->ToString(context).ToLocalChecked(),
                                          handle_v8_value, v8_attr).FromMaybe(false);
}

std::shared_ptr<CtxValue> V8Ctx::CreateObject() {
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  auto object = v8::Object::New(isolate_);
  return std::make_shared<V8CtxValue>(isolate_, object);
}

std::shared_ptr<CtxValue> V8Ctx::NewInstance(const std::shared_ptr<CtxValue>& cls,
                                             int argc, std::shared_ptr<CtxValue> argv[],
                                             void* external) {
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  auto v8_cls = std::static_pointer_cast<V8CtxValue>(cls);
  auto cls_handle_value = v8::Local<v8::Value>::New(isolate_, v8_cls->global_value_);
  auto func = v8::Local<v8::Function>::Cast(cls_handle_value);
  v8::Local<v8::Object> instance;
  if (argc > 0 && argv) {
    v8::Local<v8::Value> v8_argv[argc];
    for (auto i = 0; i < argc; ++i) {
      auto v8_value = std::static_pointer_cast<V8CtxValue>(argv[i]);
      v8_argv[i] = v8::Local<v8::Value>::New(isolate_, v8_value->global_value_);
    }
    instance = func->NewInstance(context, argc, v8_argv).ToLocalChecked();
  } else {
    instance = func->NewInstance(context).ToLocalChecked();
  }
  instance->SetAlignedPointerInInternalField(kInternalIndex, external);
  return std::make_shared<V8CtxValue>(isolate_, instance);
}

void* V8Ctx::GetExternal(const std::shared_ptr<CtxValue>& object) {
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  auto v8_object = std::static_pointer_cast<V8CtxValue>(object);
  auto handle_value = v8::Local<v8::Value>::New(isolate_, v8_object->global_value_);
  auto handle_object = v8::Local<v8::Object>::Cast(handle_value);
  return handle_object->GetAlignedPointerFromInternalField(kInternalIndex);
}

std::shared_ptr<CtxValue> V8Ctx::DefineProxy(const std::unique_ptr<FuncWrapper>& constructor_wrapper) {
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  auto func_tpl = v8::FunctionTemplate::New(isolate_);
  auto obj_tpl = func_tpl->InstanceTemplate();
  obj_tpl->SetHandler(v8::NamedPropertyHandlerConfiguration(InvokePropertyCallback,
                                                            nullptr,
                                                            nullptr,
                                                            nullptr,
                                                            nullptr,
                                                            v8::External::New(isolate_, reinterpret_cast<void*>(constructor_wrapper.get()))));
  obj_tpl->SetInternalFieldCount(1);
  return std::make_shared<V8CtxValue>(isolate_, func_tpl->GetFunction(context).ToLocalChecked());
}

std::shared_ptr<CtxValue> V8Ctx::DefineClass(unicode_string_view name,
                                             const std::unique_ptr<FuncWrapper>& constructor_wrapper,
                                             size_t property_count,
                                             std::shared_ptr<PropertyDescriptor> properties[]) {
  v8::HandleScope handle_scope(isolate_);
  auto context = context_persistent_.Get(isolate_);
  v8::Context::Scope context_scope(context);

  v8::Local<v8::FunctionTemplate> tpl = CreateTemplate(constructor_wrapper);
  tpl->SetClassName(CreateV8String(name));
  for (size_t i = 0; i < property_count; i++) {
    const auto& prop_desc = properties[i];
    auto v8_attr = v8::PropertyAttribute(prop_desc->attr);
    auto prop_name = std::static_pointer_cast<V8CtxValue>(prop_desc->name);
    auto property_name = v8::Local<v8::Value>::New(isolate_, prop_name->global_value_);
    auto v8_prop_name = v8::Local<v8::Name>::Cast(property_name);
    if (prop_desc->has_getter || prop_desc->has_setter) {
      v8::Local<v8::FunctionTemplate> getter_tpl;
      v8::Local<v8::FunctionTemplate> setter_tpl;
      if (prop_desc->has_getter) {
        getter_tpl = CreateTemplate(prop_desc->getter);
      }
      if (prop_desc->has_setter) {
        setter_tpl = CreateTemplate(prop_desc->setter);
      }
      tpl->PrototypeTemplate()->SetAccessorProperty(
          v8_prop_name,
          getter_tpl,
          setter_tpl,
          v8_attr,
          v8::AccessControl::DEFAULT);
    } else if (prop_desc->has_method) {
      auto method = CreateTemplate(prop_desc->method);
      tpl->PrototypeTemplate()->Set(v8_prop_name, method, v8_attr);
    } else {
      auto v8_ctx = std::static_pointer_cast<V8CtxValue>(prop_desc->value);
      auto handle_value = v8::Local<v8::Value>::New(isolate_, v8_ctx->global_value_);
      tpl->PrototypeTemplate()->Set(v8_prop_name, handle_value, v8_attr);
    }
  }
  // todo(polly) static_property
  return std::make_shared<V8CtxValue>(isolate_, tpl->GetFunction(context).ToLocalChecked());
}

REGISTER_EXTERNAL_REFERENCES(InvokeJsCallback)

}  // namespace napi
}  // namespace hippy


