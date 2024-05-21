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

#include "driver/vm/v8/v8_vm.h"

#include "v8/libplatform/libplatform.h"

#include "footstone/check.h"
#include "footstone/string_view.h"
#include "footstone/string_view_utils.h"
#include "dom/dom_event.h"
#include "driver/napi/v8/v8_ctx.h"
#include "driver/napi/v8/v8_ctx_value.h"
#include "driver/napi/v8/v8_try_catch.h"

using string_view = footstone::string_view;
using Ctx = hippy::napi::Ctx;
using V8Ctx = hippy::napi::V8Ctx;
using CtxValue = hippy::napi::CtxValue;
using string_view = footstone::string_view;
using StringViewUtils = footstone::StringViewUtils;


namespace hippy {
inline namespace driver {
inline namespace vm {

static std::unique_ptr<v8::Platform> platform = nullptr;
static std::mutex mutex;

void InitializePlatform() {
  std::lock_guard<std::mutex> lock(mutex);
  if (platform != nullptr) {
#if defined(V8_X5_LITE) && defined(THREAD_LOCAL_PLATFORM)
    FOOTSTONE_DLOG(INFO) << "InitializePlatform";
    v8::V8::InitializePlatform(platform.get());
#endif
  } else {
    FOOTSTONE_LOG(INFO) << "NewDefaultPlatform";
    platform = v8::platform::NewDefaultPlatform();

#if defined(V8_X5_LITE)
    v8::V8::InitializePlatform(platform.get(), true);
#else
    v8::V8::InitializePlatform(platform.get());
#endif
    FOOTSTONE_DLOG(INFO) << "Initialize";
    v8::V8::Initialize();
  }
}

V8VM::V8VM(const std::shared_ptr<V8VMInitParam>& param) : VM(param) {
  FOOTSTONE_DLOG(INFO) << "V8VM begin, version: " << v8::V8::GetVersion();
  {
    std::lock_guard<std::mutex> lock(mutex);
    if (platform != nullptr) {
#if defined(V8_X5_LITE) && defined(THREAD_LOCAL_PLATFORM)
      FOOTSTONE_DLOG(INFO) << "InitializePlatform";
      v8::V8::InitializePlatform(platform_.get());
#endif
    } else {
      FOOTSTONE_DLOG(INFO) << "NewDefaultPlatform";
      platform = v8::platform::NewDefaultPlatform();

#if defined(V8_X5_LITE)
      v8::V8::InitializePlatform(platform.get(), true);
#else
      v8::V8::InitializePlatform(platform.get());
#endif
      FOOTSTONE_DLOG(INFO) << "Initialize";
      v8::V8::Initialize();
#ifdef ENABLE_INSPECTOR
      auto trace = reinterpret_cast<v8::platform::tracing::TracingController*>(platform->GetTracingController());
      devtools::DevtoolsDataSource::OnGlobalTracingControlGenerate(trace);
#endif    
    }
  }
  create_params_.array_buffer_allocator = v8::ArrayBuffer::Allocator::NewDefaultAllocator();
  if (param) {
    create_params_.constraints.ConfigureDefaultsFromHeapSize(param->initial_heap_size_in_bytes,
                                                             param->maximum_heap_size_in_bytes);
  }
  isolate_ = v8::Isolate::New(create_params_);
  isolate_->Enter();
  isolate_->SetCaptureStackTraceForUncaughtExceptions(true);
  if (param && param->near_heap_limit_callback) {
    isolate_->AddNearHeapLimitCallback(param->near_heap_limit_callback,
                                       param->near_heap_limit_callback_data);
  }

  enable_v8_serialization_ = param->enable_v8_serialization;
  FOOTSTONE_DLOG(INFO) << "V8VM end";
}

constexpr static int kScopeWrapperIndex = 5;


static void UncaughtExceptionMessageCallback(v8::Local<v8::Message> message, v8::Local<v8::Value> data) {
  auto isolate = message->GetIsolate();
  v8::HandleScope handle_scope(isolate);
  auto context = isolate->GetCurrentContext();
  v8::Context::Scope context_scope(context);
  CallbackInfo callback_info;
  callback_info.SetSlot(context->GetAlignedPointerFromEmbedderData(kScopeWrapperIndex));
  auto error = v8::Exception::Error(message->Get());
  callback_info.AddValue(std::make_shared<V8CtxValue>(isolate, error));
  auto description = V8VM::GetMessageDescription(isolate, context, message);
  callback_info.AddValue(std::make_shared<V8CtxValue>(isolate, V8VM::CreateV8String(isolate, context, description)));
  auto stack = V8VM::GetStackTrace(isolate, context, message->GetStackTrace());
  callback_info.AddValue(std::make_shared<V8CtxValue>(isolate, V8VM::CreateV8String(isolate, context, stack)));
  auto external = data.As<v8::External>();
  FOOTSTONE_CHECK(!external.IsEmpty());
  auto* func_wrapper = reinterpret_cast<FunctionWrapper*>(external->Value());
  FOOTSTONE_CHECK(func_wrapper && func_wrapper->callback);
  (func_wrapper->callback)(callback_info, func_wrapper->data);
}

void V8VM::AddUncaughtExceptionMessageListener(const std::unique_ptr<FunctionWrapper>& wrapper) const {
  FOOTSTONE_CHECK(!wrapper->data) << "Snapshot requires the parameter data to be nullptr or the address can be determined during compilation";
  v8::HandleScope handle_scope(isolate_);
  isolate_->AddMessageListener(UncaughtExceptionMessageCallback,
                               v8::External::New(isolate_, wrapper.get()));
}

V8VM::~V8VM() {
  FOOTSTONE_LOG(INFO) << "~V8VM";

#if defined(ENABLE_INSPECTOR) && !defined(V8_WITHOUT_INSPECTOR)
  inspector_client_ = nullptr;
#endif
  isolate_->Exit();
  isolate_->Dispose();
  delete create_params_.array_buffer_allocator;
}

void V8VM::PlatformDestroy() {
  platform = nullptr;

  v8::V8::Dispose();
#if (V8_MAJOR_VERSION == 9 && V8_MINOR_VERSION == 8 && \
     V8_BUILD_NUMBER >= 124) || \
    (V8_MAJOR_VERSION == 9 && V8_MINOR_VERSION > 8) || (V8_MAJOR_VERSION > 9)
  v8::V8::DisposePlatform();
#else
  v8::V8::ShutdownPlatform();
#endif
}

std::shared_ptr<Ctx> V8VM::CreateContext() {
  FOOTSTONE_DLOG(INFO) << "CreateContext";
  return std::make_shared<V8Ctx>(isolate_);
}

string_view V8VM::ToStringView(v8::Isolate* isolate,
                               v8::Local<v8::Context> context,
                               v8::Local<v8::String> string) {
  FOOTSTONE_DCHECK(!string.IsEmpty());
  v8::HandleScope handle_scope(isolate);
  v8::Context::Scope context_scope(context);

  auto v8_string = v8::String::Cast(*string);
  auto len = footstone::checked_numeric_cast<int, size_t>(v8_string->Length());
  if (v8_string->IsOneByte()) {
    std::string one_byte_string;
    one_byte_string.resize(len);
    v8_string->WriteOneByte(isolate,
                            reinterpret_cast<uint8_t*>(&one_byte_string[0]));
    return string_view(one_byte_string);
  }
  std::u16string two_byte_string;
  two_byte_string.resize(len);
  v8_string->Write(isolate, reinterpret_cast<uint16_t*>(&two_byte_string[0]));
  return string_view(two_byte_string);
}

v8::Local<v8::String> V8VM::CreateV8String(v8::Isolate* isolate,
                                           v8::Local<v8::Context> context,
                                           const string_view& str_view) {
  v8::EscapableHandleScope handle_scope(isolate);
  v8::Context::Scope context_scope(context);

  string_view::Encoding encoding = str_view.encoding();
  switch (encoding) {
    case string_view::Encoding::Latin1: {
      const std::string& one_byte_str = str_view.latin1_value();
      return handle_scope.Escape(v8::String::NewFromOneByte(
          isolate,
          reinterpret_cast<const uint8_t*>(one_byte_str.c_str()),
          v8::NewStringType::kNormal)
          .ToLocalChecked());
    }
    case string_view::Encoding::Utf8: {
      const string_view::u8string& utf8_str = str_view.utf8_value();
      return handle_scope.Escape(v8::String::NewFromUtf8(
          isolate, reinterpret_cast<const char*>(utf8_str.c_str()),
          v8::NewStringType::kNormal)
          .ToLocalChecked());
    }
    case string_view::Encoding::Utf16: {
      const std::u16string& two_byte_str = str_view.utf16_value();
      return handle_scope.Escape(v8::String::NewFromTwoByte(
          isolate,
          reinterpret_cast<const uint16_t*>(two_byte_str.c_str()),
          v8::NewStringType::kNormal)
          .ToLocalChecked());
    }
    default:break;
  }
  FOOTSTONE_UNREACHABLE();
}

string_view V8VM::GetMessageDescription(v8::Isolate* isolate,
                                        v8::Local<v8::Context> context,
                                        v8::Local<v8::Message> message) {
  v8::HandleScope handle_scope(isolate);
  v8::Context::Scope context_scope(context);

  auto msg = ToStringView(isolate, context, message->Get());
  auto maybe_file_name = message->GetScriptOrigin().ResourceName()->ToString(context);
  string_view file_name;
  if (!maybe_file_name.IsEmpty()) {
    file_name = ToStringView(isolate, context, maybe_file_name.ToLocalChecked());
  } else {
    file_name = string_view("");
  }
  int line = message->GetLineNumber(context).FromMaybe(-1);
  int start = message->GetStartColumn(context).FromMaybe(-1);
  int end = message->GetEndColumn(context).FromMaybe(-1);

  std::basic_stringstream<char> description;
  description << file_name << ": " << line << ": " << start << "-" << end
              << ": " << msg;
  std::string u8_str = description.str();
  return string_view::new_from_utf8(u8_str.c_str(), u8_str.length());
}

string_view V8VM::GetStackTrace(v8::Isolate* isolate,
                                v8::Local<v8::Context> context,
                                v8::Local<v8::StackTrace> trace) {
  if (trace.IsEmpty()) {
    return "";
  }

  v8::HandleScope handle_scope(isolate);
  v8::Context::Scope context_scope(context);

  std::basic_stringstream<char> stack_stream;
  auto len = trace->GetFrameCount();
  for (auto i = 0; i < len; ++i) {
    auto frame = trace->GetFrame(isolate, static_cast<uint32_t>(i));
    if (frame.IsEmpty()) {
      continue;
    }

    auto v8_script_name = frame->GetScriptName();
    string_view script_name("");
    if (!v8_script_name.IsEmpty()) {
      script_name = ToStringView(isolate, context, v8_script_name);
    }

    string_view function_name("");
    auto v8_function_name = frame->GetFunctionName();
    if (!v8_function_name.IsEmpty()) {
      function_name = ToStringView(isolate, context, v8_function_name);
    }

    stack_stream << std::endl
                 << script_name << ":" << frame->GetLineNumber() << ":"
                 << frame->GetColumn() << ":" << function_name;
  }
  auto u8_str = stack_stream.str();
  return string_view::new_from_utf8(u8_str.c_str(), u8_str.length());
}


std::shared_ptr<VM> CreateVM(const std::shared_ptr<VM::VMInitParam>& param) {
  return std::make_shared<V8VM>(std::static_pointer_cast<V8VMInitParam>(param));
}

std::shared_ptr<CtxValue> V8VM::ParseJson(const std::shared_ptr<Ctx>& ctx, const string_view& json) {
  if (StringViewUtils::IsEmpty(json)) {
    return nullptr;
  }

  auto v8_ctx = std::static_pointer_cast<V8Ctx>(ctx);
  auto isolate = v8_ctx->isolate_;
  v8::HandleScope handle_scope(isolate);
  auto context = v8_ctx->context_persistent_.Get(isolate);
  v8::Context::Scope context_scope(context);

  auto v8_string = V8VM::CreateV8String(isolate, context, json);
  v8::MaybeLocal<v8::Value> maybe_obj = v8::JSON::Parse(context, v8_string);
  if (maybe_obj.IsEmpty()) {
    return nullptr;
  }
  return std::make_shared<V8CtxValue>(isolate, maybe_obj.ToLocalChecked());
}

V8VM::DeserializerResult V8VM::Deserializer(const std::shared_ptr<Ctx>& ctx, const std::string& buffer) {
  v8::HandleScope handle_scope(isolate_);
  auto v8_ctx = std::static_pointer_cast<V8Ctx>(ctx);
  auto context = v8_ctx->context_persistent_.Get(isolate_);

  V8TryCatch try_catch(true, v8_ctx);
  v8::ValueDeserializer deserializer(
      isolate_,
      reinterpret_cast<const uint8_t*>(buffer.c_str()),
      buffer.length());
  FOOTSTONE_CHECK(deserializer.ReadHeader(context).FromMaybe(false));
  auto ret = deserializer.ReadValue(context);
  if (!ret.IsEmpty()) {
    return {
      true,
      std::make_shared<V8CtxValue>(isolate_, ret.ToLocalChecked()),
      ""
    };
  } else if (try_catch.HasCaught()) {
    return {
      false,
      nullptr,
      try_catch.GetExceptionMessage()
    };
  }
  return {false, nullptr, ""};
}

}
}
}
